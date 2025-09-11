import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkspacePage from "./page";

// Mock the database module
vi.mock("@/lib/database", () => ({
  getWorkspaceBySlug: vi.fn(),
  getWorkspaceFiles: vi.fn(),
  recordWorkspaceView: vi.fn(),
  verifyWorkspacePassword: vi.fn(),
}));

// Mock Stack Auth
vi.mock("@stackframe/stack", () => ({
  useUser: vi.fn(() => ({ user: null })),
}));

// Mock Next.js navigation functions
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn((header: string) => {
      if (header === "x-forwarded-for") return "127.0.0.1";
      if (header === "user-agent") return "Mozilla/5.0 Test Agent";
      return null;
    }),
  })),
}));

// Mock components
vi.mock("@/components/workspace-viewer", () => ({
  default: ({ workspace, files }: any) => (
    <div>
      <h1>{workspace.title}</h1>
      <div data-testid="file-count">{files.length} files</div>
    </div>
  ),
}));

vi.mock("@/components/password-form", () => ({
  default: () => <div>Password Required</div>,
}));

// Import the mocked functions
import {
  getWorkspaceBySlug,
  getWorkspaceFiles,
  recordWorkspaceView,
  verifyWorkspacePassword,
} from "@/lib/database";

const mockGetWorkspaceBySlug = getWorkspaceBySlug as any;
const mockGetWorkspaceFiles = getWorkspaceFiles as any;
const mockRecordWorkspaceView = recordWorkspaceView as any;
const mockVerifyWorkspacePassword = verifyWorkspacePassword as any;

describe("WorkspacePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw not found error when workspace does not exist", async () => {
    mockGetWorkspaceBySlug.mockResolvedValue(null);

    await expect(
      WorkspacePage({
        params: Promise.resolve({ slug: "nonexistent" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockGetWorkspaceBySlug).toHaveBeenCalledWith("nonexistent");
  });

  it("should render workspace content when public workspace exists", async () => {
    const mockWorkspace = {
      id: "workspace-1",
      title: "Test Workspace",
      slug: "test-workspace",
      user_id: "user-1",
      is_public: true,
      password_hash: null,
      expires_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockFiles = [
      {
        id: "file-1",
        workspace_id: "workspace-1",
        name: "test.txt",
        content: "Hello World",
        language: "text",
        type: "text" as const,
        file_order: 0,
        google_drive_file_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockGetWorkspaceBySlug.mockResolvedValue(mockWorkspace);
    mockGetWorkspaceFiles.mockResolvedValue(mockFiles);
    mockRecordWorkspaceView.mockResolvedValue(undefined);

    const result = await WorkspacePage({
      params: Promise.resolve({ slug: "test-workspace" }),
      searchParams: Promise.resolve({}),
    });

    render(result);

    expect(screen.getByText("Test Workspace")).toBeInTheDocument();
    expect(screen.getByTestId("file-count")).toHaveTextContent("1 files");
    expect(mockRecordWorkspaceView).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      ip_address: "127.0.0.1",
      user_agent: "Mozilla/5.0 Test Agent",
    });
  });

  it("should render password form for password protected workspace", async () => {
    const mockWorkspace = {
      id: "workspace-1",
      title: "Protected Workspace",
      slug: "protected",
      user_id: "user-1",
      is_public: true,
      password_hash: "hashed-password",
      expires_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockGetWorkspaceBySlug.mockResolvedValue(mockWorkspace);

    const result = await WorkspacePage({
      params: Promise.resolve({ slug: "protected" }),
      searchParams: Promise.resolve({}),
    });

    render(result);

    expect(screen.getByText("Password Required")).toBeInTheDocument();
  });

  it("should render workspace when correct password is provided", async () => {
    const mockWorkspace = {
      id: "workspace-1",
      title: "Protected Workspace",
      slug: "protected",
      user_id: "user-1",
      is_public: true,
      password_hash: "hashed-password",
      expires_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockFiles: any[] = [];

    mockGetWorkspaceBySlug.mockResolvedValue(mockWorkspace);
    mockGetWorkspaceFiles.mockResolvedValue(mockFiles);
    mockRecordWorkspaceView.mockResolvedValue(undefined);
    mockVerifyWorkspacePassword.mockResolvedValue(true);

    const result = await WorkspacePage({
      params: Promise.resolve({ slug: "protected" }),
      searchParams: Promise.resolve({ password: "correct-password" }),
    });

    render(result);

    expect(screen.getByText("Protected Workspace")).toBeInTheDocument();
  });

  it("should render private workspace for unauthorized user", async () => {
    const mockWorkspace = {
      id: "workspace-1",
      title: "Private Workspace",
      slug: "private",
      user_id: "user-1",
      is_public: false,
      password_hash: null,
      expires_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockGetWorkspaceBySlug.mockResolvedValue(mockWorkspace);

    const result = await WorkspacePage({
      params: Promise.resolve({ slug: "private" }),
      searchParams: Promise.resolve({}),
    });

    render(result);

    await waitFor(() => {
      expect(screen.getByText("Private Workspace")).toBeInTheDocument();
    });
  });

  it("should handle expired workspace", async () => {
    // Expired workspaces return null from getWorkspaceBySlug
    mockGetWorkspaceBySlug.mockResolvedValue(null);

    await expect(
      WorkspacePage({
        params: Promise.resolve({ slug: "expired" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockGetWorkspaceBySlug).toHaveBeenCalledWith("expired");
  });
});
