import { basename } from "node:path";

export const PACKAGE_JSON_VERSION_REGEX = /"version":\s*?"(?<version>)"/;
export const PACKAGE_YAML_VERSION_REGEX = /["']?version["']?:\s+?["']?(?<version>)["']?/;
export const CARGO_TOML_VERSION_REGEX = /^version\s*=\s*"(?<version>\w*?)"/;

export function getVersionRegexFor(versionFile: string): RegExp {
  const filename = basename(versionFile);

  switch (filename) {
    case "package.json":
    case "package.jsonc":
    case "package.json5":
    case "deno.json":
    case "deno.jsonc":
    case "jsr.json":
    case "jsr.jsonc":
      return PACKAGE_JSON_VERSION_REGEX;
    case "package.yaml":
    case "package.yml":
      return PACKAGE_YAML_VERSION_REGEX;
    case "Cargo.toml":
      return CARGO_TOML_VERSION_REGEX;
    default:
      throw new Error(`Unknown version file: ${filename}`);
  }
}
