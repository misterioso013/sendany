import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Alice } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const alice = Alice({
  variable: "--font-alice",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sendany.all.dev.br'),
  title: {
    default: "SendAny - Share anything with anyone",
    template: "%s | SendAny"
  },
  description: "The perfect combination of Google Drive, Pastebin, and GitHub Gist. Create workspaces to share text, code, and files in one beautiful, minimalist interface.",
  keywords: [
    "file sharing",
    "code sharing", 
    "text sharing",
    "workspace",
    "pastebin",
    "github gist",
    "google drive alternative",
    "secure file sharing",
    "code collaboration",
    "temporary files",
    "sendany"
  ],
  authors: [{ name: "SendAny Team" }],
  creator: "SendAny",
  publisher: "SendAny",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sendany.all.dev.br",
    siteName: "SendAny",
    title: "SendAny - Share anything with anyone",
    description: "The perfect combination of Google Drive, Pastebin, and GitHub Gist. Create workspaces to share text, code, and files in one beautiful, minimalist interface.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "SendAny - Share anything with anyone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SendAny - Share anything with anyone",
    description: "The perfect combination of Google Drive, Pastebin, and GitHub Gist. Create workspaces to share text, code, and files in one beautiful, minimalist interface.",
    creator: "@RVictor013",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://sendany.all.dev.br",
  },
  category: "technology",
  classification: "File Sharing Platform",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: "Next.js",
  applicationName: "SendAny",
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SendAny',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000',
      },
    ],
  },
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
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
