import { access, cp, mkdir } from "node:fs/promises";
import path from "node:path";
import zod from "zod";
import type { ResolvedMarketingConfig } from "../../core/load-marketing-config.ts";
import { PACKAGE_ROOT } from "../../core/package-paths.ts";

const slugSchema = zod
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase words joined by hyphens");

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
  const exists = await access(carouselDirectory).then(
    () => true,
    () => false,
  );
  if (exists) throw new Error(`Carousel "${slug}" already exists`);

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
