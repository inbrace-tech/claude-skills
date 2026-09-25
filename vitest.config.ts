import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only `*.spec.ts` under `scripts/`: the repository's scripts are the only
    // code it owns. Skills and agents are Markdown, checked by `check-norms`.
    include: ["scripts/**/*.spec.ts"],
    exclude: [...configDefaults.exclude],

    // Globals on, so `describe`/`it`/`expect` are ambient in every spec.
    //
    // This flag and the `vitest/globals` entry in `tsconfig.json`'s `types` are
    // ONE decision, not two: flipping either alone yields a suite whose compiler
    // surface and runtime surface disagree — ambient names that fail at run
    // time, or an available global the compiler refuses to resolve.
    globals: true,

    root: "./",
  },
});
