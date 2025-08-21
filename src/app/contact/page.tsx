import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Github, Twitter } from "lucide-react";
import ModeToggle from "@/components/ui/mode-toggle";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the SendAny team. We're here to help with questions, feedback, and support.",
  keywords: ["contact sendany", "support", "help", "feedback", "customer service"],
  openGraph: {
    title: "Contact | SendAny",
    description: "Get in touch with the SendAny team. We're here to help with questions, feedback, and support.",
    type: "website",
  },
  alternates: {
    canonical: "https://sendany.all.dev.br/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <div className="w-px h-4 bg-border/50" />
              <h1 className="text-lg font-medium text-foreground">Contact</h1>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Get in Touch</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            We&apos;d love to hear from you! Whether you have questions, feedback, or need support, 
            we&apos;re here to help.
          </p>

          <div className="grid md:grid-cols-2 gap-8 not-prose mb-12">
            <div className="space-y-6">
              <div className="border border-border/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Email Support</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  For general questions, technical support, or feedback
                </p>
                <a 
                  href="mailto:rosielvictor.dev@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  rosielvictor.dev@gmail.com
                </a>
              </div>

              <div className="border border-border/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Feature Requests</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Have an idea for a new feature? We&apos;d love to hear it!
                </p>
                <a 
                  href="https://discord.gg/F4WBXeyaVa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Discord
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-border/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Github className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Bug Reports</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Found a bug? Report it on our GitHub repository
                </p>
                <a 
                  href="https://github.com/misterioso013/sendany/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  GitHub Issues
                </a>
              </div>

              <div className="border border-border/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Twitter className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium">Social Media</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Follow us for updates and announcements
                </p>
                <a 
                  href="https://twitter.com/RVictor013" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  @RVictor013
                </a>
              </div>
            </div>
          </div>

          <h2>Frequently Asked Questions</h2>
          
          <div className="space-y-6 not-prose">
            <details className="border border-border/20 rounded-lg p-6">
              <summary className="font-medium cursor-pointer">How do I delete my account?</summary>
              <p className="text-muted-foreground mt-3">
                You can delete your account from your dashboard settings. All your workspaces and files will be permanently deleted.
              </p>
            </details>

            <details className="border border-border/20 rounded-lg p-6">
              <summary className="font-medium cursor-pointer">What file types are supported?</summary>
              <p className="text-muted-foreground mt-3">
                SendAny supports text files, code files with syntax highlighting for 100+ languages, markdown files, and binary file uploads.
              </p>
            </details>

            <details className="border border-border/20 rounded-lg p-6">
              <summary className="font-medium cursor-pointer">Is there a file size limit?</summary>
              <p className="text-muted-foreground mt-3">
                Currently, there&apos;s a 10MB limit per file for uploads. For larger files, you can use our Google Drive integration.
              </p>
            </details>

            <details className="border border-border/20 rounded-lg p-6">
              <summary className="font-medium cursor-pointer">How long are files stored?</summary>
              <p className="text-muted-foreground mt-3">
                Files are stored indefinitely unless you set an expiration date or delete them manually. We may implement storage limits in the future.
              </p>
            </details>

            <details className="border border-border/20 rounded-lg p-6">
              <summary className="font-medium cursor-pointer">Can I use SendAny for commercial purposes?</summary>
              <p className="text-muted-foreground mt-3">
                Yes, SendAny can be used for both personal and commercial purposes, as long as you comply with our Terms of Service.
              </p>
            </details>
          </div>

          <h2>Response Times</h2>
          <p>
            We aim to respond to all inquiries within:
          </p>
          <ul>
            <li><strong>Support requests:</strong> 24-48 hours</li>
            <li><strong>Bug reports:</strong> 1-3 business days</li>
            <li><strong>Feature requests:</strong> 1 week</li>
            <li><strong>General inquiries:</strong> 24 hours</li>
          </ul>

          <p className="text-muted-foreground mt-8">
            <strong>Note:</strong> For security-related issues, please email{" "}
            <a href="mailto:rosielvictor.dev@gmail.com" className="text-primary hover:underline">
              rosielvictor.dev@gmail.com
            </a>{" "}
            directly. We take security concerns very seriously and will respond as quickly as possible.
          </p>
        </div>
      </main>
    </div>
  );
}
