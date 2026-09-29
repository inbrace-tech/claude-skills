// The pure rules behind verify-tag-signature.ts: a tag's object type and text in, errors out.
// A release tag is annotated and signed; this checks the signature is present, and `git tag -v`
// (run by the entrypoint with --verify-signature, where the key is known) checks it is valid.

/** The armor git writes for an OpenPGP, SSH or X.509 tag signature. */
const SIGNATURES = [
  ["-----BEGIN PGP SIGNATURE-----", "-----END PGP SIGNATURE-----"],
  ["-----BEGIN SSH SIGNATURE-----", "-----END SSH SIGNATURE-----"],
  ["-----BEGIN SIGNED MESSAGE-----", "-----END SIGNED MESSAGE-----"],
] as const;

/**
 * Errors for the tag `name`, given `git cat-file -t` of the ref and, for an annotated tag, the
 * `git cat-file tag` text. A lightweight tag's ref points straight at a commit and carries nothing to sign.
 */
export function checkTagObject(name: string, type: string, text: string | null): string[] {
  if (type !== "tag") return [`${name} is a lightweight tag (its ref points at a ${type}); release tags are annotated and signed`];
  if (text === null) return [`${name}: the tag object could not be read`];

  const errors: string[] = [];
  const headerEnd = text.indexOf("\n\n");
  const headers = (headerEnd === -1 ? text : text.slice(0, headerEnd)).split("\n");
  const tagged = headers.find((line) => line.startsWith("tag "))?.slice("tag ".length);
  if (tagged !== name) errors.push(`${name}: the tag object is named ${JSON.stringify(tagged ?? null)}, not ${name}`);

  const lines = text.trimEnd().split("\n");
  const signed = SIGNATURES.some(([begin, end]) => {
    const start = lines.indexOf(begin);
    return start !== -1 && start > 0 && lines.at(-1) === end;
  });
  if (!signed) errors.push(`${name} is annotated but not signed: it ends in no signature block`);
  return errors;
}
