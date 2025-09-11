import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// Environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.STACK_SECRET_SERVER_KEY = "test-secret";
process.env.STACK_PROJECT_ID = "test-project-id";

// Mock Stack Auth
vi.mock("@stackframe/stack", () => ({
  UserButton: vi.fn(() => null),
  stackServerApp: {
    getUser: vi.fn(() =>
      Promise.resolve({ id: "test-user-id", email: "test@example.com" })
    ),
  },
}));

// Mock Neon database
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => vi.fn(() => Promise.resolve([]))),
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-nanoid-123"),
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  hash: vi.fn(() => Promise.resolve("hashed-password")),
  compare: vi.fn(() => Promise.resolve(true)),
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  useParams: vi.fn(() => ({})),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => "test-header"),
  })),
}));

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
