import { spawn } from "node:child_process";

import { waitForChildProcess } from "./internal/wait-for-child-process";

const REMOTE_REGEX = [
  /^git@github\.com:(?<owner>\S+)\/(?<repo>\S+)\.git$/,
  /^https:\/\/github\.com\/(?<owner>\S+)\/(?<repo>\S+)\.git$/,
];

export async function getGithubRepo(): Promise<`${string}/${string}`> {
  console.log("Getting current github repo...");
  const child = spawn("git", ["config", "--get", "remote.origin.url"]);
  const { stdout } = await waitForChildProcess(child);
  const url = stdout.trim();

  for (const regex of REMOTE_REGEX) {
    const groups = url.match(regex)?.groups;
    if (groups) {
      return `${groups.owner}/${groups.repo}`;
    }
  }

  throw Error(`Could not find github repo from the origin remote's URL: ${url}`);
}
