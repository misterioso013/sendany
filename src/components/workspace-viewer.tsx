"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Archive,
  File,
  Eye,
  ExternalLink,
  Share
} from "lucide-react";
import { cn } from "@/lib/utils";

type Language = "javascript" | "typescript" | "css" | "html" | "json" | "markdown" | "python" | "sql" | "text";

interface WorkspaceFile {
  id: string;
  filename: string;
  content?: string;
  file_type: "text" | "code" | "markdown" | "file";
  language?: Language;
  file_size?: number;
  file_url?: string;
  mime_type?: string;
  order_index: number;
}

interface WorkspaceViewerProps {
  workspace: {
    id: string;
    title: string;
    description?: string;
    slug: string;
    is_public: boolean;
    expires_at?: Date;
  };
  files: WorkspaceFile[];
}

// Helper function to get file icon based on mime type
const getFileIcon = (mimeType?: string, filename?: string) => {
  if (!mimeType && !filename) return File;
  
  if (mimeType?.startsWith('image/')) return ImageIcon;
  if (mimeType?.startsWith('video/')) return Video;
  if (mimeType?.startsWith('audio/')) return Music;
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar')) return Archive;
  
  // Check by file extension if mime type is not available
  const ext = filename?.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return ImageIcon;
  if (ext && ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', '3gp'].includes(ext)) return Video;
  if (ext && ['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return Music;
  
  return FileText;
};

// Helper function to determine if file can be previewed
const canPreviewFile = (mimeType?: string, filename?: string) => {
  if (!mimeType && !filename) return false;
  
  if (mimeType?.startsWith('image/')) return true;
  if (mimeType?.startsWith('video/')) return true;
  
  const ext = filename?.split('.').pop()?.toLowerCase();
  if (ext && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return true;
  if (ext && ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', '3gp'].includes(ext)) return true;
  
  return false;
};

// Helper function to format file size
const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export function WorkspaceViewer({ workspace, files }: WorkspaceViewerProps) {
  const [activeFileId, setActiveFileId] = useState<string | null>(
    files.length > 0 ? files[0].id : null
  );
  
  const activeFile = files.find(f => f.id === activeFileId);

  const handleShare = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    // You could add a toast notification here
  };

  const handleDownload = (file: WorkspaceFile) => {
    if (file.file_url) {
      // For uploaded files, download from URL
      const link = document.createElement('a');
      link.href = file.file_url;
      link.download = file.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (file.content) {
      // For text content, create blob and download
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const renderFilePreview = (file: WorkspaceFile) => {
    // Text/Code content
    if (file.content && (file.file_type === 'text' || file.file_type === 'code' || file.file_type === 'markdown')) {
      return (
        <div className="h-full">
          <CodeEditor
            value={file.content}
            language={file.language || 'text'}
            onChange={() => {}} // Read-only
            readonly={true}
          />
        </div>
      );
    }

    // File preview (images, videos)
    if (file.file_url && canPreviewFile(file.mime_type, file.filename)) {
      if (file.mime_type?.startsWith('image/')) {
        return (
          <div className="flex items-center justify-center h-full p-8">
            <img
              src={file.file_url}
              alt={file.filename}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Image failed to load:', file.file_url);
                const target = e.target as HTMLImageElement;
                
                // Extract file ID from various Google Drive URL formats
                let fileId = '';
                if (target.src.includes('googleusercontent.com/d/')) {
                  fileId = target.src.match(/\/d\/([^=]*)/)?.[1] || '';
                } else if (target.src.includes('drive.google.com')) {
                  fileId = target.src.match(/[?&]id=([^&]*)/)?.[1] || 
                           target.src.match(/\/d\/([^\/]*)/)?.[1] || '';
                }
                
                if (target.src.includes('googleusercontent.com') && fileId) {
                  // If googleusercontent fails, try direct Drive URL
                  target.src = `https://drive.google.com/uc?id=${fileId}`;
                } else if (target.src.includes('drive.google.com/uc') && !target.src.includes('/api/proxy-image')) {
                  // If direct Drive fails, use our proxy
                  target.src = `/api/proxy-image?url=${encodeURIComponent(target.src)}`;
                } else if (!target.src.includes('/api/proxy-image') && fileId) {
                  // Try proxy with the original Google Drive URL
                  const originalUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                  target.src = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
                } else {
                  // Last fallback - show error state
                  target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'text-center';
                  errorDiv.innerHTML = `
                    <div class="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                      <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <p class="text-sm text-muted-foreground">Unable to display image</p>
                    <p class="text-xs text-muted-foreground mt-1">Click download to view the file</p>
                  `;
                  target.parentElement!.appendChild(errorDiv);
                }
              }}
            />
          </div>
        );
      }
      
      if (file.mime_type?.startsWith('video/') || 
          (['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', '3gp'].includes(
            file.filename?.split('.').pop()?.toLowerCase() || ''
          ))) {
        return (
          <div className="flex items-center justify-center h-full p-8">
            <iframe
              src={file.file_url}
              className="w-full h-full min-h-[400px] rounded-lg shadow-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={file.filename}
            />
          </div>
        );
      }
    }

    // Default file view
    const FileIconComponent = getFileIcon(file.mime_type, file.filename);
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileIconComponent className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{file.filename}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {formatFileSize(file.file_size)}
        </p>
        {file.file_url && (
          <div className="space-y-2">
            <Button onClick={() => handleDownload(file)} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(file.file_url, '_blank')}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{workspace.title}</h1>
            {workspace.description && (
              <p className="text-sm text-muted-foreground truncate">{workspace.description}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare(workspace.slug)}
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-muted-foreground">This workspace is empty.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{workspace.title}</h1>
          {workspace.description && (
            <p className="text-sm text-muted-foreground truncate">{workspace.description}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare(workspace.slug)}
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        {files.length > 1 && (
          <div className="w-64 border-r bg-muted/20">
            <div className="p-3 border-b">
              <h3 className="font-medium text-sm">Files ({files.length})</h3>
            </div>
            <div className="p-2">
              {files.map((file) => {
                const FileIconComponent = getFileIcon(file.mime_type, file.filename);
                return (
                  <button
                    key={file.id}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-md text-left hover:bg-muted/50 transition-colors",
                      activeFileId === file.id && "bg-muted"
                    )}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    <FileIconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-sm">{file.filename}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {activeFile && (
            <>
              {/* File header */}
              <div className="flex items-center justify-between p-4 border-b bg-background/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {(() => {
                    const FileIconComponent = getFileIcon(activeFile.mime_type, activeFile.filename);
                    return <FileIconComponent className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
                  })()}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium truncate">{activeFile.filename}</h2>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(activeFile.file_size)}
                      {activeFile.mime_type && ` • ${activeFile.mime_type}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canPreviewFile(activeFile.mime_type, activeFile.filename) && (
                    <Eye className="w-4 h-4 text-green-600" />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(activeFile)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* File content */}
              <div className="flex-1 overflow-hidden">
                {renderFilePreview(activeFile)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
