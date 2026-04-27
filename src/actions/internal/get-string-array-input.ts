import { getMultilineInput, type InputOptions } from "@actions/core";

export function getStringArrayInput(key: string, options?: InputOptions): string[] | undefined {
  const lines = getMultilineInput(key, options);
  // Defaults to [], which we don't care about
  if (lines.length === 0) return undefined;

  return lines;
}
