import { setFailed } from "@actions/core";

try {
  console.log("TODO");
  setFailed("TODO");
} catch (err) {
  setFailed(err instanceof Error ? err.message : String(err));
}
