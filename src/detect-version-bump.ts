import type { ConventionalCommit } from "./conventional-commit";

export function detectVersionBump(
  _conventionalCommits: ConventionalCommit[],
): "major" | "minor" | "patch" {
  console.log("Detecting version bump based on changes...");
  throw Error("TODO");
}
