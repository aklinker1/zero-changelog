export type RelativeBump = "major" | "minor" | "patch";
export type BumpBy = RelativeBump | (string & {});

const STABLE_REGEX = /^(?<major>[1-9]\d*)\.(?<minor>\d+)\.(?<patch>\d+)$/;
const UNSTABLE_REGEX = /^0\.(?<minor>\d+)\.(?<patch>\d+)$/;
const PRERELEASE_REGEX =
  /^(?<major>[1-9]\d*)\.0\.0-(?<prereleaseType>(alpha|beta|rc))\.(?<prerelease>\d+)$/;

export interface Semver {
  type: unknown;
  version: string;

  bump(this: void, by: BumpBy): string;
  compare(this: void, other: Semver): -1 | 0 | 1;
}

const STABLE_TYPE = Symbol("stable");

export interface StableVersion extends Semver {
  type: typeof STABLE_TYPE;
  major: number;
  minor: number;
  patch: number;
}

export function parseSemver(version: string): Semver {
  const stable = version.match(STABLE_REGEX)?.groups;
  if (stable) {
    const major = parseIntOrThrow(stable.major);
    const minor = parseIntOrThrow(stable.minor);
    const patch = parseIntOrThrow(stable.patch);
    return createStableVersion(major, minor, patch);
  }

  const unstable = version.match(UNSTABLE_REGEX)?.groups;
  if (unstable) {
    const minor = parseIntOrThrow(unstable.minor);
    const patch = parseIntOrThrow(unstable.patch);
    return createUnstableVersion(minor, patch);
  }

  const prerelease = version.match(PRERELEASE_REGEX)?.groups;
  if (prerelease) {
    const major = parseIntOrThrow(prerelease.major);
    const prereleaseType = parsePrereleaseTypeOrThrow(prerelease.prereleaseType);
    const prereleaseNumber = parseIntOrThrow(prerelease.prerelease);
    return createPrereleaseVersion(major, prereleaseType, prereleaseNumber);
  }

  throw Error(
    `Unsupported version format: "${version}". See docs: https://github.com/aklinker1/zero-changelog#semver`,
  );
}

function createStableVersion(major: number, minor: number, patch: number): StableVersion {
  const bump: StableVersion["bump"] = (by) => {
    switch (by) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
      default:
        return validateGreaterVersion(version, by);
    }
  };

  const compare: StableVersion["compare"] = (other) => {
    if (isUnstable(other)) return 1;
    if (isPrerelease(other)) return major >= other.major ? 1 : -1;
    if (!isStable(other)) throw Error("Unknown version type: " + other.type);

    if (major > other.major) return 1;
    if (major < other.major) return -1;
    if (minor > other.minor) return 1;
    if (minor < other.minor) return -1;
    if (patch > other.patch) return 1;
    if (patch < other.patch) return -1;
    return 0;
  };

  const version: StableVersion = {
    type: STABLE_TYPE,
    version: `${major}.${minor}.${patch}`,
    major,
    minor,
    patch,
    bump,
    compare,
  };

  return version;
}

export function isStable(semver: Semver): semver is StableVersion {
  return semver.type === STABLE_TYPE;
}

const UNSTABLE_TYPE = Symbol("unstable");

export interface UnstableVersion extends Semver {
  type: typeof UNSTABLE_TYPE;
  major: 0;
  minor: number;
  patch: number;
}

function createUnstableVersion(minor: number, patch: number): UnstableVersion {
  const bump: UnstableVersion["bump"] = (by) => {
    switch (by) {
      case "major":
        return `0.${minor + 1}.0`;
      case "minor":
      case "patch":
        return `0.${minor}.${patch + 1}`;
      default:
        return validateGreaterVersion(version, by);
    }
  };

  const compare: StableVersion["compare"] = (other) => {
    if (isStable(other)) return -1;
    if (isPrerelease(other)) return -1;
    if (!isUnstable(other)) throw Error("Unknown version type: " + other.type);

    if (minor > other.minor) return 1;
    if (minor < other.minor) return -1;
    if (patch > other.patch) return 1;
    if (patch < other.patch) return -1;
    return 0;
  };

  const version: UnstableVersion = {
    type: UNSTABLE_TYPE,
    version: `0.${minor}.${patch}`,
    major: 0,
    minor,
    patch,
    bump,
    compare,
  };

  return version;
}

export function isUnstable(semver: Semver): semver is UnstableVersion {
  return semver.type === UNSTABLE_TYPE;
}

const PRERELEASE_TYPE = Symbol("prerelease");

export interface PrereleaseVersion extends Semver {
  type: typeof PRERELEASE_TYPE;
  major: number;
  prerelease: number;
  prereleaseType: PrereleaseType;
}

export type PrereleaseType = "alpha" | "beta" | "rc";

const PRERELEASE_TYPE_ORDER: Record<PrereleaseType, number> = {
  alpha: 0,
  beta: 1,
  rc: 2,
};

function createPrereleaseVersion(
  major: number,
  prereleaseType: PrereleaseType,
  prerelease: number,
): PrereleaseVersion {
  const bump: PrereleaseVersion["bump"] = (by) => {
    switch (by) {
      case "major":
      case "minor":
      case "patch":
        return `${major}.0.0-${prereleaseType}.${prerelease + 1}`;
      default:
        return validateGreaterVersion(version, by);
    }
  };

  const compare: StableVersion["compare"] = (other) => {
    if (isUnstable(other)) return 1;
    if (isStable(other)) return other.major >= major ? -1 : 1;
    if (!isPrerelease(other)) throw Error("Unknown version type: " + other.type);

    if (major > other.major) return 1;
    if (major < other.major) return -1;

    const prereleaseTypeOrder = PRERELEASE_TYPE_ORDER[prereleaseType];
    const otherPrereleaseTypeOrder = PRERELEASE_TYPE_ORDER[other.prereleaseType];
    if (prereleaseTypeOrder > otherPrereleaseTypeOrder) return 1;
    if (prereleaseTypeOrder < otherPrereleaseTypeOrder) return -1;

    if (prerelease > other.prerelease) return 1;
    if (prerelease < other.prerelease) return -1;
    return 0;
  };

  const version: PrereleaseVersion = {
    type: PRERELEASE_TYPE,
    version: `${major}.0.0-${prereleaseType}.${prerelease}`,
    major,
    prereleaseType,
    prerelease,
    bump,
    compare,
  };

  return version;
}

export function isPrerelease(semver: Semver): semver is PrereleaseVersion {
  return semver.type === PRERELEASE_TYPE;
}

function parseIntOrThrow(value: any): number {
  const i = parseInt(value);
  if (isNaN(i)) throw Error(`Cannot convert to number: ${value}`);
  return i;
}

function parsePrereleaseTypeOrThrow(value: any): PrereleaseType {
  if (value !== "alpha" && value !== "beta" && value !== "rc") {
    throw Error(`Invalid prerelease type: ${value}`);
  }
  return value as PrereleaseType;
}

function validateGreaterVersion(currentSemver: Semver, nextVersion: string): string {
  const nextSemver = parseSemver(nextVersion);
  if (nextSemver.compare(currentSemver) <= 0) {
    throw Error("New version must be greater than the current version");
  }

  return nextSemver.version;
}
