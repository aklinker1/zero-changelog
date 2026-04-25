import { describe, expect, it } from "bun:test";

import dedent from "dedent";

import type { ChangelogSection } from "../changelog-section";
import { serializeChangelog } from "../serialize-changelog";

describe("serializeChangelog", () => {
  describe("no sections", () => {
    const sections: ChangelogSection[] = [];

    it("should generate an empty changelog", () => {
      const expected = "# Changelog\n";

      expect(serializeChangelog(sections)).toEqual(expected);
    });
  });

  describe("with sections", () => {
    it("should generate a full changelog", () => {
      const sections: ChangelogSection[] = [
        { header: "v1.0.1", body: "one" },
        { header: "v1.0.0", body: "two" },
        { header: "v0.5.19-beta.2", body: "three" },
      ];

      const expected =
        dedent`
        # Changelog

        ## v1.0.1

        one

        ## v1.0.0

        two

        ## v0.5.19-beta.2

        three
      ` + "\n";

      const actual = serializeChangelog(sections);

      expect(actual).toEqual(expected);
    });
  });
});
