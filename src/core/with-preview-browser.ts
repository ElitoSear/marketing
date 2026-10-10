import { chromium, type Page } from "playwright-core";
import { createPreviewServer, PREVIEW_PAGE_PATH } from "./create-preview-server.ts";
import type { ResolvedMarketingConfig } from "./load-marketing-config.ts";
import type { MediaFormat } from "./media-format.ts";

export interface PreviewBrowserSession {
  page: Page;
  /** Loads one asset in export mode and waits until its fonts and images are ready. */
  open: (query: Record<string, string>) => Promise<void>;
  /** Sizes the viewport to a format, with room for Chrome's unpainted edge. */
  fitViewport: (format: Pick<MediaFormat, "width" | "height">) => Promise<void>;
}

/**
 * Starts the preview server and the installed Chrome (so no browser download
 * is needed), warms the dependency cache and hands a page to `run`. Both are
 * closed afterwards, even when `run` throws.
 */
export async function withPreviewBrowser<Result>(options: {
  config: ResolvedMarketingConfig;
  run: (session: PreviewBrowserSession) => Promise<Result>;
}): Promise<Result> {
  const server = await createPreviewServer({
    config: options.config,
    port: undefined,
    exportMode: true,
  });
  await server.listen();
  const localUrl = server.resolvedUrls?.local[0];
  if (localUrl === undefined) throw new Error("Vite did not report a local URL");
  const pageUrl = `${localUrl.replace(/\/$/, "")}${PREVIEW_PAGE_PATH}`;

  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      document.documentElement.style.overflow = "hidden";
    });
    // With a cold dependency cache, Vite re-optimizes while the first page
    // loads and that page keeps stale modules (hot reload is off). The index
    // page imports every design, so loading it twice lets the cache settle
    // before anything is captured.
    for (let warmUpRound = 0; warmUpRound < 2; warmUpRound += 1) {
      await page.goto(pageUrl);
      await page.waitForLoadState("networkidle");
    }
    return await options.run({
      page,
      fitViewport: (format) =>
        // Chrome leaves the last ~10px of a viewport unpainted (white), so the
        // viewport is larger than the media and screenshots are clipped to it.
        page.setViewportSize({
          width: format.width + 100,
          height: format.height + 100,
        }),
      open: async (query) => {
        await page.goto(
          `${pageUrl}?${new URLSearchParams({ ...query, export: "true" })}`,
        );
        await page.waitForLoadState("load");
      },
    });
  } finally {
    await browser.close();
    await server.close();
  }
}

/** Waits for web fonts and decodes every image so a screenshot never catches a half-loaded page. */
export async function settlePage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((image) => image.decode()));
  });
}
