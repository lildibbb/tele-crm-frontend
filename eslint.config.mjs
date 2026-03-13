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
    // Agent skill files — not source code, not linted:
    ".agents/**",
  ]),
  // E2E test files — disable React-specific rules (these are not React components)
  {
    files: ["tests/e2e/**/*.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // eslint-plugin-react-hooks v7 added React Compiler constraint rules to its
  // recommended config (refs, purity, set-state-in-effect, static-components, etc.).
  // These are set to "error" by default, but React Compiler is NOT enabled in
  // next.config.ts. Downgrade to "warn" so CI passes while violations stay visible.
  {
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/component-hook-factories": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/config": "warn",
      "react-hooks/gating": "warn",
      // Underscore-prefixed params/vars/caught-errors are intentionally unused.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
