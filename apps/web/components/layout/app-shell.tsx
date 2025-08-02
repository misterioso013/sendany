"use client";

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@repo/ui/components/dropdown-menu';
import { Badge } from '@repo/ui/components/badge';
import { 
  Plus, 
  Settings, 
  LogOut, 
  User,
  Sparkles
} from 'lucide-react';

interface User {
  email: string;
  name?: string;
  picture?: string;
}

interface AppShellProps {
  children: React.ReactNode;
  user?: User;
  onCreateWorkspace?: () => void;
  showCreateButton?: boolean;
}

export function AppShell({ 
  children, 
  user, 
  onCreateWorkspace, 
  showCreateButton = false 
}: AppShellProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getUserInitials = (email: string) => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                SendAny
              </h1>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={isOnline ? "default" : "secondary"} 
                  className="text-xs h-4"
                >
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {showCreateButton && onCreateWorkspace && (
              <Button
                onClick={onCreateWorkspace}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Workspace
              </Button>
            )}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.picture} alt={user.name || user.email} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {getUserInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.name || 'Usuário'}</p>
                    <p className="text-xs leading-none text-slate-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
