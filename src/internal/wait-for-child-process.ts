import type { ChildProcessWithoutNullStreams } from "node:child_process";

export function waitForChildProcess(
  child: ChildProcessWithoutNullStreams,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("close", (code: number | null) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Child process exited with code ${code}\n${stderr}`));
      }
    });

    child.on("error", (err: Error) => {
      reject(err);
    });
  });
}
