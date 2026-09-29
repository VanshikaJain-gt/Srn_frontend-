import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunrisers Runners Network",
  description: "Sunrisers Runners Network",
  icons: {
    icon: "/logo.png.jpeg",
    shortcut: "/logo.png.jpeg",
    apple: "/logo.png.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
