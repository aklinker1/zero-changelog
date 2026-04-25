import type { ChangelogSection } from "./changelog-section";

export function serializeChangelog(sections: ChangelogSection[]): string {
  const parts = ["# Changelog"];

  for (const section of sections) {
    parts.push(`## ${section.header}`, section.body);
  }

  return parts.join("\n\n") + "\n";
}
