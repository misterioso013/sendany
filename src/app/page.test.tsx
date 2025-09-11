import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import HomePage from "./page";

// Mock Stack Auth
vi.mock("@/stack", () => ({
  stackServerApp: {
    getUser: vi.fn(),
  },
  UserButton: () => <div data-testid="user-button">User Button</div>,
}));

// Mock Next.js Link
vi.mock("next/link", () => {
  const MockLink = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock components
vi.mock("@/components/home-content", () => ({
  HomeContent: () => <div data-testid="home-content">Home Content</div>,
}));

vi.mock("@/components/ui/mode-toggle", () => ({
  default: () => <button data-testid="mode-toggle">Toggle Mode</button>,
}));

const { stackServerApp } = await import("@/stack");

describe("HomePage", () => {
  it("renders for unauthenticated user", async () => {
    vi.mocked(stackServerApp.getUser).mockResolvedValue(null);

    render(await HomePage());

    expect(screen.getByTestId("home-content")).toBeInTheDocument();
    expect(screen.getByTestId("mode-toggle")).toBeInTheDocument();
  });

  it("renders for authenticated user", async () => {
    const mockUser = {
      id: "user-123",
      displayName: "Test User",
      primaryEmail: "test@example.com",
    } as any;

    vi.mocked(stackServerApp.getUser).mockResolvedValue(mockUser);

    render(await HomePage());

    expect(screen.getByTestId("home-content")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    expect(screen.getByTestId("mode-toggle")).toBeInTheDocument();
  });

  it("shows dashboard link for authenticated user", async () => {
    const mockUser = {
      id: "user-123",
      displayName: "Test User",
      primaryEmail: "test@example.com",
    } as any;

    vi.mocked(stackServerApp.getUser).mockResolvedValue(mockUser);

    render(await HomePage());

    expect(
      screen.getByRole("link", { name: /dashboard/i })
    ).toBeInTheDocument();
  });

  it("does not show dashboard link for unauthenticated user", async () => {
    vi.mocked(stackServerApp.getUser).mockResolvedValue(null);

    render(await HomePage());

    expect(
      screen.queryByRole("link", { name: /dashboard/i })
    ).not.toBeInTheDocument();
  });

  it("contains proper meta information", async () => {
    // This test would check that metadata is properly set
    // Since it's exported from the file, we can test the metadata object
    const { metadata } = await import("./page");

    expect(metadata.title).toBe("SendAny - Share anything with anyone");
    expect(metadata.description).toContain(
      "The perfect combination of Google Drive, Pastebin, and GitHub Gist"
    );
    expect(metadata.keywords).toContain("file sharing");
    expect(metadata.openGraph?.title ?? "").toBe(
      "SendAny - Share anything with anyone"
    );
  });
});
