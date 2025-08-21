"use client";

import { useCallback } from "react";
import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { Upload, X, File, Image, Code, FileText } from "lucide-react";
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (mimeType.includes("text") || mimeType.includes("json")) {
      return <FileText className="w-4 h-4 text-green-500" />;
    } else if (mimeType.includes("javascript") || mimeType.includes("typescript")) {
      return <Code className="w-4 h-4 text-yellow-500" />;
    } else {
      return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input {...getInputProps()} />

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-12 min-h-[300px]",
          isDragging
            ? "border-foreground bg-muted/20"
            : "border-border/50 hover:border-border hover:bg-muted/10"
        )}
      >
        <Upload className={cn(
          "w-8 h-8 mb-4 transition-colors",
          isDragging ? "text-foreground" : "text-muted-foreground"
        )} />
        
        <div className="text-center space-y-2">
          <p className="text-lg font-light text-foreground">
            {isDragging ? "Drop files here" : "Drag files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or <span className="underline">browse to upload</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Up to {maxFiles} files, {maxSize}MB each
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-destructive mb-1">
                Upload errors:
              </p>
              <ul className="text-xs text-destructive space-y-1">
                {errors.map((error, index) => (
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
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-foreground">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((fileWithPreview: FileWithPreview) => {
              const file = fileWithPreview.file;
              const isFileObject = file instanceof globalThis.File;
              
              return (
                <div
                  key={fileWithPreview.id}
                  className="flex items-center gap-3 p-3 border border-border/30 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  {getFileIcon(isFileObject ? file.type : (file as { type?: string }).type || 'application/octet-stream')}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

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
