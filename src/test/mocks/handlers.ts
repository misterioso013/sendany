import { http, HttpResponse } from "msw";

export const handlers = [
  // Workspace API handlers
  http.get("/api/workspaces/:id", ({ params }) => {
    return HttpResponse.json({
      workspace: {
        id: params.id,
        slug: "test-workspace",
        title: "Test Workspace",
        description: "A test workspace",
        user_id: "test-user-id",
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      files: [
        {
          id: "file-1",
          workspace_id: params.id,
          filename: "test.md",
          content: "# Test Content",
          file_type: "markdown",
          language: "markdown",
          order_index: 0,
        },
      ],
    });
  }),

  http.put("/api/workspaces/:id", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/upload", () => {
    return HttpResponse.json({
      success: true,
      file: {
        id: "uploaded-file-id",
        filename: "test-file.pdf",
        file_url: "https://example.com/test-file.pdf",
      },
    });
  }),

  http.get("/api/drive-status", () => {
    return HttpResponse.json({
      connected: true,
      email: "test@gmail.com",
      storageUsed: 0,
    });
  }),

  http.post("/api/cleanup", () => {
    return HttpResponse.json({
      success: true,
      message: "Cleanup completed",
      cleanedCount: 0,
    });
  }),

  // Auth handlers
  http.get("/api/auth/google", () => {
    return HttpResponse.redirect("/api/auth/google/callback");
  }),

  http.get("/api/auth/google/callback", () => {
    return HttpResponse.redirect("/dashboard");
  }),
];
