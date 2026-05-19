import type { ChildProcess } from "node:child_process";
import { relative, resolve } from "node:path";
import { styleText } from "node:util";

import { version } from "../package.json" with { type: "json" };

export interface Logger {
  title(text: string): void;
  section(text: string): void;
  info(message: string, ...args: any[]): void;
  detail(message: string, ...args: any[]): void;
  command(command: string, wd: string, child?: ChildProcess): () => void;
}

export function initLogger(dryRun?: boolean): void {
  const cwd = process.cwd();

  const dryRunPrefix = dryRun ? styleText("yellow", "[dry-run] ") : "";

  const title: Logger["title"] = (text) => {
    console.log(`${dryRunPrefix}${styleText("bold", text)}`);
    console.log(`${dryRunPrefix}${styleText("dim", "zero-changelog v" + version)}`);
  };

  const section: Logger["section"] = (text) => {
    console.log(`\n${styleText("cyan", text)}`);
  };

  const info: Logger["info"] = console.log;

  const detail: Logger["detail"] = (message, ...args) => {
    console.log(styleText("dim", `  → ${message}`), ...args);
  };

  const command: Logger["command"] = (command, wd, child) => {
    const start = performance.now();
    const absWd = resolve(wd);
    console.log(`╭─ ${cwd === absWd ? "." : "./" + relative(cwd, absWd)} $ ${command}`);
    if (child) {
      child.stdout?.on("data", (data) => {
        process.stdout.write(data);
      });
      child.stderr?.on("data", (data) => {
        process.stderr.write(data);
      });
    }
    return () => {
      const end = performance.now();
      console.log(`╰─ Done in ${end - start}ms`);
    };
  };

  logger = {
    title,
    section,
    info,
    detail,
    command,
  };
}

export let logger: Logger | undefined;
