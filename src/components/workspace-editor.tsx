"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { FileUploader } from "@/components/file-uploader";
import { type FileWithPreview } from "@/hooks/use-file-upload";
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Trash2,
  Save,
  Share,
  FileText,
  Code,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

type FileType = "text" | "code" | "markdown" | "file";
type Language = "javascript" | "typescript" | "css" | "html" | "json" | "markdown" | "python" | "sql" | "text";

interface WorkspaceFile {
  id: string;
  filename: string;
  content?: string;
  file_type: FileType;
  language?: Language;
  file_size?: number;
  file_url?: string;
  mime_type?: string;
  order_index: number;
}

interface WorkspaceEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    slug?: string;
    files?: WorkspaceFile[];
    is_public?: boolean;
    expires_at?: Date;
    password?: string;
  };
  isReadOnly?: boolean;
  onSave?: (data: WorkspaceData) => void;
  onShare?: (slug: string) => void;
}

interface WorkspaceData {
  title: string;
  description?: string;
  slug?: string;
  files: WorkspaceFile[];
  is_public: boolean;
  expires_at?: Date | null;
  password?: string | null;
}

export function WorkspaceEditor({ 
  initialData, 
  isReadOnly = false, 
  onSave, 
  onShare 
}: WorkspaceEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "Untitled");
  const [description, setDescription] = useState(initialData?.description || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const [password, setPassword] = useState(initialData?.password || "");
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expires_at ? initialData.expires_at.toISOString().slice(0, 16) : ""
  );
  
  const [files, setFiles] = useState<WorkspaceFile[]>(initialData?.files || []);
  
  // Function to get default active file (prioritize README.md)
  const getDefaultActiveFileId = (fileList: WorkspaceFile[]) => {
    if (fileList.length === 0) return null;
    
    // Look for README.md (case insensitive)
    const readmeFile = fileList.find(f => 
      f.filename.toLowerCase() === 'readme.md' ||
      f.filename.toLowerCase() === 'readme.markdown'
    );
    
    if (readmeFile) return readmeFile.id;
    
    // Look for any markdown file
    const markdownFile = fileList.find(f => f.language === 'markdown');
    if (markdownFile) return markdownFile.id;
    
    // Default to first file
    return fileList[0].id;
  };
  
  const [activeFileId, setActiveFileId] = useState<string | null>(
    getDefaultActiveFileId(files)
  );
  const [showSettings, setShowSettings] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId);

  const addFile = useCallback((type: FileType) => {
    const id = nanoid();
    let filename = "untitled";
    let language: Language = "text";
    
    switch (type) {
      case "code":
        filename = "untitled.js";
        language = "javascript";
        break;
      case "markdown":
        filename = "untitled.md";
        language = "markdown";
        break;
      case "text":
        filename = "untitled.txt";
        language = "text";
        break;
    }

    const newFile: WorkspaceFile = {
      id,
      filename,
      content: "",
      file_type: type,
      language,
      order_index: files.length,
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(id);
  }, [files.length]);

  const updateFile = useCallback((id: string, updates: Partial<WorkspaceFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(getDefaultActiveFileId(newFiles));
      }
      return newFiles;
    });
  }, [activeFileId]);

  const handleUploadedFiles = useCallback((uploadedFiles: FileWithPreview[]) => {
    const newFiles: WorkspaceFile[] = uploadedFiles.map((fileWithPreview, index) => {
      const file = fileWithPreview.file;
      const isFileObject = file instanceof globalThis.File;
      
      return {
        id: nanoid(),
        filename: file.name,
        file_type: "file" as FileType,
        file_size: file.size,
        file_url: isFileObject ? "" : (file as { url?: string }).url || "", // Will be uploaded later
        mime_type: isFileObject ? file.type : (file as { type?: string }).type || "",
        order_index: files.length + index,
      };
    });

    setFiles(prev => {
      const updatedFiles = [...prev, ...newFiles];
      // If there's a README.md in the uploaded files, select it
      const readmeFile = newFiles.find(f => 
        f.filename.toLowerCase() === 'readme.md' ||
        f.filename.toLowerCase() === 'readme.markdown'
      );
      
      if (readmeFile) {
        setActiveFileId(readmeFile.id);
      } else if (prev.length === 0 && newFiles.length > 0) {
        // If this is the first file upload, use the smart selection
        setActiveFileId(getDefaultActiveFileId(updatedFiles));
      }
      
      return updatedFiles;
    });
  }, [files.length]);

  const getLanguageFromFilename = (filename: string): Language => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'css': return 'css';
      case 'html': case 'htm': return 'html';
      case 'json': return 'json';
      case 'md': case 'markdown': return 'markdown';
      case 'py': return 'python';
      case 'sql': return 'sql';
      default: return 'text';
    }
  };

  const handleSave = async () => {
    const data = {
      title,
      description,
      slug: slug || nanoid(10),
      files,
      is_public: isPublic,
      expires_at: expiresAt ? new Date(expiresAt) : null,
      password: password || null,
    };
    
    if (onSave) {
      // If onSave prop is provided, use it (for create new workspace)
      onSave(data);
    } else if (initialData?.id) {
      // If editing existing workspace, save via API
      try {
        const response = await fetch(`/api/workspaces/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save workspace');
        }
        
        // Show success feedback or redirect
        alert('Workspace saved successfully!');
      } catch (error) {
        console.error('Error saving workspace:', error);
        alert('Failed to save workspace. Please try again.');
      }
    }
  };

  if (isReadOnly && files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No files found</h3>
        <p className="text-muted-foreground">This workspace is empty.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 min-w-0">
          {isReadOnly ? (
            <div>
              <h1 className="text-xl font-bold truncate">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground truncate">{description}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold bg-transparent border-none outline-none w-full"
                placeholder="Workspace title"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full"
                placeholder="Description (optional)"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          )}
          {slug && (
            <Button
              variant="outline"
              onClick={() => onShare?.(slug)}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && !isReadOnly && (
        <div className="p-4 bg-muted/50 border-b space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Custom URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="custom-slug"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Expiration Date
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Password Protection
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Optional password"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border",
                  isPublic ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                )}
              >
                {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {isPublic ? "Public" : "Private"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* File Sidebar */}
        <div className="w-64 border-r bg-muted/25 flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Files</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50",
                  activeFileId === file.id && "bg-muted"
                )}
                onClick={() => setActiveFileId(file.id)}
              >
                {file.file_type === "file" ? (
                  <Upload className="w-4 h-4 text-muted-foreground" />
                ) : file.file_type === "markdown" ? (
                  <FileText className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Code className="w-4 h-4 text-muted-foreground" />
                )}
                
                <span className="text-sm truncate flex-1">{file.filename}</span>
                
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!isReadOnly && (
            <div className="p-3 border-t space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addFile("text")}
                  className="text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addFile("code")}
                  className="text-xs"
                >
                  <Code className="w-3 h-3 mr-1" />
                  Code
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addFile("markdown")}
                className="w-full text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Markdown
              </Button>
              
              <div className="pt-2">
                <FileUploader
                  onFilesChange={handleUploadedFiles}
                  maxFiles={10}
                  maxSize={50}
                  className="text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <>
              <div className="flex items-center justify-between p-3 border-b bg-muted/25">
                <div className="flex items-center gap-2">
                  {!isReadOnly ? (
                    <input
                      type="text"
                      value={activeFile.filename}
                      onChange={(e) => {
                        const newFilename = e.target.value;
                        updateFile(activeFile.id, { 
                          filename: newFilename,
                          language: getLanguageFromFilename(newFilename)
                        });
                      }}
                      className="bg-transparent border-none outline-none font-medium"
                    />
                  ) : (
                    <span className="font-medium">{activeFile.filename}</span>
                  )}
                </div>
                
                {activeFile.file_size && (
                  <span className="text-xs text-muted-foreground">
                    {(activeFile.file_size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>

              <div className="flex-1">
                {activeFile.file_type === "file" ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium mb-2">{activeFile.filename}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activeFile.mime_type} • {activeFile.file_size && (activeFile.file_size / 1024).toFixed(1)} KB
                      </p>
                      {activeFile.file_url && (
                        <Button variant="outline" className="mt-4">
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <CodeEditor
                    value={activeFile.content || ""}
                    onChange={(value) => updateFile(activeFile.id, { content: value })}
                    language={activeFile.language || "text"}
                    filename={activeFile.filename}
                    readonly={isReadOnly}
                    placeholder={`Start typing in ${activeFile.filename}...`}
                    defaultPreview={isReadOnly && activeFile.language === 'markdown'}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No file selected</h3>
                <p className="text-muted-foreground mb-4">
                  {files.length === 0 
                    ? "Create your first file to get started" 
                    : "Select a file from the sidebar"}
                </p>
                {!isReadOnly && files.length === 0 && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => addFile("text")}>
                      <FileText className="w-4 h-4 mr-2" />
                      New Text File
                    </Button>
                    <Button variant="outline" onClick={() => addFile("code")}>
                      <Code className="w-4 h-4 mr-2" />
                      New Code File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
