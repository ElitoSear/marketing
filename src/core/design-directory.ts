import { access, readdir } from "node:fs/promises";
import path from "node:path";
import zod from "zod";

export const slugSchema = zod
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase words joined by hyphens");

export async function fileExists(filePath: string): Promise<boolean> {
  return access(filePath).then(
    () => true,
    () => false,
  );
}

/** Slugs are the folder names of a designs directory; a directory not created yet holds none. */
export async function listDesignSlugs(
  designsDirectory: string,
): Promise<string[]> {
  if (!(await fileExists(designsDirectory))) return [];
  const entries = await readdir(designsDirectory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/** Language codes of the `copy.<language>.json` files in one design folder. */
export async function listDesignLanguages(
  designDirectory: string,
): Promise<string[]> {
  const files = await readdir(designDirectory);
  return files
    .map((file) => /^copy\.(.+)\.json$/.exec(file)?.[1])
    .filter((language) => language !== undefined);
}

/**
 * Narrows what to export to the requested slug and language, rejecting
 * values the project does not have.
 */
export function selectExports(options: {
  kind: string;
  availableSlugs: string[];
  configuredLanguages: string[];
  slug: string | undefined;
  language: string | undefined;
}): { slugs: string[]; languages: string[] } {
  if (options.slug !== undefined && !options.availableSlugs.includes(options.slug))
    throw new Error(
      `Unknown ${options.kind} "${options.slug}". Available: ${options.availableSlugs.join(", ")}`,
    );
  if (
    options.language !== undefined &&
    !options.configuredLanguages.includes(options.language)
  )
    throw new Error(
      `Unknown language "${options.language}". Configured: ${options.configuredLanguages.join(", ")}`,
    );
  return {
    slugs: options.slug === undefined ? options.availableSlugs : [options.slug],
    languages:
      options.language === undefined
        ? options.configuredLanguages
        : [options.language],
  };
}

export function copyFilePath(options: {
  designsDirectory: string;
  slug: string;
  language: string;
}): string {
  return path.join(
    options.designsDirectory,
    options.slug,
    `copy.${options.language}.json`,
  );
}
