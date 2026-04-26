export type GithubRelease = {
  tag: string;
  title: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
};

export async function getGithubRelease(options: {
  repo: string;
  tag: string;
  token: string;
}): Promise<GithubRelease> {
  const res = await fetch(
    `https://api.github.com/repos/${options.repo}/releases/tags/${options.tag}`,
    {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
    },
  );
  if (res.ok) {
    const json = await res.json();
    return json as any;
  }

  console.log("Response status:", res.status);
  console.log("Response body:");
  console.log(await res.text());
  throw Error("Failed to fetch github release");
}
