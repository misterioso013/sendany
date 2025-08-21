import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getWorkspace, getWorkspaceFiles, verifyWorkspacePassword, recordWorkspaceView } from "@/lib/databse";
import { WorkspaceViewer } from "@/components/workspace-viewer";
import { PasswordForm } from "@/components/password-form";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ password?: string }>;
}

async function WorkspaceContent({ slug, password }: { slug: string; password?: string }) {
  const workspace = await getWorkspace(slug);
  
  if (!workspace) {
    notFound();
  }

  // Check if workspace is expired
  if (workspace.expires_at && new Date(workspace.expires_at) < new Date()) {
    notFound();
  }

  // Check password protection
  if (workspace.password_hash) {
    if (!password) {
      return <PasswordForm slug={slug} />;
    }

    const isValidPassword = await verifyWorkspacePassword(slug, password);
    if (!isValidPassword) {
      return <PasswordForm slug={slug} error="Invalid password" />;
    }
  }

  // Record view (get IP from headers)
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";
  
  await recordWorkspaceView(workspace.id, ip, userAgent);

  // Get workspace files
  const files = await getWorkspaceFiles(workspace.id);

  return (
    <WorkspaceViewer
      workspace={{
        id: workspace.id,
        title: workspace.title,
        description: workspace.description || undefined,
        slug: workspace.slug,
        is_public: workspace.is_public,
        expires_at: workspace.expires_at ? new Date(workspace.expires_at) : undefined,
      }}
      files={files.map(file => ({
        id: file.id,
        filename: file.filename,
        content: file.content || undefined,
        file_type: file.file_type,
        language: file.language as "javascript" | "typescript" | "css" | "html" | "json" | "markdown" | "python" | "sql" | "text" | undefined,
        file_size: file.file_size || undefined,
        file_url: file.file_url || undefined,
        mime_type: file.mime_type || undefined,
        order_index: file.order_index,
      }))}
    />
  );
}

export default async function WorkspacePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { password } = await searchParams;

  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    }>
      <WorkspaceContent slug={slug} password={password} />
    </Suspense>
  );
}
