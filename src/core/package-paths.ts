import { fileURLToPath } from "node:url";

/** Root of this package: two levels above this file in both `src` and `dist`. */
export const PACKAGE_ROOT = fileURLToPath(new URL("../..", import.meta.url));
