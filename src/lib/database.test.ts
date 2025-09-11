import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// Mock dependencies
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => {
    return vi.fn();
  }),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn(),
}));

// Import functions after mocking
import {
  createWorkspace,
  getWorkspaceBySlug,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  verifyWorkspacePassword,
  createWorkspaceFile,
  getWorkspaceFiles,
  updateWorkspaceFile,
  deleteWorkspaceFile,
  deleteWorkspaceFiles,
  recordWorkspaceView,
  getWorkspaceViews,
  getExpiredWorkspaces,
  cleanupExpiredWorkspaces,
} from "@/lib/database";

// Get the mocked sql function
let mockSql = vi.fn();

vi.doMock("@neondatabase/serverless", () => ({
  neon: () => mockSql,
}));

describe("Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql = vi.fn();
    (nanoid as any).mockReturnValue("mock-id");
    (bcrypt.hash as any).mockResolvedValue("hashed-password");
    (bcrypt.compare as any).mockResolvedValue(true);
  });

  describe("Workspace Operations", () => {
    it("should create a workspace", async () => {
      const mockWorkspace = {
        id: "mock-id",
        title: "Test Workspace",
        slug: "test-workspace",
        user_id: "user-1",
        is_public: true,
        password_hash: null,
        expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSql.mockResolvedValue([mockWorkspace]);

      const result = await createWorkspace({
        title: "Test Workspace",
        slug: "test-workspace",
        user_id: "user-1",
      });

      expect(result).toEqual(mockWorkspace);
      expect(mockSql).toHaveBeenCalledOnce();
    });

    it("should get workspace by slug", async () => {
      const mockWorkspace = {
        id: "workspace-1",
        title: "Test Workspace",
        slug: "test-slug",
        user_id: "user-1",
        is_public: true,
        password_hash: null,
        expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSql.mockResolvedValue([mockWorkspace]);

      const result = await getWorkspaceBySlug("test-slug");

      expect(result).toEqual(mockWorkspace);
      expect(mockSql).toHaveBeenCalledOnce();
    });

    it("should return null when workspace not found by slug", async () => {
      mockSql.mockResolvedValue([]);

      const result = await getWorkspaceBySlug("nonexistent");

      expect(result).toBeNull();
    });

    it("should get workspace by id", async () => {
      const mockWorkspace = {
        id: "workspace-1",
        title: "Test Workspace",
        slug: "test-slug",
        user_id: "user-1",
        is_public: true,
        password_hash: null,
        expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSql.mockResolvedValue([mockWorkspace]);

      const result = await getWorkspaceById("workspace-1");

      expect(result).toEqual(mockWorkspace);
    });

    it("should update workspace", async () => {
      const mockWorkspace = {
        id: "workspace-1",
        title: "Updated Workspace",
        slug: "test-slug",
        user_id: "user-1",
        is_public: false,
        password_hash: null,
        expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSql.mockResolvedValue([mockWorkspace]);

      const result = await updateWorkspace("workspace-1", {
        title: "Updated Workspace",
        is_public: false,
      });

      expect(result).toEqual(mockWorkspace);
    });

    it("should delete workspace", async () => {
      mockSql.mockResolvedValue([{ id: "workspace-1" }]);

      const result = await deleteWorkspace("workspace-1");

      expect(result).toBe(true);
    });

    it("should get user workspaces", async () => {
      const mockWorkspaces = [
        {
          id: "workspace-1",
          title: "Workspace 1",
          slug: "workspace-1",
          user_id: "user-1",
          is_public: true,
          password_hash: null,
          expires_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "workspace-2",
          title: "Workspace 2",
          slug: "workspace-2",
          user_id: "user-1",
          is_public: false,
          password_hash: null,
          expires_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValue(mockWorkspaces);

      const result = await getUserWorkspaces("user-1");

      expect(result).toEqual(mockWorkspaces);
    });

    it("should verify workspace password", async () => {
      const workspace = {
        id: "workspace-1",
        title: "Protected Workspace",
        slug: "protected",
        user_id: "user-1",
        is_public: false,
        password_hash: "hashed-password",
        expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await verifyWorkspacePassword(workspace, "password");

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password",
        "hashed-password"
      );
    });

    it("should verify workspace without password", async () => {
      const workspace = {
        id: "workspace-1",
        title: "Public Workspace",
        slug: "public",
        user_id: "user-1",
        is_public: true,
        password_hash: null,
        expires_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await verifyWorkspacePassword(workspace, "any-password");

      expect(result).toBe(true);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe("File Operations", () => {
    it("should create workspace file", async () => {
      const mockFile = {
        id: "mock-id",
        workspace_id: "workspace-1",
        name: "test.txt",
        content: "Hello World",
        language: "text",
        type: "text",
        file_order: 1,
        google_drive_file_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock the order query
      mockSql.mockResolvedValueOnce([{ next_order: 1 }]);
      // Mock the insert query
      mockSql.mockResolvedValueOnce([mockFile]);

      const result = await createWorkspaceFile({
        workspace_id: "workspace-1",
        name: "test.txt",
        content: "Hello World",
      });

      expect(result).toEqual(mockFile);
      expect(mockSql).toHaveBeenCalledTimes(2);
    });

    it("should get workspace files", async () => {
      const mockFiles = [
        {
          id: "file-1",
          workspace_id: "workspace-1",
          name: "file1.txt",
          content: "Content 1",
          language: "text",
          type: "text",
          file_order: 0,
          google_drive_file_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "file-2",
          workspace_id: "workspace-1",
          name: "file2.js",
          content: 'console.log("Hello");',
          language: "javascript",
          type: "text",
          file_order: 1,
          google_drive_file_id: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValue(mockFiles);

      const result = await getWorkspaceFiles("workspace-1");

      expect(result).toEqual(mockFiles);
    });

    it("should update workspace file", async () => {
      const mockFile = {
        id: "file-1",
        workspace_id: "workspace-1",
        name: "updated.txt",
        content: "Updated content",
        language: "text",
        type: "text",
        file_order: 0,
        google_drive_file_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSql.mockResolvedValue([mockFile]);

      const result = await updateWorkspaceFile("file-1", {
        name: "updated.txt",
        content: "Updated content",
      });

      expect(result).toEqual(mockFile);
    });

    it("should delete workspace file", async () => {
      mockSql.mockResolvedValue([{ id: "file-1" }]);

      const result = await deleteWorkspaceFile("file-1");

      expect(result).toBe(true);
    });

    it("should delete all workspace files", async () => {
      mockSql.mockResolvedValue([]);

      const result = await deleteWorkspaceFiles("workspace-1");

      expect(result).toBe(true);
    });
  });

  describe("View Operations", () => {
    it("should record workspace view", async () => {
      const mockView = {
        id: "mock-id",
        workspace_id: "workspace-1",
        ip_address: "127.0.0.1",
        user_agent: "test-agent",
        viewed_at: new Date(),
      };

      mockSql.mockResolvedValue([mockView]);

      const result = await recordWorkspaceView({
        workspace_id: "workspace-1",
        ip_address: "127.0.0.1",
        user_agent: "test-agent",
      });

      expect(result).toEqual(mockView);
    });

    it("should get workspace views", async () => {
      const mockViews = [
        {
          id: "view-1",
          workspace_id: "workspace-1",
          ip_address: "127.0.0.1",
          user_agent: "test-agent",
          viewed_at: new Date(),
        },
      ];

      mockSql.mockResolvedValue(mockViews);

      const result = await getWorkspaceViews("workspace-1");

      expect(result).toEqual(mockViews);
    });
  });

  describe("Cleanup Operations", () => {
    it("should get expired workspaces", async () => {
      const expiredWorkspaces = [
        {
          id: "expired-1",
          title: "Expired Workspace",
          slug: "expired",
          user_id: "user-1",
          is_public: true,
          password_hash: null,
          expires_at: new Date("2023-01-01"),
          created_at: new Date("2022-12-01"),
          updated_at: new Date("2022-12-01"),
        },
      ];

      mockSql.mockResolvedValue(expiredWorkspaces);

      const result = await getExpiredWorkspaces();

      expect(result).toEqual(expiredWorkspaces);
    });

    it("should cleanup expired workspaces", async () => {
      const expiredWorkspaces = [
        {
          id: "expired-1",
          title: "Expired Workspace",
          slug: "expired",
          user_id: "user-1",
          is_public: true,
          password_hash: null,
          expires_at: new Date("2023-01-01"),
          created_at: new Date("2022-12-01"),
          updated_at: new Date("2022-12-01"),
        },
      ];

      // Mock getExpiredWorkspaces
      mockSql.mockResolvedValueOnce(expiredWorkspaces);
      // Mock deleteWorkspaceFiles
      mockSql.mockResolvedValueOnce([]);
      // Mock delete views
      mockSql.mockResolvedValueOnce([]);
      // Mock deleteWorkspace
      mockSql.mockResolvedValueOnce([{ id: "expired-1" }]);

      const result = await cleanupExpiredWorkspaces();

      expect(result).toBe(1);
    });
  });
});
