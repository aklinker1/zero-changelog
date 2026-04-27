import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { styleText } from "node:util";

import { getVersionRegexFor } from "./internal/version-regex";

export async function getCurrentVersion(path: string, versionFiles: string[]): Promise<string> {
  console.log("Getting current version...");

  for (const versionFile of versionFiles) {
    try {
      const file = join(path, versionFile);
      const text = await readFile(file, "utf8");
      const regex = getVersionRegexFor(file);
      const version = text.match(regex)?.groups?.version;
      console.log({ versionFile, regex, version });
      console.log(text);

      if (version) {
        console.log(
          `Found current version (${version})) in ${styleText("cyan", relative(process.cwd(), file))}`,
        );
        return version;
      }

      console.log(`  -> Not found in ${styleText("cyan", relative(process.cwd(), file))}`);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }
  }

  throw Error("Version not found");
}
