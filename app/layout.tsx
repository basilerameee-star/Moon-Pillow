import type { Metadata } from "next";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, GOOGLE_SITE_VERIFICATION, robotsMeta, organizationLd, pageMeta, websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMeta({
    title: "Moon & Pillow — Linge de maison pour la chambre et le salon",
    description: "Linge de maison pour la chambre et le salon : housses de couette, taies d’oreiller, housses de coussin et plaids. Découvrez la collection Moon & Pillow.",
    path: "/",
  }),
  robots: robotsMeta,
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        {children}
      </body>
    </html>
  );
}
