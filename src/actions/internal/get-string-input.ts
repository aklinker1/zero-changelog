import { getInput, type InputOptions } from "@actions/core";

export function getStringInput(key: string, options?: InputOptions): string | undefined {
  // getInput returns a blank string when the input is not provided. We need `undefined`
  return getInput(key, options) || undefined;
}
