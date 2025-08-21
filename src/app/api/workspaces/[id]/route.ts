import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getWorkspaceById, 
  updateWorkspace, 
  updateWorkspaceFile,
  createWorkspaceFile,
  deleteWorkspaceFile,
  getWorkspaceFiles
} from '@/lib/databse';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Get workspace to verify ownership
    const workspace = await getWorkspaceById(id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (workspace.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update workspace metadata
    await updateWorkspace(id, {
      title: data.title,
      description: data.description,
      is_public: data.is_public,
      expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
      // Note: password and slug updates might need special handling
    });

    // Handle file updates
    const currentFiles = await getWorkspaceFiles(id);
    const newFiles = data.files || [];

    // Create a map of current files by ID
    const currentFileMap = new Map(currentFiles.map(f => [f.id, f]));
    const newFileIds = new Set(newFiles.map((f: any) => f.id).filter(Boolean));

    // Delete files that are no longer present
    for (const currentFile of currentFiles) {
      if (!newFileIds.has(currentFile.id)) {
        await deleteWorkspaceFile(currentFile.id);
      }
    }

    // Update or create files
    for (const newFile of newFiles) {
      if (newFile.id && currentFileMap.has(newFile.id)) {
        // Update existing file
        await updateWorkspaceFile(newFile.id, {
          filename: newFile.filename,
          content: newFile.content,
          file_type: newFile.file_type,
          language: newFile.language,
          file_size: newFile.file_size,
          file_url: newFile.file_url,
          mime_type: newFile.mime_type,
          order_index: newFile.order_index,
        });
      } else {
        // Create new file
        await createWorkspaceFile({
          workspace_id: id,
          filename: newFile.filename,
          content: newFile.content,
          file_type: newFile.file_type,
          language: newFile.language,
          file_size: newFile.file_size,
          file_url: newFile.file_url,
          mime_type: newFile.mime_type,
          order_index: newFile.order_index,
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    const { id } = await params;

    const workspace = await getWorkspaceById(id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if user has access to this workspace
    if (!workspace.is_public && (!user || workspace.user_id !== user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const files = await getWorkspaceFiles(id);

    return NextResponse.json({
      workspace,
      files,
    });

  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}
