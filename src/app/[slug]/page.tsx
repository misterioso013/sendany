import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getWorkspace, getWorkspaceFiles, verifyWorkspacePassword, recordWorkspaceView } from "@/lib/databse";
import { WorkspaceViewer } from "@/components/workspace-viewer";
import { PasswordForm } from "@/components/password-form";
import { headers } from "next/headers";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ password?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const workspace = await getWorkspace(slug);
    
    if (!workspace) {
      return {
        title: 'Workspace Not Found | SendAny',
        description: 'The requested workspace could not be found.',
        robots: 'noindex, nofollow',
      };
    }

    // Check if workspace is expired
    if (workspace.expires_at && new Date(workspace.expires_at) < new Date()) {
      return {
        title: 'Workspace Expired | SendAny',
        description: 'This workspace has expired and is no longer available.',
        robots: 'noindex, nofollow',
      };
    }

    // For private or password-protected workspaces
    if (!workspace.is_public || workspace.password_hash) {
      return {
        title: `${workspace.title} | SendAny`,
        description: 'A private workspace on SendAny. Access restricted.',
        robots: 'noindex, nofollow',
      };
    }

    // Get files for public workspaces
    const files = await getWorkspaceFiles(workspace.id);
    const fileCount = files.length;
    const hasCode = files.some(f => f.file_type === 'code');
    const hasMarkdown = files.some(f => f.file_type === 'markdown');
    const hasFiles = files.some(f => f.file_type === 'file');
    
    // Create dynamic description
    let description = workspace.description || `Shared workspace containing ${fileCount} file${fileCount !== 1 ? 's' : ''}`;
    
    if (fileCount > 0) {
      const types = [];
      if (hasCode) types.push('code');
      if (hasMarkdown) types.push('documentation');
      if (hasFiles) types.push('files');
      
      if (types.length > 0) {
        description += ` including ${types.join(', ')}`;
      }
    }
    
    description += ' - Shared securely on SendAny.';

    const title = `${workspace.title} | SendAny`;
    const url = `https://sendany.all.dev.br/${workspace.slug}`;

    return {
      title,
      description,
      keywords: [
        'file sharing',
        'code sharing',
        'workspace',
        'SendAny',
        workspace.title,
        ...(hasCode ? ['code', 'programming', 'development'] : []),
        ...(hasMarkdown ? ['documentation', 'markdown'] : []),
        ...(hasFiles ? ['file upload', 'file sharing'] : []),
      ],
      authors: [{ name: 'SendAny' }],
      creator: 'SendAny',
      publisher: 'SendAny',
      robots: workspace.is_public ? 'index, follow' : 'noindex, nofollow',
      openGraph: {
        title,
        description,
        url,
        siteName: 'SendAny',
        type: 'website',
        locale: 'en_US',
        images: [
          {
            url: '/og-workspace.png',
            width: 1200,
            height: 630,
            alt: `${workspace.title} - SendAny Workspace`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@RVictor013',
        images: ['/og-workspace.png'],
      },
      alternates: {
        canonical: url,
      },
      other: {
        'workspace:file_count': fileCount.toString(),
        'workspace:type': workspace.is_public ? 'public' : 'private',
        'workspace:created': workspace.created_at?.toISOString() || '',
      },
    };
  } catch (error) {
    console.error('Error generating metadata for workspace:', error);
    return {
      title: 'SendAny Workspace',
      description: 'Share files, code, and documents securely with SendAny.',
      robots: 'noindex, nofollow',
    };
  }
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
