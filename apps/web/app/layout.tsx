import type { Metadata } from "next";
import localFont from "next/font/local";
import "@repo/ui/styles/globals.css";
import { Toaster } from "@repo/ui/components/sonner";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SendAny - Share files with ease",
  description: "Upload and share files quickly and securely with anyone. Simple, fast, and reliable file sharing.",
  keywords: ["file sharing", "upload", "download", "share files", "file transfer"],
  authors: [{ name: "SendAny Team" }],
  creator: "SendAny",
  openGraph: {
    title: "SendAny - Share files with ease",
    description: "Upload and share files quickly and securely with anyone.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SendAny - Share files with ease",
    description: "Upload and share files quickly and securely with anyone.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
