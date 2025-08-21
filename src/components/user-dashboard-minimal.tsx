"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { 
  Plus, 
  Search,
  ExternalLink,
  Lock,
  Globe,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import { GoogleDriveConnection } from "@/components/google-drive-connection";
import type { Workspace } from "@/lib/databse";
import ModeToggle from "@/components/ui/mode-toggle";

interface UserData {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
}

interface UserDashboardProps {
  user: UserData;
  workspaces: Workspace[];
  currentPage: number;
  totalPages: number;
  totalWorkspaces: number;
}

export function UserDashboard({ user, workspaces, currentPage, totalPages, totalWorkspaces }: UserDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const filteredWorkspaces = workspaces.filter(workspace => {
    return workspace.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workspace.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           workspace.slug.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/dashboard?${params.toString()}`);
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
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Google Drive Connection Status */}
        <div className="mb-8">
          <GoogleDriveConnection />
        </div>

        {/* Search */}
        {totalWorkspaces > 0 && (
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
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                {filteredWorkspaces.length} result{filteredWorkspaces.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        )}

        {/* Workspaces List */}
        {filteredWorkspaces.length === 0 && totalWorkspaces === 0 ? (
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

        {/* Pagination */}
        {!searchQuery && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {(() => {
                const pages = [];
                const showEllipsis = totalPages > 7;
                
                if (!showEllipsis) {
                  // Show all pages if total is 7 or less
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(i)}
                        className="w-10"
                      >
                        {i}
                      </Button>
                    );
                  }
                } else {
                  // Show smart pagination with ellipsis
                  // Always show first page
                  pages.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      className="w-10"
                    >
                      1
                    </Button>
                  );
                  
                  // Show ellipsis or pages near current
                  if (currentPage > 4) {
                    pages.push(<span key="ellipsis1" className="text-muted-foreground">...</span>);
                  }
                  
                  // Show pages around current page
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  
                  for (let i = start; i <= end; i++) {
                    if (i !== 1 && i !== totalPages) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(i)}
                          className="w-10"
                        >
                          {i}
                        </Button>
                      );
                    }
                  }
                  
                  // Show ellipsis or last pages
                  if (currentPage < totalPages - 3) {
                    pages.push(<span key="ellipsis2" className="text-muted-foreground">...</span>);
                  }
                  
                  // Always show last page if more than 1 page
                  if (totalPages > 1) {
                    pages.push(
                      <Button
                        key={totalPages}
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10"
                      >
                        {totalPages}
                      </Button>
                    );
                  }
                }
                
                return pages;
              })()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Stats Footer */}
        {totalWorkspaces > 0 && (
          <div className="mt-12 pt-8 border-t border-border/30">
            <div className="text-center text-sm text-muted-foreground">
              {!searchQuery ? (
                <>
                  Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalWorkspaces)} of {totalWorkspaces} workspace{totalWorkspaces > 1 ? "s" : ""}
                  {totalPages > 1 && (
                    <span> • Page {currentPage} of {totalPages}</span>
                  )}
                </>
              ) : (
                <>
                  {totalWorkspaces} workspace{totalWorkspaces > 1 ? "s" : ""} total
                  {filteredWorkspaces.length !== totalWorkspaces && (
                    <span> • {filteredWorkspaces.length} shown</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
