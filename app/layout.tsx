import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Type — Concrete Poetry Generator",
  description: "Shape text into concrete poetry with SC Prosper Sans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
