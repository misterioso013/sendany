import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import { stackServerApp } from "@/stack";
import { HomeContent } from "@/components/home-content";
import ModeToggle from "@/components/ui/mode-toggle";

export default async function HomePage() {
  const user = await stackServerApp.getUser();
  
  // Extract only serializable user data
  const userData = user ? {
    id: user.id,
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    profileImageUrl: user.profileImageUrl,
  } : null;

  return (
    <div className="min-h-screen">
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