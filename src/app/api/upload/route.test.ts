import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock the dependencies
vi.mock("@/stack", () => ({
  stackServerApp: {
    getUser: vi.fn(),
  },
}));

vi.mock("@/lib/databse", () => ({
  getWorkspaceById: vi.fn(),
  createWorkspaceFile: vi.fn(),
  getUserStorageUsage: vi.fn(),
  getWorkspaceSize: vi.fn(),
  updateUserStorageUsed: vi.fn(),
  updateWorkspaceDriveFolder: vi.fn(),
  updateWorkspaceFileDriveId: vi.fn(),
}));

vi.mock("@/lib/google-drive", () => ({
  driveService: {
    validateFile: vi.fn(),
    createSendAnyFolder: vi.fn(),
    createWorkspaceFolder: vi.fn(),
    uploadFile: vi.fn(),
    initializeFromTokens: vi.fn(),
  },
}));

const { stackServerApp } = await import("@/stack");
const {
  getWorkspaceById,
  createWorkspaceFile,
  getUserStorageUsage,
  getWorkspaceSize,
} = await import("@/lib/databse");
const { driveService } = await import("@/lib/google-drive");

describe("/api/upload Route", () => {
  const mockUser = {
    id: "user-123",
    displayName: "Test User",
    primaryEmail: "test@example.com",
  } as any;

  const mockWorkspace = {
    id: "workspace-123",
    user_id: "user-123",
    title: "Test Workspace",
    slug: "test-workspace",
    is_public: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(stackServerApp.getUser).mockResolvedValue(mockUser);
    vi.mocked(getWorkspaceById).mockResolvedValue(mockWorkspace);
    vi.mocked(getUserStorageUsage).mockResolvedValue(0);
    vi.mocked(getWorkspaceSize).mockResolvedValue(0);
    vi.mocked(driveService.validateFile).mockReturnValue({ valid: true });
  });

  it("should upload file successfully", async () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    const formData = new FormData();
    formData.append("file", mockFile);
    formData.append("workspaceId", "workspace-123");

    vi.mocked(driveService.createSendAnyFolder).mockResolvedValue(
      "main-folder-id"
    );
    vi.mocked(driveService.createWorkspaceFolder).mockResolvedValue(
      "workspace-folder-id"
    );
    vi.mocked(driveService.uploadFile).mockResolvedValue({
      id: "drive-file-id",
      name: "test.txt",
      size: 12,
      mimeType: "text/plain",
      webViewLink: "https://drive.google.com/file/d/drive-file-id/view",
    });
    vi.mocked(createWorkspaceFile).mockResolvedValue({
      id: "file-123",
      workspace_id: "workspace-123",
      filename: "test.txt",
      file_type: "file",
      file_size: 12,
      file_url: "https://drive.google.com/file/d/drive-file-id/view",
      mime_type: "text/plain",
      drive_file_id: "drive-file-id",
      order_index: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.file).toBeDefined();
    expect(data.file.filename).toBe("test.txt");
  });

  it("should return 401 for unauthenticated user", async () => {
    vi.mocked(stackServerApp.getUser).mockResolvedValue(null);

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.txt"));
    formData.append("workspaceId", "workspace-123");

    const request = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 404 for non-existent workspace", async () => {
    vi.mocked(getWorkspaceById).mockResolvedValue(undefined);

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.txt"));
    formData.append("workspaceId", "non-existent");

    const request = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Workspace not found");
  });

  it("should return 403 for unauthorized user", async () => {
    const otherWorkspace = {
      ...mockWorkspace,
      user_id: "other-user",
    };
    vi.mocked(getWorkspaceById).mockResolvedValue(otherWorkspace);

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.txt"));
    formData.append("workspaceId", "workspace-123");

    const request = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Unauthorized");
  });

  it("should reject file that exceeds size limits", async () => {
    vi.mocked(driveService.validateFile).mockReturnValue({
      valid: false,
      error: "File size exceeds limit",
    });

    const formData = new FormData();
    formData.append("file", new File(["test"], "large.txt"));
    formData.append("workspaceId", "workspace-123");

    const request = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("File size exceeds limit");
  });

  it("should handle upload errors gracefully", async () => {
    vi.mocked(driveService.uploadFile).mockRejectedValue(
      new Error("Upload failed")
    );

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.txt"));
    formData.append("workspaceId", "workspace-123");

    const request = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to upload file");
  });

  it("should handle missing file in form data", async () => {
    const formData = new FormData();
    formData.append("workspaceId", "workspace-123");
    // No file appended

    const request = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No file provided");
  });
});
