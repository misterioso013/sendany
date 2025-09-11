import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import vitest from "eslint-plugin-vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.test.{js,ts,jsx,tsx}"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-imports": [
        "error",
        {
          "paths": [
            {
              "name": "@/lib/databse",
              "message": "Import from '@/lib/database' instead. The '@/lib/databse' module has been removed due to typo."
            }
          ]
        }
      ]
    },
  },
];

export default eslintConfig;
