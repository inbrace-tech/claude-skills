// Tests for release-version's pure rules, with strings and a fake gh (`pnpm test`).

import { resolveToken } from "./release-version.logic.ts";

describe("release-version rules", () => {
  const noGh = (): string | null => {
    throw new Error("gh must not run");
  };

  it("takes an exported GITHUB_TOKEN without starting gh", () => {
    expect(resolveToken({ GITHUB_TOKEN: "t1" }, noGh)).toEqual({ token: "t1" });
  });

  it("falls back to gh when GITHUB_TOKEN is unset or empty, trimming its output", () => {
    expect(resolveToken({}, () => "t2\n")).toEqual({ token: "t2" });
    expect(resolveToken({ GITHUB_TOKEN: "" }, () => "t3")).toEqual({ token: "t3" });
  });

  it("fails when gh failed or printed nothing, without echoing anything", () => {
    const error = { error: "the changelog needs a GitHub token: export GITHUB_TOKEN, or sign in with `gh auth login`" };
    expect(resolveToken({}, () => null)).toEqual(error);
    expect(resolveToken({}, () => "  \n")).toEqual(error);
  });
});
