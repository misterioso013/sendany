import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Database, Clock, Share2, Trash2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
          <h1 className="text-3xl font-light text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 font-light">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="space-y-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-foreground">
              Your Privacy Matters
            </h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              SendAny is designed with privacy in mind. This policy explains how we collect,
              use, and protect your information when you use our platform.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8 flex items-center">
            <Database className="w-6 h-6 mr-3 text-muted-foreground" />
            Information We Collect
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Account Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Email address (for authentication and account recovery)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Display name and profile picture (if provided)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Authentication tokens (managed by Stack Auth)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Content Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Files and text content you upload to workspaces</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Workspace metadata (titles, descriptions, settings)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">File metadata (names, sizes, types)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Usage Information</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">IP addresses and user agents (for analytics and security)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Access logs and view counts</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Device and browser information</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8 flex items-center">
            <Eye className="w-6 h-6 mr-3 text-muted-foreground" />
            How We Use Your Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Service Operation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Provide and maintain the SendAny service</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Authenticate users and manage accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Store and serve your content</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Process file uploads to Google Drive</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Security & Analytics</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Monitor for abuse and security threats</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Analyze usage patterns to improve the service</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Provide basic analytics to workspace owners</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Comply with legal requirements</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Storage */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-muted-foreground" />
            Data Storage & Security
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">File Storage</h3>
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <p className="text-muted-foreground font-light">
                  <strong className="text-foreground">Your files remain yours.</strong> Files uploaded to SendAny are 
                  stored in your personal Google Drive account under the `/SendAny/` folder. We do not store 
                  copies of your files on our servers.
                </p>
                <p className="text-muted-foreground font-light">
                  You maintain full control and can access, modify, or delete files directly through Google Drive 
                  at any time.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Database Security</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Encrypted connections (SSL/TLS) for all data transmission</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Password hashing using bcrypt with secure salt</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Database hosted on Neon with enterprise-grade security</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="font-light">Regular security updates and monitoring</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sharing & Visibility */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8 flex items-center">
            <Share2 className="w-6 h-6 mr-3 text-muted-foreground" />
            Content Sharing & Visibility
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Public Workspaces</h3>
              <p className="text-muted-foreground font-light">
                When you create a public workspace, the content becomes accessible to anyone with the link. 
                Public workspaces may be indexed by search engines.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Private Workspaces</h3>
              <p className="text-muted-foreground font-light">
                Private workspaces are only accessible to you and people you explicitly share the link with. 
                They are not indexed by search engines and require authentication to access.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Password Protected</h3>
              <p className="text-muted-foreground font-light">
                Password-protected workspaces add an extra layer of security. Passwords are hashed and 
                never stored in plain text.
              </p>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-muted-foreground" />
            Data Retention & Deletion
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Automatic Expiration</h3>
              <p className="text-muted-foreground font-light">
                Workspaces with expiration dates are automatically deleted when they expire. This includes 
                all associated metadata, but files in Google Drive remain unless manually deleted.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Manual Deletion</h3>
              <p className="text-muted-foreground font-light">
                You can delete your workspaces at any time. Deletion is immediate and cannot be undone. 
                Files in Google Drive must be deleted separately if desired.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Account Deletion</h3>
              <p className="text-muted-foreground font-light">
                If you delete your account, all associated workspaces and metadata are permanently removed. 
                Files in your Google Drive are not affected.
              </p>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8">Third-Party Services</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Stack Auth</h3>
              <p className="text-muted-foreground font-light">
                We use Stack Auth for authentication. Please review their 
                <Link href="https://stack-auth.com/privacy" className="text-foreground hover:underline"> privacy policy</Link> 
                for information about how they handle authentication data.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Google Drive API</h3>
              <p className="text-muted-foreground font-light">
                File uploads use Google Drive API. We only request the minimum permissions needed 
                (file creation and management). Review Google&apos;s 
                <Link href="https://policies.google.com/privacy" className="text-foreground hover:underline"> privacy policy</Link> 
                for their data handling practices.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Neon Database</h3>
              <p className="text-muted-foreground font-light">
                Our database is hosted on Neon. Review their 
                <Link href="https://neon.tech/privacy-policy" className="text-foreground hover:underline"> privacy policy</Link> 
                for information about their security and privacy practices.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8 flex items-center">
            <Trash2 className="w-6 h-6 mr-3 text-muted-foreground" />
            Your Rights
          </h2>
          
          <div className="space-y-4">
            <p className="text-muted-foreground font-light">
              You have the right to:
            </p>
            
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="font-light">Access and download your data</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="font-light">Correct inaccurate information</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="font-light">Delete your account and associated data</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="font-light">Object to processing of your data</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="font-light">Request data portability</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center py-12 border-t border-border/30">
          <h2 className="text-2xl font-light text-foreground mb-4">
            Questions About Privacy?
          </h2>
          <p className="text-muted-foreground mb-6 font-light">
            If you have any questions about this privacy policy or how we handle your data, 
            please don&apos;t hesitate to reach out.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="https://all.dev.br" target="_blank">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                Contact Us
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                Learn More
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
