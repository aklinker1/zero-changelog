import { exec } from "node:child_process";

import { ITALIC, styleText } from "./logger";
import { logger } from "./logger";

/** Run a command, inheriting stdio. Also returns `stdout` */
export async function run(options: {
  skipped?: boolean;
  cwd: string;
  cmd: string;
}): Promise<string> {
  if (options.skipped) {
    const done = logger?.command(options.cmd, options.cwd);
    logger?.info(`${logger?.dryRunPrefix}│ ${styleText(ITALIC, "Skipped")}`);
    done?.();
  }

  return new Promise((resolve, reject) => {
    const child = exec(options.cmd, { cwd: options.cwd }, (error) => {
      done?.();
      if (error) reject(error);
      else resolve(stdout.toString());
    });
    const stdout: string[] = [];
    child.stdout?.on("data", (data) => {
      stdout.push(data.toString());
    });

    const done = logger?.command(options.cmd, options.cwd, child);
  });
}
