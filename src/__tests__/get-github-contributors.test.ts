import { afterEach, describe, expect, it, spyOn } from "bun:test";

import { getGithubContributors } from "../get-github-contributors";

const mockFetch = spyOn(globalThis, "fetch");

afterEach(() => {
  mockFetch.mockReset();
});

describe("getGithubContributors", () => {
  describe("GitHub noreply emails (new format)", () => {
    it("should extract username without an API call", async () => {
      const result = await getGithubContributors(
        ["123456+octocat@users.noreply.github.com"],
        undefined,
      );

      expect(result.get("123456+octocat@users.noreply.github.com")).toBe("octocat");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("GitHub noreply emails (old format)", () => {
    it("should extract username without an API call", async () => {
      const result = await getGithubContributors(["octocat@users.noreply.github.com"], undefined);

      expect(result.get("octocat@users.noreply.github.com")).toBe("octocat");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("regular email with a matching GitHub account", () => {
    it("should resolve the login via the Search API", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ login: "octocat" }] }), { status: 200 }),
      );

      const result = await getGithubContributors(["octocat@github.com"], "gh-token");

      expect(result.get("octocat@github.com")).toBe("octocat");
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0]!;
      expect(String(url)).toContain("search/users");
      expect(String(url)).toContain(encodeURIComponent("octocat@github.com"));
      expect((init as RequestInit).headers).toMatchObject({
        Authorization: "Bearer gh-token",
      });
    });
  });

  describe("regular email with no matching GitHub account", () => {
    it("should not add an entry to the map", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }));

      const result = await getGithubContributors(["unknown@example.com"], "gh-token");

      expect(result.has("unknown@example.com")).toBe(false);
    });
  });

  describe("Search API returns a non-OK response", () => {
    it("should silently skip and not add an entry", async () => {
      mockFetch.mockResolvedValueOnce(new Response("Forbidden", { status: 403 }));

      const result = await getGithubContributors(["someone@example.com"], "bad-token");

      expect(result.has("someone@example.com")).toBe(false);
    });
  });

  describe("Search API throws a network error", () => {
    it("should silently skip and not add an entry", async () => {
      mockFetch.mockRejectedValueOnce(new Error("network failure"));

      const result = await getGithubContributors(["someone@example.com"], "gh-token");

      expect(result.has("someone@example.com")).toBe(false);
    });
  });

  describe("duplicate emails in the input", () => {
    it("should deduplicate and only call the API once per unique email", async () => {
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ items: [{ login: "octocat" }] }), { status: 200 }),
      );

      const result = await getGithubContributors(
        ["octocat@github.com", "octocat@github.com"],
        "gh-token",
      );

      expect(result.get("octocat@github.com")).toBe("octocat");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("mixed email types", () => {
    it("should resolve all emails correctly", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ login: "regular-user" }] }), { status: 200 }),
      );

      const result = await getGithubContributors(
        ["99+noreply-user@users.noreply.github.com", "regular@example.com"],
        "gh-token",
      );

      expect(result.get("99+noreply-user@users.noreply.github.com")).toBe("noreply-user");
      expect(result.get("regular@example.com")).toBe("regular-user");
      // Only the regular email should have triggered an API call
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
