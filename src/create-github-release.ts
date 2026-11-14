import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import { logger } from "./internal/logger";

type CreateGithubReleaseOptions = {
  repo: `${string}/${string}`;
  token: string;
  dryRun: boolean;
  tag: string;
  name: string;
  body: string;
  artifacts?: string[] | (() => string[] | Promise<string[]>);
  latest: boolean;
  prerelease: boolean;
};

export async function createGithubRelease(options: CreateGithubReleaseOptions): Promise<void> {
  logger?.info("Creating GitHub release...");

  if (options.dryRun) {
    logger?.detail("Skipping");
    return;
  }

  const releaseId = await createRelease(options);

  // Resolved after the release is created (and publish commands have run) so files built by those
  // commands are found.
  const artifacts =
    typeof options.artifacts === "function" ? await options.artifacts() : (options.artifacts ?? []);
  await uploadArtifacts(options, releaseId, artifacts);
}

async function createRelease(options: CreateGithubReleaseOptions): Promise<number> {
  const res = await fetch(`https://api.github.com/repos/${options.repo}/releases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.token}`,
    },
    body: JSON.stringify({
      tag_name: options.tag,
      name: options.name,
      body: options.body,
      make_latest: String(options.latest),
      prerelease: options.prerelease,
    }),
  });
  if (res.ok) return ((await res.json()) as { id: number }).id;

  console.log("Response status: " + res.status);
  console.log("Response body: " + (await res.text()));
  throw Error(`Failed to create GitHub release`);
}

async function uploadArtifacts(
  options: CreateGithubReleaseOptions,
  releaseId: number,
  artifacts: string[],
): Promise<void> {
  for (const artifact of artifacts) {
    const name = basename(artifact);
    logger?.detail("Uploading " + artifact);
    const res = await fetch(
      `https://uploads.github.com/repos/${options.repo}/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          Authorization: `Bearer ${options.token}`,
        },
        body: await readFile(artifact),
      },
    );
    if (!res.ok) {
      console.log("Response status: " + res.status);
      console.log("Response body: " + (await res.text()));
      throw Error(`Failed to upload release artifact: ${artifact}`);
    }
  }
}
