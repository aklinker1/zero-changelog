import { createReadStream, ReadStream } from "node:fs";

type CreateGithubReleaseOptions = {
  repo: `${string}/${string}`;
  token: string;
  dryRun: boolean;
  tag: string;
  name: string;
  body: string;
  artifacts?: string[];
  latest: boolean;
  prerelease: boolean;
};

export async function createGithubRelease(options: CreateGithubReleaseOptions): Promise<void> {
  console.log("Creating GitHub release...");
  const artifactStreams = await getArtifactStreams(options.artifacts ?? []);

  if (options.dryRun) {
    console.log("  -> Skipping, dry run");
  } else {
    await createRelease(options);
    if (artifactStreams) await uploadArtifacts(options, artifactStreams);
  }
}

async function getArtifactStreams(artifacts: string[]): Promise<ReadStream[]> {
  return Promise.all(artifacts.map((artifact) => createReadStream(artifact)));
}

async function createRelease(options: CreateGithubReleaseOptions): Promise<void> {
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
  if (res.ok) return;

  console.log("Response status: " + res.status);
  console.log("Response body: " + (await res.text()));
  throw Error(`Failed to create GitHub release`);
}

async function uploadArtifacts(
  options: CreateGithubReleaseOptions,
  artifactStreams: ReadStream[],
): Promise<void> {
  for (const [i, stream] of artifactStreams.entries()) {
    const artifact = options.artifacts![i];
    console.log("  -> Uploading ", artifact);
    const res = await fetch(
      `https://uploads.github.com/repos/${options.repo}/releases/tags/${options.tag}/assets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          Authorization: `Bearer ${options.token}`,
          "Content-Disposition": `attachment; filename="${artifact}"`,
        },
        body: stream,
      },
    );
    if (!res.ok) {
      console.error(`Failed to upload`, artifact, res);
      console.log(await res.text());
    }
  }
}
