export type SemverType = {
  /** The title of the section for this type of commit in the changelog. */
  title: string;
  /**
   * Describe how this type of conventional commit should bump the version when detecting the type
   * of version bump based on the commits.
   */
  bump?: "minor" | "patch";
};
