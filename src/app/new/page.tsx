import { redirect } from "next/navigation";
import Link from "next/link";
import { stackServerApp } from "@/stack";
import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import { ArrowLeft } from "lucide-react";
import ModeToggle from "@/components/ui/mode-toggle";

export default async function NewWorkspacePage() {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/handler/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="w-px h-4 bg-border/50" />
              <h1 className="text-lg font-medium text-foreground">New workspace</h1>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <CreateWorkspaceForm userId={user.id} />
      </main>
    </div>
  );
}
