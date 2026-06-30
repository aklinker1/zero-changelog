# Changelog

## v0.2.0

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.11...v0.2.0)

### 🚀 Features

- Use GitHub usernames in release notes ([#11](https://github.com/aklinker1/zero-changelog/pull/11))

### 🩹 Fixes

- Change "Release completed in ..." to "Completed in ..." ([`7a557cd`](https://github.com/aklinker1/zero-changelog/commit/7a557cd2dfffe66d0042d7018291522db49ef8e6))
- Better breaking change summaries ([#12](https://github.com/aklinker1/zero-changelog/pull/12))

### 📖 Documentation

- Update README ([`5e468f9`](https://github.com/aklinker1/zero-changelog/commit/5e468f9267dd78233bc79917bae8f1e89da90deb))

### ⚠️ Breaking Changes

- [#11](https://github.com/aklinker1/zero-changelog/pull/11): Separate arguments for \`getReleaseNotes\` have been

### ❤️ Contributors

- [@aklinker1](https://github.com/aklinker1)


## v0.1.11

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.10...v0.1.11)

### 🚀 Features

- Add PR links to release notes MD ([`009d279`](https://github.com/aklinker1/zero-changelog/commit/009d279db0ba39958618fa4573ae88d41974c307))
- Format the logs to look good ([#10](https://github.com/aklinker1/zero-changelog/pull/10))
- Add pre-commit commands option ([`7778218`](https://github.com/aklinker1/zero-changelog/commit/777821811961132e4334bb122a22a79a809c806b))

### 🩹 Fixes

- Don't print "Release created" log during dry runs ([`8bd43e5`](https://github.com/aklinker1/zero-changelog/commit/8bd43e5e70032bfc28b7b23a72e0548fcca0725a))

### 🤖 CI

- Only run pkg.pr.new on pushes to `main` and PRs ([`dff7510`](https://github.com/aklinker1/zero-changelog/commit/dff7510856eab3f5b1cd68f4bafb032c618cafea))

### ❤️ Contributors

- github-actions[bot] <github-actions[bot]@users.noreply.github.com>
- Aaron <aaronklinker1@gmail.com>

## v0.1.10

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.9...v0.1.10)

### 🚀 Features

- Include breaking change footer in release notes ([`d58bae2`](https://github.com/aklinker1/zero-changelog/commit/d58bae2fbf85f1ab70cb0156cbfe3ee14b6e04a9))

### 🩹 Fixes

- Add commit hash to changelog lines without PR number ([`61c44a2`](https://github.com/aklinker1/zero-changelog/commit/61c44a2dab41993e6b85d1dd9cee6158c57ab0c5))
- Update default `commitTemplate` to use `{{tag}}` instead of `v{{version}}` ([`b1edf22`](https://github.com/aklinker1/zero-changelog/commit/b1edf22fc51cbed70d9223d7dd7d910f1ae3703f))

### ❤️ Contributors

- Aaron <aaronklinker1@gmail.com>

## v0.1.9

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.8...v0.1.9)

### 🩹 Fixes

- **github-actions**: Fix typo in `releaseNameTemplate` input definition

### ❤️ Contributors

- Aaron <aaronklinker1@gmail.com>

## v0.1.8

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.7...v0.1.8)

### 🩹 Fixes

- Write changelog to specified `path`, not current directory

### ❤️ Contributors

- Aaron <aaronklinker1@gmail.com>

## v0.1.7

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.6...v0.1.7)

### 🩹 Fixes

- Commit changes before publishing, push after

### ❤️ Contributors

- Aaron <aaronklinker1@gmail.com>

## v0.1.6

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.5...v0.1.6)

### 🩹 Fixes

- Use `--merged=HEAD` when looking up previous git tag so only ones in the current commit history are included (#7)

### 📖 Documentation

- Update install size badge

### 🏡 Chore

- Cleanup formatting
- Don't format changelog

### ❤️ Contributors

- Aaron <aaronklinker1@gmail.com>

## v0.1.5

[compare changes](https://github.com/aklinker1/zero-changelog/compare/v0.1.4...v0.1.5)

### 🚀 Features

- Commit changelog when created for the first time

### 🏡 Chore

- Fix make_latest option on github release

### ❤️ Contributors

- Aaron <aaronklinker1@gmail.com>
