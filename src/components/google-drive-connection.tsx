"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Cloud, CloudOff, HardDrive, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageInfo {
  connected: boolean;
  driveEmail?: string;
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
  limits: {
    MAX_FILE_SIZE: number;
    MAX_WORKSPACE_SIZE: number;
    MAX_USER_STORAGE: number;
  };
}

interface GoogleDriveConnectionProps {
  className?: string;
}

export function GoogleDriveConnection({ className }: GoogleDriveConnectionProps) {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  const fetchStorageInfo = async () => {
    try {
      const response = await fetch('/api/upload');
      if (response.ok) {
        const data = await response.json();
        setStorageInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch storage info:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleDrive = async () => {
    setConnecting(true);
    try {
      // Redirect to Google OAuth
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error('Failed to connect Google Drive:', error);
      setConnecting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 p-4 border rounded-lg", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading storage info...</span>
      </div>
    );
  }

  if (!storageInfo) {
    return (
      <div className={cn("flex items-center gap-2 p-4 border rounded-lg border-destructive/20 bg-destructive/5", className)}>
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="text-sm text-destructive">Failed to load storage information</span>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Connection Status */}
        <div className={cn(
          "flex items-center justify-between p-4 border rounded-lg",
          storageInfo.connected 
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" 
            : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
        )}>
          <div className="flex items-center gap-3">
            {storageInfo.connected ? (
              <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <CloudOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            )}
            <div>
              <p className={cn(
                "font-medium text-sm",
                storageInfo.connected 
                  ? "text-green-900 dark:text-green-100" 
                  : "text-orange-900 dark:text-orange-100"
              )}>
                {storageInfo.connected ? 'Google Drive Connected' : 'Google Drive Not Connected'}
              </p>
              {storageInfo.connected && storageInfo.driveEmail && (
                <p className="text-xs text-green-700 dark:text-green-300">
                  {storageInfo.driveEmail}
                </p>
              )}
            </div>
          </div>

          {!storageInfo.connected && (
            <Button 
              onClick={connectGoogleDrive}
              disabled={connecting}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 mr-2" />
                  Connect Drive
                </>
              )}
            </Button>
          )}
        </div>

        {/* Storage Usage */}
        {storageInfo.connected && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage Usage</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(true)}
                className="text-xs"
              >
                View Limits
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{formatFileSize(storageInfo.storage.used)} / {formatFileSize(storageInfo.storage.limit)}</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    storageInfo.storage.percentage < 70 ? "bg-green-500" :
                    storageInfo.storage.percentage < 90 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(storageInfo.storage.percentage, 100)}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                {storageInfo.storage.percentage}% used
              </p>
            </div>
          </div>
        )}

        {/* Warning for disconnected state */}
        {!storageInfo.connected && (
          <div className="p-4 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  File uploads are disabled
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Connect your Google Drive to enable file uploads. Your files will be stored in your personal Drive.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Storage Limits Dialog */}
      <AlertDialog open={showInfo} onOpenChange={setShowInfo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Storage Limits</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>SendAny uses your personal Google Drive to store uploaded files. Here are the current limits:</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Max file size</span>
                    <span className="text-sm">{formatFileSize(storageInfo!.limits.MAX_FILE_SIZE)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium">Max workspace size</span>
                    <span className="text-sm">{formatFileSize(storageInfo!.limits.MAX_WORKSPACE_SIZE)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">Max total storage</span>
                    <span className="text-sm">{formatFileSize(storageInfo!.limits.MAX_USER_STORAGE)}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Files are stored in a "SendAny" folder in your Google Drive. You maintain full control and can delete them anytime.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
