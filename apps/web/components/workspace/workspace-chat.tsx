"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Badge } from '@repo/ui/components/badge';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@repo/ui/components/dialog';
import { 
  Send, 
  Paperclip, 
  Link2, 
  Type, 
  Download, 
  Copy,
  FileText,
  Image,
  Video,
  File,
  ExternalLink,
  Check,
  Clock,
  QrCode,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

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

interface Workspace {
  id: string;
  name: string;
  owner: string;
  members: string[];
  items: WorkspaceItem[];
  createdAt: string;
  isPrivate: boolean;
}

interface WorkspaceChatProps {
  workspace: Workspace;
  currentUser: string;
  onSendMessage: (content: string, type: 'text' | 'link' | 'file', file?: File) => Promise<void>;
  loading?: boolean;
}

type MessageType = 'text' | 'link' | 'file';

export function WorkspaceChat({ workspace, currentUser, onSendMessage, loading }: WorkspaceChatProps) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [sending, setSending] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [workspace.items]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!message.trim() && messageType !== 'file') return;
    
    setSending(true);
    try {
      if (messageType === 'file' && fileInputRef.current?.files?.[0]) {
        await onSendMessage('', 'file', fileInputRef.current.files[0]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        await onSendMessage(message.trim(), messageType);
      }
      setMessage('');
      setMessageType('text');
      setShowTypeSelector(false);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessageType('file');
      setMessage(`📎 ${file.name} (${formatFileSize(file.size)})`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemIcon = (item: WorkspaceItem) => {
    if (item.type === 'text') return <Type className="w-4 h-4" />;
    if (item.type === 'link') return <Link2 className="w-4 h-4" />;
    if (item.mimeType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (item.mimeType?.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getItemPreview = (item: WorkspaceItem) => {
    if (item.type === 'text') {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{item.content}</p>
        </div>
      );
    }
    
    if (item.type === 'link') {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                {item.title || 'Link'}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                {item.content}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(item.content, '_blank')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }
    
    // File
    return (
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            {getItemIcon(item)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {item.title || 'Arquivo'}
            </p>
            {item.size && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(item.size)}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // TODO: Implementar download
              toast.success('Download iniciado');
            }}
            className="text-slate-600 hover:text-slate-700 dark:text-slate-400"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado para a área de transferência');
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const shareWorkspace = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link do workspace copiado!');
    } catch (error) {
      setShowQR(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/workspaces'}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {workspace.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {workspace.members.length} membro{workspace.members.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant={workspace.isPrivate ? "secondary" : "outline"} className="text-xs">
                  {workspace.isPrivate ? 'Privado' : 'Compartilhado'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={shareWorkspace}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQR(true)}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {workspace.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full p-6 mb-4">
                <Type className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Comece a conversa
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Envie arquivos, links ou textos para compartilhar com seus dispositivos.
              </p>
            </div>
          ) : (
            workspace.items.map((item, index) => {
              const isOwn = item.sender === currentUser;
              const showAvatar = index === 0 || workspace.items[index - 1]?.sender !== item.sender;
              
              return (
                <div
                  key={item.id}
                  className={`flex items-end space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {showAvatar && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={`text-white text-xs ${
                        isOwn 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                          : 'bg-gradient-to-r from-slate-500 to-slate-600'
                      }`}>
                        {getUserInitials(item.sender)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex-1 max-w-md ${!showAvatar ? (isOwn ? 'mr-11' : 'ml-11') : ''}`}>
                    <div className={`space-y-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {showAvatar && (
                        <div className={`flex items-center space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {isOwn ? 'Você' : item.sender}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`${isOwn ? 'ml-auto' : 'mr-auto'}`}>
                        {getItemPreview(item)}
                      </div>
                      
                      {item.type !== 'file' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.content)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 ${
                            isOwn ? 'mr-auto' : 'ml-auto'
                          }`}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copiar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            {/* Type Selector */}
            <div className="flex flex-col space-y-1">
              <div className="flex space-x-1">
                <Button
                  variant={messageType === 'text' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMessageType('text')}
                  className="h-8 w-8 p-0"
                >
                  <Type className="w-4 h-4" />
                </Button>
                <Button
                  variant={messageType === 'link' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMessageType('link')}
                  className="h-8 w-8 p-0"
                >
                  <Link2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={messageType === 'file' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={handleFileSelect}
                  className="h-8 w-8 p-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Message Input */}
            <div className="flex-1">
              {messageType === 'file' ? (
                <div className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {message || 'Selecione um arquivo...'}
                  </span>
                </div>
              ) : (
                <Textarea
                  ref={textareaRef}
                  placeholder={
                    messageType === 'text' 
                      ? 'Digite sua mensagem...' 
                      : 'Cole o link aqui...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="min-h-[44px] max-h-[120px] resize-none"
                />
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={sending || (!message.trim() && messageType !== 'file')}
              className="h-11 w-11 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {sending ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Workspace</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-48 h-48 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-slate-400" />
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Escaneie este QR Code para acessar o workspace em outro dispositivo
            </p>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(window.location.href)}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
