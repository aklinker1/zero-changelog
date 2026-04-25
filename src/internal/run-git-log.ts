import { spawn } from "node:child_process";

import { waitForChildProcess } from "./wait-for-child-process";

export async function runGitLog(
  paths: string[],
  fromRef: string | undefined,
  toRef: string = "HEAD",
  cwd: string = process.cwd(),
): Promise<string> {
  const args = [
    "--no-pager",
    "log",
    ...(fromRef ? [`${fromRef}..${toRef}`] : []),
    "--date=iso-strict",
    "--no-color",
    "--no-decorate",
    "--no-merges",
    `--format=%H%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%b%x1e`,
    "--",
    ...paths,
  ];
  console.log(args);
  const child = spawn("git", args, { cwd });

  const { stdout } = await waitForChildProcess(child);
  return stdout;
}
