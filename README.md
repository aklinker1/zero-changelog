<div align="center">

# `@aklinker1/zero-changelog`

[![JSR](https://jsr.io/badges/@aklinker1/zero-changelog)](https://jsr.io/@aklinker1/zero-changelog)
[![NPM Version](https://img.shields.io/npm/v/%40aklinker1%2Fzero-changelog?logo=npm&labelColor=red&color=white)](https://www.npmjs.com/package/@aklinker1/zero-changelog)
[![Docs](https://img.shields.io/badge/API%20Reference-blue?logo=readme&logoColor=white)](https://jsr.io/@aklinker1/zero-changelog/doc)
[![Install Size](https://pkg-size.dev/badge/install/55357)](https://pkg-size.dev/@aklinker1%2Fzero-changelog)

Zero-dependency, conventional commit release and changelog generator with monorepo support

</div>

```sh
bun add @aklinker1/zero-changelog
```

## Features

- 📦 Zero dependencies, [e18e](https://e18e.dev) first
- 🏗️ Monorepo & sub-directory support
- 🛠️ Github Action, JS API, CLI
- 🚀 Runs custom publish scripts
- 📊 Summarize unreleased changes

## Options

Refer to the API reference:

- [Release](https://jsr.io/@aklinker1/zero-changelog/doc/release/~/ReleaseOptions)
- [Sync Releases](https://jsr.io/@aklinker1/zero-changelog/doc/sync-releases/~/SyncReleasesOptions)
- [Summarize Unreleased Commits](https://jsr.io/@aklinker1/zero-changelog/doc/summarize-unreleased-commits/~/SummarizeUnreleasedCommitsOptions)

## Usage

### GitHub Action

```yml
- uses: aklinker1/zero-changelog/actions/release@1.0.0
  with:
    # options...
```

### JS API

```ts
import { release } from "@aklinker1/zero-changelog/release";

await release({
  // options...
});
```

### CLI

> TODO: CLI not implemented yet.

Run any command with `--help` to see available options.

```sh
bun zero-changelog --help
bun zero-changelog release --help
bun zero-changelog sync-releases --help
bun zero-changelog summarize-unreleased-changes --help
```

## Semver

`@aklinker1/zero-changelog` does not implement the entire Semver spec. It only supports the
following types of versions:

- ✅ **Unstable**: `0.[0-9]+.[0-9]+`
  - Examples: `0.0.0`, `0.12.1`, `0.1.9`, `0.20.17`

- ✅ **Prerelease**: `[1-9][0-9]*.0.0-\w+.[0-9]+`
  - Examples: `1.0.0-alpha.1`, `2.0.0-beta.3`, `3.0.0-rc.10`

- ✅ **Stable**: `[1-9][0-9]*.[0-9]+.[0-9]+`
  - Examples: `1.1.0`, `2.0.1`, `3.0.0`

It does NOT support:

- ❌ **Truncated versions** with one or two digits:
  - Examples: `1.0`, `2`
- ❌ **Unstable prereleases**:
  - Examples: `0.2.0-alpha.1`
- ❌ **Non X.0.0 prereleases**:
  - Examples: `1.1.0-rc.1`, `1.0.5-alpha.1`
- ❌ **Other prerelease formats**:
  - Examples: `0.2.0-0.3.2`, `0.2.0-1`

This allows the package to have 0 dependencies.

### Relative Version Bumping

When bumping the version by `major`, `minor`, or `patch`, either by setting the `bump` option or
auto-detecting the type based on commits, there are some special cases where the version may not be
bumped as expected:

1. **Unstable**: The type of semver change will be lowered by 1, so `major` &rarr; `minor`, `minor`
   &rarr; `patch`, `patch` &rarr; `patch`.
   - Examples:
     - `0.1.0` &rarr; `major` &rarr; `0.2.0`
     - `0.1.0` &rarr; `minor` &rarr; `0.1.1`
     - `0.1.0` &rarr; `patch` &rarr; `0.1.1`

2. **Prereleases**: The final integer will always be updated.
   - Examples:
     - `1.0.0-alpha.1` &rarr; `major` &rarr; `1.0.0-alpha.2`
     - `1.0.0-alpha.1` &rarr; `minor` &rarr; `1.0.0-alpha.2`
     - `1.0.0-alpha.1` &rarr; `patch` &rarr; `1.0.0-alpha.2`

So if you want to switch between versions types (stable ↔ unstable ↔ pre-release), like `0.7.5`
&rarr; `1.0.0` or `2.0.0-rc.4` &rarr; `2.0.0`, you need to provide the next version number for the
`bump` option instead of using `major`/`minor`/`patch`:

```ts
await release({
  bump: "2.0.0",
});
```

Otherwise stable versions will remain stable, unstable will remain unstable, and prereleases will
remain prereleases.

## Plan

Release:

1. List git commits
2. Detect type of version bump
3. Generate changelog
4. Bump version in version files
5. Update changelog
6. Git commit & tag
7. Git push
8. Create release

Sync Releases:

1. Parse changelog
2. Update each release to match changelog

Summarize Unreleased Changes:

1. List commits in each directory since the last commit
2. Print and return the summary

## TODO

- [x] Structure for package + action
- [x] Implement tests
- [x] Implement git logic
- [ ] Implement sync releases
- [x] Glob patterns for github action
- [x] Implement unreleased commit summary
- [ ] CLI?
- [x] Implement alpha/beta version bumping
