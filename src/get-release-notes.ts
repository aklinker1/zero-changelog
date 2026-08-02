import type { ConventionalCommit } from "./conventional-commit";
import { getGithubContributors } from "./get-github-contributors";
import { sentenceCase } from "./internal/utils";
import DEFAULT_TYPES from "./semver-types/aklinker1";

const PR_SUFFIX_REGEX = / \(#([0-9]+)\)$/;

export async function getReleaseNotes(options: {
  conventionalCommits: ConventionalCommit[];
  since: string | undefined;
  tag: string;
  repo: string;
  /**
   * GitHub personal access token used to resolve contributor email addresses to GitHub usernames.
   * When provided, contributors are rendered as `@handle` profile links instead of `Name <email>`.
   */
  githubToken?: string;
}): Promise<string> {
  const commitsByType = options.conventionalCommits.reduce<Record<string, ConventionalCommit[]>>(
    (acc, commit) => {
      acc[commit.type] ??= [];
      acc[commit.type]!.push(commit);
      return acc;
    },
    {},
  );

  const lines: string[] = [];
  const breakingChanges: string[] = [];

  if (options.since) {
    lines.push(
      `[compare changes](https://github.com/${options.repo}/compare/${options.since}...${options.tag})`,
      "",
    );
  }

  for (const [type, details] of Object.entries(DEFAULT_TYPES)) {
    const commits = commitsByType[type];
    if (!commits?.length) continue;

    lines.push(`### ${details.title}`, "");
    for (const commit of commits) {
      const scope = commit.scope ? `**${commit.scope}**: ` : "";
      const { description, link } = parseDescription(options.repo, commit);
      const text = `${scope}${sentenceCase(description)}`;
      lines.push(`- ${text} (${link})`);

      if (commit.isBreaking) {
        const footer = commit.footers.find((footer) => footer.key === "breaking change");
        breakingChanges.push(footer ? `- ${link}: ${footer.value}` : `- ${text}`);
      }
    }
    lines.push("");
  }

  if (breakingChanges.length > 0) {
    lines.push("### ⚠️ Breaking Changes", "");
    lines.push(...breakingChanges);
    lines.push("");
  }

  const authors = options.conventionalCommits.flatMap((commit) => commit.authors);

  if (authors.length) {
    const emailNameMap = authors.reduce<Record<string, string>>((acc, author) => {
      acc[author.email] ??= author.name;
      return acc;
    }, {});

    const emails = new Set(authors.map((author) => author.email));
    const sortedEmails = Array.from(emails).toSorted((a, b) => b.localeCompare(a));

    const githubHandles = await getGithubContributors(sortedEmails, options?.githubToken);

    lines.push("### ❤️ Contributors", "");
    for (const email of sortedEmails) {
      const handle = githubHandles.get(email);
      if (handle) {
        lines.push(`- [@${handle}](https://github.com/${handle})`);
      } else {
        lines.push(`- ${emailNameMap[email]!} <${email}>`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

function parseDescription(
  repo: string,
  commit: ConventionalCommit,
): { description: string; link: string } {
  const pr = commit.description.match(PR_SUFFIX_REGEX)?.[1];

  if (pr) {
    const link = `[#${pr}](https://github.com/${repo}/pull/${pr})`;
    const description = commit.description.replace(PR_SUFFIX_REGEX, "");
    return { description, link };
  } else {
    const link = `[\`${commit.hash.slice(0, 7)}\`](https://github.com/${repo}/commit/${commit.hash})`;
    const description = commit.description;
    return { description, link };
  }
}
