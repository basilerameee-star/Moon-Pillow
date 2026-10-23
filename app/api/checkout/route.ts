import { assertCheckoutAllowed, CheckoutError, createStripeCheckout, getShopConfig, getShopEnvironment, readCheckoutRequest, validateCheckout } from "@/lib/commerce";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function POST(request: Request) {
  try {
    const config = getShopConfig(await getShopEnvironment());
    // Fail closed before parsing a cart or contacting Stripe.
    if (!config.checkoutEnabled) throw new CheckoutError("La boutique est en préparation. Les paiements ne sont pas encore ouverts.", 503);
    if (request.headers.get("origin") !== config.origin) throw new CheckoutError("Cette demande de paiement n’est pas autorisée.", 403);
    const checkout = validateCheckout(await readCheckoutRequest(request));
    assertCheckoutAllowed(config, checkout, request.headers.get("origin"));
    return Response.json({ url: await createStripeCheckout(config, checkout) }, { headers });
  } catch (error) {
    // Never return or log a provider response, runtime bindings, or secret credentials.
    const status = error instanceof CheckoutError ? error.status : 502;
    const message = error instanceof CheckoutError ? error.message : "La connexion au paiement est momentanément indisponible. Vous pouvez réessayer.";
    return Response.json({ error: message }, { status, headers });
  }
}
