<div align="center">

# `@aklinker1/zero-changelog`

[![JSR](https://jsr.io/badges/@aklinker1/zero-changelog)](https://jsr.io/@aklinker1/zero-changelog) [![NPM Version](https://img.shields.io/npm/v/%40aklinker1%2Fmcp-server-sdk?logo=npm&labelColor=red&color=white)](https://www.npmjs.com/package/@aklinker1/zero-changelog) [![Docs](https://img.shields.io/badge/API%20Reference-blue?logo=readme&logoColor=white)](https://jsr.io/@aklinker1/zero-changelog/doc) [![Install Size](https://pkg-size.dev/badge/install/61804)](https://pkg-size.dev/@aklinker1%2Fmcp-server-sdk)

Zero-dependency, conventional commit release and changelog generator with monorepo support

</div>

```sh
bun add @aklinker1/zero-changelog
```

## Features

- 📦 Zero dependencies, [e18e](https://e18e.dev) first
- 🏗️ Monorepo & sub-directory support
- 🛠️ CLI, JS API, Github Action
- 🚀 Runs custom publish scripts
- 📊 Summarize unreleased changes

## Options

Refer to the API reference:

- [Release](https://jsr.io/@aklinker1/zero-ioc/doc/release/~/ReleaseOptions)
- [Sync Releases](https://jsr.io/@aklinker1/zero-ioc/doc/sync-releases/~/SyncReleasesOptions)
- [Summarize Unreleased Commits](https://jsr.io/@aklinker1/zero-ioc/doc/summarize-unreleased-commits/~/SummarizeUnreleasedCommitsOptions)

## Usage

### JS API

```ts
import { release } from "@aklinker1/zero-changelog/release";

await release({
  // options...
});
```

### GitHub Action

```yml
- uses: aklinker1/zero-changelog/actions/release@1.0.0
  with:
    # options...
```

### CLI

> TODO: CLI not implemented yet.

Run the command with `--help` to see available options.

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
- [ ] Implement tests
- [x] Implement git logic
- [ ] Implement sync releases
- [ ] Glob patterns for github action
- [ ] Implement unreleased commit summary
- [ ] CLI?
