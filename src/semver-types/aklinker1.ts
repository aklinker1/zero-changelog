/**
 * [Aaron](https://github.com/aklinker1)'s preferred semver type map.
 *
 * @module semver-types/aklinker1
 */
import type { SemverTypeMap } from "../semver-type-map";

const types: SemverTypeMap = {
  feat: { title: "🚀 Features", bump: "minor" },
  perf: { title: "🔥 Performance", bump: "patch" },
  fix: { title: "🩹 Fixes", bump: "patch" },
  refactor: { title: "💅 Refactors", bump: "patch" },
  docs: { title: "📖 Documentation", bump: "patch" },
  build: { title: "📦 Build", bump: "patch" },
  types: { title: "🌊 Types", bump: "patch" },
  chore: { title: "🏡 Chore" },
  examples: { title: "🏀 Examples" },
  test: { title: "✅ Tests" },
  style: { title: "🎨 Styles" },
  ci: { title: "🤖 CI" },
};

export default types;
