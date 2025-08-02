"use client";

import { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/app-shell';
import { WorkspaceGrid } from '../../components/workspace/workspace-grid';
import { toast } from 'sonner';

interface User {
  email: string;
  name?: string;
  picture?: string;
}

interface Workspace {
  id: string;
  name: string;
  owner: string;
  members: string[];
  items: WorkspaceItem[];
  createdAt: string;
  isPrivate: boolean;
}

interface WorkspaceItem {
  id: string;
  type: 'file' | 'link' | 'text';
  content: string;
  title?: string;
  sender: string;
  timestamp: string;
  size?: number;
  mimeType?: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAndWorkspaces();
  }, []);

  const fetchUserAndWorkspaces = async () => {
    try {
      // Fetch user info and workspaces in parallel
      const [userResponse, workspacesResponse] = await Promise.all([
        fetch('/api/user', { credentials: 'include' }),
        fetch('/api/workspaces', { credentials: 'include' })
      ]);
      
      if (userResponse.status === 401 || workspacesResponse.status === 401) {
        // User not authenticated, redirect to login
        window.location.href = '/api/auth/login';
        return;
      }
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
      
      if (workspacesResponse.ok) {
        const workspacesData = await workspacesResponse.json();
        setWorkspaces(workspacesData);
      } else {
        toast.error('Erro ao carregar workspaces');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string, isPrivate: boolean) => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, isPrivate })
      });

      if (response.ok) {
        const newWorkspace = await response.json();
        setWorkspaces(prev => [newWorkspace, ...prev]);
        toast.success('Workspace criado com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao criar workspace');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  const handleCreateWorkspace = () => {
    // This will trigger the dialog in WorkspaceGrid component
    const event = new CustomEvent('openCreateDialog');
    window.dispatchEvent(event);
  };

  return (
    <AppShell 
      user={user} 
      showCreateButton={true}
      onCreateWorkspace={handleCreateWorkspace}
    >
      <WorkspaceGrid 
        workspaces={workspaces}
        onCreateWorkspace={createWorkspace}
        loading={loading}
      />
    </AppShell>
  );
}
