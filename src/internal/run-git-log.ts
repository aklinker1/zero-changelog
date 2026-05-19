import { run } from "./run";

export function runGitLog(
  paths: string[],
  fromRef: string | undefined,
  toRef: string = "HEAD",
  cwd: string = process.cwd(),
): Promise<string> {
  return run({
    cmd: `git --no-pager log ${fromRef ? `${fromRef}..${toRef}` : ""} --date=iso-strict --no-color --no-decorate --no-merges --format=%H%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%b%x1e -- ${paths.join(" ")}`,
    cwd,
  });
}
