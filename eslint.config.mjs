import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".pnpm-store/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "*.pem",
      ".env*.local",
      ".env",
      ".vercel/**",
      "*.tsbuildinfo",
      "next-env.d.ts",
      "next.config.ts",
      "postcss.config.mjs",
      "tailwind.config.ts",
      "components.json",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "public/**"
    ]
  },
  {
    rules: {
      "quotes": ["error", "double"]
    }
  }
];

export default eslintConfig;
