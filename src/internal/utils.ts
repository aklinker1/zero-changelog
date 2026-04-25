export type NullablyRequired<T> = { [P in keyof T & keyof any]: T[P] };

/**
 * Replaces a regex group in a string with a replacement value. Only replaces the first match.
 *
 * @param text The string to search in.
 * @param regexp The regex pattern to match. Must include a named group `replace`.
 * @param replacement The value to replace the matched group with.
 * @returns The modified string with the replacement applied.
 */
export function replaceRegexGroup(
  text: string,
  regexp: RegExp,
  group: string,
  replacement: string,
): string {
  const match = text.match(regexp);
  if (!match?.groups?.[group]) return text;

  const fullMatch = match[0];
  const toReplace = match.groups[group];

  const newMatch = fullMatch.replace(toReplace, replacement);

  return text.replace(regexp, newMatch);
}

export function template(
  template: string,
  vars: Record<string, string | number | boolean>,
): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) =>
      acc.replace(new RegExp(`\\{\\{\\s*?${key}\\s*?\\}\\}`, "g"), String(value)),
    template,
  );
}
