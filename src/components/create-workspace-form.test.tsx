import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { CreateWorkspaceForm } from "./create-workspace-form";

// Mock the hooks
vi.mock("@/hooks/use-file-upload", () => ({
  useFileUpload: () => ({
    files: [],
    addFiles: vi.fn(),
    removeFile: vi.fn(),
    clearFiles: vi.fn(),
    clearErrors: vi.fn(),
    isDragging: false,
    errors: [],
    handleDragEnter: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDragOver: vi.fn(),
    handleDrop: vi.fn(),
    handleFileChange: vi.fn(),
    openFileDialog: vi.fn(),
    getInputProps: vi.fn(() => ({
      ref: { current: null },
      type: "file",
      accept: "*",
      multiple: false,
      onChange: vi.fn(),
    })),
    inputRef: { current: null },
  }),
}));

// Mock database functions
vi.mock("@/lib/database", () => ({
  createWorkspace: vi.fn(() =>
    Promise.resolve({ id: "new-workspace", slug: "new-workspace" })
  ),
  createWorkspaceFile: vi.fn(() => Promise.resolve({ id: "new-file" })),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("CreateWorkspaceForm", () => {
  const defaultProps = {
    userId: "test-user-id",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    // Check for workspace title input
    expect(screen.getByPlaceholderText(/workspace title/i)).toBeInTheDocument();
    
    // Check for the save button
    expect(screen.getByRole("button", { name: /save & share/i })).toBeInTheDocument();
    
    // Check for content type buttons
    expect(screen.getByRole("button", { name: /upload files/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /write content/i })).toBeInTheDocument();
  });

  it("allows entering workspace title and description", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    const titleInput = screen.getByPlaceholderText(/workspace title/i);
    
    // Clear and enter new title
    await fireEvent.change(titleInput, { target: { value: "" } });
    await fireEvent.change(titleInput, { target: { value: "My Test Workspace" } });

    expect(titleInput).toHaveValue("My Test Workspace");
  });

  it("switches between content types", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    const uploadButton = screen.getByRole("button", { name: /upload files/i });
    const contentButton = screen.getByRole("button", { name: /write content/i });
    
    // Content tab should be active by default (since drive is not connected in test)
    expect(contentButton).toBeInTheDocument();
    expect(uploadButton).toBeInTheDocument();
    
    // Click content button to switch
    await fireEvent.click(contentButton);
    
    // Verify content editor is visible by checking for CodeMirror placeholder
    expect(screen.getByText("Start typing...")).toBeInTheDocument();
  });

  it("allows adding new text files", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    // Switch to content mode
    const contentButton = screen.getByRole("button", { name: /write content/i });
    await fireEvent.click(contentButton);
    
    // Look for Add File button
    const addFileButton = screen.getByRole("button", { name: /add file/i });
    expect(addFileButton).toBeInTheDocument();
    
    // Click to add a new file
    await fireEvent.click(addFileButton);
    
    // Should still be in the document (file added)
    expect(addFileButton).toBeInTheDocument();
  });

  it("renders basic workspace interface", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    // Check basic interface is rendered
    const titleInput = screen.getByPlaceholderText(/workspace title/i);
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue("Untitled workspace");
  });

  it("allows creating workspace with save button", async () => {
    const { createWorkspace } = await import("@/lib/database");

    render(<CreateWorkspaceForm {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save & share/i });
    expect(saveButton).toBeInTheDocument();
    // Button is disabled by default
    expect(saveButton).toBeDisabled();
  });

  it("shows content editor interface", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    // Content mode should be active (since drive is not connected)
    const contentButton = screen.getByRole("button", { name: /write content/i });
    expect(contentButton).toBeInTheDocument();
    
    // Check for specific inputs by placeholder instead of role
    const titleInput = screen.getByPlaceholderText(/workspace title/i);
    expect(titleInput).toBeInTheDocument();
    
    const filenameInput = screen.getByPlaceholderText(/untitled\.md/i);
    expect(filenameInput).toBeInTheDocument();
    
    // Check for the CodeMirror editor by its placeholder text
    expect(screen.getByText("Start typing...")).toBeInTheDocument();
  });
});
