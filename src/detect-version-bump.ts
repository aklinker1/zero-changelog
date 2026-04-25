import type { ConventionalCommit } from "./conventional-commit";
import DEFAULT_TYPES from "./semver-types/aklinker1";
import type { VersionBump } from "./version-bump";

const NONE = 0;
const PATCH = 1;
const MINOR = 2;

const PRIORITY_MAP = {
  none: NONE,
  patch: PATCH,
  minor: MINOR,
} as const;
type Priority = (typeof PRIORITY_MAP)[keyof typeof PRIORITY_MAP];

/**
 * Given the current version and a list of commits, detect the type of version bump that should be
 * applied.
 *
 * When the current version starts with `"0."`, the version is considered to be a pre-release.
 * Breaking changes (major version bumps) become minor version bumps, and minor versions bumps
 * become patches.
 *
 * @param currentVersion Used to determine the if pre-release logic should be applied.
 * @param conventionalCommits List of commits to generate the version bump from.
 */
export function detectVersionBump(
  currentVersion: string,
  conventionalCommits: ConventionalCommit[],
  throwOnNoChanges: boolean,
): VersionBump {
  console.log("Detecting version bump based on changes...");

  const isPrerelease = currentVersion.startsWith("0.");
  console.log("  -> Is pre-release?", isPrerelease);

  let priority: Priority = NONE;

  for (const commit of conventionalCommits) {
    if (commit.isBreaking) {
      if (isPrerelease) {
        console.log('Breaking change detected, but in pre-release. Bumping as "minor"', commit);
        return "minor";
      }
      console.log('Breaking change detected. Bumping as "minor"', commit);
      return "major";
    }

    const bumpBy = DEFAULT_TYPES[commit.type]?.bump ?? "none";
    priority = Math.max(priority, PRIORITY_MAP[bumpBy]) as Priority;
  }

  switch (priority) {
    case MINOR:
      if (isPrerelease) {
        console.log('"minor" detected, but in pre-release. Bumping as "patch"');
        return "patch";
      }

      console.log('Bumping as "minor"');
      return "minor";

    case PATCH:
      console.log('Bumping as "patch"');
      return "patch";

    case NONE:
      if (throwOnNoChanges) throw Error("No semver changes detected");

      console.log('No changes detected, bumping as "patch"');
      return "patch";

    default:
      throw Error("Unknown semver bump value: " + priority);
  }
}
