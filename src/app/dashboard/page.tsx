import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";
import { getWorkspacesByUser, getWorkspacesCountByUser } from "@/lib/databse";
import { UserDashboard } from "@/components/user-dashboard-minimal";

interface DashboardPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await stackServerApp.getUser();
  
  if (!user) {
    redirect("/handler/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1");
  const limit = 10;
  
  const [workspaces, totalWorkspaces] = await Promise.all([
    getWorkspacesByUser(user.id, currentPage, limit),
    getWorkspacesCountByUser(user.id)
  ]);

  const totalPages = Math.ceil(totalWorkspaces / limit);

  // Extract only serializable user data
  const userData = {
    id: user.id,
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    profileImageUrl: user.profileImageUrl,
  };

  return (
    <div className="min-h-screen bg-background">
      <UserDashboard 
        user={userData} 
        workspaces={workspaces}
        currentPage={currentPage}
        totalPages={totalPages}
        totalWorkspaces={totalWorkspaces}
      />
    </div>
  );
}
