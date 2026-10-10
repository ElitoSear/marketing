/**
 * Remotion is an optional peer dependency (its license differs from this
 * package's), so it is loaded only by the video commands.
 */
export const REMOTION_PACKAGES = [
  "remotion",
  "@remotion/bundler",
  "@remotion/renderer",
  "@remotion/cli",
  "@remotion/tailwind-v4",
] as const;

export interface RemotionApi {
  bundle: typeof import("@remotion/bundler").bundle;
  ensureBrowser: typeof import("@remotion/renderer").ensureBrowser;
  renderMedia: typeof import("@remotion/renderer").renderMedia;
  selectComposition: typeof import("@remotion/renderer").selectComposition;
  renderStill: typeof import("@remotion/renderer").renderStill;
  openBrowser: typeof import("@remotion/renderer").openBrowser;
  enableTailwind: typeof import("@remotion/tailwind-v4").enableTailwind;
}

export async function loadRemotion(): Promise<RemotionApi> {
  try {
    const [bundler, renderer, tailwind] = await Promise.all([
      import("@remotion/bundler"),
      import("@remotion/renderer"),
      import("@remotion/tailwind-v4"),
    ]);
    return {
      bundle: bundler.bundle,
      ensureBrowser: renderer.ensureBrowser,
      renderMedia: renderer.renderMedia,
      selectComposition: renderer.selectComposition,
      renderStill: renderer.renderStill,
      openBrowser: renderer.openBrowser,
      enableTailwind: tailwind.enableTailwind,
    };
  } catch (error) {
    throw new Error(
      `Video ads need Remotion. Install the same exact version of: ${REMOTION_PACKAGES.join(", ")}. Check the Remotion license terms for your company before using it.`,
      { cause: error },
    );
  }
}
