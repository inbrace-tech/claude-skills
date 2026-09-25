// Oxlint configuration for the repository scripts: TypeScript run by Node 24
// as is, tested with Vitest.
//
// The shape is one subscribed category, `correctness`, with every rule beyond
// it adopted by name, because a category is a moving target across releases.
// Only the rules that apply to Node scripts are carried here: nothing about a
// framework, a test library other than Vitest, or a domain layering.
//
// What gets linted: every file oxlint parses under the repository root, minus
// `ignorePatterns`. Oxlint refuses to run with two configuration files in one
// directory, so this is the only one.

import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",

  // `typescript` holds every type-aware rule, and oxlint accepts a rule whose
  // plugin is off without saying so. `vitest` covers `scripts/**/*.spec.ts`.
  // `unicorn` and `oxc` contribute rules to the `correctness` category below.
  plugins: ["typescript", "unicorn", "oxc", "vitest"],

  options: {
    // Type-aware rules, backed by `oxlint-tsgolint`: without that package
    // installed, oxlint fails with "Failed to find tsgolint executable".
    typeAware: true,
    // `typeCheck` stays off: `pnpm run typecheck` is the type gate, over the
    // program `tsconfig.json` declares. A second checker here would read a
    // different file set.
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

    // Syntax the scripts avoid. Node's type stripping rejects `namespace`, and
    // the scripts are ES modules, so `require` has no place in them.
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
