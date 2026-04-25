import type { ChangelogSection } from "./changelog-section";

export function parseChangelog(changelog: string): ChangelogSection[] {
  const lines = changelog.split(/\n\r?/);

  let results: ChangelogSection[] = [];

  let current: { header: string; lines: string[] } | undefined;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) {
        results.push({
          header: current.header,
          body: current.lines.join("\n").trim(),
        });
      }
      current = { header: line.slice(3), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) {
    results.push({
      header: current.header,
      body: current.lines.join("\n").trim(),
    });
  }

  return results;
}
