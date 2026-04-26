export type ConventionalCommit = {
  type: string;
  scope?: string;
  description: string;
  body?: string;
  isBreaking: boolean;
  footers: Array<{
    /**
     * Lowercase footer key.
     *
     * @example
     *   "Co-authored-by: Aaron <aaron@example.com>"; // key: "co-authored-by"
     */
    key: string;
    /**
     * @example
     *   "Co-authored-by: Aaron <aaron@example.com>"; // value: "Aaron <aaron@example.com>"
     */
    value: string;
  }>;
  authors: Array<{
    name: string;
    email: string;
  }>;
};
