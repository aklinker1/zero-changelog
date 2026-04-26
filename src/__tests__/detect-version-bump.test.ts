import { describe, expect, it } from "bun:test";

import type { ConventionalCommit } from "../conventional-commit";
import { detectVersionBump } from "../detect-version-bump";
import { conventionalCommitFactory } from "../internal/factories";

describe("detectVersionBump", () => {
  const throwOnNoChanges = false;

  describe("breaking changes", () => {
    it("should return 'major' breaking commits", () => {
      const commits = [
        conventionalCommitFactory({
          type: "feat",
          description: "some feature",
          isBreaking: true,
        }),
      ];

      const actual = detectVersionBump(commits, throwOnNoChanges);

      expect(actual).toBe("major");
    });

    it("should take precedence over all other commits", () => {
      const commits = [
        conventionalCommitFactory({
          type: "feat",
          description: "new feature",
        }),
        conventionalCommitFactory({
          type: "fix",
          description: "breaking fix",
          isBreaking: true,
        }),
        conventionalCommitFactory({
          type: "feat",
          description: "another feature",
        }),
      ];
      const result = detectVersionBump(commits, throwOnNoChanges);
      expect(result).toBe("major");
    });
  });

  describe("minor changes", () => {
    it("should return 'minor' for feat commits", () => {
      const commits = [
        conventionalCommitFactory({
          type: "feat",
          description: "new feature",
        }),
      ];

      const actual = detectVersionBump(commits, throwOnNoChanges);

      expect(actual).toBe("minor");
    });

    it("should return 'minor' when when it is the highest \"priority\"", () => {
      const commits = [
        conventionalCommitFactory({
          type: "fix",
          description: "bug fix",
        }),
        conventionalCommitFactory({
          type: "feat",
          description: "new feature",
        }),
        conventionalCommitFactory({
          type: "docs",
          description: "update docs",
        }),
      ];

      const actual = detectVersionBump(commits, throwOnNoChanges);

      expect(actual).toBe("minor");
    });
  });

  describe("patch changes", () => {
    it("should return 'patch' for fix commits", () => {
      const commits = [
        conventionalCommitFactory({
          type: "fix",
          description: "bug fix",
        }),
      ];

      const actual = detectVersionBump(commits, throwOnNoChanges);

      expect(actual).toBe("patch");
    });
  });

  describe("no commits", () => {
    const commits: ConventionalCommit[] = [];

    it("should return 'patch'", () => {
      const actual = detectVersionBump(commits, throwOnNoChanges);

      expect(actual).toBe("patch");
    });

    describe("throwOnNoChanges: true", () => {
      const throwOnNoChanges = true;

      it("should throw", () => {
        expect(() => detectVersionBump(commits, throwOnNoChanges)).toThrow(
          "No semver changes detected",
        );
      });
    });
  });

  describe("no semver commits", () => {
    const commits = [
      conventionalCommitFactory({
        type: "test",
        description: "update tests",
      }),
      conventionalCommitFactory({
        type: "ci",
        description: "update CI",
      }),
    ];

    it("should return 'patch'", () => {
      const actual = detectVersionBump(commits, throwOnNoChanges);

      expect(actual).toBe("patch");
    });

    describe("throwOnNoChanges: true", () => {
      const throwOnNoChanges = true;

      it("should throw", () => {
        expect(() => detectVersionBump(commits, throwOnNoChanges)).toThrow(
          "No semver changes detected",
        );
      });
    });
  });
});
