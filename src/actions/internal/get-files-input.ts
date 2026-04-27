import type { InputOptions } from "@actions/core";
import { create as createGlob } from "@actions/glob";

import { getStringArrayInput } from "./get-string-array-input";

export async function getFilesInput(
  key: string,
  options?: InputOptions,
): Promise<string[] | undefined> {
  const lines = getStringArrayInput(key, options);
  if (!lines) return undefined;

  const globber = await createGlob(lines.join("\n"));
  return await globber.glob();
}
