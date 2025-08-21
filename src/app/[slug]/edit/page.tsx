import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getWorkspace, getWorkspaceFiles, verifyWorkspacePassword } from "@/lib/databse";
import { WorkspaceEditor } from "@/components/workspace-editor";
import { PasswordForm } from "@/components/password-form";
import { stackServerApp } from "@/stack";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ password?: string }>;
}

async function WorkspaceEditContent({ slug, password }: { slug: string; password?: string }) {
  const workspace = await getWorkspace(slug);
  
  if (!workspace) {
    notFound();
  }

  // Check if workspace is expired
  if (workspace.expires_at && new Date(workspace.expires_at) < new Date()) {
    notFound();
  }

  // Check if user is authenticated and owns the workspace
  const user = await stackServerApp.getUser();
  if (!user || workspace.user_id !== user.id) {
    redirect(`/${slug}`); // Redirect to view-only mode
  }

  // Check password protection (even for owners)
  if (workspace.password_hash) {
    if (!password) {
      return <PasswordForm slug={slug} isEdit={true} />;
    }

    const isValidPassword = await verifyWorkspacePassword(slug, password);
    if (!isValidPassword) {
      return <PasswordForm slug={slug} error="Invalid password" isEdit={true} />;
    }
  }

  // Get workspace files
  const files = await getWorkspaceFiles(workspace.id);

  return (
    <WorkspaceEditor
      initialData={{
        id: workspace.id,
        title: workspace.title,
        description: workspace.description || undefined,
        slug: workspace.slug,
        files: files.map(file => ({
          id: file.id,
          filename: file.filename,
          content: file.content || undefined,
          file_type: file.file_type,
          language: file.language as "javascript" | "typescript" | "css" | "html" | "json" | "markdown" | "python" | "sql" | "text" | undefined,
          file_size: file.file_size || undefined,
          file_url: file.file_url || undefined,
          mime_type: file.mime_type || undefined,
          order_index: file.order_index,
        })),
        is_public: workspace.is_public,
        expires_at: workspace.expires_at ? new Date(workspace.expires_at) : undefined,
      }}
      isReadOnly={false}
    />
  );
}

export default async function WorkspaceEditPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { password } = await searchParams;

  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workspace editor...</p>
        </div>
      </div>
    }>
      <WorkspaceEditContent slug={slug} password={password} />
    </Suspense>
  );
}
