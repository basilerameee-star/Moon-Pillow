import "server-only";
import { colorName, products, resolveItem, type CartItem } from "./catalog";
import { shippingForCart } from "./shipping";

export const SHOP_ID = "moon-and-pillow";
export const MAX_BODY_BYTES = 16 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_ID = /^cs_(?:test_|live_)?[A-Za-z0-9]{12,240}$/;
type Environment = Record<string, unknown>;
export type ShopConfig = {
  checkoutEnabled: boolean;
  origin: string | null;
  approvedIds: string[];
  minDays: number | null;
  maxDays: number | null;
  secretKey: string | null;
  testMode: boolean;
};
export type ValidatedCheckout = { attemptId: string; items: CartItem[] };

export class CheckoutError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

// This module is server-only. Runtime bindings are read on the server for each request.
export async function getShopEnvironment(): Promise<Environment> {
  try {
    const { env } = await import("cloudflare:workers");
    return env as unknown as Environment;
  } catch {
    // A preview without configured runtime bindings must stay closed for payments.
    return {};
  }
}

function integerSetting(value: unknown, minimum: number, maximum: number): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const result = Number(value);
  return Number.isSafeInteger(result) && result >= minimum && result <= maximum ? result : null;
}

export function getShopConfig(env: Environment): ShopConfig {
  let origin: string | null = null;
  if (typeof env.APP_ORIGIN === "string") {
    try {
      const url = new URL(env.APP_ORIGIN);
      if (url.protocol === "https:" && !url.username && !url.password && url.origin === env.APP_ORIGIN) origin = url.origin;
    } catch { /* An invalid origin leaves payments disabled. */ }
  }
  const approvedIds = typeof env.APPROVED_PRODUCT_IDS === "string"
    ? [...new Set(env.APPROVED_PRODUCT_IDS.split(",").map(id => id.trim()).filter(Boolean))].sort()
    : [];
  const approved = approvedIds.length > 0 && approvedIds.every(id => products.some(product => product.id === id && !product.draftOnly && product.priceStatus === "approved"));
  const minDays = integerSetting(env.SHIPPING_MIN_DAYS, 1, 60);
  const maxDays = integerSetting(env.SHIPPING_MAX_DAYS, 1, 60);
  const secretKey = typeof env.STRIPE_SECRET_KEY === "string" && /^(?:sk|rk)_(?:test|live)_[A-Za-z0-9]+$/.test(env.STRIPE_SECRET_KEY)
    ? env.STRIPE_SECRET_KEY : null;
  return {
    checkoutEnabled: env.SHOP_READY === "true" && env.LEGAL_APPROVED === "true" && Boolean(origin && approved && secretKey)
      && minDays !== null && maxDays !== null && maxDays >= minDays,
    origin, approvedIds, minDays, maxDays, secretKey,
    testMode: secretKey !== null && /^(?:sk|rk)_test_/.test(secretKey),
  };
}

export function publicShopStatus(config: ShopConfig) {
  return { checkoutEnabled: config.checkoutEnabled, minDays: config.minDays, maxDays: config.maxDays, testMode: config.testMode };
}

function plainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function onlyKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).every(key => keys.includes(key));
}

