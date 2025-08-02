"use client";

import { useState, useEffect } from 'react';
import { WorkspaceChat } from '../../../components/workspace/workspace-chat';
import { toast } from 'sonner';

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
  driveFileId?: string;
  sender: string;
  timestamp: string;
  size?: number;
  mimeType?: string;
}

interface WorkspacePageProps {
  params: Promise<{ id: string }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string>('');

  useEffect(() => {
    params.then(resolvedParams => {
      setWorkspaceId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const [workspaceResponse, userResponse] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}`, { credentials: 'include' }),
        fetch('/api/user', { credentials: 'include' })
      ]);
      
      if (workspaceResponse.status === 401 || userResponse.status === 401) {
        window.location.href = '/api/auth/login';
        return;
      }
      
      if (workspaceResponse.status === 404) {
        toast.error('Workspace não encontrado');
        window.location.href = '/workspaces';
        return;
      }
      
      if (workspaceResponse.ok && userResponse.ok) {
        const [workspaceData, userData] = await Promise.all([
          workspaceResponse.json(),
          userResponse.json()
        ]);
        
        setWorkspace(workspaceData);
        setCurrentUser(userData.email);
      } else {
        toast.error('Erro ao carregar workspace');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, type: 'text' | 'link' | 'file', file?: File) => {
    try {
      let requestBody: any;
      let headers: any = {};

      if (type === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        requestBody = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify({
          content,
          type,
          title: type === 'link' ? content : undefined
        });
      }

      const response = await fetch(`/api/workspaces/${workspaceId}/items`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: requestBody
      });

      if (response.ok) {
        const newItem = await response.json();
        setWorkspace(prev => prev ? {
          ...prev,
          items: [...prev.items, newItem]
        } : null);
        toast.success('Mensagem enviada!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      toast.error('Erro de conexão');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Workspace não encontrado
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            O workspace que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceChat
      workspace={workspace}
      currentUser={currentUser}
      onSendMessage={sendMessage}
      loading={loading}
    />
  );
}
