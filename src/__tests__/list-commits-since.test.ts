import { beforeEach, describe, expect, it, mock, type Mock } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

mock.module("../internal/run-git-log", () => ({ runGitLog: mock() }));

describe("listCommitsSince", async () => {
  const { listCommitsSince } = await import("../list-commits-since");
  const { runGitLog } = await import("../internal/run-git-log");
  const runGitLogMock = runGitLog as Mock<typeof runGitLog>;

  const FIXTURES_PATH = "src/__tests__/__fixtures__/git-log";
  const files = (await readdir(FIXTURES_PATH)).filter((file) => file.endsWith(".log")).toSorted();

  beforeEach(() => {
    mock.clearAllMocks();
  });

  it.each(files)("%s", async (filename) => {
    const since = "anything";
    const dirs: string[] = [];

    const path = join(FIXTURES_PATH, filename);
    const log = await Bun.file(path).text();
    runGitLogMock.mockResolvedValue(log);

    const actual = await listCommitsSince({ dirs, since });

    expect(actual).toMatchSnapshot();
    expect(runGitLogMock).toBeCalledTimes(1);
    expect(runGitLogMock).toBeCalledWith(dirs, since);
  });
});
