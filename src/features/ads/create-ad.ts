import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  fileExists,
  listDesignSlugs,
  slugSchema,
} from "../../core/design-directory.ts";
import type { ResolvedMarketingConfig } from "../../core/load-marketing-config.ts";
import { PACKAGE_ROOT } from "../../core/package-paths.ts";

export type AdMedium = "image" | "video";

/**
 * Copies the starter design for the medium into `<designs>/<slug>/` with one
 * copy file per configured language. Slugs are unique across both media so
 * exports never share a name. Returns the created paths.
 */
export async function createAd(options: {
  config: ResolvedMarketingConfig;
  medium: AdMedium;
  slug: string;
}): Promise<string[]> {
  const slug = slugSchema.parse(options.slug);
  const { image, video } = options.config.ads;
  const existingSlugs = [
    ...(await listDesignSlugs(image.designsDirectory)),
    ...(await listDesignSlugs(video.designsDirectory)),
  ];
  if (existingSlugs.includes(slug)) throw new Error(`Ad "${slug}" already exists`);

  const designsDirectory = (options.medium === "image" ? image : video)
    .designsDirectory;
  const adDirectory = path.join(designsDirectory, slug);
  if (await fileExists(adDirectory)) throw new Error(`Ad "${slug}" already exists`);

  const templateDirectory = path.join(PACKAGE_ROOT, "templates", "ads", options.medium);
  await mkdir(adDirectory, { recursive: true });
  await cp(path.join(templateDirectory, "design.tsx"), path.join(adDirectory, "design.tsx"));
  await cp(path.join(templateDirectory, "design"), path.join(adDirectory, "design"), {
    recursive: true,
  });
  const createdPaths = [
    path.join(adDirectory, "design.tsx"),
    path.join(adDirectory, "design", "copy-schema.ts"),
  ];
  for (const language of options.config.languages) {
    const copyPath = path.join(adDirectory, `copy.${language}.json`);
    await cp(path.join(templateDirectory, "copy.json"), copyPath);
    createdPaths.push(copyPath);
  }
  return createdPaths;
}
