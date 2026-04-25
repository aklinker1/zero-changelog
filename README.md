# zero-changelog

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

Summarize unreleased changes

1. List commits in each directory since the last commit
2. Print and return the summary

GitHub Actions?

- Release
- Sync Releases
- Summarize unreleased

## TODO

- [x] Structure for package + action
- [ ] Implement tests
- [ ] Implement git logic
- [ ] Implement sync releases
- [ ] Glob patterns for github action
- [ ] Implement unreleased commit summary
- [ ] CLI?
