import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoogleDriveService, STORAGE_LIMITS } from "./google-drive";

// Mock googleapis
const mockDrive = {
  files: {
    create: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  },
};

const mockOAuth2 = {
  setCredentials: vi.fn(),
  refreshAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
};

vi.mock("googleapis", () => ({
  google: {
    drive: () => mockDrive,
    auth: {
      OAuth2: vi.fn(() => mockOAuth2),
    },
  },
}));

describe("GoogleDriveService", () => {
  let driveService: GoogleDriveService;

  beforeEach(() => {
    vi.clearAllMocks();
    driveService = new GoogleDriveService();
  });

  describe("Storage Validation", () => {
    it("should validate file size correctly", () => {
      const smallFile = { size: 1024, type: "text/plain" };
      const result = driveService.validateFile(smallFile, 0, 0);

      expect(result.valid).toBe(true);
    });

    it("should reject file exceeding max file size", () => {
      const largeFile = {
        size: STORAGE_LIMITS.MAX_FILE_SIZE + 1,
        type: "text/plain",
      };
      const result = driveService.validateFile(largeFile, 0, 0);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("File size");
    });

    it("should reject file causing workspace size limit to be exceeded", () => {
      const file = { size: 1024, type: "text/plain" };
      const currentWorkspaceSize = STORAGE_LIMITS.MAX_WORKSPACE_SIZE - 512;
      const result = driveService.validateFile(file, currentWorkspaceSize, 0);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Workspace size would exceed limit/i);
    });

    it("should reject file causing user storage limit to be exceeded", () => {
      const file = { size: 1024, type: "text/plain" };
      const currentUserStorage = STORAGE_LIMITS.MAX_USER_STORAGE - 512;
      const result = driveService.validateFile(file, 0, currentUserStorage);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("User storage");
    });

    it.skip("should reject unsupported file types", () => {
      // Enable when service enforces allowed MIME types
    });
  });

  describe("Token Management", () => {
    it("should set credentials", () => {
      const tokens = {
        access_token: "access-token",
        refresh_token: "refresh-token",
      };

      driveService.setCredentials(tokens);

      expect(mockOAuth2.setCredentials).toHaveBeenCalledWith(tokens);
    });

    it("should handle token refresh", async () => {
      mockOAuth2.refreshAccessToken.mockResolvedValue({
        credentials: {
          access_token: "new-access-token",
          expires_in: 3600,
        },
      });

      const result = await driveService.refreshTokens("refresh-token");

      expect(result.access_token).toBe("new-access-token");
      expect(result.refresh_token).toBe("refresh-token");
    });
  });

  describe("Folder Operations", () => {
    it("should create SendAny folder", async () => {
      mockDrive.files.list.mockResolvedValue({
        data: { files: [] }, // No existing folder
      });

      mockDrive.files.create.mockResolvedValue({
        data: { id: "new-folder-id" },
      });

      const folderId = await driveService.createSendAnyFolder();

      expect(mockDrive.files.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            name: "SendAny",
            mimeType: "application/vnd.google-apps.folder",
          }),
        })
      );

      expect(folderId).toBe("new-folder-id");
    });

    it("should return existing SendAny folder if found", async () => {
      mockDrive.files.list.mockResolvedValue({
        data: {
          files: [{ id: "existing-folder-id", name: "SendAny" }],
        },
      });

      const folderId = await driveService.createSendAnyFolder();

      expect(mockDrive.files.create).not.toHaveBeenCalled();
      expect(folderId).toBe("existing-folder-id");
    });

    it("should create workspace folder", async () => {
      mockDrive.files.create.mockResolvedValue({
        data: { id: "workspace-folder-id" },
      });

      const folderId = await driveService.createWorkspaceFolder(
        "workspace-123",
        "My Workspace",
        "parent-folder-id"
      );

      expect(mockDrive.files.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            name: "My Workspace (workspace-123)",
            mimeType: "application/vnd.google-apps.folder",
            parents: ["parent-folder-id"],
          }),
        })
      );

      expect(folderId).toBe("workspace-folder-id");
    });

    it("should delete folder", async () => {
      mockDrive.files.delete.mockResolvedValue({ data: {} });

      await driveService.deleteFolder("folder-to-delete");

      expect(mockDrive.files.delete).toHaveBeenCalledWith({
        fileId: "folder-to-delete",
      });
    });
  });

  describe("File Operations", () => {
    it("should upload file successfully", async () => {
      const fileContent = Buffer.from("test content");

      mockDrive.files.create.mockResolvedValue({
        data: {
          id: "uploaded-file-id",
          name: "test.txt",
          size: 12,
          mimeType: "text/plain",
          webViewLink: "https://drive.google.com/file/d/uploaded-file-id/view",
        },
      });

      const result = await driveService.uploadFile(
        fileContent,
        "test.txt",
        "text/plain",
        "parent-folder-id"
      );

      expect(mockDrive.files.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            name: "test.txt",
            parents: ["parent-folder-id"],
          }),
          media: expect.objectContaining({
            mimeType: "text/plain",
          }),
        })
      );

      expect(result.id).toBe("uploaded-file-id");
      expect(result.name).toBe("test.txt");
    });

    it("should handle upload errors", async () => {
      const fileContent = Buffer.from("test content");

      mockDrive.files.create.mockRejectedValue(new Error("Upload failed"));

      await expect(
        driveService.uploadFile(
          fileContent,
          "test.txt",
          "text/plain",
          "parent-folder-id"
        )
      ).rejects.toThrow("Upload failed");
    });

    it("should delete file", async () => {
      mockDrive.files.delete.mockResolvedValue({ data: {} });

      await driveService.deleteFile("file-to-delete");

      expect(mockDrive.files.delete).toHaveBeenCalledWith({
        fileId: "file-to-delete",
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      mockDrive.files.list.mockRejectedValue(new Error("API Error"));

      await expect(driveService.createSendAnyFolder()).rejects.toThrow(
        "API Error"
      );
    });

    it("should handle network timeouts", async () => {
      mockDrive.files.create.mockRejectedValue(new Error("TIMEOUT"));

      const fileContent = Buffer.from("content");

      await expect(
        driveService.uploadFile(
          fileContent,
          "test.txt",
          "text/plain",
          "folder-id"
        )
      ).rejects.toThrow("TIMEOUT");
    });
  });
});
