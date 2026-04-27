/** Github's getBooleanInput returns false when not provided, we need to use undefined. */

import { getInput, type InputOptions } from "@actions/core";

export function getBoolInput(key: string, options?: InputOptions): boolean | undefined {
  const str = getInput(key, options);
  // Returns "" when not provided
  if (!str) return undefined;

  return str === "true" || str === "True" || str === "TRUE";
}
