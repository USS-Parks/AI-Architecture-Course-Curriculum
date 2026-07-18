import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Architecture Practitioner",
  description:
    "A private, at-your-pace learning workspace for the AI Architecture Practitioner curriculum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
