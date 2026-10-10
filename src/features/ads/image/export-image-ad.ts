import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  copyFilePath,
  fileExists,
  listDesignSlugs,
  selectExports,
} from "../../../core/design-directory.ts";
import type { ResolvedMarketingConfig } from "../../../core/load-marketing-config.ts";
import { settlePage, withPreviewBrowser } from "../../../core/with-preview-browser.ts";
import { AD_CANVAS_ID } from "../ads-config.ts";
import { adLedger } from "../ads-ledger.ts";

export type ImageAdExportEvent =
  | { kind: "skipped"; slug: string; language: string }
  | { kind: "exported"; slug: string; language: string; filePath: string };

export function listImageAdSlugs(
  config: ResolvedMarketingConfig,
): Promise<string[]> {
  return listDesignSlugs(config.ads.image.designsDirectory);
}

/**
 * Renders each image ad in the installed Chrome and screenshots its canvas to
 * `<output>/<language>/<slug>.png`. Omitting `slug` exports every design;
 * omitting `language` exports every configured language that has copy.
 */
export async function exportImageAds(options: {
  config: ResolvedMarketingConfig;
  slug: string | undefined;
  language: string | undefined;
  onEvent: (event: ImageAdExportEvent) => void;
}): Promise<void> {
  const { config } = options;
  const { designsDirectory } = config.ads.image;
  const { slugs, languages } = selectExports({
    kind: "image ad",
    availableSlugs: await listImageAdSlugs(config),
    configuredLanguages: config.languages,
    slug: options.slug,
    language: options.language,
  });
  if (slugs.length === 0) return;

  // Fail early if the ledger is malformed, since the next ad depends on it.
  await adLedger.read(config.ads.ledgerPath);

  await withPreviewBrowser({
    config,
    run: async ({ page, open, fitViewport }) => {
      for (const slug of slugs) {
        for (const language of languages) {
          const hasCopy = await fileExists(
            copyFilePath({ designsDirectory, slug, language }),
          );
          if (!hasCopy && options.language === undefined) {
            options.onEvent({ kind: "skipped", slug, language });
            continue;
          }
          await open({ ad: slug, language });
          const canvas = page.locator(`#${AD_CANVAS_ID}`);
          await canvas.waitFor();
          const width = Number(await canvas.getAttribute("data-width"));
          const height = Number(await canvas.getAttribute("data-height"));
          await fitViewport({ width, height });
          await settlePage(page);

          const directory = path.join(config.ads.outputDirectory, language);
          await mkdir(directory, { recursive: true });
          const filePath = path.join(directory, `${slug}.png`);
          await page.screenshot({
            path: filePath,
            clip: { x: 0, y: 0, width, height },
          });
          options.onEvent({ kind: "exported", slug, language, filePath });
        }
      }
    },
  });
}
