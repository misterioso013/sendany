import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {  
     environment: "happy-dom",  
     setupFiles: ["./src/test/setup.ts"],  
     include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],  
     globals: true,  
     coverage: {  
      provider: "v8",  
      reporter: ["text", "lcov"],  
      reportsDirectory: "coverage",  
    },  
   },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
