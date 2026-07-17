import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Titanium Gestão",
  description: "Check-in, fila e gestão da Titanium Barbearia",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  themeColor: "#090b0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
