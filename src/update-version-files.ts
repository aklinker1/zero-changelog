import { readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

import { logger, styleText, CYAN } from "./internal/logger";
import { replaceRegexGroup } from "./internal/utils";
import { getVersionRegexFor } from "./internal/version-regex";

export async function updateVersionFiles(
  path: string,
  versionFiles: string[],
  newVersion: string,
): Promise<void> {
  logger?.info("Updating version...");
  for (const versionFile of versionFiles) {
    await updateVersionFile(path, versionFile, newVersion);
  }
}

async function updateVersionFile(
  path: string,
  versionFile: string,
  newVersion: string,
): Promise<void> {
  const file = join(path, versionFile);
  const relativePath = relative(process.cwd(), file);

  try {
    const text = await readFile(file, "utf8");

    const regex = getVersionRegexFor(file);
    const newText = replaceRegexGroup(text, regex, "version", newVersion);

    await writeFile(file, newText, "utf8");

    logger?.detail(`${styleText(CYAN, relativePath)} updated`);
  } catch (err: any) {
    // Ignore missing files
    if (err.code === "ENOENT") {
      logger?.detail(`${styleText(CYAN, relativePath)} does not exist, skipping`);
      return;
    }

    throw err;
  }
}
