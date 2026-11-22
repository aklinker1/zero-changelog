import { readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

import { logger, styleText, CYAN } from "./internal/logger";
import { replaceRegexGroup } from "./internal/utils";
import { getVersionRegexFor } from "./internal/version-regex";

export async function updateVersionFiles(
  path: string,
  versionFiles: string[],
  newVersion: string,
): Promise<string[]> {
  logger?.info("Updating version...");
  const updated: string[] = [];
  for (const versionFile of versionFiles) {
    const file = await updateVersionFile(path, versionFile, newVersion);
    if (file) updated.push(file);
  }
  return updated;
}

async function updateVersionFile(
  path: string,
  versionFile: string,
  newVersion: string,
): Promise<string | undefined> {
  const file = resolve(path, versionFile);
  const relativePath = relative(process.cwd(), file);

  try {
    const text = await readFile(file, "utf8");

    const regex = getVersionRegexFor(file);
    const newText = replaceRegexGroup(text, regex, "version", newVersion);

    await writeFile(file, newText, "utf8");

    logger?.detail(`${styleText(CYAN, relativePath)} updated`);
    return file;
  } catch (err: any) {
    // Ignore missing files
    if (err.code === "ENOENT") {
      logger?.detail(`${styleText(CYAN, relativePath)} does not exist, skipping`);
      return;
    }

    throw err;
  }
}
