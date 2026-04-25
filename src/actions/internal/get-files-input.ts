import { getMultilineInput, type InputOptions } from "@actions/core";
import { create as createGlob } from "@actions/glob";

export async function getFilesInput(key: string, options?: InputOptions): Promise<string[]> {
  const lines = getMultilineInput(key, options);
  const globber = await createGlob(lines.join("\n"));
  return await globber.glob();
}
