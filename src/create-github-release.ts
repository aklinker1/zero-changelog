import { styleText } from "node:util";

export async function createGithubRelease(options: {
  dryRun: boolean;
  tag: string;
  title: string;
  body: string;
  artifacts?: string[];
}): Promise<void> {
  console.log("Creating GitHub release...");
  if (options.dryRun) {
    console.log("  -> Skipping, dry run");
  } else {
    throw Error("TODO");
  }

  for (const artifact of options.artifacts ?? []) {
    console.log(`Uploading ${styleText("cyan", artifact)}...`);
    if (options.dryRun) {
      console.log("  -> Skipping, dry run");
    } else {
      throw Error("TODO");
    }
  }
}
