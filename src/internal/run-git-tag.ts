import { run } from "./run";

export async function runGitTag(prefix: string, cwd: string = process.cwd()): Promise<string> {
  return run({
    cmd: `git --no-pager tag -l "${prefix}*" --merged=HEAD --sort=-version:refname`,
    cwd,
  });
}
