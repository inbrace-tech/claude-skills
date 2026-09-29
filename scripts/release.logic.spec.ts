// Tests for release's pure rules (`pnpm test`). release.ts itself tags and pushes, so it runs only by hand.

import { newTags, signedTagEnv } from "./release.logic.ts";

describe("release rules", () => {
  describe("signedTagEnv", () => {
    it("adds tag.gpgSign=true as the first git config entry", () => {
      expect(signedTagEnv({ HOME: "/h" })).toEqual({ HOME: "/h", GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "tag.gpgSign", GIT_CONFIG_VALUE_0: "true" });
    });

    it("appends after entries already in the environment", () => {
      const env = signedTagEnv({ GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "a.b", GIT_CONFIG_VALUE_0: "c" });
      expect(env).toMatchObject({ GIT_CONFIG_COUNT: "2", GIT_CONFIG_KEY_0: "a.b", GIT_CONFIG_KEY_1: "tag.gpgSign", GIT_CONFIG_VALUE_1: "true" });
    });

    it("starts over from an unreadable count", () => {
      expect(signedTagEnv({ GIT_CONFIG_COUNT: "x" })).toMatchObject({ GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "tag.gpgSign" });
    });
  });

  it("newTags lists only the tags a run added", () => {
    expect(newTags(["a@1.0.0"], ["a@1.0.0", "a@1.1.0", "", "b@0.1.0"])).toEqual(["a@1.1.0", "b@0.1.0"]);
  });
});
