import { getBooleanInput, getMultilineInput, setFailed, setOutput } from "@actions/core";

import type { NullablyRequired } from "../internal/utils";
import { release, type ReleaseOptions } from "../release";
import { getFilesInput } from "./internal/get-files-input";
import { getStringInput } from "./internal/get-string-input";

try {
  const options: NullablyRequired<ReleaseOptions> = {
    additionalDirs: await getFilesInput("additionalDirs"),
    bump: getStringInput("bump"),
    commitTemplate: getStringInput("commitTemplate"),
    dryRun: getBooleanInput("dryRun"),
    since: getStringInput("since"),
    dryRunPublishCommands: getMultilineInput("dryRunPublishCommands"),
    path: getStringInput("path"),
    publishCommands: getMultilineInput("publishCommands"),
    releaseArtifacts: await getFilesInput("releaseArtifacts"),
    releaseNameTemplate: getStringInput("releaseNameTemplate"),
    latestRelease: getBooleanInput("latestRelease"),
    tagPrefix: getStringInput("tagPrefix"),
    versionFiles: await getFilesInput("versionFiles"),
    throwOnNoChanges: getBooleanInput("throwOnNoChanges"),
    githubRepo: getStringInput("githubRepo") as `${string}/${string}` | undefined,
    githubToken: getStringInput("githubToken", { required: true }),
  };
  console.log("Options from GitHub:", options);

  const res = await release(options);

  setOutput("version", res.version);
  setOutput("tag", res.tag);
  setOutput("releaseNotes", res.releaseNotes);
} catch (err) {
  setFailed(err instanceof Error ? err.message : String(err));
}