export function validateCheckout(value: unknown): ValidatedCheckout {
  if (!plainObject(value) || !onlyKeys(value, ["attemptId", "items"]) || typeof value.attemptId !== "string" || !UUID.test(value.attemptId)) {
    throw new CheckoutError("La demande de paiement est invalide. Actualisez la page et réessayez.");
  }
  if (!Array.isArray(value.items) || value.items.length < 1 || value.items.length > 15) {
    throw new CheckoutError("Le panier doit contenir de 1 à 15 lignes.");
  }
  const consolidated = new Map<string, CartItem>();
  for (const candidate of value.items) {
    if (!plainObject(candidate) || !onlyKeys(candidate, ["productId", "color", "optionId", "quantity"])
      || typeof candidate.productId !== "string" || typeof candidate.optionId !== "string" || typeof candidate.color !== "string"
      || !Number.isInteger(candidate.quantity) || (candidate.quantity as number) < 1 || (candidate.quantity as number) > 10) {
      throw new CheckoutError("Un article du panier est invalide. La quantité autorisée est de 1 à 10.");
    }
    const item: CartItem = { productId: candidate.productId, optionId: candidate.optionId,
      color: candidate.color as CartItem["color"], quantity: candidate.quantity as number };
    let resolved: ReturnType<typeof resolveItem>;
    try { resolved = resolveItem(item); }
    catch { throw new CheckoutError("Un article ou une variante n’est plus disponible."); }
    if (!Number.isSafeInteger(resolved.option.price) || resolved.option.price <= 0 || resolved.option.price > 1000000) {
      throw new CheckoutError("Le prix de cet article doit être vérifié avant le paiement.", 503);
    }
    const key = JSON.stringify([item.productId, item.color, item.optionId]);
    const quantity = (consolidated.get(key)?.quantity ?? 0) + item.quantity;
    if (quantity > 10) throw new CheckoutError("La quantité maximale est de 10 par variante.");
    consolidated.set(key, { productId: item.productId, color: item.color, optionId: item.optionId, quantity });
  }
  return { attemptId: value.attemptId.toLowerCase(), items: [...consolidated.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, item]) => item) };
}

export async function readCheckoutRequest(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new CheckoutError("Le format de la demande est invalide.", 415);
  }
  const announcedLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(announcedLength) && announcedLength > MAX_BODY_BYTES) throw new CheckoutError("Le panier envoyé est trop volumineux.", 413);
  if (!request.body) throw new CheckoutError("Le panier est vide.");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let byteLength = 0;
  let body = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new CheckoutError("Le panier envoyé est trop volumineux.", 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof CheckoutError) throw error;
    throw new CheckoutError("Le panier envoyé est illisible.");
  } finally { reader.releaseLock(); }
}

export function assertCheckoutAllowed(config: ShopConfig, checkout: ValidatedCheckout, origin: string | null) {
  if (!config.checkoutEnabled || !config.origin || !config.secretKey) throw new CheckoutError("La boutique est en préparation. Les paiements ne sont pas encore ouverts.", 503);
  if (origin !== config.origin) throw new CheckoutError("Cette demande de paiement n’est pas autorisée.", 403);
  if (checkout.items.some(item => !config.approvedIds.includes(item.productId))) {
    throw new CheckoutError("Un article du panier n’est pas encore ouvert à la vente.", 409);
  }
}

// Port au prix coûtant par fournisseur, offert dès le seuil ; un port non vérifié bloque le paiement.
export function checkoutShipping(checkout: ValidatedCheckout) {
  const subtotal = checkout.items.reduce((sum, item) => sum + resolveItem(item).option.price * item.quantity, 0);
  const shipping = shippingForCart(subtotal, checkout.items);
  if (shipping === null) throw new CheckoutError("Les frais de port de cet article sont en cours de vérification.", 503);
  return shipping;
}

export function buildCheckoutParameters(config: ShopConfig, checkout: ValidatedCheckout, cartHash: string) {
  if (!config.origin || config.minDays === null || config.maxDays === null) throw new CheckoutError("La livraison doit être configurée.", 503);
  const shipping = checkoutShipping(checkout);
  const params = new URLSearchParams({
    mode: "payment", locale: "fr", customer_creation: "always",
    success_url: `${config.origin}/commande?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.origin}/?paiement=annule#collection`,
    client_reference_id: checkout.attemptId,
    "payment_method_types[0]": "card",
    "shipping_address_collection[allowed_countries][0]": "FR",
    "consent_collection[terms_of_service]": "required",
    "metadata[shop]": SHOP_ID, "metadata[cart_hash]": cartHash,
    "metadata[fulfillment]": "manual",
    "payment_intent_data[metadata][shop]": SHOP_ID,
    "payment_intent_data[metadata][cart_hash]": cartHash,
    "shipping_options[0][shipping_rate_data][type]": "fixed_amount",
    "shipping_options[0][shipping_rate_data][fixed_amount][amount]": String(shipping),
    "shipping_options[0][shipping_rate_data][fixed_amount][currency]": "eur",
    "shipping_options[0][shipping_rate_data][display_name]": shipping === 0 ? "Livraison offerte en France" : "Livraison en France, au prix coûtant",
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]": "business_day",
    "shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]": String(config.minDays),
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]": "business_day",
    "shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]": String(config.maxDays),
  });
  checkout.items.forEach((item, index) => {
    // Prices and names are read exclusively from the server catalogue.
    const { product, option } = resolveItem(item);
    const color = { name: colorName(item.color, product) };
    const base = `line_items[${index}]`;
    params.set(`${base}[quantity]`, String(item.quantity));
    params.set(`${base}[price_data][currency]`, "eur");
    params.set(`${base}[price_data][unit_amount]`, String(option.price));
    params.set(`${base}[price_data][product_data][name]`, `${product.name} — ${option.label} — ${color.name}`);
    params.set(`${base}[price_data][product_data][metadata][product_id]`, product.id);
    params.set(`${base}[price_data][product_data][metadata][option_id]`, option.id);
    params.set(`${base}[price_data][product_data][metadata][color]`, item.color);
  });
  return params;
}

