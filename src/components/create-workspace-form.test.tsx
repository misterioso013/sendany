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
  }),
}));

// Mock database functions
vi.mock("@/lib/databse", () => ({
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

    expect(screen.getByLabelText(/workspace title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create workspace/i })
    ).toBeInTheDocument();
  });

  it("allows entering workspace title and description", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/workspace title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(titleInput, { target: { value: "My Test Workspace" } });
    fireEvent.change(descriptionInput, {
      target: { value: "A workspace for testing" },
    });

    expect(titleInput).toHaveValue("My Test Workspace");
    expect(descriptionInput).toHaveValue("A workspace for testing");
  });

  it("handles privacy toggle", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    const privateToggle = screen.getByRole("switch");

    expect(privateToggle).not.toBeChecked(); // Public by default

    fireEvent.click(privateToggle);

    expect(privateToggle).toBeChecked(); // Should be private now
  });

  it("shows password field when workspace is private", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    const privateToggle = screen.getByRole("switch");
    fireEvent.click(privateToggle);

    await waitFor(() => {
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  it("handles expiration date setting", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);

    const expirationSelect = screen.getByLabelText(/expires in/i);
    fireEvent.change(expirationSelect, { target: { value: "24h" } });

    expect(expirationSelect).toHaveValue("24h");
  });

  it("creates workspace with text content", async () => {
    const { createWorkspace, createWorkspaceFile } = await import(
      "@/lib/databse"
    );

    render(<CreateWorkspaceForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/workspace title/i);
    const createButton = screen.getByRole("button", {
      name: /create workspace/i,
    });

    fireEvent.change(titleInput, { target: { value: "Test Workspace" } });

    // Add text content
    const addTextButton = screen.getByText(/add text file/i);
    fireEvent.click(addTextButton);

    const textArea = screen.getByPlaceholderText(/enter your text here/i);
    fireEvent.change(textArea, { target: { value: "# Test Content" } });

    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createWorkspace).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Workspace",
          user_id: "test-user-id",
        })
      );
    });
  });

  it("disables form when loading", async () => {
    render(<CreateWorkspaceForm {...defaultProps} />);
    const createButton = screen.getByRole("button", {
      name: /create workspace/i,
    });
    // Provide valid content to enable the button
    fireEvent.click(screen.getByText(/add text file/i));
    fireEvent.change(
      screen.getByPlaceholderText(/enter your text here/i),
      { target: { value: "content" } }
    );
    // Trigger creation to set loading state
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
  });

  it("shows error state when creation fails", async () => {
    const { createWorkspace } = await import("@/lib/databse");
    vi.mocked(createWorkspace).mockRejectedValue(new Error("Creation failed"));

    render(<CreateWorkspaceForm {...defaultProps} />);

    const createButton = screen.getByRole("button", {
      name: /create workspace/i,
    });
    // seed valid content so the button becomes enabled
    fireEvent.click(screen.getByText(/add text file/i));
    fireEvent.change(
      screen.getByPlaceholderText(/enter your text here/i),
      { target: { value: "content" } }
    );
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to create workspace/i)
      ).toBeInTheDocument();
    });
  });
});
