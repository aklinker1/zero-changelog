import { getInput, setFailed, setOutput } from "@actions/core";

import type { NullablyRequired } from "../internal/utils";
import {
  summarizeUnreleasedCommits,
  type PathSummary,
  type SummarizeUnreleasedCommitsOptions,
} from "../summarize-unreleased-commits";
import { getFilesInput } from "./internal/get-files-input";
import { getStringInput } from "./internal/get-string-input";

try {
  const options: NullablyRequired<SummarizeUnreleasedCommitsOptions> = {
    paths: await getFilesInput("paths"),
    tagPrefixTemplate: getStringInput("tagPrefixTemplate"),
  };

  const summaries = await summarizeUnreleasedCommits(options);

  setOutput("json", summaries);
  setOutput("text", renderSummariesText(summaries));
} catch (err) {
  setFailed(err instanceof Error ? err.message : String(err));
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
