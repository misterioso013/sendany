import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

// Mock database
vi.mock("@/lib/database", () => ({
  getExpiredWorkspaces: vi.fn(),
  deleteWorkspaceCompletely: vi.fn(),
  getUserDriveTokens: vi.fn(),
}));

// Mock Google Drive service
vi.mock("@/lib/google-drive", () => ({
  driveService: {
    deleteFolder: vi.fn(),
    initializeFromTokens: vi.fn(),
  },
}));

const { getExpiredWorkspaces, deleteWorkspaceCompletely } = await import(
  "@/lib/databse"
);

describe("/api/cleanup Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return expired workspaces count", async () => {
      const mockExpiredWorkspaces = [
        {
          id: "expired-1",
          title: "Expired Workspace 1",
          user_id: "user-123",
          expires_at: new Date(Date.now() - 86400000), // 1 day ago
          drive_folder_id: undefined,
          slug: "expired-1",
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "expired-2",
          title: "Expired Workspace 2",
          user_id: "user-456",
          expires_at: new Date(Date.now() - 172800000), // 2 days ago
          drive_folder_id: "drive-folder-123",
          slug: "expired-2",
          is_public: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(getExpiredWorkspaces).mockResolvedValue(mockExpiredWorkspaces);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(2);
      expect(data.workspaces).toHaveLength(2);
      expect(data.workspaces[0].id).toBe("expired-1");
      expect(data.workspaces[1].drive_folder_id).toBe("drive-folder-123");
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(getExpiredWorkspaces).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to check expired workspaces");
    });
  });

  describe("POST", () => {
    it("should cleanup expired workspaces", async () => {
      const mockExpiredWorkspaces = [
        {
          id: "expired-1",
          title: "Expired Workspace 1",
          user_id: undefined,
          drive_folder_id: undefined,
          slug: "expired-1",
          is_public: true,
          expires_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(getExpiredWorkspaces).mockResolvedValue(mockExpiredWorkspaces);
      vi.mocked(deleteWorkspaceCompletely).mockResolvedValue();

      const request = new NextRequest("http://localhost:3000/api/cleanup", {
        method: "POST",
        headers: { "x-vercel-cron": "1" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cleanedCount).toBe(1);
      expect(data.totalExpired).toBe(1);
      expect(deleteWorkspaceCompletely).toHaveBeenCalledWith("expired-1");
    });

    it("should require authorization without Vercel cron header", async () => {
      process.env.CLEANUP_API_KEY = "secret-key";

      const request = new NextRequest("http://localhost:3000/api/cleanup", {
        method: "POST",
        headers: { "x-api-key": "wrong-key" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");

      delete process.env.CLEANUP_API_KEY;
    });

    it("should allow access with correct API key", async () => {
      process.env.CLEANUP_API_KEY = "secret-key";
      vi.mocked(getExpiredWorkspaces).mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/cleanup", {
        method: "POST",
        headers: { "x-api-key": "secret-key" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      delete process.env.CLEANUP_API_KEY;
    });

    it("should handle database errors during cleanup", async () => {
      const mockExpiredWorkspaces = [
        {
          id: "expired-1",
          title: "Expired Workspace 1",
          user_id: undefined,
          drive_folder_id: undefined,
          slug: "expired-1",
          is_public: true,
          expires_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(getExpiredWorkspaces).mockResolvedValue(mockExpiredWorkspaces);
      vi.mocked(deleteWorkspaceCompletely).mockRejectedValue(
        new Error("Delete failed")
      );

      const request = new NextRequest("http://localhost:3000/api/cleanup", {
        method: "POST",
        headers: { "x-vercel-cron": "1" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cleanedCount).toBe(0);
      expect(data.errors).toHaveLength(1);
      expect(data.errors![0]).toContain("Delete failed");
    });
  });
});
