"use client";

import { useState, useEffect } from "react";

interface GoogleDriveStatus {
  isAvailable: boolean;
  isConnected: boolean;
  loading: boolean;
  error?: string;
}

export function useGoogleDriveStatus(): GoogleDriveStatus {
  const [status, setStatus] = useState<GoogleDriveStatus>({
    isAvailable: false,
    isConnected: false,
    loading: true,
  });

  useEffect(() => {
    checkGoogleDriveStatus();
  }, []);

  const checkGoogleDriveStatus = async () => {
    try {
      // Check Google Drive status
      const response = await fetch('/api/drive-status');
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          isAvailable: data.available,
          isConnected: data.connected,
          loading: false,
          error: data.reason && !data.connected ? data.reason : undefined,
        });
      } else {
        setStatus({
          isAvailable: false,
          isConnected: false,
          loading: false,
          error: 'Failed to check Google Drive status',
        });
      }
    } catch (error) {
      setStatus({
        isAvailable: false,
        isConnected: false,
        loading: false,
        error: 'Failed to check Google Drive status',
      });
    }
  };

  return status;
}
