import type { ConventionalCommit } from "./conventional-commit";
import type { GitCommit } from "./git-commit";
import { parseCommit } from "./parse-commit";

/** Convert commits to an array of {@link Change}, ignoring commits with an unknown format. */
export function parseCommits(commits: GitCommit[]): ConventionalCommit[] {
  return commits.map(parseCommit).filter((change) => change != null);
}
