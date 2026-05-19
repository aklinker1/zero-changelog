import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { styleText } from "node:util";

import { getVersionRegexFor } from "./internal/version-regex";
import { logger } from "./logger";

export async function getCurrentVersion(path: string, versionFiles: string[]): Promise<string> {
  logger?.info("Getting current version...");

  for (const versionFile of versionFiles) {
    try {
      const file = join(path, versionFile);
      const text = await readFile(file, "utf8");
      const regex = getVersionRegexFor(file);
      const version = text.match(regex)?.groups?.version;

      if (version) {
        logger?.info(
          `Found current version (${version}) in ${styleText("cyan", relative(process.cwd(), file))}`,
        );
        return version;
      }

      logger?.detail(`Not found in ${styleText("cyan", relative(process.cwd(), file))}`);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }
  }

  throw Error("Version not found");
}
