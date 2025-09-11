import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { ThemeProvider } from "next-themes";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock data factories
export const createMockWorkspace = (overrides = {}) => ({
  id: "test-workspace-id",
  slug: "test-workspace",
  title: "Test Workspace",
  description: "A test workspace",
  user_id: "test-user-id",
  is_public: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const createMockWorkspaceFile = (overrides = {}) => ({
  id: "test-file-id",
  workspace_id: "test-workspace-id",
  filename: "test.md",
  content: "# Test Content",
  file_type: "markdown" as const,
  language: "markdown",
  order_index: 0,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  ...overrides,
});
