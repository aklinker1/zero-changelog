import type { ConventionalCommit } from "./conventional-commit";
import type { RelativeBump } from "./semver";
import DEFAULT_TYPES from "./semver-types/aklinker1";

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
 * Given the current version and a list of commits, detect the type of relative version bump to use.
 *
 * @param currentVersion Used to determine the if prerelease logic should be applied.
 * @param conventionalCommits List of commits to generate the version bump from.
 */
export function detectVersionBump(
  conventionalCommits: ConventionalCommit[],
  throwOnNoChanges: boolean,
): RelativeBump {
  console.log("Detecting version bump based on changes...");

  let priority: Priority = NONE;

  for (const commit of conventionalCommits) {
    if (commit.isBreaking) {
      console.log("  -> major");
      return "major";
    }

    const bumpBy = DEFAULT_TYPES[commit.type]?.bump ?? "none";
    priority = Math.max(priority, PRIORITY_MAP[bumpBy]) as Priority;
  }

  switch (priority) {
    case MINOR:
      console.log("  -> minor");
      return "minor";

    case PATCH:
      console.log("  -> patch");
      return "patch";

    case NONE:
      if (throwOnNoChanges) throw Error("No semver changes detected");

      console.log("  -> patch");
      return "patch";

    default:
      throw Error("Unknown semver bump value: " + priority);
  }
}
