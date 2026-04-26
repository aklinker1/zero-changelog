import { describe, expect, it } from "bun:test";

import { gitCommitFactory } from "../internal/factories";
import { parseCommit } from "../parse-commit";

describe("parseCommit", () => {
  describe("simple subject", () => {
    const commit = gitCommitFactory({
      subject: "chore: Update nano-staged precommit command",
    });

    it("should be parsed", () => {
      expect(parseCommit(commit)).toEqual({
        type: "chore",
        scope: undefined,
        description: "Update nano-staged precommit command",
        body: undefined,
        isBreaking: false,
        footers: [],
        authors: [commit.author],
      });
    });
  });

  describe("simple, breaking subject", () => {
    const commit = gitCommitFactory({
      subject: "fix!: Make web-ext a peer dependency (#2079)",
    });

    it("should be parsed", () => {
      expect(parseCommit(commit)).toEqual({
        type: "fix",
        scope: undefined,
        description: "Make web-ext a peer dependency (#2079)",
        body: undefined,
        isBreaking: true,
        footers: [],
        authors: [commit.author],
      });
    });
  });

  describe("scoped subject", () => {
    const commit = gitCommitFactory({
      subject: "feat(modules): Add support for augmenting entrypoint options (#2149)",
    });

    it("should be parsed", () => {
      expect(parseCommit(commit)).toEqual({
        type: "feat",
        scope: "modules",
        description: "Add support for augmenting entrypoint options (#2149)",
        body: undefined,
        isBreaking: false,
        footers: [],
        authors: [commit.author],
      });
    });
  });

  describe("scoped, breaking subject", () => {
    const commit = gitCommitFactory({
      subject: "feat(unimport)!: Auto-import types",
    });

    it("should be parsed", () => {
      expect(parseCommit(commit)).toEqual({
        type: "feat",
        scope: "unimport",
        description: "Auto-import types",
        body: undefined,
        isBreaking: true,
        footers: [],
        authors: [commit.author],
      });
    });
  });

  describe("co-author footer", () => {
    const commit = gitCommitFactory({
      subject: "perf: Use filter to improve plugin performance with rolldown (#1787)",
      body: "Co-authored-by: Aaron <aaronklinker1@gmail.com>",
    });

    it("should be parsed", () => {
      expect(parseCommit(commit)).toEqual({
        type: "perf",
        scope: undefined,
        description: "Use filter to improve plugin performance with rolldown (#1787)",
        body: "Co-authored-by: Aaron <aaronklinker1@gmail.com>",
        isBreaking: false,
        footers: [{ key: "co-authored-by", value: "Aaron <aaronklinker1@gmail.com>" }],
        authors: [
          commit.author,
          {
            name: "Aaron",
            email: "aaronklinker1@gmail.com",
          },
        ],
      });
    });
  });

  describe("with body", () => {
    const commit = gitCommitFactory({
      subject: "docs: Update README",
      body: "- Bullet point one: test\n- Bullet point two: example",
    });

    it("should be parsed", () => {
      expect(parseCommit(commit)).toEqual({
        type: "docs",
        scope: undefined,
        description: "Update README",
        body: "- Bullet point one: test\n- Bullet point two: example",
        isBreaking: false,
        footers: [],
        authors: [commit.author],
      });
    });
  });

  describe("breaking change footer", () => {
    const commit = gitCommitFactory({
      subject: "feat: Add support for breaking change footer",
      body: "BREAKING CHANGE: example breaking change",
    });

    it("should be parsed", () => {
      expect(parseCommit(commit)).toEqual({
        type: "feat",
        scope: undefined,
        description: "Add support for breaking change footer",
        body: "BREAKING CHANGE: example breaking change",
        isBreaking: true,
        footers: [{ key: "breaking change", value: "example breaking change" }],
        authors: [commit.author],
      });
    });
  });

  describe("invalid format", () => {
    const commit = gitCommitFactory({
      subject: "something else: Some description",
    });

    it("should not be parsed", () => {
      expect(parseCommit(commit)).toBeUndefined();
    });
  });

  describe("invalid format", () => {
    const commit = gitCommitFactory({
      subject: "feat:! Some description",
    });

    it("should not be parsed", () => {
      expect(parseCommit(commit)).toBeUndefined();
    });
  });
});
