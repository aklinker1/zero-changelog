import type { ConventionalCommit } from "./conventional-commit";
import DEFAULT_TYPES from "./semver-types/aklinker1";

export function getReleaseNotes(
  conventionalCommits: ConventionalCommit[],
  since: string,
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

  const lines = [`[compare changes](https://github.com/${repo}/compare/${since}...${tag})`, ""];

  for (const [type, details] of Object.entries(DEFAULT_TYPES)) {
    const commits = commitsByType[type];
    if (!commits?.length) continue;

    lines.push(`### ${details.title}`, "");
    for (const commit of commits) {
      const scope = commit.scope ? `**${commit.scope}**: ` : "";
      const breaking = commit.isBreaking ? "⚠️ " : "";
      lines.push(`- ${breaking}${scope}${commit.description}`);
    }
    lines.push("");
  }

  const authors = new Set(conventionalCommits.flatMap((commit) => commit.authors));
  if (authors.size) {
    const sorted = Array.from(authors).toSorted((a, b) => b.name.localeCompare(a.name));
    lines.push("### ❤️ Contributors", "");
    for (const author of sorted) {
      // TODO: Fetch github profiles.
      lines.push(`- ${author.name} <${author.email}>`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
