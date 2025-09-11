import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import { createMockWorkspace } from "@/test/test-utils";
import { WorkspaceViewer } from "./workspace-viewer";

describe("WorkspaceViewer", () => {
  const mockWorkspace = createMockWorkspace({
    title: "Test Workspace",
    description: "A test workspace for viewing",
  });

  const mockFiles: Array<{
    id: string;
    filename: string;
    content?: string;
    file_type: "text" | "code" | "markdown" | "file";
    language?:
      | "javascript"
      | "typescript"
      | "css"
      | "html"
      | "json"
      | "markdown"
      | "python"
      | "sql"
      | "text";
    file_size?: number;
    file_url?: string;
    mime_type?: string;
    order_index: number;
  }> = [
    {
      id: "test-file-id",
      filename: "readme.md",
      content: "# Welcome\n\nThis is a test workspace.",
      file_type: "markdown",
      language: "markdown",
      order_index: 0,
    },
    {
      id: "file-2",
      filename: "script.js",
      content: 'console.log("Hello, world!");',
      file_type: "code",
      language: "javascript",
      order_index: 1,
    },
  ];

  it("renders workspace title and description", () => {
    render(<WorkspaceViewer workspace={mockWorkspace} files={mockFiles} />);

    expect(screen.getByText("Test Workspace")).toBeInTheDocument();
    expect(
      screen.getByText("A test workspace for viewing")
    ).toBeInTheDocument();
  });

  it("renders file tabs", () => {
    render(<WorkspaceViewer workspace={mockWorkspace} files={mockFiles} />);

    expect(screen.getByText("readme.md")).toBeInTheDocument();
    expect(screen.getByText("script.js")).toBeInTheDocument();
  });

  it("displays file content", () => {
    render(<WorkspaceViewer workspace={mockWorkspace} files={mockFiles} />);

    // The first file should be active by default
    expect(screen.getByText(/Welcome/)).toBeInTheDocument();
  });

  it("handles workspace without files", () => {
    render(<WorkspaceViewer workspace={mockWorkspace} files={[]} />);

    expect(screen.getByText(/no files/i)).toBeInTheDocument();
  });

  it("shows workspace metadata", () => {
    const workspaceWithExpiry = createMockWorkspace({
      title: "Expiring Workspace",
      expires_at: new Date(Date.now() + 86400000), // 1 day from now
      is_public: false,
    });

    render(
      <WorkspaceViewer workspace={workspaceWithExpiry} files={mockFiles} />
    );

    // Should show privacy and expiration information
    expect(screen.getByText(/private/i)).toBeInTheDocument();
  });

  it("renders code files with syntax highlighting", () => {
    const codeFile = {
      id: "code-file-id",
      filename: "example.py",
      content: 'print("Hello, Python!")',
      file_type: "code" as const,
      language: "python" as const,
      order_index: 0,
    };

    render(<WorkspaceViewer workspace={mockWorkspace} files={[codeFile]} />);

    // Should contain the code content
    expect(screen.getByText(/Hello, Python!/)).toBeInTheDocument();
  });

  it("handles large file display", () => {
    const largeFile = {
      id: "large-file-id",
      filename: "large.txt",
      content: "A".repeat(10000), // Large content
      file_type: "text" as const,
      file_size: 10000,
      order_index: 0,
    };

    render(<WorkspaceViewer workspace={mockWorkspace} files={[largeFile]} />);

    expect(screen.getByText("large.txt")).toBeInTheDocument();
  });

  // Mock must be hoisted before importing the SUT when it depends on "@/stack"
  vi.mock("@/stack", () => ({
    stackServerApp: {
      getUser: () => Promise.resolve({ id: "test-user-id" }),
    },
  }));
});
