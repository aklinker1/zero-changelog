import type { ChildProcess } from "node:child_process";
import { relative, resolve } from "node:path";
import { styleText } from "node:util";

import { version } from "../../package.json" with { type: "json" };

export interface Logger {
  title(text: string): void;
  section(text: string): void;
  info(message: string, ...args: any[]): void;
  detail(message: string, ...args: any[]): void;
  command(command: string, wd: string, child?: ChildProcess): () => void;
  dryRunPrefix: string;
}

export function initLogger(dryRun?: boolean): void {
  const cwd = process.cwd();

  const dryRunPrefix = dryRun ? styleText("yellow", "[dry-run] ") : "";

  const title: Logger["title"] = (text) => {
    console.log(`${dryRunPrefix}${styleText("bold", text)}`);
    console.log(`${dryRunPrefix}${styleText("dim", "zero-changelog v" + version)}`);
  };

  const section: Logger["section"] = (text) => {
    console.log(`${dryRunPrefix}\n${dryRunPrefix}${styleText("cyan", text)}`);
  };

  const info: Logger["info"] = (message, ...args) => {
    console.log(`${dryRunPrefix}${message}`, ...args);
  };

  const detail: Logger["detail"] = (message, ...args) => {
    console.log(dryRunPrefix + styleText("dim", `  → ${message}`), ...args);
  };

  const command: Logger["command"] = (command, wd, child) => {
    const start = performance.now();
    const absWd = resolve(wd);
    console.log(
      `${dryRunPrefix}╭─ ${cwd === absWd ? "" : relative(cwd, absWd) + " "}$ ${styleText("cyan", command)}`,
    );
    if (child) {
      child.stdout?.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          process.stdout.write(`${dryRunPrefix}│ ${styleText("dim", line)}`);
        }
      });
      child.stderr?.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          process.stderr.write(`${dryRunPrefix}│ ${styleText("dim", line)}`);
        }
      });
    }
    return () => {
      const end = performance.now();
      console.log(`${dryRunPrefix}╰─ Done in ${end - start}ms`);
    };
  };

  logger = {
    title,
    section,
    info,
    detail,
    command,
    dryRunPrefix,
  };
}

export let logger: Logger | undefined;
