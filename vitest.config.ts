import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The scripts are the only code here; skills and agents are Markdown, checked by check-norms.
    include: ["scripts/**/*.spec.ts"],
    exclude: [...configDefaults.exclude],

    // Paired with `vitest/globals` in tsconfig.json's `types`: change both or neither.
    globals: true,

    root: "./",
  },
});
