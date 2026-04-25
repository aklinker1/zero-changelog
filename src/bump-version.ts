export type VersionBump = (string & {}) | "major" | "minor" | "patch";

export function bumpVersion(currentVersion: string, bump: VersionBump): string {
  if (currentVersion.startsWith("0.")) {
    if (bump === "major") bump = "minor";
    else if (bump === "minor") bump = "patch";
  }

  const parts = currentVersion.split(".");
  validateSemver("current", parts);

  if (bump === "major") {
    requireHardcodedVersion(currentVersion, bump);

    const [major] = parts;
    const newMajor = parseInt(major!) + 1;
    return `${newMajor}.0.0`;
  } else if (bump === "minor") {
    requireHardcodedVersion(currentVersion, bump);

    const [major, minor] = parts;
    const newMinor = parseInt(minor!) + 1;
    return `${major}.${newMinor}.0`;
  } else if (bump === "patch") {
    requireHardcodedVersion(currentVersion, bump);

    const [major, minor, patch] = parts;
    const newPatch = parseInt(patch!) + 1;
    return `${major}.${minor}.${newPatch}`;
  } else {
    validateSemver("bumped", bump.split("."));
    return bump;
  }
}

function requireHardcodedVersion(currentVersion: string, bump: string): void | never {
  if (currentVersion.includes("-"))
    throw Error(
      `Relative version bump (${bump}) not allowed when the current version is in pre-release. Use a hardcoded version instead.`,
    );
}

function validateSemver(label: string, parts: string[]): void | never {
  if (parts.length < 3) throw Error(`Invalid semver in ${label} version: ${parts.join(".")}`);
}
