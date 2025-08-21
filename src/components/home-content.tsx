"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, ArrowRight } from "lucide-react";

interface UserData {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
}

interface HomeContentProps {
  user: UserData | null;
}

export function HomeContent({ user }: HomeContentProps) {
  return (
    <main className="min-h-screen bg-background">
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-foreground">
              SendAny
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-lg mx-auto">
              Upload and share files instantly.
              <br />
              Simple, secure, and beautiful.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {user ? (
              <Link href="/new">
                <Button 
                  size="lg" 
                  className="h-12 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90 border-0 rounded-lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload files
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/handler/sign-up">
                  <Button 
                    size="lg" 
                    className="h-12 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90 border-0 rounded-lg"
                  >
                    Get started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/handler/sign-in">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="h-12 px-8 text-base font-medium text-muted-foreground hover:text-foreground"
                  >
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-light text-foreground mb-3">
              Everything you need to share
            </h2>
            <p className="text-muted-foreground font-light">
              Upload files, write notes, share code. All in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Files",
                description: "Upload any file type and share instantly"
              },
              {
                title: "Text & Code",
                description: "Write notes or paste code with syntax highlighting"
              },
              {
                title: "Secure",
                description: "Password protection and automatic expiration"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center space-y-3">
                <h3 className="text-lg font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SendAny.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}