import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileExists, slugSchema } from "../../core/design-directory.ts";
import type { ResolvedMarketingConfig } from "../../core/load-marketing-config.ts";
import { PACKAGE_ROOT } from "../../core/package-paths.ts";

/**
 * Copies the starter design into `<designs>/<slug>/` with one copy file per
 * configured language. Returns the created paths.
 */
export async function createCarousel(options: {
  config: ResolvedMarketingConfig;
  slug: string;
}): Promise<string[]> {
  const slug = slugSchema.parse(options.slug);
  const carouselDirectory = path.join(options.config.carousel.designsDirectory, slug);
  if (await fileExists(carouselDirectory))
    throw new Error(`Carousel "${slug}" already exists`);

  const templateDirectory = path.join(PACKAGE_ROOT, "templates", "carousel");
  await mkdir(carouselDirectory, { recursive: true });
  await cp(path.join(templateDirectory, "design.tsx"), path.join(carouselDirectory, "design.tsx"));
  await cp(
    path.join(templateDirectory, "design"),
    path.join(carouselDirectory, "design"),
    { recursive: true },
  );
  const createdPaths = [
    path.join(carouselDirectory, "design.tsx"),
    path.join(carouselDirectory, "design", "copy-schema.ts"),
  ];
  for (const language of options.config.languages) {
    const copyPath = path.join(carouselDirectory, `copy.${language}.json`);
    await cp(path.join(templateDirectory, "copy.json"), copyPath);
    createdPaths.push(copyPath);
  }
  return createdPaths;
}
