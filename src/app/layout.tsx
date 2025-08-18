import type { Metadata } from "next";
import { Alice } from "next/font/google";
import "./globals.css";

const alice = Alice({
  variable: "--font-alice",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "SendAny - Share anything with anyone",
  description: "Share anything with anyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${alice.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
