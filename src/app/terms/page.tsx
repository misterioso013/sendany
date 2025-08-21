import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ModeToggle from "@/components/ui/mode-toggle";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read SendAny's Terms of Service. Understand your rights and responsibilities when using our file and code sharing platform.",
  keywords: ["terms of service", "terms and conditions", "sendany terms", "user agreement"],
  openGraph: {
    title: "Terms of Service | SendAny",
    description: "Read SendAny's Terms of Service and understand your rights and responsibilities.",
    type: "website",
  },
  alternates: {
    canonical: "https://sendany.all.dev.br/terms",
  },
};

export default function TermsPage() {
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
              <h1 className="text-lg font-medium text-foreground">Terms of Service</h1>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <h1>Terms of Service</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Welcome to SendAny. By using our service, you agree to these Terms of Service. 
            Please read them carefully.
          </p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing or using SendAny, you agree to be bound by these Terms of Service 
            and our Privacy Policy. If you do not agree to these terms, you may not use our service.
          </p>

          <h2>Description of Service</h2>
          <p>
            SendAny is a file and code sharing platform that allows users to:
          </p>
          <ul>
            <li>Create workspaces to organize and share files</li>
            <li>Upload and share various types of content</li>
            <li>Collaborate on code and documents</li>
            <li>Control privacy settings for shared content</li>
          </ul>

          <h2>User Accounts</h2>
          
          <h3>Account Creation</h3>
          <p>
            To use certain features of SendAny, you must create an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activities under your account</li>
          </ul>

          <h3>Age Requirements</h3>
          <p>
            You must be at least 13 years old to use SendAny. Users between 13-18 must have 
            parental or guardian consent.
          </p>

          <h2>Acceptable Use</h2>
          
          <h3>Permitted Uses</h3>
          <p>You may use SendAny to:</p>
          <ul>
            <li>Share legitimate files and content</li>
            <li>Collaborate on code and documents</li>
            <li>Store and organize your digital content</li>
            <li>Create public or private workspaces</li>
          </ul>

          <h3>Prohibited Uses</h3>
          <p>You may NOT use SendAny to:</p>
          <ul>
            <li>Upload illegal, harmful, or infringing content</li>
            <li>Share malware, viruses, or malicious code</li>
            <li>Violate intellectual property rights</li>
            <li>Harass, threaten, or abuse other users</li>
            <li>Spam or send unsolicited communications</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated tools to scrape or collect data</li>
            <li>Share personal information of others without consent</li>
          </ul>

          <h2>Content and Intellectual Property</h2>
          
          <h3>Your Content</h3>
          <p>
            You retain ownership of all content you upload to SendAny. By uploading content, you grant us:
          </p>
          <ul>
            <li>A license to store, display, and share your content as directed by you</li>
            <li>The right to backup and maintain your content</li>
            <li>Permission to process your content to provide our services</li>
          </ul>

          <h3>Removal of Content</h3>
          <p>
            We reserve the right to remove content that violates these terms or applicable laws. 
            You can delete your own content at any time.
          </p>

          <h2>Privacy and Data</h2>
          <p>
            Your privacy is important to us. Please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> 
            {" "}to understand how we collect, use, and protect your information.
          </p>

          <h2>Service Availability</h2>
          
          <h3>Uptime</h3>
          <p>
            While we strive to maintain high availability, we do not guarantee uninterrupted service. 
            SendAny may be temporarily unavailable due to maintenance, updates, or technical issues.
          </p>

          <h3>Data Backup</h3>
          <p>
            We implement backup systems, but we recommend you maintain your own backups of important content. 
            We are not liable for data loss.
          </p>

          <h2>Pricing and Payments</h2>
          
          <h3>Free Service</h3>
          <p>
            SendAny currently offers free access to our platform. We may introduce paid plans 
            in the future with advance notice.
          </p>

          <h3>Storage Limits</h3>
          <p>
            We may implement storage or usage limits to ensure fair access for all users. 
            These limits will be clearly communicated.
          </p>

          <h2>Termination</h2>
          
          <h3>By You</h3>
          <p>
            You may terminate your account at any time by deleting it through your account settings.
          </p>

          <h3>By Us</h3>
          <p>
            We may suspend or terminate your account if you violate these terms, engage in illegal activities, 
            or abuse our service.
          </p>

          <h2>Disclaimers and Limitations</h2>
          
          <h3>Service &quot;As Is&quot;</h3>
          <p>
            SendAny is provided &quot;as is&quot; without warranties of any kind. We disclaim all warranties, 
            express or implied, including merchantability and fitness for a particular purpose.
          </p>

          <h3>Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, SendAny shall not be liable for any indirect, 
            incidental, special, or consequential damages arising from your use of our service.
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to indemnify and hold SendAny harmless from any claims, damages, or expenses 
            arising from your use of our service or violation of these terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction where SendAny operates. 
            Any disputes will be resolved in the appropriate courts of that jurisdiction.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. We will notify users of 
            material changes by posting the updated terms on our website.
          </p>

          <h2>Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us:
          </p>
          <ul>
            <li>Email: rosielvictor.dev@gmail.com</li>
            <li>Website: <Link href="/contact" className="text-primary hover:underline">Contact Form</Link></li>
          </ul>

          <p className="text-sm text-muted-foreground mt-12">
            By continuing to use SendAny, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Service.
          </p>
        </div>
      </main>
    </div>
  );
}
