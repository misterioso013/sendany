import { Credentials } from 'google-auth-library';
import { tokenStore } from './memory';

export interface Workspace {
  id: string;
  name: string;
  owner: string;
  members: string[];
  items: WorkspaceItem[];
  createdAt: Date;
  isPrivate: boolean;
}

export interface WorkspaceItem {
  id: string;
  type: 'file' | 'link' | 'text';
  content: string;
  title?: string;
  driveFileId?: string;
  sender: string;
  timestamp: Date;
  size?: number;
  mimeType?: string;
}

export interface UserSession {
  email: string;
  tokens: Credentials;
  workspaces: string[];
}

// In-memory storage (replace with database in production)
export const workspaceStore: Record<string, Workspace> = {};
export const userStore: Record<string, UserSession> = {};

export function createWorkspace(name: string, owner: string, isPrivate: boolean = false): Workspace {
  const id = generateWorkspaceId();
  const workspace: Workspace = {
    id,
    name,
    owner,
    members: [owner],
    items: [],
    createdAt: new Date(),
    isPrivate
  };
  
  workspaceStore[id] = workspace;
  
  // Add workspace to user's list
  if (!userStore[owner]) {
    userStore[owner] = { 
      email: owner, 
      tokens: tokenStore[owner] || {}, 
      workspaces: [] 
    };
  }
  userStore[owner].workspaces.push(id);
  
  return workspace;
}

export function addItemToWorkspace(workspaceId: string, item: Omit<WorkspaceItem, 'id' | 'timestamp'>): WorkspaceItem {
  const workspace = workspaceStore[workspaceId];
  if (!workspace) throw new Error('Workspace not found');
  
  const newItem: WorkspaceItem = {
    ...item,
    id: generateItemId(),
    timestamp: new Date()
  };
  
  workspace.items.push(newItem);
  return newItem;
}

export function getUserWorkspaces(email: string): Workspace[] {
  const user = userStore[email];
  if (!user) return [];
  
  return user.workspaces
    .map(id => workspaceStore[id])
    .filter((workspace): workspace is Workspace => workspace !== undefined)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function generateWorkspaceId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateItemId(): string {
  return Math.random().toString(36).substring(2, 15);
}
