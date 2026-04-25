import { join, relative } from "node:path";

import { runGitTag } from "../../../internal/run-git-tag";

const [repoName, rootDir, prefix] = process.argv.slice(2);

if (!repoName) throw Error("Repo name not passed");
if (!rootDir) throw Error("Root dir not passed");
if (!prefix) throw Error("Prefix not passed");

const outputPath = join(import.meta.dir, `${repoName}-${prefix}.log`);

const log = await runGitTag(prefix, rootDir);

await Bun.write(outputPath, log);

console.log("Wrote log to: " + relative(process.cwd(), outputPath));
