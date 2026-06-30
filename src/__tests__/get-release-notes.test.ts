import { describe, it, expect, mock } from "bun:test";

import dedent from "dedent";

import { getReleaseNotes } from "../get-release-notes";
import { parseCommit } from "../parse-commit";

// @ts-expect-error
globalThis.fetch = mock(() => {
  throw Error("fetch should not be called in this test");
});

describe("getReleaseNotes", () => {
  it("should include breaking change footers in their own section", async () => {
    // These are real commits that didn't result in the changelog I expected.
    const commits = [
      {
        author: {
          email: "aklinker1@users.noreply.github.com",
          name: "Aaron",
        },
        body: undefined,
        date: new Date("2026-05-19T16:30:01.000Z"),
        hash: "7a557cd2dfffe66d0042d7018291522db49ef8e6",
        subject: 'fix: Change "Release completed in ..." to "Completed in ..."',
      },
      {
        author: {
          email: "aklinker1@users.noreply.github.com",
          name: "Aaron",
        },
        body: undefined,
        date: new Date("2026-05-19T16:33:30.000Z"),
        hash: "5e468f9267dd78233bc79917bae8f1e89da90deb",
        subject: "docs: Update README",
      },
      {
        author: {
          email: "aklinker1@users.noreply.github.com",
          name: "Aaron",
        },
        body: "BREAKING CHANGE: Arguments for getReleaseNotes have changed to a single object",
        date: new Date("2026-06-30T20:17:29.000Z"),
        hash: "47dfe01aaf042503d4eb12a8a28e5a8d9097a9ea",
        subject: "feat!: Use GitHub usernames in release notes",
      },
    ];

    const actual = await getReleaseNotes({
      conventionalCommits: commits.map(parseCommit).filter((commit) => commit != null),
      repo: "aklinker1/zero-changelog",
      since: "v0.1.11",
      tag: "v0.2.0",
    });

    expect(actual).toEqual(
      dedent`
        [compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.11...v0.2.0)

        ### 🚀 Features

        - Use GitHub usernames in release notes ([\`47dfe01\`](https://github.com/aklinker1/zero-changelog/commit/47dfe01aaf042503d4eb12a8a28e5a8d9097a9ea))

        ### 🩹 Fixes

        - Change "Release completed in ..." to "Completed in ..." ([\`7a557cd\`](https://github.com/aklinker1/zero-changelog/commit/7a557cd2dfffe66d0042d7018291522db49ef8e6))

        ### 📖 Documentation

        - Update README ([\`5e468f9\`](https://github.com/aklinker1/zero-changelog/commit/5e468f9267dd78233bc79917bae8f1e89da90deb))

        ### ⚠️ Breaking Changes

        - [\`47dfe01\`](https://github.com/aklinker1/zero-changelog/commit/47dfe01aaf042503d4eb12a8a28e5a8d9097a9ea): Arguments for getReleaseNotes have changed to a single object

        ### ❤️ Contributors

        - [@aklinker1](https://github.com/aklinker1)
      ` + "\n",
    );
  });
});
