import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moon & Pillow — Les petits bonheurs de la maison",
  description: "Housses de coussin, plaids et ensembles Cocon. Découvrez les couleurs et les formats de notre sélection. Découvrez la première collection Moon & Pillow.",
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
