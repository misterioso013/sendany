import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import { stackServerApp } from "@/stack";
import { HomeContent } from "@/components/home-content";
import ModeToggle from "@/components/ui/mode-toggle";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SendAny - Share anything with anyone",
  description: "The perfect combination of Google Drive, Pastebin, and GitHub Gist. Create workspaces to share text, code, and files in one beautiful, minimalist interface. Free, secure, and easy to use.",
  keywords: [
    "file sharing",
    "code sharing",
    "pastebin alternative",
    "github gist alternative",
    "google drive alternative",
    "secure file sharing",
    "temporary file sharing",
    "workspace",
    "code collaboration",
    "text sharing",
    "document sharing"
  ],
  openGraph: {
    title: "SendAny - Share anything with anyone",
    description: "The perfect combination of Google Drive, Pastebin, and GitHub Gist. Create workspaces to share text, code, and files in one beautiful, minimalist interface.",
    type: "website",
    url: "https://sendany.all.dev.br",
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
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: "https://sendany.all.dev.br",
  },
};

export default async function HomePage() {
  const user = await stackServerApp.getUser();
  
  // Extract only serializable user data
  const userData = user ? {
    id: user.id,
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    profileImageUrl: user.profileImageUrl,
  } : null;

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SendAny",
    "description": "The perfect combination of Google Drive, Pastebin, and GitHub Gist. Create workspaces to share text, code, and files in one beautiful, minimalist interface.",
    "url": "https://sendany.all.dev.br",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "SendAny",
      "url": "https://sendany.all.dev.br"
    },
    "featureList": [
      "File sharing",
      "Code sharing", 
      "Text sharing",
      "Workspace creation",
      "Secure file hosting",
      "Temporary file sharing",
      "Code collaboration"
    ],
    "screenshot": "https://sendany.all.dev.br/og-default.png",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "audience": {
      "@type": "Audience",
      "audienceType": "Developers, Content Creators, Students"
    }
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
          <Link href="/" className="text-lg font-medium text-foreground hover:text-muted-foreground transition-colors">
            SendAny
          </Link>
          <div className="flex items-center gap-6">
            {user && (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
            <UserButton />
            <ModeToggle />
          </div>
        </nav>
      </header>
      
      <HomeContent user={userData} />
    </div>
  );
}