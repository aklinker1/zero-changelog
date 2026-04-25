import { describe, expect, it } from "bun:test";

import dedent from "dedent";

import type { ChangelogSection } from "../changelog-section";
import { parseChangelog } from "../parse-changelog";

describe("parseChangelog", () => {
  describe("with versions", () => {
    const changelog = dedent`
      # Changelog

      ignored text

      ## v1.0.1

      one

      ## v1.0.0
      two

      ## v0.5.19-beta.2
      three
    `;

    it("should return the sections", () => {
      const expected: ChangelogSection[] = [
        { header: "v1.0.1", body: "one" },
        { header: "v1.0.0", body: "two" },
        { header: "v0.5.19-beta.2", body: "three" },
      ];

      const actual = parseChangelog(changelog);

      expect(actual).toEqual(expected);
    });
  });

  describe("no versions", () => {
    const changelog = dedent`
      # Something

      This file doesn't contain any versions
    `;

    it("should return an empty array for an empty string", () => {
      expect(parseChangelog(changelog)).toEqual([]);
    });
  });

  describe("empty string", () => {
    const changelog = ``;

    it("should return an empty array for an empty string", () => {
      expect(parseChangelog(changelog)).toEqual([]);
    });
  });
});
