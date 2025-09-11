import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, PUT } from "./route";

// Mock the database module
vi.mock("@/lib/database", () => ({
  getWorkspaceById: vi.fn(),
  updateWorkspace: vi.fn(),
  getWorkspaceFiles: vi.fn(),
  updateWorkspaceFile: vi.fn(),
  createWorkspaceFile: vi.fn(),
  deleteWorkspaceFile: vi.fn(),
}));

// Mock Stack Auth
vi.mock("@/stack", () => ({
  stackServerApp: {
    getUser: vi.fn(),
  },
}));

const { getWorkspaceById, updateWorkspace, getWorkspaceFiles } = await import(
  "@/lib/databse"
);
const { stackServerApp } = await import("@/stack");

describe("/api/workspaces/[id] Route", () => {
  const mockUser = {
    id: "user-123",
    displayName: "Test User",
    primaryEmail: "test@example.com",
    primaryEmailVerified: true,
    profileImageUrl: null,
  } as any;
  const mockWorkspace = {
    id: "workspace-123",
    slug: "test-workspace",
    title: "Test Workspace",
    user_id: "user-123",
    is_public: true,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const mockFiles = [
    {
      id: "file-1",
      workspace_id: "workspace-123",
      filename: "test.md",
      content: "# Test",
      file_type: "markdown" as const,
      order_index: 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stackServerApp.getUser).mockResolvedValue(mockUser);
    vi.mocked(getWorkspaceById).mockResolvedValue(mockWorkspace);
    vi.mocked(getWorkspaceFiles).mockResolvedValue(mockFiles);
  });

  describe("GET", () => {
    it("should return workspace and files for authenticated user", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/workspaces/workspace-123"
      );
      const params = Promise.resolve({ id: "workspace-123" });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.workspace).toEqual(mockWorkspace);
      expect(data.files).toEqual(mockFiles);
    });

    it("should return 404 for non-existent workspace", async () => {
      vi.mocked(getWorkspaceById).mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost:3000/api/workspaces/non-existent"
      );
      const params = Promise.resolve({ id: "non-existent" });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Workspace not found");
    });

    it("should return 403 for private workspace without ownership", async () => {
      const privateWorkspace = {
        ...mockWorkspace,
        is_public: false,
        user_id: "other-user",
      };
      vi.mocked(getWorkspaceById).mockResolvedValue(privateWorkspace);

      const request = new NextRequest(
        "http://localhost:3000/api/workspaces/workspace-123"
      );
      const params = Promise.resolve({ id: "workspace-123" });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Unauthorized");
    });

    it("should handle public workspace for unauthenticated user", async () => {
      vi.mocked(stackServerApp.getUser).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/workspaces/workspace-123"
      );
      const params = Promise.resolve({ id: "workspace-123" });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.workspace).toEqual(mockWorkspace);
    });
  });

  describe("PUT", () => {
    const updateData = {
      title: "Updated Title",
      description: "Updated Description",
      is_public: false,
      files: [
        {
          id: "file-1",
          filename: "updated.md",
          content: "# Updated Content",
          file_type: "markdown",
          order_index: 0,
        },
      ],
    };

    it("should update workspace successfully", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/workspaces/workspace-123",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
          headers: { "Content-Type": "application/json" },
        }
      );
      const params = Promise.resolve({ id: "workspace-123" });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(updateWorkspace).toHaveBeenCalledWith(
        "workspace-123",
        expect.any(Object)
      );
    });

    it("should return 401 for unauthenticated user", async () => {
      vi.mocked(stackServerApp.getUser).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost:3000/api/workspaces/workspace-123",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      const params = Promise.resolve({ id: "workspace-123" });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentication required");
    });

    it("should return 403 for non-owner", async () => {
      const otherWorkspace = {
        ...mockWorkspace,
        user_id: "other-user",
      };
      vi.mocked(getWorkspaceById).mockResolvedValue(otherWorkspace);

      const request = new NextRequest(
        "http://localhost:3000/api/workspaces/workspace-123",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      const params = Promise.resolve({ id: "workspace-123" });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Unauthorized");
    });
  });
});
