"use client";

import { useCallback, useState } from "react";
import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { Upload, X, File, Image as ImageIcon, Code, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFilesChange?: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
}

export function FileUploader({
  onFilesChange,
  maxFiles = 10,
  maxSize = 50, // 50MB default
  accept,
  className,
}: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const fileUpload = useFileUpload({
    maxFiles,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    accept,
    multiple: true,
    onFilesChange,
  });

  const {
    files,
    isDragging,
    errors,
    removeFile,
    clearFiles,
    clearErrors,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    inputRef,
    getInputProps,
  } = fileUpload;

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    if (type.includes("text/") || type.includes("json") || type.includes("javascript")) {
      return <Code className="w-5 h-5" />;
    }
    if (type.includes("pdf") || type.includes("document")) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragging || isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragEnter={(e) => {
          handleDragEnter(e);
          setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          handleDragLeave(e);
          setIsDragActive(false);
        }}
        onDragOver={(e) => {
          handleDragOver(e);
          setIsDragActive(true);
        }}
        onDrop={(e) => {
          handleDrop(e);
          setIsDragActive(false);
        }}
        onClick={handleClick}
        aria-label="Upload files"
      >
        <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-muted-foreground text-sm">
          Maximum {maxFiles} files, up to {maxSize}MB each
        </p>
        <input {...getInputProps()} />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-destructive mb-1">
                Upload Errors
              </h4>
              <ul className="text-sm text-destructive/80 space-y-1">
                {errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearErrors}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">
              Uploaded Files ({files.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((fileWithPreview: FileWithPreview) => {
              const file = fileWithPreview.file;
              const isFileObject = file instanceof globalThis.File;
              
              return (
                <div
                  key={fileWithPreview.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  {getFileIcon(isFileObject ? file.type : (file as { type?: string }).type || 'application/octet-stream')}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                      {isFileObject && file.type && (
                        <span className="ml-2">• {file.type}</span>
                      )}
                      {!isFileObject && (file as { type?: string }).type && (
                        <span className="ml-2">• {(file as { type?: string }).type}</span>
                      )}
                    </p>
                  </div>

                  {fileWithPreview.preview && (
                    <img
                      src={fileWithPreview.preview}
                      alt={`Preview of ${file.name}`}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileWithPreview.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
