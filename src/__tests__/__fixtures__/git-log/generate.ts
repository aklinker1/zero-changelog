import { join, relative } from "node:path";

import { runGitLog } from "../../../internal/run-git-log";

const [repoName, rootDir, fromRef, toRef, ...inputPaths] = process.argv.slice(2);

if (!repoName) throw Error("Repo name not passed");
if (!rootDir) throw Error("Root dir not passed");
if (!fromRef) throw Error("From ref not passed");
if (!toRef) throw Error("To ref not passed");

const outputPath = join(import.meta.dir, `${repoName}-${fromRef}..${toRef}.log`);

const paths = inputPaths.length === 0 ? ["."] : inputPaths;

const log = await runGitLog(paths, fromRef, toRef, rootDir);

await Bun.write(outputPath, log);

console.log("Wrote log to: " + relative(process.cwd(), outputPath));
