import type { Metadata } from "next";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, GOOGLE_SITE_VERIFICATION, robotsMeta, organizationLd, websiteLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Moon & Pillow — Linge de maison pour la chambre et le salon",
  description: "Linge de maison pour la chambre et le salon : parures, taies d’oreiller, housses de coussin et plaids. Découvrez la collection Moon & Pillow.",
  alternates: { canonical: "/" },
  robots: robotsMeta,
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  openGraph: { siteName: "Moon & Pillow", locale: "fr_FR", type: "website" },
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
