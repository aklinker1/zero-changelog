import { logger } from "./internal/logger";
import { run } from "./internal/run";

const REMOTE_REGEX = [
  /^git@github\.com:(?<owner>\S+)\/(?<repo>\S+)\.git$/,
  /^https:\/\/github\.com\/(?<owner>\S+)\/(?<repo>\S+)\.git$/,
  /^https:\/\/github\.com\/(?<owner>\S+)\/(?<repo>\S+)$/,
];

export async function getGithubRepo(): Promise<`${string}/${string}` | undefined> {
  logger?.info("Detecting github repo based on git origin URL...");
  const stdout = await run({ cwd: process.cwd(), cmd: "git config --get remote.origin.url" });
  const url = stdout.trim();

  for (const regex of REMOTE_REGEX) {
    const groups = url.match(regex)?.groups;
    if (groups) {
      return `${groups.owner}/${groups.repo}`;
    }
  }

  logger?.detail("Failed to parse remote URL");
}
