import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Lock, Clock, Code, Upload, Users } from "lucide-react";

export default function AboutPage() {
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
          <h1 className="text-3xl font-light text-foreground">About SendAny</h1>
          <p className="text-muted-foreground mt-2 font-light">
            The perfect combination of Google Drive, Pastebin, and GitHub Gist
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="space-y-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-light text-foreground">
              Share anything with anyone
            </h2>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              SendAny is a minimalist and elegant platform for sharing content online.<br />Create workspaces to share text, code, and files with full control over
              privacy, password protection, and expiration times.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Users className="w-5 h-5 mr-3 text-muted-foreground" />
                For Registered Users
              </h3>
              
              <div className="space-y-4 pl-8">
                <div>
                  <h4 className="font-medium text-foreground">Workspaces</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Create workspace similar to GitHub Gist with multiple files and rich content
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Code Editor</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Syntax highlighting for multiple programming languages
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Markdown Support</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Full Markdown support with real-time preview
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">File Upload</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Upload any file type with Google Drive integration
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Privacy Control</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Choose between public or private visibility
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Custom URLs</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Edit slugs for more friendly URLs
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <Share2 className="w-5 h-5 mr-3 text-muted-foreground" />
                For Everyone
              </h3>
              
              <div className="space-y-4 pl-8">
                <div>
                  <h4 className="font-medium text-foreground">Link Access</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    View shared workspaces without registration
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Password Protection</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Secure content with password protection
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Clean Interface</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Optimized viewing experience for all devices
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground">Expiration Control</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Content automatically expires when set
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8">Technology</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Code className="w-8 h-8 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Modern Stack</h3>
              <p className="text-sm text-muted-foreground font-light">
                Built with Next.js 15, React 19, and TypeScript for maximum performance and developer experience
              </p>
            </div>
            
            <div className="space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Secure</h3>
              <p className="text-sm text-muted-foreground font-light">
                Stack Auth authentication, bcrypt password hashing, and input validation for maximum security
              </p>
            </div>
            
            <div className="space-y-3">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Integrated</h3>
              <p className="text-sm text-muted-foreground font-light">
                Google Drive integration for file storage, CodeMirror for code editing, and Markdown support
              </p>
            </div>
          </div>
        </section>

        {/* Limitations Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-foreground mb-8">File Storage Limits</h2>
          
          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Maximum file size</span>
              <span className="text-muted-foreground font-medium">100 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Maximum workspace size</span>
              <span className="text-muted-foreground font-medium">500 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Total storage per user</span>
              <span className="text-muted-foreground font-medium">5 GB</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 font-light">
            Files are stored in your personal Google Drive under the `/SendAny/` folder. 
            You maintain full control over your files and can access them directly through Google Drive.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 border-t border-border/30">
          <h2 className="text-2xl font-light text-foreground mb-4">
            Ready to start sharing?
          </h2>
          <p className="text-muted-foreground mb-6 font-light">
            Create your first workspace and experience the power of simple sharing
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/new">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                Create Workspace
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                View Dashboard
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
