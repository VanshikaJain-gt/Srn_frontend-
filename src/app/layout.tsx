import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunrise Runners Network",
  description: "Run Together. Grow Together.",
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