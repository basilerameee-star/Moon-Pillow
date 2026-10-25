import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moon & Pillow — Les petits bonheurs de la maison",
  description: "Linge de maison pour la chambre et le salon : parures, taies d’oreiller, housses de coussin et plaids. Découvrez la collection Moon & Pillow en préparation.",
  robots: { index: false, follow: false },
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
