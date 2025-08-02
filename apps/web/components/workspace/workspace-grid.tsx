"use client";

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { 
  MoreHorizontal,
  Users, 
  Lock, 
  Share2, 
  MessageSquare,
  FileText,
  Link2,
  Image,
  QrCode,
  Plus
} from 'lucide-react';

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

interface WorkspaceGridProps {
  workspaces: Workspace[];
  onCreateWorkspace: (name: string, isPrivate: boolean) => Promise<void>;
  loading?: boolean;
}

export function WorkspaceGrid({ workspaces, onCreateWorkspace, loading }: WorkspaceGridProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Listen for custom events from the parent component
  useEffect(() => {
    const handleOpenDialog = () => {
      setShowCreateDialog(true);
    };

    window.addEventListener('openCreateDialog', handleOpenDialog);
    return () => {
      window.removeEventListener('openCreateDialog', handleOpenDialog);
    };
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    setCreating(true);
    try {
      await onCreateWorkspace(newWorkspaceName.trim(), isPrivate);
      setNewWorkspaceName('');
      setIsPrivate(false);
      setShowCreateDialog(false);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  const getLastActivity = (workspace: Workspace) => {
    if (workspace.items.length === 0) return workspace.createdAt;
    const lastItem = workspace.items[workspace.items.length - 1];
    return lastItem?.timestamp || workspace.createdAt;
  };

  const getItemTypeIcon = (type: string, mimeType?: string) => {
    if (type === 'text') return <MessageSquare className="w-4 h-4" />;
    if (type === 'link') return <Link2 className="w-4 h-4" />;
    if (mimeType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getWorkspacePreview = (workspace: Workspace) => {
    const recentItems = workspace.items.slice(-3).reverse();
    return recentItems;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-200 rounded"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full p-8 mb-6">
              <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Bem-vindo ao SendAny
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
              Crie seu primeiro workspace para começar a compartilhar arquivos, links e textos com seus dispositivos.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Workspace
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Seus Workspaces
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} disponível{workspaces.length !== 1 ? 'eis' : ''}
                </p>
              </div>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Workspace
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => {
                const recentItems = getWorkspacePreview(workspace);
                
                return (
                  <Card 
                    key={workspace.id} 
                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    onClick={() => window.location.href = `/workspace/${workspace.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">
                            {workspace.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant={workspace.isPrivate ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {workspace.isPrivate ? (
                                <>
                                  <Lock className="w-3 h-3 mr-1" />
                                  Privado
                                </>
                              ) : (
                                <>
                                  <Share2 className="w-3 h-3 mr-1" />
                                  Compartilhado
                                </>
                              )}
                            </Badge>
                            <div className="flex items-center text-slate-500 dark:text-slate-400">
                              <Users className="w-3 h-3 mr-1" />
                              <span className="text-xs">{workspace.members.length}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Adicionar menu de ações
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Preview dos últimos itens */}
                      <div className="space-y-2 mb-4">
                        {recentItems.length > 0 ? (
                          recentItems.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2"
                            >
                              <div className="text-slate-400">
                                {getItemTypeIcon(item.type, item.mimeType)}
                              </div>
                              <span className="flex-1 truncate">
                                {item.title || item.content}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatDate(item.timestamp)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-slate-400 dark:text-slate-500">
                            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <span className="text-sm">Nenhum item ainda</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <span>
                          {workspace.items.length} item{workspace.items.length !== 1 ? 's' : ''}
                        </span>
                        <span>
                          Atualizado {formatDate(getLastActivity(workspace))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dialog para criar workspace */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Workspace</DialogTitle>
            <DialogDescription>
              Crie um espaço para compartilhar arquivos, links e textos entre seus dispositivos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do workspace (ex: Projeto ABC, Pessoal...)"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="private" className="text-sm text-slate-600 dark:text-slate-400">
                Workspace privado (apenas você pode acessar)
              </label>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleCreateWorkspace} 
                disabled={creating || !newWorkspaceName.trim()}
                className="flex-1"
              >
                {creating ? 'Criando...' : 'Criar Workspace'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
