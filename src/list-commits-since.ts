import type { GitCommit } from "./git-commit";

/** List the commits since a ref in specific dirs. */
export function listCommitsSince(options: {
  dirs: string[];
  since: string | undefined;
}): GitCommit[] {
  console.log(`Listing commits ${options.since ? "since " + options.since : "for all time"}`);
  throw Error("TODO");
}
