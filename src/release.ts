import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { createGithubRelease } from "./create-github-release";
import { detectVersionBump } from "./detect-version-bump";
import { findPreviousTag } from "./find-previous-tag";
import { getCurrentVersion } from "./get-current-version";
import { getGithubRepo } from "./get-github-repo";
import { getReleaseNotes } from "./get-release-notes";
import { run } from "./internal/run";
import { template } from "./internal/utils";
import { listCommitsSince } from "./list-commits-since";
import { parseChangelog } from "./parse-changelog";
import { parseCommits } from "./parse-commits";
import { isPrerelease, parseSemver, type BumpBy } from "./semver";
import { serializeChangelog } from "./serialize-changelog";
import { updateVersionFiles } from "./update-version-files";

export type ReleaseOptions = {
  /**
   * How to bump the version during the release.
   *
   * - `undefined`: Detect based on the commit messages since {@link ReleaseOptions#since}
   * - `"major"`: Bump the major version (e.g. `1.0.0` → `2.0.0`)
   * - `"minor"`: Bump the minor version (e.g. `1.0.0` → `1.1.0`)
   * - `"patch"`: Bump the patch version (e.g. `1.0.0` → `1.0.1`)
   * - `"X.Y.Z"`: Use a specific version (e.g. `1.0.0` → `1.0.0`)
   *
   *   - You may set this string to any valid semver (e.g. `"2.0.0"`, `"1.2.3-beta.1"`).
   *
   * JS Usage:
   *
   * ```ts
   * await release({ bump: "minor" });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     bump: ${{ inputs.version }}
   * ```
   *
   * @default undefined
   */
  bump?: BumpBy;

  /**
   * The directory to release
   *
   * JS Usage:
   *
   * ```ts
   * await release({ path: "packages/my-package" });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     path: ${{ inputs.packageDir }}
   * ```
   *
   * @default process.cwd()
   */
  path?: string;

  /**
   * Additional directories to include commits from when computing the version bump.
   *
   * > **IMPORTANT**: You may use glob patterns for ONLY the github action. They are not automatically
   * > expanded when using the JS API. If you use the JS API and want to use glob patterns, [install a
   * > glob pattern library](https://www.npmjs.com/search?q=glob) and call it yourself.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   path: "packages/my-package",
   *   additionalDirs: ["../../.github", "../../scripts"],
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     path: ${{ inputs.packageDir }}
   *     additionalDirs: |-
   *       ../../.github
   *       ../../scripts
   * ```
   */
  additionalDirs?: string[];

  /**
   * Tag prefix to use while generating the tag name.
   *
   * The default value changes based on {@link ReleaseOptions#path}:
   *
   * - When `undefined`, defaults to `"v"`
   * - When set, defaults to `basename(path) + "-v"`
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   tagPrefix: "npm-v",
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     tagPrefix: npm-v
   * ```
   */
  tagPrefix?: string;

  /**
   * Customize the commit message.
   *
   * Template vars:
   *
   * - `{{version}}`: The version after being bumped.
   * - `{{path}}`: The {@link ReleaseOptions#path} relative to the current working directory.
   * - `{{dirname}}`: The path's base name.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   path: "packages/my-package",
   *   commitTemplate: "chore(release): My Package v{{version}}",
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     path: packages/my-package
   *     commitTemplate: "chore(release): My Package v{{version}}"
   * ```
   *
   * @default "chore(release): v{{version}}"
   */
  commitTemplate?: string;

  /**
   * A git ref to use as the starting point when generating changelog and determining which version
   * to bump to.
   *
   * When not provided, the last tag that starts with your {@link ReleaseOptions#tagPrefix} will be
   * used.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   since: "some-tag",
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     since: "some-tag"
   * ```
   */
  since?: string;

  /**
   * If `true`, the release will not be committed or tagged.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   dryRun: true,
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     dryRun: true
   * ```
   *
   * @default false
   */
  dryRun?: boolean;

  /**
   * Customize the release title.
   *
   * Template vars:
   *
   * - `{{version}}`: The version after being bumped.
   * - `{{tag}}`: The tag that will be used for the release.
   * - `{{path}}`: The {@link ReleaseOptions#path} relative to the current working directory.
   * - `{{dirname}}`: The path's base name.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   path: "packages/my-package",
   *   releaseNameTemplate: "My Package {{version}}",
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     path: "packages/my-package"
   *     releaseNameTemplate: "My Package {{version}}"
   * ```
   *
   * @default "{{tag}}"
   */
  releaseNameTemplate?: string;

  /**
   * A custom publish command to run before committing and creating the release.
   *
   * If not provided, nothing is ran.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   publishCommands: ["npm publish", "jsr publish"],
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     publishCommands: |-
   *       npm publish
   *       jsr publish
   * ```
   */
  publishCommands?: string[];

  /**
   * If your {@link ReleaseOptions#publishCommands} has a dry run variant, you can provide it here.
   *
   * When provided, this command will be ran instead of the regular publishCommands when
   * {@link ReleaseOptions#dryRun} is true.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   dryRunPublishCommands: ["npm publish --dry-run", "jsr publish --dry-run"],
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     dryRunPublishCommands: |-
   *       npm publish --dry-run
   *       jsr publish --dry-run
   * ```
   */
  dryRunPublishCommands?: string[];

  /**
   * List of files to bump versions inside, relative to the {@link ReleaseOptions#path}.
   *
   * - If none of the files exist, an error will be thrown.
   * - If the file is not present, the path will be logged.
   *
   * > **IMPORTANT**: You may use glob patterns for ONLY the github action. They are not automatically
   * > expanded when using the JS API. If you use the JS API and want to use glob patterns, [install a
   * > glob pattern library](https://www.npmjs.com/search?q=glob) and call it yourself.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   versionFiles: ["package.json", "jsr.json"],
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     versionFiles: |-
   *       package.json
   *       jsr.json
   * ```
   *
   * @default ["package.json", "jsr.json", "deno.json", "Cargo.toml"]
   */
  versionFiles?: string[];

  /**
   * List of paths to artifacts to upload on the github release. Does NOT support globs.
   *
   * > **IMPORTANT**: You may use glob patterns for ONLY the github action. They are not automatically
   * > expanded when using the JS API. If you use the JS API and want to use glob patterns, [install a
   * > glob pattern library](https://www.npmjs.com/search?q=glob) and call it yourself.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   releaseArtifacts: ["file1", "file2"],
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     releaseArtifacts: |-
   *       file1
   *       file2
   * ```
   */
  releaseArtifacts?: string[];

  /**
   * When `true`, throw an error if no commits contain semver changes. When `false` or `undefined`,
   * use `bump: "patch"` when no changes are detected.
   *
   * > IMPORTANT**: This option is only effective when the {@link ReleaseOptions#bump} is `undefined`.
   *
   * @default false
   */
  throwOnNoChanges?: boolean;

  /**
   * The repo to create the release on.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   githubRepo: "aklinker1/zero-changelog",
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     githubRepo: "some-other/repo" # Defaults to the current repo
   * ```
   */
  githubRepo?: `${string}/${string}`;
  /**
   * A github API token with access to the repo for creating a release.
   *
   * JS Usage:
   *
   * ```ts
   * await release({
   *   githubToken: process.env.GITHUB_TOKEN!,
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     githubToken: ${{ secrets.GITHUB_TOKEN }}
   * ```
   *
   * @default process.env.GITHUB_TOKEN
   */
  githubToken?: string;

  /**
   * Set to false to prevent marking the github release as "latest"
   *
   * @default true
   */
  latestRelease?: boolean;
};

