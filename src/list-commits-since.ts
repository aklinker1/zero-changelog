import type { GitCommit } from "./git-commit";
import { runGitLog } from "./internal/run-git-log";
import { logger } from "./logger";

/** List the commits since a ref in specific dirs. */
export async function listCommitsSince(options: {
  dirs: string[];
  since: string | undefined;
}): Promise<GitCommit[]> {
  logger?.info(
    `Listing commits ${options.since ? "since " + options.since : "for all time"} in:`,
    options.dirs,
  );

  const log = await runGitLog(options.dirs, options.since);
  return parseGitLog(log);
}

export function parseGitLog(log: string): GitCommit[] {
  const records = log
    .split("\x1e")
    .map((r) => r.trim())
    .filter(Boolean);

  return records.map<GitCommit>((record) => {
    const [hash, authorName, authorEmail, date, subject, body] = record.split("\x1f");

    return {
      hash: hash!,
      author: { name: authorName!, email: authorEmail! },
      date: new Date(date!),
      subject: subject!,
      body: body?.trim() || undefined,
    };
  });
}
