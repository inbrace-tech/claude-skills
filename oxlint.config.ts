// Oxlint configuration for the Node 24 TypeScript scripts and their Vitest specs.
// Only the `correctness` category is subscribed; every other rule is adopted by name, since
// categories change across releases. Keep this the only config: oxlint refuses two in one directory.

import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",

  // `typescript` must stay on: oxlint silently accepts a rule whose plugin is off.
  plugins: ["typescript", "unicorn", "oxc", "vitest"],

  options: {
    // Needs `oxlint-tsgolint` installed, or oxlint fails to find the tsgolint executable.
    typeAware: true,
    // `typeCheck` stays off: `pnpm run typecheck` is the type gate, over tsconfig.json's file set.
  },

  categories: {
    correctness: "deny",
  },

  rules: {
    // Type-aware.
    "typescript/no-deprecated": "error",
    "typescript/no-misused-promises": "error",
    "typescript/only-throw-error": "error",
    "typescript/require-await": "error",
    "typescript/prefer-promise-reject-errors": "error",
    "typescript/no-unnecessary-type-assertion": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unnecessary-type-conversion": "error",

    // Node's type stripping rejects `namespace`, and the scripts are ES modules.
    "typescript/ban-ts-comment": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/no-namespace": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-empty-object-type": "error",
    "oxc/no-map-spread": "error",

    eqeqeq: ["error", "always"],
    "preserve-caught-error": "error",
    "no-case-declarations": "error",
    "no-fallthrough": "error",
    "no-prototype-builtins": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-regex-spaces": "error",
    "no-empty": "error",
    "no-useless-assignment": "error",
    "no-array-constructor": "error",

    "vitest/no-commented-out-tests": "error",
    "vitest/no-identical-title": "error",
    "vitest/no-import-node-test": "error",
    "vitest/no-interpolation-in-snapshots": "error",
    "vitest/no-mocks-import": "error",
    "vitest/no-unneeded-async-expect-function": "error",
    "vitest/prefer-called-exactly-once-with": "error",
  },

  ignorePatterns: ["node_modules/**"],
});
