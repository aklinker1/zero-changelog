import { readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

import { createGithubRelease } from "./create-github-release";
import { detectVersionBump } from "./detect-version-bump";
import { findPreviousTag } from "./find-previous-tag";
import { getCurrentVersion } from "./get-current-version";
import { getGithubRepo } from "./get-github-repo";
import { getReleaseNotes } from "./get-release-notes";
import { styleText, GREEN } from "./internal/logger";
import { initLogger, logger } from "./internal/logger";
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
   * - `{{tag}}`: The tag that will be used for the release.
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
   * @default "chore(release): {{tag}}"
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
   * Custom commands to run after the version bump, but before committing.
   *
   * If not provided, nothing is ran.
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
   *   preCommitCommands: ["bun run build"],
   * });
   * ```
   *
   * GitHub Actions:
   *
   * ```yml
   * - uses: aklinker1/zero-changelog/actions/release
   *   with:
   *     preCommitCommands: |-
   *       bun run build
   * ```
   */
  preCommitCommands?: string[];

  /**
   * A custom publish command to run before committing and creating the release.
   *
   * If not provided, nothing is ran.
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
  const start = performance.now();
  initLogger(options.dryRun);

  logger?.title("Release");

  // 0. Resolve options

  logger?.section("Resolve options");
  logger?.info("Input:", options);

  const resolved = await resolveOptions(options);
  logger?.info("Resolved:", resolved);

  // 1. Get current version

  logger?.section("Get current version");
  const currentVersion = parseSemver(await getCurrentVersion(resolved.path, resolved.versionFiles));

  // 2. Collect relevant commits

  logger?.section("Collect relevant commits");

  const commits = await listCommitsSince({
    since: resolved.since,
    dirs: [resolved.path, ...resolved.additionalDirs],
  });
  logger?.info("Commits:", commits.length);
  for (const commit of commits) {
    logger?.detail(`${commit.hash.slice(0, 7)} ${commit.subject}`);
  }

  const conventionalCommits = parseCommits(commits);
  logger?.info("Conventional commits:", conventionalCommits.length);
  for (const commit of conventionalCommits) {
    logger?.detail(`${commit.hash.slice(0, 7)} ${commit.description}`);
  }

  // 3. Bump version

  logger?.section("Bump version");

  const bump =
    (options.bump?.trim() || undefined) ??
    detectVersionBump(conventionalCommits, resolved.throwOnNoChanges);
  logger?.info("Bump:", bump);

  const version = currentVersion.bump(bump);
  logger?.info("Version:", version);

  const tag = resolved.tagPrefix + version;
  logger?.info("Tag:", tag);

  await updateVersionFiles(resolved.path, resolved.versionFiles, version);

  const templateVars = {
    version,
    tag,
    path: resolved.relativePath,
    dirname: resolved.dirname,
  };

  // 4. Create release notes

  logger?.section("Create release notes");

  const releaseNotes = await getReleaseNotes({
    conventionalCommits,
    since: resolved.since,
    tag,
    repo: resolved.githubRepo,
    githubToken: resolved.githubToken,
  });
  logger?.info("Release notes:");
  for (const line of releaseNotes.trim().split("\n")) {
    logger?.detail(line);
  }

  // 5. Update changelog

  logger?.section("Update changelog");

  const changelog = parseChangelog(
    await readFile(resolved.changelogPath, "utf8").catch((err) => {
      if (err.code === "ENOENT") {
        logger?.info("No changelog present, it will be added");
        return "";
      }
      throw err;
    }),
  );
  changelog.unshift({
    header: `v${version}`,
    body: releaseNotes,
  });
  await writeFile(resolved.changelogPath, serializeChangelog(changelog), "utf8");
  logger?.info(`Updated`);
  logger?.detail(resolved.changelogPath);

  // 6. Commit changes

  logger?.section("Commit changes");

  const preCommitCommands = options.preCommitCommands?.map((command) =>
    template(command, templateVars),
  );
  if (preCommitCommands) {
    for (const cmd of preCommitCommands) {
      await run({ cwd: resolved.path, cmd });
    }
  }

  const commit = template(resolved.commitTemplate, templateVars);
  await run({ skipped: resolved.dryRun, cwd: resolved.path, cmd: `git add CHANGELOG.md` });
  await run({ skipped: resolved.dryRun, cwd: resolved.path, cmd: `git commit -am "${commit}"` });
  await run({ skipped: resolved.dryRun, cwd: resolved.path, cmd: `git tag ${tag}` });

  // 7. Run publish scripts

  logger?.section("Run publish scripts");

  const publishCommands = options.publishCommands?.map((command) =>
    template(command, templateVars),
  );
  const dryRunPublishCommands = options.dryRunPublishCommands?.map((command) =>
    template(command, templateVars),
  );

  if (resolved.dryRun && dryRunPublishCommands?.length) {
    for (const cmd of dryRunPublishCommands) {
      await run({ cwd: resolved.path, cmd });
    }
  } else if (publishCommands?.length) {
    for (const cmd of publishCommands) {
      await run({ skipped: resolved.dryRun, cwd: resolved.path, cmd });
    }
  }

  // 8. Push changes

  logger?.section("Push changes");

  await run({ skipped: resolved.dryRun, cwd: resolved.path, cmd: "git push" });
  await run({ skipped: resolved.dryRun, cwd: resolved.path, cmd: "git push --tags" });

  // 9. Create release

  logger?.section("Create release");

  const releaseName = template(resolved.releaseNameTemplate, templateVars);
  await createGithubRelease({
    repo: resolved.githubRepo,
    token: resolved.githubToken,
    dryRun: resolved.dryRun,
    tag,
    name: releaseName,
    body: releaseNotes,
    artifacts: resolved.releaseArtifacts,
    latest: resolved.latestRelease,
    prerelease: isPrerelease(parseSemver(version)),
  });
  if (!resolved.dryRun) logger?.info("Created release on GitHub");

  const end = performance.now();
  logger?.info("");
  logger?.info(`${styleText(GREEN, "✓")} Completed in ${((end - start) / 1000).toFixed(3)}s`);

  return {
    version,
    tag,
    releaseNotes,
  };
}

type ResolvedReleaseOptions = {
  additionalDirs: string[];
  bump: BumpBy | undefined;
  changelogPath: string;
  commitTemplate: string;
  cwd: string;
  dirname: string;
  dryRun: boolean;
  dryRunPublishCommands: string[];
  githubRepo: `${string}/${string}`;
  githubToken: string;
  latestRelease: boolean;
  path: string;
  preCommitCommands: string[];
  publishCommands: string[];
  relativePath: string;
  releaseArtifacts: string[];
  releaseNameTemplate: string;
  since: string | undefined;
  tagPrefix: string;
  throwOnNoChanges: boolean;
  versionFiles: string[];
};

async function resolveOptions(input: ReleaseOptions): Promise<ResolvedReleaseOptions> {
  const {
    additionalDirs = [],
    bump,
    commitTemplate = "chore(release): {{tag}}",
    dryRun = false,
    latestRelease = true,
    releaseArtifacts = [],
    releaseNameTemplate = "{{tag}}",
    throwOnNoChanges = false,
    versionFiles = ["package.json", "jsr.json", "deno.json", "Cargo.toml"],
  } = input;

  const cwd = process.cwd();
  const path = input.path ? resolve(input.path) : cwd;
  const dirname = basename(path);
  const relativePath = relative(cwd, path);
  const changelogPath = join(path, "CHANGELOG.md");
  const githubToken = input.githubToken ?? process.env.GITHUB_TOKEN;
  const githubRepo = input.githubRepo ?? (await getGithubRepo());
  const publishCommands = input.publishCommands ?? [];
  const dryRunPublishCommands = input.dryRunPublishCommands ?? [];
  const preCommitCommands = input.preCommitCommands ?? [];
  const tagPrefix = path === cwd ? "v" : `${dirname}-v`;
  const since = input.since ?? (await findPreviousTag(tagPrefix));

  const errors: string[] = [];

  if (!githubToken)
    errors.push("GitHub token not provided manually or in the GITHUB_TOKEN env var");
  if (!githubRepo)
    errors.push("GitHub repo not provided manually and could not be inferred from your git origin");

  if (errors.length > 0)
    throw Error("Invalid options:\n" + errors.map((message) => "- " + message).join("\n") + "\n");

  return {
    additionalDirs,
    bump,
    changelogPath,
    commitTemplate,
    cwd,
    dirname,
    dryRun,
    dryRunPublishCommands,
    githubRepo: githubRepo!,
    githubToken: githubToken!,
    latestRelease,
    path,
    preCommitCommands,
    publishCommands,
    relativePath,
    releaseArtifacts,
    releaseNameTemplate,
    since,
    tagPrefix,
    throwOnNoChanges,
    versionFiles,
  };
}
