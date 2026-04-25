import { runGitTag } from "./internal/run-git-tag";

/**
 * Finds the previous tag that starts with a prefix. If there are no previous tags starting with the
 * prefix, this returns `undefined`.
 *
 * @param tagPrefix The prefix to look for.
 */
export async function findPreviousTag(tagPrefix: string): Promise<string | undefined> {
  console.log(`Finding previous tag matching: "${tagPrefix}*"`);
  const log = await runGitTag(tagPrefix);
  return log.trim().split("\n")[0] || undefined;
}
