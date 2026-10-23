import { money } from "@/lib/catalog";
import { getShopEnvironment, retrieveStripeReceipt } from "@/lib/commerce";
import ClearPaidCart from "./clear-paid-cart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Votre commande · Moon & Pillow", robots: { index: false, follow: false } };

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
  const { session_id } = await searchParams;
  const receipt = await retrieveStripeReceipt(session_id, await getShopEnvironment());
  const paid = receipt.status === "paid";
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px 20px", background: "#f7f3ec", color: "#3b332e" }}>
      <section style={{ maxWidth: 600, textAlign: "center", background: "#fffdf8", padding: "56px 28px", border: "1px solid #e4dbce", borderRadius: 24 }}>
        <a href="/" style={{ color: "inherit", textDecoration: "none", fontSize: 23, fontFamily: "Georgia, serif" }}>Moon &amp; Pillow</a>
        <p style={{ marginTop: 36, letterSpacing: ".16em", textTransform: "uppercase", fontSize: 11 }}>Votre commande</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 36, lineHeight: 1.18 }}>{receipt.status === "paid" && receipt.testMode ? "Votre test est terminé." : paid ? "Merci pour votre commande." : "Vérification du paiement"}</h1>
        {receipt.status === "paid" ? <>
          <ClearPaidCart attemptId={receipt.attemptId}/>
          {receipt.testMode ? <p style={{ lineHeight: 1.7 }}>Stripe confirme un paiement de test de <strong>{money(receipt.amountCents)}</strong>. Aucun argent réel n’a été encaissé et aucune commande réelle ne sera expédiée.</p>
            : <p style={{ lineHeight: 1.7 }}>Votre paiement de <strong>{money(receipt.amountCents)}</strong> est confirmé par Stripe. Votre commande est enregistrée et sera traitée par la boutique.</p>}
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>Référence : <strong>{receipt.reference}</strong></p>
        </> : receipt.status === "unavailable" ? <p style={{ lineHeight: 1.7 }}>Nous ne pouvons pas vérifier votre paiement pour le moment. Cette page ne confirme aucun achat. Si un paiement apparaît dans votre banque, attendez sa vérification avant de réessayer.</p>
          : <p style={{ lineHeight: 1.7 }}>Aucun paiement confirmé n’est associé à ce lien. Si vous venez de payer, actualisez cette page dans quelques instants avant de renouveler une tentative.</p>}
        <a href="/" style={{ display: "inline-block", marginTop: 24, padding: "14px 24px", borderRadius: 40, background: "#3b332e", color: "#fffdf8", textDecoration: "none" }}>Retrouver la collection</a>
      </section>
    </main>
  );
}
