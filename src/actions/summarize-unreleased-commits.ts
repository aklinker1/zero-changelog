import { getInput, setOutput } from "@actions/core";

import type { NullablyRequired } from "../internal/utils";
import {
  summarizeUnreleasedCommits,
  type PathSummary,
  type SummarizeUnreleasedCommitsOptions,
} from "../summarize-unreleased-commits";
import { getFilesInput } from "./internal/get-files-input";

export async function run() {
  const options: NullablyRequired<SummarizeUnreleasedCommitsOptions> = {
    paths: await getFilesInput("paths"),
    tagPrefixTemplate: getInput("tagPrefixTemplate"),
  };

  const summaries = await summarizeUnreleasedCommits(options);

  setOutput("json", summaries);
  setOutput("text", renderSummariesText(summaries));
}

function renderSummariesText(summaries: PathSummary[]): string {
  return summaries.map((summary) => renderSummaryText(summary)).join("\n\n");
}

function renderSummaryText(summary: PathSummary): string {
  return [
    summary.path,
    "-".repeat(10),
    `Commits (${summary.commits.length} total, ${summary.conventionalCommits.length} conventional)`,
    ...summary.commits.map((commit) => `- ${commit.subject}`),
  ].join("\n");
}
