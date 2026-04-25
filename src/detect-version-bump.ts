import type { Change } from "./change";

export function detectVersionBump(_changes: Change[]): "major" | "minor" | "patch" {
  console.log("Detecting version bump based on changes...");
  throw Error("TODO");
}
