import type { ConventionalCommit } from "./conventional-commit";
import type { GitCommit } from "./git-commit";

const SUBJECT_REGEX = /^(?<type>\w+)(\((?<scope>.*?)\))?(?<breaking>!)?:\s+(?<description>.+)$/;

const FOOTER_REGEX = /^(?<key>BREAKING CHANGE|\S+):\s+(?<value>.+)$/;

const AUTHOR_REGEX = /^(?<name>.+) <(?<email>.+)>$/;

/** Convert a commit to a {@link ConventionalCommit}, returning `undefined` for unknown formats */
export function parseCommit(commit: GitCommit): ConventionalCommit | undefined {
  const titleMatch = commit.subject.match(SUBJECT_REGEX);
  if (!titleMatch) return undefined;

  const { type, scope, breaking, description } = titleMatch.groups!;
  if (type == null || description == null) return undefined;

  const footers: ConventionalCommit["footers"] = [];
  if (commit.body) {
    for (const line of commit.body.split("\n")) {
      const match = line.match(FOOTER_REGEX);
      if (!match?.groups) continue;

      footers.push({
        key: match.groups.key!.toLowerCase(),
        value: match.groups.value!,
      });
    }
  }

  return {
    type,
    scope,
    description,
    body: commit.body,
    isBreaking: !!breaking || footers.some((footer) => footer.key === "breaking change"),
    footers,
    authors: [
      commit.author,
      ...footers
        .filter((footer) => footer.key === "co-authored-by")
        .map((footer) => footer.value.match(AUTHOR_REGEX)?.groups)
        .filter((group) => group != null)
        .map((group) => ({
          name: group.name!,
          email: group.email!,
        })),
    ],
  };
}
