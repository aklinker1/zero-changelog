export type GitCommit = {
  hash: string;
  author: { name: string; email: string };
  subject: string;
  body: string | undefined;
  date: Date;
};
