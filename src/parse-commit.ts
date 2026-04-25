import type { Change } from "./change";
import type { GitCommit } from "./git-commit";

/** Convert a commit to a change, returning `undefined` for unknown formats */
export function parseCommit(_commit: GitCommit): Change | undefined {
  throw Error("TODO");
}
