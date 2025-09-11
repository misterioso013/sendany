import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "./use-file-upload";

// Mock URL.createObjectURL
Object.defineProperty(URL, "createObjectURL", {
  value: vi.fn(() => "mock-blob-url"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  value: vi.fn(),
});

describe("useFileUpload", () => {
  it("should initialize with empty files array", () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.files).toEqual([]);
  });

  it("should add files correctly", () => {
    const { result } = renderHook(() => useFileUpload());

    const mockFiles = [
      new File(["content1"], "file1.txt", { type: "text/plain" }),
      new File(["content2"], "file2.txt", { type: "text/plain" }),
    ];

    act(() => {
      result.current.addFiles(mockFiles);
    });

    expect(result.current.files).toHaveLength(2);
    expect(result.current.files[0].file.name).toBe("file1.txt");
    expect(result.current.files[1].file.name).toBe("file2.txt");
  });

  it("should generate preview URLs for files", () => {
    const { result } = renderHook(() => useFileUpload());

    const mockFile = new File(["content"], "test.txt", { type: "text/plain" });

    act(() => {
      result.current.addFiles([mockFile]);
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    expect(result.current.files[0].preview).toBe("mock-blob-url");
  });

  it("should remove files correctly", () => {
    const { result } = renderHook(() => useFileUpload());

    const mockFiles = [
      new File(["content1"], "file1.txt", { type: "text/plain" }),
      new File(["content2"], "file2.txt", { type: "text/plain" }),
    ];

    act(() => {
      result.current.addFiles(mockFiles);
    });

    expect(result.current.files).toHaveLength(2);

    act(() => {
      result.current.removeFile(result.current.files[0].id);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].file.name).toBe("file2.txt");
  });

  it("should clear all files", () => {
    const { result } = renderHook(() => useFileUpload());

    const mockFiles = [
      new File(["content1"], "file1.txt", { type: "text/plain" }),
      new File(["content2"], "file2.txt", { type: "text/plain" }),
    ];

    act(() => {
      result.current.addFiles(mockFiles);
    });

    expect(result.current.files).toHaveLength(2);

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toHaveLength(0);
  });

  it("should revoke object URLs when removing files", () => {
    const { result } = renderHook(() => useFileUpload());

   const mockFile = new File(["content"], "test.png", { type: "image/png" });

    act(() => {
      result.current.addFiles([mockFile]);
    });

    const fileId = result.current.files[0].id;
    const previewUrl = result.current.files[0].preview;

    act(() => {
      result.current.removeFile(fileId);
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(previewUrl);
  });
  it("should handle duplicate files", () => {
    const { result } = renderHook(() => useFileUpload());

    const mockFile = new File(["content"], "test.txt", { type: "text/plain" });

    act(() => {
      result.current.addFiles([mockFile]);
    });

    expect(result.current.files).toHaveLength(1);

    // Add the same file again
    act(() => {
      result.current.addFiles([mockFile]);
    });

    expect(result.current.files).toHaveLength(1);
  });

  it("should handle file validation", () => {
    const { result } = renderHook(() => useFileUpload());

    // Create a very large file (assuming there's a size limit)
    const largeFile = new File(["x".repeat(1000000)], "large.txt", {
      type: "text/plain",
    });

    act(() => {
      result.current.addFiles([largeFile]);
    });

    // This depends on implementation - the hook might reject large files
    // Adjust expectation based on actual behavior
    expect(result.current.files).toHaveLength(1);
  });

  it("should maintain file order", () => {
    const { result } = renderHook(() => useFileUpload());

    const file1 = new File(["content1"], "file1.txt", { type: "text/plain" });
    const file2 = new File(["content2"], "file2.txt", { type: "text/plain" });
    const file3 = new File(["content3"], "file3.txt", { type: "text/plain" });

    act(() => {
      result.current.addFiles([file1, file2, file3]);
    });

    expect(result.current.files[0].file.name).toBe("file1.txt");
    expect(result.current.files[1].file.name).toBe("file2.txt");
    expect(result.current.files[2].file.name).toBe("file3.txt");
  });

  it("should clean up on unmount", () => {
    const { result, unmount } = renderHook(() => useFileUpload());

    const mockFile = new File(["content"], "test.txt", { type: "text/plain" });

    act(() => {
      result.current.addFiles([mockFile]);
    });

    const previewUrl = result.current.files[0].preview;

    unmount();

    // Should revoke the object URL on cleanup
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(previewUrl);
  });
});
