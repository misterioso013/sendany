import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
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
