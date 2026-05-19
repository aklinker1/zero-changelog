import { runGitTag } from "./internal/run-git-tag";
import { logger } from "./logger";

/**
 * Finds the previous tag that starts with a prefix. If there are no previous tags starting with the
 * prefix, this returns `undefined`.
 *
 * @param tagPrefix The prefix to look for.
 */
export async function findPreviousTag(tagPrefix: string): Promise<string | undefined> {
  logger?.info(`Finding previous tag matching: "${tagPrefix}*"`);
  const log = await runGitTag(tagPrefix);
  return log.trim().split("\n")[0] || undefined;
}
