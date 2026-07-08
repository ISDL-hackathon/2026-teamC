import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team C",
  description: "Next.js application for Team C"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
