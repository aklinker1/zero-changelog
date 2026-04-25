import { exec } from "node:child_process";

/** Run a command, inheriting stdio. */
export async function run(options: { dryRun: boolean; cwd: string; cmd: string }): Promise<void> {
  console.log("Running command:", options);
  if (options.dryRun) {
    console.log("  -> Skipping, dry run");
    return;
  }

  return new Promise((resolve, reject) => {
    const child = exec(options.cmd, { cwd: options.cwd }, (error) => {
      if (error) return reject(error);
      else resolve();
    });
    child.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });
    child.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });
  });
}
