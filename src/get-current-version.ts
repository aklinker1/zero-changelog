import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { CYAN, styleText } from "./internal/logger";
import { logger } from "./internal/logger";
import { getVersionRegexFor } from "./internal/version-regex";

export async function getCurrentVersion(path: string, versionFiles: string[]): Promise<string> {
  for (const versionFile of versionFiles) {
    try {
      const file = join(path, versionFile);
      const text = await readFile(file, "utf8");
      const regex = getVersionRegexFor(file);
      const version = text.match(regex)?.groups?.version;

      if (version) {
        logger?.info(
          `Found current version (${version}) in ${styleText(CYAN, relative(process.cwd(), file))}`,
        );
        return version;
      }

      logger?.detail(`Not found in ${styleText(CYAN, relative(process.cwd(), file))}`);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }
  }

  throw Error("Version not found");
}
