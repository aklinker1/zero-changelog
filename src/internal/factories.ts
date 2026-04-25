import { createFactory } from "@aklinker1/zero-factory";

import type { ConventionalCommit } from "../conventional-commit";
import type { GitCommit } from "../git-commit";

export const gitCommitFactory = createFactory<GitCommit>({
  hash: "1234567",
  author: {
    name: "aaron",
    email: "aaron@example.com",
  },
  body: undefined,
  date: new Date(),
  subject: "chore: Test commit",
});

export const conventionalCommitFactory = createFactory<ConventionalCommit>({
  description: "This is a test message",
  footers: [],
  isBreaking: false,
  type: "test",
  body: undefined,
  scope: undefined,
});
