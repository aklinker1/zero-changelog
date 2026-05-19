import { spawn } from "node:child_process";

import { waitForChildProcess } from "./internal/wait-for-child-process";
import { logger } from "./logger";

const REMOTE_REGEX = [
  /^git@github\.com:(?<owner>\S+)\/(?<repo>\S+)\.git$/,
  /^https:\/\/github\.com\/(?<owner>\S+)\/(?<repo>\S+)\.git$/,
  /^https:\/\/github\.com\/(?<owner>\S+)\/(?<repo>\S+)$/,
];

export async function getGithubRepo(): Promise<`${string}/${string}` | undefined> {
  logger?.info("Detecting github repo based on git origin URL...");
  const child = spawn("git", ["config", "--get", "remote.origin.url"]);
  const { stdout } = await waitForChildProcess(child);
  const url = stdout.trim();

  for (const regex of REMOTE_REGEX) {
    const groups = url.match(regex)?.groups;
    if (groups) {
      return `${groups.owner}/${groups.repo}`;
    }
  }

  logger?.detail("Failed to parse github repo from:", { url });
}
