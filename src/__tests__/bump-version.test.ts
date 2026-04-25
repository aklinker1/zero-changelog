import { describe, expect, it } from "bun:test";

import { bumpVersion } from "../bump-version";

describe("bumpVersion", () => {
  it.each([
    // Pre v1.0
    { version: "0.0.0", bump: "major", expected: "1.0.0" },
    { version: "0.0.0", bump: "minor", expected: "0.1.0" },
    { version: "0.0.0", bump: "patch", expected: "0.0.1" },
    { version: "0.0.0", bump: "1.0.0", expected: "1.0.0" },

    // Release
    { version: "1.2.0", bump: "major", expected: "2.0.0" },
    { version: "1.2.0", bump: "minor", expected: "1.3.0" },
    { version: "1.2.0", bump: "patch", expected: "1.2.1" },
    { version: "1.2.0", bump: "1.0.0", expected: "1.0.0" },

    // Prerelease
    {
      version: "2.0.0-alpha.1",
      bump: "2.0.0-alpha.2",
      expected: "2.0.0-alpha.2",
    },
    {
      version: "0.1.1-alpha.2",
      bump: "1.0.0",
      expected: "1.0.0",
    },
  ])('should bump "$version" via "$bump" to "$expected"', ({ version, bump, expected }) => {
    expect(bumpVersion(version, bump)).toBe(expected);
  });

  it.each(["major", "minor", "patch"])(
    "should throw an error for %j when current version has a suffix",
    (bump) => {
      expect(() => bumpVersion("1.0.0-alpha1", bump)).toThrowError(
        `Relative version bump (${bump}) not allowed when the current version is in pre-release. Use a hardcoded version instead.`,
      );
    },
  );

  it.each(["1.0", "2.00", "test"])(
    "should throw an error when the current version is invalid semver: %j",
    (version) => {
      expect(() => bumpVersion(version, "major")).toThrow("Invalid semver in current version");
    },
  );

  it.each(["1.0", "2.00", "test"])(
    "should throw an error when the bump is invalid semver: %j",
    (bump) => {
      expect(() => bumpVersion("1.0.0", bump)).toThrow("Invalid semver in bumped version");
    },
  );
});
