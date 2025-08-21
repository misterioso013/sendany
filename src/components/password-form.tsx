"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordFormProps {
  slug: string;
  error?: string;
  isEdit?: boolean;
}

export function PasswordForm({ error, isEdit = false }: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Add password to URL params and refresh
    const url = new URL(window.location.href);
    url.searchParams.set("password", password);
    router.push(url.pathname + url.search);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Password Protected</h1>
          <p className="text-muted-foreground mt-2">
            This workspace is password protected. Please enter the password to {isEdit ? 'edit' : 'continue'}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Access Workspace
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            ← Back to SendAny
          </Link>
        </div>
      </div>
    </div>
  );
}
