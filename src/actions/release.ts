import { getBooleanInput, getInput, getMultilineInput, setOutput } from "@actions/core";

import type { NullablyRequired } from "../internal/utils";
import { release, type ReleaseOptions } from "../release";

export async function run(): Promise<void> {
  const options: NullablyRequired<ReleaseOptions> = {
    additionalDirs: getMultilineInput("additionalDirs"),
    bump: getInput("bump"),
    commitTemplate: getInput("commitTemplate"),
    dryRun: getBooleanInput("dryRun"),
    since: getInput("since"),
    dryRunPublishCommands: getMultilineInput("dryRunPublishCommands"),
    path: getInput("path"),
    publishCommands: getMultilineInput("publishCommands"),
    releaseArtifacts: getMultilineInput("releaseArtifacts"),
    releaseTitleTemplate: getInput("releaseTitleTemplate"),
    tagPrefix: getInput("tagPrefix"),
    versionFiles: getMultilineInput("versionFiles"),
  };

  const res = await release(options);

  setOutput("version", res.version);
  setOutput("tag", res.tag);
  setOutput("releaseNotes", res.releaseNotes);
}
