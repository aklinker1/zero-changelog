export type GithubRelease = {
  tag: string;
  title: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
};

export async function getGithubRelease(_tag: string): Promise<unknown> {}
