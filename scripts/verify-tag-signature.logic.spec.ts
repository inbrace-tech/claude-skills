// Tests for verify-tag-signature's pure rules, with strings and no git (`pnpm test`).

import { checkTagObject } from "./verify-tag-signature.logic.ts";

describe("verify-tag-signature rules", () => {
  const NAME = "p@1.0.0";
  const tagObject = (signature: string, name = NAME): string =>
    `object 0123456789abcdef0123456789abcdef01234567\ntype commit\ntag ${name}\ntagger A <a@example.com> 1 +0000\n\n${name}\n${signature}`;
  const pgp = "-----BEGIN PGP SIGNATURE-----\n\nabc=\n-----END PGP SIGNATURE-----\n";

  it("passes an annotated tag with a PGP, SSH or X.509 signature", () => {
    expect(checkTagObject(NAME, "tag", tagObject(pgp))).toEqual([]);
    expect(checkTagObject(NAME, "tag", tagObject("-----BEGIN SSH SIGNATURE-----\nabc\n-----END SSH SIGNATURE-----\n"))).toEqual([]);
    expect(checkTagObject(NAME, "tag", tagObject("-----BEGIN SIGNED MESSAGE-----\nabc\n-----END SIGNED MESSAGE-----\n"))).toEqual([]);
  });

  it("refuses a lightweight tag by name", () => {
    expect(checkTagObject(NAME, "commit", null)).toEqual([`${NAME} is a lightweight tag (its ref points at a commit); release tags are annotated and signed`]);
  });

  it("fails an annotated tag without a signature block", () => {
    expect(checkTagObject(NAME, "tag", tagObject(""))).toEqual([`${NAME} is annotated but not signed: it ends in no signature block`]);
  });

  it("fails a signature block that does not end the tag", () => {
    expect(checkTagObject(NAME, "tag", tagObject(`${pgp}trailing text\n`))).toEqual([expect.stringMatching(/not signed/)]);
  });

  it("fails a tag object named otherwise than its ref", () => {
    expect(checkTagObject(NAME, "tag", tagObject(pgp, "p@0.9.0"))).toEqual([`${NAME}: the tag object is named "p@0.9.0", not ${NAME}`]);
  });

  it("fails an unreadable tag object", () => {
    expect(checkTagObject(NAME, "tag", null)).toEqual([`${NAME}: the tag object could not be read`]);
  });
});
