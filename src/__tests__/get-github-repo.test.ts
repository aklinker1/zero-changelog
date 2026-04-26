import { describe, it, expect } from "bun:test";

import { getGithubRepo } from "../get-github-repo";

describe("getGithubRepo", () => {
  it("should return the github repo from the origin remote's URL", async () => {
    expect(await getGithubRepo()).toBe("aklinker1/zero-changelog");
  });
});
