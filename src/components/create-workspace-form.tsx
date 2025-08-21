"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/file-uploader-minimal";
import { CodeEditor } from "@/components/code-editor";
import { createWorkspace, createWorkspaceFile } from "@/lib/databse";
import { useGoogleDriveStatus } from "@/hooks/use-google-drive-status";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { Upload, FileText, Settings, Save, X, AlertCircle, Cloud, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWorkspaceFormProps {
  userId: string;
}

type ContentType = "upload" | "content";

export function CreateWorkspaceForm({ userId }: CreateWorkspaceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("Untitled workspace");
  const [activeContentType, setActiveContentType] = useState<ContentType>("upload");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  
  // Multiple text files support
  const [textFiles, setTextFiles] = useState<Array<{
    id: string;
    filename: string;
    content: string;
    language: string;
  }>>([
    { id: nanoid(), filename: "untitled.md", content: "", language: "markdown" }
  ]);
  const [activeTextFileIndex, setActiveTextFileIndex] = useState(0);
  
  const [showSettings, setShowSettings] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  
  const router = useRouter();
  const driveStatus = useGoogleDriveStatus();

  // Auto-switch from upload if Google Drive becomes unavailable
  useEffect(() => {
    if (activeContentType === "upload" && (!driveStatus.isAvailable || !driveStatus.isConnected)) {
      setActiveContentType("content");
    }
  }, [activeContentType, driveStatus.isAvailable, driveStatus.isConnected]);

  // Functions for managing text files
  const addTextFile = () => {
    const newFile = {
      id: nanoid(),
      filename: "untitled.md",
      content: "",
      language: "markdown"
    };
    setTextFiles([...textFiles, newFile]);
  };

  const removeTextFile = (id: string) => {
    if (textFiles.length > 1) {
      const removingIndex = textFiles.findIndex(file => file.id === id);
      setTextFiles(textFiles.filter(file => file.id !== id));
      
      // Adjust active index if necessary
      if (removingIndex <= activeTextFileIndex && activeTextFileIndex > 0) {
        setActiveTextFileIndex(activeTextFileIndex - 1);
      } else if (removingIndex === activeTextFileIndex && removingIndex === textFiles.length - 1) {
        setActiveTextFileIndex(activeTextFileIndex - 1);
      }
    }
  };

  const updateTextFile = (id: string, updates: Partial<typeof textFiles[0]>) => {
    setTextFiles(textFiles.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  // Function to get language from filename extension
  const getLanguageFromFilename = (filename: string): "javascript" | "typescript" | "css" | "html" | "json" | "markdown" | "python" | "sql" | "text" => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, "javascript" | "typescript" | "css" | "html" | "json" | "markdown" | "python" | "sql" | "text"> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'htm': 'html',
      'json': 'json',
      'md': 'markdown',
      'markdown': 'markdown',
      'sql': 'sql',
      'txt': 'text',
    };
    return languageMap[ext || ''] || 'text';
  };

  // Function to determine file type from extension
  const getFileTypeFromFilename = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'css', 'html', 'htm', 'json', 'sql'].includes(ext || '')) {
      return 'code';
    } else if (['md', 'markdown'].includes(ext || '')) {
      return 'markdown';
    }
    return 'text';
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const workspaceFiles: Array<{
        filename: string;
        content?: string;
        file_type: "text" | "code" | "markdown" | "file";
        language?: string;
        file_size?: number;
        file_url?: string;
        mime_type?: string;
        order_index: number;
      }> = [];
      
      // First, create workspace
      const workspace = await createWorkspace({
        title,
        user_id: userId,
        password: password || undefined,
        expires_at: expiresAt ? new Date(expiresAt) : undefined,
        is_public: isPublic,
      });

      // Process uploaded files - upload to Google Drive first
      for (let index = 0; index < files.length; index++) {
        const fileWithPreview = files[index];
        
        // Handle both File and FileMetadata cases
        const filename = fileWithPreview.file instanceof globalThis.File ? fileWithPreview.file.name : fileWithPreview.file.name;
        const fileSize = fileWithPreview.file instanceof globalThis.File ? fileWithPreview.file.size : fileWithPreview.file.size;
        const mimeType = fileWithPreview.file instanceof globalThis.File ? fileWithPreview.file.type : fileWithPreview.file.type;
        
        // Only upload if it's a real File object (not already uploaded)
        let fileUrl = '';
        if (fileWithPreview.file instanceof globalThis.File) {
          try {
            // Upload to Google Drive
            const formData = new FormData();
            formData.append('file', fileWithPreview.file);
            formData.append('workspaceId', workspace.id);
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              const error = await uploadResponse.json();
              throw new Error(error.error || 'Failed to upload file');
            }
            
            const uploadResult = await uploadResponse.json();
            fileUrl = uploadResult.driveFile.webViewLink || '';
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            // Continue with local storage if Google Drive fails
            fileUrl = '';
          }
        } else {
          // File is already uploaded (FileMetadata case)
          fileUrl = fileWithPreview.file.url || '';
        }
        
        workspaceFiles.push({
          filename: filename || `file-${index + 1}`,
          file_type: "file",
          file_size: fileSize,
          file_url: fileUrl,
          mime_type: mimeType,
          order_index: index,
        });
      }
      
      // Add content files if provided
      textFiles.forEach((textFile, index) => {
        if (textFile.content.trim()) {
          workspaceFiles.push({
            filename: textFile.filename || "untitled.md",
            content: textFile.content,
            file_type: getFileTypeFromFilename(textFile.filename || "untitled.md"),
            language: getLanguageFromFilename(textFile.filename || "untitled.md"),
            order_index: files.length + index,
          });
        }
      });

      // Create files in database
      for (const file of workspaceFiles) {
        await createWorkspaceFile({
          workspace_id: workspace.id,
          filename: file.filename,
          content: file.content,
          file_type: file.file_type,
          language: file.language,
          file_size: file.file_size,
          file_url: file.file_url,
          mime_type: file.mime_type,
          order_index: file.order_index,
        });
      }

      // Redirect to the new workspace
      router.push(`/${workspace.slug}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const contentTypes = [
    { 
      type: "upload" as ContentType, 
      label: "Upload files", 
      icon: Upload,
      description: "Drag and drop or select files"
    },
    { 
      type: "content" as ContentType, 
      label: "Write content", 
      icon: FileText,
      description: "Write text, code, or markdown"
    },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-light bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full"
            placeholder="Workspace title..."
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || (files.length === 0 && textFiles.every(f => !f.content.trim()))}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save & Share
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 border border-border/30 rounded-lg bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <select
                value={isPublic ? "public" : "private"}
                onChange={(e) => setIsPublic(e.target.value === "public")}
                className="w-full p-2 border border-border/30 rounded bg-background text-foreground"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Protect with password"
                className="w-full p-2 border border-border/30 rounded bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expires (optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-2 border border-border/30 rounded bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Type Selector */}
      <div className="flex gap-1 mb-6 border border-border/30 rounded-lg p-1 bg-muted/20">
        {contentTypes.map((item) => {
          const isUploadDisabled = item.type === "upload" && (!driveStatus.isAvailable || !driveStatus.isConnected);
          
          return (
            <button
              key={item.type}
              onClick={() => !isUploadDisabled && setActiveContentType(item.type)}
              disabled={isUploadDisabled}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-3 rounded-md transition-all text-sm font-medium relative",
                activeContentType === item.type
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                isUploadDisabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground"
              )}
              title={isUploadDisabled ? "Google Drive is not available or connected" : undefined}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {isUploadDisabled && (
                <AlertCircle className="w-3 h-3 text-destructive absolute -top-1 -right-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Google Drive Status Message */}
      {(!driveStatus.isAvailable || !driveStatus.isConnected) && (
        <div className="mb-4 p-3 bg-muted/50 border border-border/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cloud className="w-4 h-4" />
            <span>
              {driveStatus.loading ? (
                "Checking Google Drive connection..."
              ) : !driveStatus.isAvailable ? (
                "Google Drive is not configured. File uploads are disabled."
              ) : (
                "Google Drive is not connected. File uploads are disabled."
              )}
            </span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1">
        {activeContentType === "upload" && (
          <div className="space-y-4">
            <FileUploader
              onFilesChange={setFiles}
              maxFiles={10}
              className="min-h-[400px]"
            />
            {files.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {file.file instanceof globalThis.File ? file.file.name : file.file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {file.file instanceof globalThis.File ? 
                            (file.file.size / 1024 / 1024).toFixed(2) : 
                            ((file.file.size || 0) / 1024 / 1024).toFixed(2)
                          } MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeContentType === "content" && (
          <div className="space-y-4">
            {/* Text Files Header with Add Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Text Files</h3>
              <Button
                onClick={addTextFile}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add File
              </Button>
            </div>

            {/* Text Files Tabs */}
            {textFiles.length > 0 && (
              <div className="space-y-4">
                {/* File Tabs */}
                <div className="flex items-center gap-2 flex-wrap border-b border-border/30">
                  {textFiles.map((file, index) => (
                    <div key={file.id} className="flex items-center">
                      <button
                        onClick={() => setActiveTextFileIndex(index)}
                        className={`px-3 py-2 text-sm rounded-t-lg transition-colors ${
                          activeTextFileIndex === index
                            ? 'bg-background border border-border/30 border-b-transparent text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                        }`}
                      >
                        {file.filename || 'untitled'}
                        <span className="ml-2 text-xs opacity-60">
                          {getLanguageFromFilename(file.filename)}
                        </span>
                      </button>
                      {textFiles.length > 1 && (
                        <button
                          onClick={() => removeTextFile(file.id)}
                          className="ml-1 p-1 text-muted-foreground hover:text-destructive rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Active File Editor */}
                {textFiles[activeTextFileIndex] && (
                  <div className="space-y-3">
                    {/* Filename Input */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">Filename:</label>
                      <input
                        type="text"
                        value={textFiles[activeTextFileIndex].filename}
                        onChange={(e) => updateTextFile(textFiles[activeTextFileIndex].id, { filename: e.target.value })}
                        placeholder="untitled.md"
                        className="flex-1 max-w-md p-2 border border-border/30 rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                      />
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/20 rounded">
                        {getLanguageFromFilename(textFiles[activeTextFileIndex].filename)}
                      </span>
                    </div>
                    
                    {/* Quick filename suggestions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Quick:</span>
                      {[
                        'README.md',
                        'notes.txt', 
                        'script.js',
                        'main.py',
                        'styles.css',
                        'index.html',
                        'config.json'
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => updateTextFile(textFiles[activeTextFileIndex].id, { filename: suggestion })}
                          className="text-xs px-2 py-1 bg-muted/20 hover:bg-muted/40 rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    {/* Code Editor */}
                    <CodeEditor
                      value={textFiles[activeTextFileIndex].content}
                      onChange={(value) => updateTextFile(textFiles[activeTextFileIndex].id, { content: value })}
                      language={getLanguageFromFilename(textFiles[activeTextFileIndex].filename)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {textFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No text files added yet</p>
                <Button onClick={addTextFile} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First File
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
