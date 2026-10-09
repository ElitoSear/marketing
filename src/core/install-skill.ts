import { cp, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { PACKAGE_ROOT } from "./package-paths.ts";

const SKILLS_DIRECTORY = path.join(PACKAGE_ROOT, "skill");

/**
 * Copies the packaged skills, unchanged, into `targetDirectory`. Each skill
 * replaces its previous copy, so running it again after an upgrade updates it.
 * Returns the installed skill names.
 */
export async function installSkills(options: {
  targetDirectory: string;
}): Promise<string[]> {
  const entries = await readdir(SKILLS_DIRECTORY, { withFileTypes: true });
  const skillNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  for (const skillName of skillNames) {
    const destination = path.join(options.targetDirectory, skillName);
    await rm(destination, { recursive: true, force: true });
    await cp(path.join(SKILLS_DIRECTORY, skillName), destination, {
      recursive: true,
    });
  }
  return skillNames;
}
