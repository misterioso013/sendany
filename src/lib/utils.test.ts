import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("Utils", () => {
  describe("cn (className utility)", () => {
    it("should combine class names correctly", () => {
      const result = cn("base-class", "additional-class");
      expect(result).toBe("base-class additional-class");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn(
        "base-class",
        isActive && "active",
        isDisabled && "disabled"
      );

      expect(result).toBe("base-class active");
    });

    it("should merge tailwind classes correctly", () => {
      // This tests the tailwind-merge functionality
      const result = cn("px-4", "px-6"); // px-6 should override px-4
      expect(result).toBe("px-6");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base-class", undefined, null, "other-class");
      expect(result).toBe("base-class other-class");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle objects with boolean values", () => {
      const result = cn({
        "always-present": true,
        "never-present": false,
        "conditionally-present": true,
      });

      expect(result).toBe("always-present conditionally-present");
    });

    it("should handle complex combinations", () => {
      const isLoading = true;
      const variant: "primary" | "secondary" = "primary";
      const size: "sm" | "lg" = "lg";

      const result = cn(
        "button",
        {
          "opacity-50": isLoading,
          "cursor-not-allowed": isLoading,
        },
        variant === "primary" && "bg-blue-500 text-white",
        size === "lg" && "px-6 py-3 text-lg"
      );

      expect(result).toContain("button");
      expect(result).toContain("opacity-50");
      expect(result).toContain("cursor-not-allowed");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("text-white");
      expect(result).toContain("px-6");
      expect(result).toContain("py-3");
      expect(result).toContain("text-lg");
    });
  });
});
