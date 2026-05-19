import type { ChildProcess } from "node:child_process";
import { relative, resolve } from "node:path";

import { version } from "../../jsr.json" with { type: "json" };

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

  const dryRunPrefix = dryRun ? styleText(YELLOW, "[dry-run] ") : "";

  const title: Logger["title"] = (text) => {
    console.log(`${dryRunPrefix}${styleText(BOLD, text)}`);
    console.log(`${dryRunPrefix}${styleText(DIM, "zero-changelog v" + version)}`);
  };

  const section: Logger["section"] = (text) => {
    console.log(`${dryRunPrefix}\n${dryRunPrefix}${styleText(CYAN, text)}`);
  };

  const info: Logger["info"] = (message, ...args) => {
    console.log(`${dryRunPrefix}${message}`, ...args);
  };

  const detail: Logger["detail"] = (message, ...args) => {
    console.log(dryRunPrefix + styleText(DIM, `  → ${message}`), ...args);
  };

  const command: Logger["command"] = (command, wd, child) => {
    const start = performance.now();
    const absWd = resolve(wd);
    console.log(
      `${dryRunPrefix}╭─ ${cwd === absWd ? "" : relative(cwd, absWd) + " "}$ ${styleText(CYAN, command)}`,
    );
    if (child) {
      child.stdout?.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          process.stdout.write(`${dryRunPrefix}│ ${styleText(DIM, line)}`);
        }
      });
      child.stderr?.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          process.stderr.write(`${dryRunPrefix}│ ${styleText(DIM, line)}`);
        }
      });
    }
    return () => {
      const end = performance.now();
      console.log(`${dryRunPrefix}╰─ Done in ${((end - start) / 1000).toFixed(3)}s`);
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

export const RESET = "\x1b[0m";
export const BOLD = "\x1b[1m";
export const DIM = "\x1b[2m";
export const ITALIC = "\x1b[3m";
export const GREEN = "\x1b[32m";
export const YELLOW = "\x1b[33m";
export const CYAN = "\x1b[36m";

/** We don't use `node:util` `styleText` because it doesn't provide colors in github CI. */
export function styleText(color: string | string[], text: string): string {
  return `${Array.isArray(color) ? color.join("") : color}${text}${RESET}`;
}
