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
  title: "SendAny - Share anything with anyone",
  description: "The perfect combination of Google Drive, Pastebin, and GitHub Gist. Create workspaces to share text, code, and files in one beautiful, minimalist interface.",
  keywords: ["share", "files", "code", "text", "gist", "pastebin", "workspace"],
  authors: [{ name: "SendAny" }],
  openGraph: {
    title: "SendAny - Share anything with anyone",
    description: "Create workspaces to share text, code, and files in one beautiful, minimalist interface.",
    type: "website",
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