export async function checkoutFingerprint(config: ShopConfig, checkout: ValidatedCheckout) {
  const pricedItems = checkout.items.map(item => ({ ...item, unitAmount: resolveItem(item).option.price }));
  const bytes = new TextEncoder().encode(JSON.stringify({ shop: SHOP_ID, origin: config.origin, items: pricedItems,
    shipping: checkoutShipping(checkout), minDays: config.minDays, maxDays: config.maxDays, currency: "eur" }));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function safeCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" && !url.port && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export async function createStripeCheckout(config: ShopConfig, checkout: ValidatedCheckout): Promise<string> {
  if (!config.checkoutEnabled || !config.secretKey) throw new CheckoutError("Les paiements ne sont pas encore ouverts.", 503);
  const hash = await checkoutFingerprint(config, checkout);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${config.secretKey}`, "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `${SHOP_ID}:${checkout.attemptId}:${hash}` },
    body: buildCheckoutParameters(config, checkout, hash).toString(),
  });
  if (!response.ok) throw new CheckoutError("Le paiement est momentanément indisponible. Aucun paiement n’a été lancé ici.", 502);
  const session = await response.json() as { url?: unknown; metadata?: { shop?: string } };
  const url = safeCheckoutUrl(session.url);
  if (!url) throw new CheckoutError("Le lien de paiement n’a pas pu être vérifié. Réessayez dans un instant.", 502);
  return url;
}

export type Receipt = { status: "paid"; reference: string; amountCents: number; testMode: boolean; attemptId: string | null } | { status: "unconfirmed" | "unavailable" };

export function receiptFromSession(value: unknown): Receipt {
  if (!plainObject(value) || !plainObject(value.metadata) || value.metadata.shop !== SHOP_ID || value.currency !== "eur"
    || value.mode !== "payment" || value.status !== "complete" || value.payment_status !== "paid" || typeof value.livemode !== "boolean"
    || typeof value.id !== "string" || !SESSION_ID.test(value.id)
    || !Number.isSafeInteger(value.amount_total) || (value.amount_total as number) <= 0) return { status: "unconfirmed" };
  return { status: "paid", reference: value.id.slice(-12).toUpperCase(), amountCents: value.amount_total as number,
    testMode: !value.livemode, attemptId: typeof value.client_reference_id === "string" && UUID.test(value.client_reference_id) ? value.client_reference_id.toLowerCase() : null };
}

export async function retrieveStripeReceipt(sessionId: unknown, env: Environment): Promise<Receipt> {
  if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId)) return { status: "unconfirmed" };
  const config = getShopConfig(env);
  if (!config.secretKey) return { status: "unavailable" };
  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${config.secretKey}` }, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { status: response.status === 404 ? "unconfirmed" : "unavailable" };
    const data: unknown = await response.json();
    if (!plainObject(data) || data.id !== sessionId) return { status: "unconfirmed" };
    return receiptFromSession(data);
  } catch { return { status: "unavailable" }; }
}
