import { getBooleanInput, getInput, getMultilineInput, setOutput } from "@actions/core";

import type { NullablyRequired } from "../internal/utils";
import { release, type ReleaseOptions } from "../release";
import { getFilesInput } from "./internal/get-files-input";

export async function run(): Promise<void> {
  const options: NullablyRequired<ReleaseOptions> = {
    additionalDirs: await getFilesInput("additionalDirs"),
    bump: getInput("bump"),
    commitTemplate: getInput("commitTemplate"),
    dryRun: getBooleanInput("dryRun"),
    since: getInput("since"),
    dryRunPublishCommands: getMultilineInput("dryRunPublishCommands"),
    path: getInput("path"),
    publishCommands: getMultilineInput("publishCommands"),
    releaseArtifacts: await getFilesInput("releaseArtifacts"),
    releaseNameTemplate: getInput("releaseNameTemplate"),
    latestRelease: getBooleanInput("latestRelease"),
    tagPrefix: getInput("tagPrefix"),
    versionFiles: await getFilesInput("versionFiles"),
    throwOnNoChanges: getBooleanInput("throwOnNoChanges"),
    githubRepo: getInput("githubRepo") as `${string}/${string}` | undefined,
    githubToken: getInput("githubToken", { required: true }),
  };

  const res = await release(options);

  setOutput("version", res.version);
  setOutput("tag", res.tag);
  setOutput("releaseNotes", res.releaseNotes);
}
