import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../lib/catalog.ts";
import { assertCheckoutAllowed, buildCheckoutParameters, checkoutFingerprint, createStripeCheckout, getShopConfig, MAX_BODY_BYTES, publicShopStatus, readCheckoutRequest, receiptFromSession, retrieveStripeReceipt, safeCheckoutUrl, validateCheckout } from "../lib/commerce.ts";

const attemptId = "b8dc3488-5088-49b0-906d-d2e47f998a20";
const first = { productId: products[0].id, optionId: products[0].options[0].id, color: "blanc", quantity: 1 };
const request = (items = [first], extra = {}) => ({ attemptId, items, ...extra });
const environment = () => ({ SHOP_READY: "true", LEGAL_APPROVED: "true", APP_ORIGIN: "https://shop.example", APPROVED_PRODUCT_IDS: products.map(product => product.id).join(","), SHIPPING_CENTS: "490", SHIPPING_MIN_DAYS: "3", SHIPPING_MAX_DAYS: "7", STRIPE_SECRET_KEY: "sk_test_fixtureonly" });

test("payment requires every explicit readiness condition, and status never exposes secrets", () => {
  assert.equal(getShopConfig({}).checkoutEnabled, false);
  assert.equal(getShopConfig(environment()).checkoutEnabled, true);
  for (const key of Object.keys(environment())) {
    const env = environment(); delete env[key];
    assert.equal(getShopConfig(env).checkoutEnabled, false, key);
  }
  assert.deepEqual(Object.keys(publicShopStatus(getShopConfig(environment()))).sort(), ["checkoutEnabled", "maxDays", "minDays", "shippingCents", "testMode"]);
  assert.equal(publicShopStatus(getShopConfig(environment())).testMode, true);
  assert.equal(publicShopStatus(getShopConfig({ ...environment(), STRIPE_SECRET_KEY: "sk_live_fixtureonly" })).testMode, false);
});

test("invalid delivery, unknown product approvals and noncanonical origins stay closed", () => {
  for (const overrides of [{ SHIPPING_CENTS: "-1" }, { SHIPPING_CENTS: "4.9" }, { SHIPPING_MIN_DAYS: "8" }, { SHIPPING_MAX_DAYS: "61" }, { APPROVED_PRODUCT_IDS: "unknown" }, { APP_ORIGIN: "http://shop.example" }, { APP_ORIGIN: "https://shop.example/path" }, { APP_ORIGIN: "https://shop.example/" }, { APP_ORIGIN: "https://user:pass@shop.example" }, { LEGAL_APPROVED: "yes" }]) {
    assert.equal(getShopConfig({ ...environment(), ...overrides }).checkoutEnabled, false);
  }
});

test("cart validation rejects altered prices, unknown variants and invalid quantities", () => {
  for (const item of [{ ...first, price: 1 }, { ...first, productId: "unknown" }, { ...first, optionId: "unknown" }, { ...first, color: "purple" }, ...[0, -1, 11, 1.5, "2", null].map(quantity => ({ ...first, quantity }))]) {
    assert.throws(() => validateCheckout(request([item])));
  }
  assert.throws(() => validateCheckout(request([first], { amount: 1 })));
  assert.throws(() => validateCheckout(request([], {})));
  assert.throws(() => validateCheckout(request(Array(16).fill(first))));
  assert.throws(() => validateCheckout({ items: [first], attemptId: "reuse-forever" }));
});

test("duplicates consolidate before totals; consolidated quantity remains limited", () => {
  const result = validateCheckout(request([{ ...first, quantity: 2 }, { ...first, quantity: 3 }]));
  assert.deepEqual(result.items, [{ ...first, quantity: 5 }]);
  assert.throws(() => validateCheckout(request([{ ...first, quantity: 6 }, { ...first, quantity: 5 }])));
});

test("Stripe receives server prices, EUR, address restriction, consent and canonical return URLs", () => {
  const params = buildCheckoutParameters(getShopConfig(environment()), validateCheckout(request()), "hash");
  assert.equal(params.get("line_items[0][price_data][unit_amount]"), String(products[0].options[0].price));
  assert.equal(params.get("line_items[0][price_data][currency]"), "eur");
  assert.equal(params.get("shipping_address_collection[allowed_countries][0]"), "FR");
  assert.equal(params.get("consent_collection[terms_of_service]"), "required");
  assert.equal(params.get("success_url"), "https://shop.example/commande?session_id={CHECKOUT_SESSION_ID}");
  assert.equal(params.get("shipping_options[0][shipping_rate_data][fixed_amount][amount]"), "490");
});

test("same-origin and approved supplier products are enforced server-side", () => {
  const config = getShopConfig({ ...environment(), APPROVED_PRODUCT_IDS: products[0].id });
  const valid = validateCheckout(request());
  assert.doesNotThrow(() => assertCheckoutAllowed(config, valid, "https://shop.example"));
  for (const origin of [null, "https://shop.example.evil", "http://shop.example"]) assert.throws(() => assertCheckoutAllowed(config, valid, origin));
  const other = products[1];
  assert.throws(() => assertCheckoutAllowed(config, validateCheckout(request([{ ...first, productId: other.id, optionId: other.options[0].id }])), "https://shop.example"));
});