export type ReleaseMeta = {
  /** The new version it was bumped to. */
  version: string;
  /** The tag used. */
  tag: string;
  /** The release notes added to the changelog for the version */
  releaseNotes: string;
};

export async function release(options: ReleaseOptions): Promise<ReleaseMeta> {
  // 0. Resolve options

  const {
    additionalDirs = [],
    commitTemplate = "chore(release): v{{version}}",
    dryRun = false,
    dryRunPublishCommands,
    publishCommands,
    releaseNameTemplate = "{{tag}}",
    versionFiles = ["package.json", "jsr.json", "deno.json", "Cargo.toml"],
    releaseArtifacts = [],
    throwOnNoChanges = false,
    githubToken = process.env.GITHUB_TOKEN,
    githubRepo = await getGithubRepo(),
    latestRelease = true,
  } = options;

  const cwd = process.cwd();
  const path = options.path ? resolve(options.path) : cwd;
  const dirname = basename(path);
  const tagPrefix = path === cwd ? "v" : `${dirname}-v`;

  if (!githubToken) throw Error("No github token provided");
  if (!githubRepo) throw Error("No github repo provided");

  // 1. Get current version

  const currentVersion = parseSemver(await getCurrentVersion(path, versionFiles));

  // 2. Collect relevant commits

  const since = options.since ?? (await findPreviousTag(tagPrefix));
  console.log("Since:", since);
  const commits = await listCommitsSince({ since, dirs: [path, ...additionalDirs] });
  console.log("Commits:", commits.length);
  const conventionalCommits = parseCommits(commits);
  console.log("Conventional commits:", conventionalCommits.length);

  // 3. Bump version

  const bump =
    (options.bump?.trim() || undefined) ?? detectVersionBump(conventionalCommits, throwOnNoChanges);
  console.log("Bump:", bump);

  const version = currentVersion.bump(bump);
  console.log("Version:", version);

  const tag = tagPrefix + version;
  console.log("Tag:", tag);

  await updateVersionFiles(path, versionFiles, version);

  // 4. Create release notes

  const releaseNotes = getReleaseNotes(conventionalCommits, since, tag, githubRepo);
  console.log("Release notes:");
  console.log("---");
  console.log(releaseNotes);
  console.log("---");

  // 5. Update changelog

  const changelog = parseChangelog(
    await readFile("CHANGELOG.md", "utf8").catch((err) => {
      if (err.code === "ENOENT") return "";
      throw err;
    }),
  );
  changelog.unshift({
    header: `v${version}`,
    body: releaseNotes,
  });
  await writeFile("CHANGELOG.md", serializeChangelog(changelog), "utf8");
  console.log("CHANGELOG.md updated");

  // 6. Commit changes

  const commit = template(commitTemplate, { version, path, dirname });
  await run({ dryRun, cwd: path, cmd: `git add CHANGELOG.md` });
  await run({ dryRun, cwd: path, cmd: `git commit -am "${commit}"` });
  await run({ dryRun, cwd: path, cmd: `git tag ${tag}` });
  console.log("Changes committed");

  // 7. Run publish script

  if (dryRun && dryRunPublishCommands?.length) {
    for (const cmd of dryRunPublishCommands) {
      await run({ dryRun: false, cwd: path, cmd });
    }
  } else if (publishCommands?.length) {
    for (const cmd of publishCommands) {
      await run({ dryRun, cwd: path, cmd });
    }
  }

  // 8. Push changes

  await run({ dryRun, cwd: path, cmd: "git push" });
  await run({ dryRun, cwd: path, cmd: "git push --tags" });
  console.log("Changes pushed");

  // 9. Create release

  const releaseName = template(releaseNameTemplate, { version, tag, path, dirname });
  await createGithubRelease({
    repo: githubRepo,
    token: githubToken,
    dryRun,
    tag,
    name: releaseName,
    body: releaseNotes,
    artifacts: releaseArtifacts,
    latest: latestRelease,
    prerelease: isPrerelease(parseSemver(version)),
  });
  console.log("Release created");

  return {
    version,
    tag,
    releaseNotes,
  };
}
