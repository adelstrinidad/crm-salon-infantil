import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // AI-Kit tooling (hooks + capture/validation scripts) — CommonJS node
    // scripts, not part of the Next app source; not linted with app rules.
    ".ai/**",
    // Prisma-generated client.
    "app/generated/**",
  ]),
  // Playwright e2e suite: the fixture callback param is named `use` (Playwright
  // API), which the React rule misreads as a hook. These files are not React.
  {
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
]);

export default eslintConfig;
