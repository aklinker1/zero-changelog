import { describe, expect, it } from "bun:test";

import { parseSemver } from "../semver";

describe("Semver", () => {
  describe("parseSemver", () => {});

  describe("bump", () => {
    it.each([
      // Unstable
      { version: "0.0.0", bump: "major", expected: "0.1.0" },
      { version: "0.0.0", bump: "minor", expected: "0.0.1" },
      { version: "0.0.0", bump: "patch", expected: "0.0.1" },
      { version: "0.0.0", bump: "1.0.0", expected: "1.0.0" },
      { version: "0.0.0", bump: "1.0.0-alpha.1", expected: "1.0.0-alpha.1" },

      // Prerelease
      { version: "1.0.0-alpha.1", bump: "major", expected: "1.0.0-alpha.2" },
      { version: "1.0.0-alpha.1", bump: "minor", expected: "1.0.0-alpha.2" },
      { version: "1.0.0-alpha.1", bump: "patch", expected: "1.0.0-alpha.2" },
      { version: "1.0.0-alpha.1", bump: "1.0.0-beta.1", expected: "1.0.0-beta.1" },
      { version: "1.0.0-alpha.1", bump: "1.0.0", expected: "1.0.0" },

      // Stable
      { version: "1.2.0", bump: "major", expected: "2.0.0" },
      { version: "1.2.0", bump: "minor", expected: "1.3.0" },
      { version: "1.2.0", bump: "patch", expected: "1.2.1" },
      { version: "1.2.0", bump: "2.0.0", expected: "2.0.0" },
    ])('should bump "$version" via "$bump" to "$expected"', ({ version, bump, expected }) => {
      expect(parseSemver(version).bump(bump)).toBe(expected);
    });

    it.each([
      // Unstable
      { from: "0.2.0", to: "0.1.0" },
      { from: "0.2.2", to: "0.2.1" },

      // Prerelease
      { from: "1.0.0-alpha.2", to: "0.1.0" },
      { from: "1.0.0-alpha.2", to: "1.0.0-alpha.1" },
      { from: "1.0.0-beta.1", to: "1.0.0-alpha.1" },
      { from: "1.0.0-beta.1", to: "1.0.0-alpha.2" },
      { from: "1.0.0-rc.1", to: "1.0.0-beta.1" },
      { from: "1.0.0-rc.1", to: "1.0.0-beta.2" },
      { from: "1.0.0-rc.1", to: "1.0.0-alpha.1" },
      { from: "1.0.0-rc.1", to: "1.0.0-alpha.2" },

      // Stable
      { from: "1.0.0", to: "0.1.0" },
      { from: "2.2.2", to: "1.0.0" },
      { from: "2.2.2", to: "2.1.2" },
      { from: "2.2.2", to: "2.2.1" },
      { from: "1.0.0", to: "1.0.0-alpha.1" },
      { from: "1.0.0", to: "1.0.0-beta.1" },
      { from: "1.0.0", to: "1.0.0-rc.1" },
      { from: "2.0.0", to: "1.0.0-alpha.1" },
      { from: "2.0.0", to: "1.0.0-beta.1" },
      { from: "2.0.0", to: "1.0.0-rc.1" },
    ])('should throw an error when bumping from "$from" to "$to"', ({ from, to }) => {
      expect(() => parseSemver(from).bump(to)).toThrowError(
        "New version must be greater than the current version",
      );
    });
  });

  describe("compare", () => {
    it("should sort versions correctly", () => {
      const expected: string[] = [
        "10.0.0",
        "2.0.0",
        "2.0.0-rc.2",
        "2.0.0-rc.1",
        "2.0.0-beta.2",
        "2.0.0-beta.1",
        "2.0.0-alpha.2",
        "2.0.0-alpha.1",
        "1.2.1",
        "1.2.0",
        "1.1.1",
        "1.1.0",
        "1.1.0",
        "1.0.0",
        "1.0.0-rc.2",
        "1.0.0-rc.2",
        "1.0.0-rc.1",
        "1.0.0-beta.2",
        "1.0.0-beta.1",
        "1.0.0-alpha.2",
        "1.0.0-alpha.1",
        "0.20.5",
        "0.20.0",
        "0.19.10",
        "0.1.0",
        "0.0.2",
        "0.0.2",
        "0.0.1",
        "0.0.0",
      ];
      const semver = expected.map(parseSemver);

      // Shuffle and repeat multiple times to test lots of different order combinations
      for (let i = 0; i < 100; i++) {
        const shuffled = semver.toSorted(() => 0.5 - Math.random());

        const actual = shuffled
          .toSorted((a, b) => {
            const res = b.compare(a);
            // Uncomment to debug
            // console.log(`${b.version} vs ${a.version} ->`, res);
            return res;
          })
          .map((v) => v.version);

        expect(actual).toEqual(expected);
      }
    });
  });
});
