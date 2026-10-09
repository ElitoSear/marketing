import { access, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import { CAROUSEL_CANVAS_ID } from "./carousel-config.ts";
import { readCarouselLedger } from "./carousel-ledger.ts";
import { createPreviewServer, PREVIEW_PAGE_PATH } from "../../core/create-preview-server.ts";
import type { ResolvedMarketingConfig } from "../../core/load-marketing-config.ts";

export type ExportEvent =
  | { kind: "skipped"; slug: string; language: string }
  | {
      kind: "exported";
      slug: string;
      language: string;
      slideCount: number;
      directory: string;
    };

export async function listCarouselSlugs(
  config: ResolvedMarketingConfig,
): Promise<string[]> {
  const entries = await readdir(config.carousel.designsDirectory, {
    withFileTypes: true,
  });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function fileExists(filePath: string): Promise<boolean> {
  return access(filePath).then(
    () => true,
    () => false,
  );
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
  const { width, height } = config.carousel.format;
  const availableSlugs = await listCarouselSlugs(config);
  if (options.slug !== undefined && !availableSlugs.includes(options.slug))
    throw new Error(
      `Unknown carousel "${options.slug}". Available: ${availableSlugs.join(", ")}`,
    );
  if (options.language !== undefined && !config.languages.includes(options.language))
    throw new Error(
      `Unknown language "${options.language}". Configured: ${config.languages.join(", ")}`,
    );
  const slugs = options.slug === undefined ? availableSlugs : [options.slug];
  const languages =
    options.language === undefined ? config.languages : [options.language];

  // Fail early if the ledger is malformed, since the next carousel depends on it.
  await readCarouselLedger(config.carousel.ledgerPath);

  const server = await createPreviewServer({
    config,
    port: undefined,
    exportMode: true,
  });
  await server.listen();
  const baseUrl = server.resolvedUrls?.local[0];
  if (baseUrl === undefined) throw new Error("Vite did not report a local URL");

  // Uses the installed Chrome so no browser download is needed.
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({
      // Chrome leaves the last ~10px of a viewport unpainted (white), so the
      // viewport is larger than a slide and the screenshot is clipped to it.
      viewport: { width: width + 100, height: height + 100 },
    });
    await page.addInitScript(() => {
      document.documentElement.style.overflow = "hidden";
    });
    // With a cold dependency cache, Vite re-optimizes while the first page
    // loads and that page keeps stale modules (hot reload is off). The index
    // page imports every design, so loading it twice lets the cache settle
    // before any slide is captured.
    for (let warmUpRound = 0; warmUpRound < 2; warmUpRound += 1) {
      await page.goto(`${baseUrl.replace(/\/$/, "")}${PREVIEW_PAGE_PATH}`);
      await page.waitForLoadState("networkidle");
    }
    for (const slug of slugs) {
      for (const language of languages) {
        const hasCopy = await fileExists(
          path.join(config.carousel.designsDirectory, slug, `copy.${language}.json`),
        );
        if (!hasCopy && options.language === undefined) {
          options.onEvent({ kind: "skipped", slug, language });
          continue;
        }
        await page.goto(
          `${baseUrl.replace(/\/$/, "")}${PREVIEW_PAGE_PATH}?carousel=${slug}&language=${language}&export=true`,
        );
        const canvas = page.locator(`#${CAROUSEL_CANVAS_ID}`);
        await canvas.waitFor();
        const slideCount = Number(await canvas.getAttribute("data-slide-count"));
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            Array.from(document.images).map((image) => image.decode()),
          );
        });

        const directory = path.join(config.carousel.outputDirectory, language, slug);
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
            { shift: slideIndex * width, canvasId: CAROUSEL_CANVAS_ID },
          );
          await page.screenshot({
            path: path.join(directory, fileName),
            clip: { x: 0, y: 0, width, height },
          });
        }
        options.onEvent({ kind: "exported", slug, language, slideCount, directory });
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
}
