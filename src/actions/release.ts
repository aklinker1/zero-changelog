import { setFailed, setOutput } from "@actions/core";

import type { NullablyRequired } from "../internal/utils";
import { release, type ReleaseOptions } from "../release";
import { getBoolInput } from "./internal/get-bool-input";
import { getFilesInput } from "./internal/get-files-input";
import { getStringArrayInput } from "./internal/get-string-array-input";
import { getStringInput } from "./internal/get-string-input";

try {
  const options: NullablyRequired<ReleaseOptions> = {
    additionalDirs: await getFilesInput("additionalDirs"),
    bump: getStringInput("bump"),
    commitTemplate: getStringInput("commitTemplate"),
    dryRun: getBoolInput("dryRun"),
    since: getStringInput("since"),
    dryRunPublishCommands: getStringArrayInput("dryRunPublishCommands"),
    path: getStringInput("path"),
    publishCommands: getStringArrayInput("publishCommands"),
    preCommitCommands: getStringArrayInput("preCommitCommands"),
    releaseArtifacts: await getFilesInput("releaseArtifacts"),
    releaseNameTemplate: getStringInput("releaseNameTemplate"),
    latestRelease: getBoolInput("latestRelease"),
    tagPrefix: getStringInput("tagPrefix"),
    versionFiles: await getFilesInput("versionFiles"),
    throwOnNoChanges: getBoolInput("throwOnNoChanges"),
    githubRepo: getStringInput("githubRepo") as `${string}/${string}` | undefined,
    githubToken: getStringInput("githubToken", { required: true }),
  };
  const res = await release(options);

  setOutput("version", res.version);
  setOutput("tag", res.tag);
  setOutput("releaseNotes", res.releaseNotes);
} catch (err) {
  setFailed(err instanceof Error ? err.message : String(err));
}
