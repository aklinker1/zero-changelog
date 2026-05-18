import type { ConventionalCommit } from "./conventional-commit";
import { sentenceCase } from "./internal/utils";
import DEFAULT_TYPES from "./semver-types/aklinker1";

const REF_SUFFIX_REGEX = /\(#[0-9]+\)$/;

export function getReleaseNotes(
  conventionalCommits: ConventionalCommit[],
  since: string | undefined,
  tag: string,
  repo: string,
): string {
  const commitsByType = conventionalCommits.reduce<Record<string, ConventionalCommit[]>>(
    (acc, commit) => {
      acc[commit.type] ??= [];
      acc[commit.type]!.push(commit);
      return acc;
    },
    {},
  );

  const lines: string[] = [];

  if (since) {
    lines.push(`[compare changes](https://github.com/${repo}/compare/${since}...${tag})`, "");
  }

  for (const [type, details] of Object.entries(DEFAULT_TYPES)) {
    const commits = commitsByType[type];
    if (!commits?.length) continue;

    lines.push(`### ${details.title}`, "");
    for (const commit of commits) {
      const scope = commit.scope ? `**${commit.scope}**: ` : "";
      const breaking = commit.isBreaking ? "⚠️ " : "";
      lines.push(
        `- ${breaking}${scope}${sentenceCase(commit.description)}${REF_SUFFIX_REGEX.test(commit.description) ? "" : ` (${commit.hash.slice(0, 7)})`}`,
      );
    }
    lines.push("");
  }

  const authors = conventionalCommits.flatMap((commit) => commit.authors);

  if (authors.length) {
    const emailNameMap = authors.reduce<Record<string, string>>((acc, author) => {
      acc[author.email] ??= author.name;
      return acc;
    }, {});

    const emails = new Set(
      conventionalCommits.flatMap((commit) => commit.authors).map((author) => author.email),
    );
    const sortedEmails = Array.from(emails).toSorted((a, b) => b.localeCompare(a));
    lines.push("### ❤️ Contributors", "");
    for (const email of sortedEmails) {
      // TODO: Fetch github profiles.
      lines.push(`- ${emailNameMap[email]!} <${email}>`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
