"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  Plus, 
  Search,
  ExternalLink,
  Lock,
  Globe,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import type { Workspace } from "@/lib/databse";

interface UserData {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
}

interface UserDashboardProps {
  user: UserData;
  workspaces: Workspace[];
}

export function UserDashboard({ user, workspaces }: UserDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = workspaces.filter(workspace => {
    return workspace.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workspace.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workspace.slug.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <div className="w-px h-4 bg-border/50" />
              <h1 className="text-lg font-medium text-foreground">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/new">
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New workspace
                </Button>
              </Link>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        {workspaces.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border/30 rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
          </div>
        )}

        {/* Workspaces List */}
        {filteredWorkspaces.length === 0 && workspaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <p className="text-lg font-light text-foreground">No workspaces yet</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Create your first workspace to start sharing files, text, and code.
              </p>
              <Link href="/new">
                <Button className="mt-4 bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create workspace
                </Button>
              </Link>
            </div>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No workspaces match your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="group border border-border/30 rounded-lg p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        href={`/${workspace.slug}`}
                        className="text-lg font-medium text-foreground hover:text-muted-foreground transition-colors truncate"
                      >
                        {workspace.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        {workspace.is_public ? (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                        {workspace.password && (
                          <Lock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </div>
                    
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>/{workspace.slug}</span>
                      <span>•</span>
                      <span>Updated {formatDate(workspace.updated_at)}</span>
                      {workspace.expires_at && (
                        <>
                          <span>•</span>
                          <span>Expires {formatDate(workspace.expires_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/${workspace.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {workspaces.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/30">
            <div className="text-center text-sm text-muted-foreground">
              {workspaces.length} workspace{workspaces.length > 1 ? "s" : ""} total
              {searchQuery && filteredWorkspaces.length !== workspaces.length && (
                <span> • {filteredWorkspaces.length} shown</span>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workspaces.filter(w => w.is_public).length}
                </p>
                <p className="text-muted-foreground text-sm">Public</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {workspaces.filter(w => !w.is_public || w.password_hash).length}
                </p>
                <p className="text-muted-foreground text-sm">Protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "public" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("public")}
            >
              Public
            </Button>
            <Button
              variant={filterType === "private" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("private")}
            >
              Private
            </Button>
          </div>
        </div>

        {/* Workspaces Grid */}
        {filteredWorkspaces.length === 0 ? (
          <div className="text-center py-12">
            {workspaces.length === 0 ? (
              <>
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No workspaces yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first workspace to start sharing content
                </p>
                <Link href="/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workspace
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No workspaces found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate mb-1">
                      {workspace.title}
                    </h3>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {!workspace.is_public && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    {workspace.password_hash && (
                      <Lock className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      /{workspace.slug}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(workspace.created_at)}</span>
                  </div>

                  {workspace.expires_at && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Calendar className="w-4 h-4" />
                      <span>Expires {formatDate(workspace.expires_at)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Link href={`/${workspace.slug}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/edit/${workspace.slug}`}>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      // TODO: Implement delete functionality
                      console.log("Delete workspace:", workspace.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
