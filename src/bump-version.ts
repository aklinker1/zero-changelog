export type VersionBump = (string & {}) | "major" | "minor" | "patch";

/**
 * Bumps the version by the specified amount (`bump: "major" | "minor" | "patch"`), or sets the
 * version to a specific value (`bump: "1.2.4"`).
 *
 * > **NOTE**: This function does not take into consideration if the current version is in prerelease
 * > (0.X.Y). During prerelease, conventional commit tools "lower" the bump type from `"major"` →
 * > `"minor"` and `"minor"` → `"patch"`. _**This function is not responsible for this logic**_; it
 * > just bumps the version exactly as described. See `detectVersionBump` for this logic.
 *
 * @example
 *   bumpVersion("1.2.3", "major"); // "2.0.0" bumpVersion("1.2.3", "minor"); // "1.3.0"
 *   bumpVersion("1.2.3", "patch"); // "1.2.4" bumpVersion("1.2.3", "1.3.4"); // "1.3.4"
 */
export function bumpVersion(currentVersion: string, bump: VersionBump): string {
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
