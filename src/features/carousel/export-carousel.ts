import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  copyFilePath,
  fileExists,
  listDesignSlugs,
  selectExports,
} from "../../core/design-directory.ts";
import type { ResolvedMarketingConfig } from "../../core/load-marketing-config.ts";
import { settlePage, withPreviewBrowser } from "../../core/with-preview-browser.ts";
import { CAROUSEL_CANVAS_ID } from "./carousel-config.ts";
import { carouselLedger } from "./carousel-ledger.ts";

export type ExportEvent =
  | { kind: "skipped"; slug: string; language: string }
  | {
      kind: "exported";
      slug: string;
      language: string;
      slideCount: number;
      directory: string;
    };

export function listCarouselSlugs(
  config: ResolvedMarketingConfig,
): Promise<string[]> {
  return listDesignSlugs(config.carousel.designsDirectory);
}

/**
 * Renders each carousel in the installed Chrome and screenshots one
 * slide-sized window per slide. Omitting `slug` exports every design; omitting
 * `language` exports every configured language that has copy.
 */
export async function exportCarousels(options: {
  config: ResolvedMarketingConfig;
  slug: string | undefined;
  language: string | undefined;
  onEvent: (event: ExportEvent) => void;
}): Promise<void> {
  const { config } = options;
  const { designsDirectory, outputDirectory, format } = config.carousel;
  const { slugs, languages } = selectExports({
    kind: "carousel",
    availableSlugs: await listCarouselSlugs(config),
    configuredLanguages: config.languages,
    slug: options.slug,
    language: options.language,
  });

  // Fail early if the ledger is malformed, since the next carousel depends on it.
  await carouselLedger.read(config.carousel.ledgerPath);

  await withPreviewBrowser({
    config,
    run: async ({ page, open, fitViewport }) => {
      await fitViewport(format);
      for (const slug of slugs) {
        for (const language of languages) {
          const hasCopy = await fileExists(
            copyFilePath({ designsDirectory, slug, language }),
          );
          if (!hasCopy && options.language === undefined) {
            options.onEvent({ kind: "skipped", slug, language });
            continue;
          }
          await open({ carousel: slug, language });
          const canvas = page.locator(`#${CAROUSEL_CANVAS_ID}`);
          await canvas.waitFor();
          const slideCount = Number(await canvas.getAttribute("data-slide-count"));
          await settlePage(page);

          const directory = path.join(outputDirectory, language, slug);
          await mkdir(directory, { recursive: true });
          for (let slideIndex = 0; slideIndex < slideCount; slideIndex += 1) {
            const fileName = `slide-${String(slideIndex + 1).padStart(2, "0")}.png`;
            // The viewport stays fixed; shifting the canvas selects the slide
            // window. Scrolling would reserve scrollbar space inside the screenshot.
            await page.evaluate(
              ({ shift, canvasId }) => {
                const canvasElement = document.getElementById(canvasId);
                if (canvasElement === null) throw new Error("Missing carousel canvas");
                canvasElement.style.transform = `translateX(-${shift}px)`;
              },
              { shift: slideIndex * format.width, canvasId: CAROUSEL_CANVAS_ID },
            );
            await page.screenshot({
              path: path.join(directory, fileName),
              clip: { x: 0, y: 0, width: format.width, height: format.height },
            });
          }
          options.onEvent({ kind: "exported", slug, language, slideCount, directory });
        }
      }
    },
  });
}
