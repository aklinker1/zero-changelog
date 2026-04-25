import { beforeEach, describe, expect, it, mock, type Mock } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

mock.module("../internal/run-git-tag", () => ({ runGitTag: mock() }));

describe("findPreviousTag", async () => {
  const { findPreviousTag } = await import("../find-previous-tag");
  const { runGitTag } = await import("../internal/run-git-tag");
  const runGitTagMock = runGitTag as Mock<typeof runGitTag>;

  const FIXTURES_PATH = "src/__tests__/__fixtures__/git-tag";
  const files = (await readdir(FIXTURES_PATH)).filter((file) => file.endsWith(".log")).toSorted();

  beforeEach(() => {
    mock.clearAllMocks();
  });

  it.each(files)("%s", async (filename) => {
    const tagPrefix = "anything";

    const path = join(FIXTURES_PATH, filename);
    const log = await Bun.file(path).text();
    runGitTagMock.mockResolvedValue(log);

    const actual = await findPreviousTag(tagPrefix);

    expect(actual).toMatchSnapshot();
    expect(runGitTagMock).toBeCalledTimes(1);
    expect(runGitTagMock).toBeCalledWith(tagPrefix);
  });
});
