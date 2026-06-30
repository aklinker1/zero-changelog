/**
 * Matches both old (`user@users.noreply.github.com`) and new (`123+user@users.noreply.github.com`)
 * noreply formats.
 */
const NOREPLY_EMAIL_REGEX = /^(?:\d+\+)?(?<username>[^@]+)@users\.noreply\.github\.com$/;

/**
 * Look up GitHub usernames for a list of author emails.
 *
 * Resolution strategy (in order):
 *
 * 1. GitHub noreply emails – username extracted directly, no API call needed.
 * 2. GitHub Search API (`/search/users?q=<email>+in:email`) – requires a token for reliable results;
 *    silently skipped when the request fails or returns no match.
 *
 * @param emails Deduplicated list of author emails to resolve.
 * @param token Optional GitHub personal access token or `GITHUB_TOKEN`. When omitted, noreply
 *   emails are still resolved but Search API calls are made without auth (lower rate limit, may
 *   miss private emails).
 * @returns A `Map` of `email → GitHub username` (without the `@` prefix). Emails that could not be
 *   resolved are absent from the map.
 */
export async function getGithubContributors(
  emails: string[],
  token: string | undefined,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const uniqueEmails = [...new Set(emails)];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  for (const email of uniqueEmails) {
    // Fast path: parse GitHub noreply addresses without an API call.
    const noreplyMatch = email.match(NOREPLY_EMAIL_REGEX);
    if (noreplyMatch?.groups?.username) {
      result.set(email, noreplyMatch.groups.username);
      continue;
    }

    // Slow path: search GitHub for a user with this public email.
    try {
      const url = `https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email&per_page=1`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = (await res.json()) as { items: Array<{ login: string }> };
        const user = json.items[0];
        if (user) {
          result.set(email, user.login);
        }
      }
    } catch {
      // Network or parse errors are silently ignored; the email will be used as a fallback.
    }
  }

  return result;
}
