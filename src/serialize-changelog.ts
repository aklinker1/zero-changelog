import type { ChangelogSection } from "./changelog-section";
import { parseSemver } from "./semver";

/** Headers are tags (`v1.0.0`, `pkg-v1.0.0`), so drop everything before the first digit. */
function stripTagPrefix(header: string): string {
  return header.replace(/^\D*/, "");
}

export function serializeChangelog(sections: ChangelogSection[]): string {
  const parts = ["# Changelog"];

  const ordered = sections.sort((a, b) => {
    const aV = stripTagPrefix(a.header);
    const bV = stripTagPrefix(b.header);
    try {
      const aSemver = parseSemver(aV);
      try {
        const bSemver = parseSemver(bV);
        // Both are valid semver - compare in descending order
        return bSemver.compare(aSemver);
      } catch {
        // a is semver, b is not - a comes first
        return -1;
      }
    } catch {
      try {
        parseSemver(bV);
        // b is semver, a is not - b comes first
        return 1;
      } catch {
        // Neither is semver - maintain relative order
        return 0;
      }
    }
  });

  for (const section of ordered) {
    parts.push(`## ${section.header}`, section.body);
  }

  return parts.join("\n\n") + "\n";
}
