import { exec, execFile } from "node:child_process";

import { ITALIC, styleText } from "./logger";
import { logger } from "./logger";

/**
 * Run a command, inheriting stdio. Also returns `stdout`
 *
 * When `args` is passed, `cmd` is the executable and it is run directly, without a shell. Use this
 * for any argument that may contain user-controlled text. Otherwise `cmd` is run via the shell.
 */
export async function run(options: {
  skipped?: boolean;
  cwd: string;
  cmd: string;
  args?: string[];
}): Promise<string> {
  const display = options.args
    ? [options.cmd, ...options.args.map(quoteForDisplay)].join(" ")
    : options.cmd;

  if (options.skipped) {
    const done = logger?.command(display, options.cwd);
    logger?.info(`│ ${styleText(ITALIC, "Skipped")}`);
    done?.();
    return "";
  }

  return new Promise((resolve, reject) => {
    const callback = (error: Error | null) => {
      done?.();
      if (error) reject(error);
      else resolve(stdout.join(""));
    };
    const child = options.args
      ? execFile(options.cmd, options.args, { cwd: options.cwd }, callback)
      : exec(options.cmd, { cwd: options.cwd }, callback);
    const stdout: string[] = [];
    child.stdout?.on("data", (data) => {
      stdout.push(data.toString());
    });

    const done = logger?.command(display, options.cwd, child);
  });
}

function quoteForDisplay(arg: string): string {
  return /^[\w@%+=:,./-]+$/.test(arg) ? arg : JSON.stringify(arg);
}