test("idempotency fingerprint is stable for equivalent carts and changes with delivery charges", async () => {
  const config = getShopConfig(environment());
  const a = validateCheckout(request([{ ...first, quantity: 2 }]));
  const b = validateCheckout(request([first, first]));
  assert.equal(await checkoutFingerprint(config, a), await checkoutFingerprint(config, b));
  assert.notEqual(await checkoutFingerprint(config, a), await checkoutFingerprint({ ...config, shippingCents: 0 }, a));
  assert.notEqual(await checkoutFingerprint(config, a), await checkoutFingerprint(config, validateCheckout(request())));
});

test("provider redirects are limited to Stripe HTTPS checkout", () => {
  assert.equal(safeCheckoutUrl("https://checkout.stripe.com/c/pay/session"), "https://checkout.stripe.com/c/pay/session");
  for (const value of ["https://checkout.stripe.com.evil/pay", "http://checkout.stripe.com/pay", "https://checkout.stripe.com@evil/pay", "https://user@checkout.stripe.com/pay", "https://checkout.stripe.com:444/pay", "javascript:alert(1)", null]) assert.equal(safeCheckoutUrl(value), null);
});

test("request body limit covers streamed bytes even without content-length", async () => {
  const body = JSON.stringify(request());
  assert.deepEqual(await readCheckoutRequest(new Request("https://shop.example/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body })), JSON.parse(body));
  await assert.rejects(() => readCheckoutRequest(new Request("https://shop.example/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: "x".repeat(MAX_BODY_BYTES + 1) })), error => error.status === 413);
  await assert.rejects(() => readCheckoutRequest(new Request("https://shop.example/api/checkout", { method: "POST", headers: { "content-type": "text/plain" }, body })), error => error.status === 415);
});

test("a success link alone cannot confirm payment or a different merchant's session", () => {
  const session = { id: "cs_test_12345678901234567890", mode: "payment", status: "complete", payment_status: "paid", currency: "eur", amount_total: 2980, metadata: { shop: "moon-and-pillow" }, livemode: false, client_reference_id: attemptId };
  assert.equal(receiptFromSession(session).status, "paid");
  assert.equal(receiptFromSession(session).testMode, true);
  assert.equal(receiptFromSession({ ...session, livemode: true }).testMode, false);
  assert.equal(receiptFromSession(session).attemptId, attemptId);
  assert.equal(receiptFromSession({ ...session, client_reference_id: "invalid" }).attemptId, null);
  for (const overrides of [{ payment_status: "unpaid" }, { status: "open" }, { currency: "usd" }, { metadata: {} }, { metadata: { shop: "another-shop" } }, { amount_total: 0 }, { id: "made-up" }, { livemode: undefined }]) assert.equal(receiptFromSession({ ...session, ...overrides }).status, "unconfirmed");
  assert.equal(receiptFromSession(null).status, "unconfirmed");
});

test("Stripe session creation sends one stable idempotency key and rejects an untrusted provider URL", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      return Response.json({ url: "https://checkout.stripe.com/c/pay/test-session" });
    };
    const config = getShopConfig(environment());
    const checkout = validateCheckout(request());
    await createStripeCheckout(config, checkout);
    await createStripeCheckout(config, checkout);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "https://api.stripe.com/v1/checkout/sessions");
    assert.equal(calls[0].options.headers["Idempotency-Key"], calls[1].options.headers["Idempotency-Key"]);
    assert.equal(new URLSearchParams(calls[0].options.body).get("line_items[0][price_data][unit_amount]"), String(products[0].options[0].price));
    globalThis.fetch = async () => Response.json({ url: "https://malicious.example/pay" });
    await assert.rejects(() => createStripeCheckout(config, checkout), error => error.status === 502);
    await assert.rejects(() => createStripeCheckout(getShopConfig({}), checkout), error => error.status === 503);
  } finally { globalThis.fetch = originalFetch; }
});

test("receipt lookup verifies Stripe server-side and never returns customer details", async () => {
  const originalFetch = globalThis.fetch;
  const id = "cs_test_12345678901234567890";
  const session = { id, mode: "payment", status: "complete", payment_status: "paid", currency: "eur", amount_total: 2980, livemode: false, client_reference_id: attemptId,
    metadata: { shop: "moon-and-pillow" }, customer_details: { email: "private@example.com" } };
  try {
    globalThis.fetch = async url => {
      assert.equal(url, `https://api.stripe.com/v1/checkout/sessions/${id}`);
      return Response.json(session);
    };
    const result = await retrieveStripeReceipt(id, environment());
    assert.deepEqual(Object.keys(result).sort(), ["amountCents", "attemptId", "reference", "status", "testMode"]);
    assert.equal(result.status, "paid");
    globalThis.fetch = async () => Response.json({ ...session, id: "cs_test_99999999999999999999" });
    assert.equal((await retrieveStripeReceipt(id, environment())).status, "unconfirmed");
    globalThis.fetch = async () => { throw new Error("provider unavailable"); };
    assert.equal((await retrieveStripeReceipt(id, environment())).status, "unavailable");
    assert.equal((await retrieveStripeReceipt("../other", environment())).status, "unconfirmed");
  } finally { globalThis.fetch = originalFetch; }
});
