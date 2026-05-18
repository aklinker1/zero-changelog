import { spawn } from "node:child_process";

import { waitForChildProcess } from "./wait-for-child-process";

export async function runGitTag(prefix: string, cwd: string = process.cwd()): Promise<string> {
  const child = spawn(
    "git",
    ["--no-pager", "tag", "-l", `${prefix}*`, "--merged=HEAD", "--sort=-version:refname"],
    {
      cwd,
    },
  );
  const { stdout } = await waitForChildProcess(child);
  return stdout;
}
