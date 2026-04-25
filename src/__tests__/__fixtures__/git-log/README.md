To generate a git log, run:

```sh
bun src/__tests__/__fixtures__/git-log/generate.ts <repoName> <rootDir> <sinceRef> <toRef> [...paths]
```

For example:

```sh
bun src/__tests__/__fixtures__/git-log/generate.ts "wxt" "/path/to/wxt" "wxt-v0.20.14" "wxt-v0.20.15" "packages/wxt" "scripts"
```
