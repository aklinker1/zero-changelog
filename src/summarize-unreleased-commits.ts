import { basename, relative, resolve } from "node:path";

import type { ConventionalCommit } from "./conventional-commit";
import { findPreviousTag } from "./find-previous-tag";
import type { GitCommit } from "./git-commit";
import { template } from "./internal/utils";
import { listCommitsSince } from "./list-commits-since";
import { parseCommits } from "./parse-commits";

export type SummarizeUnreleasedCommitsOptions = {
  /**
   * List of paths to summarize commits for.
   *
   * > **IMPORTANT**: You may use glob patterns for ONLY the github action. They are not automatically
   * > expanded when using the JS API. If you use the JS API and want to use glob patterns, [install a
   * > glob pattern library](https://www.npmjs.com/search?q=glob) and call it yourself.
   *
   * JS Usage:
   *
   * ```ts
   * const summary = await summarizeUnreleasedCommits({
   *   paths: ["packages/a", "packages/b", "packages/c"],
   * });
   * ```
   *
   * GitHub Action:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/summarize-unreleased-commits
   *   with:
   *     paths: |-
   *       packages/*
   * ```
   *
   * @default [process.cwd()]
   */
  paths?: string[];

  /**
   * Template for the tag prefix. Available variables:
   *
   * - `{{dirname}}`: The directory name of the path.
   * - `{{path}}`: The path relative to the CWD.
   *
   * @default "v"
   */
  tagPrefixTemplate?: string;
};

export type PathSummary = {
  path: string;
  commits: GitCommit[];
  conventionalCommits: ConventionalCommit[];
};

export async function summarizeUnreleasedCommits(
  options?: SummarizeUnreleasedCommitsOptions,
): Promise<PathSummary[]> {
  const { tagPrefixTemplate = "v{{dirname}}" } = options ?? {};
  const paths = options?.paths?.length ? options.paths : [process.cwd()];
  const absolutePaths = paths.map((path) => resolve(path));

  const summaries: PathSummary[] = [];

  for (const path of absolutePaths) {
    const tagPrefix = template(tagPrefixTemplate, {
      dirname: basename(path),
      path: relative(process.cwd(), path),
    });
    const since = await findPreviousTag(tagPrefix);
    const commits = await listCommitsSince({ dirs: [path], since });
    const conventionalCommits = parseCommits(commits);

    summaries.push({ commits, path, conventionalCommits });
  }

  return summaries;
}
