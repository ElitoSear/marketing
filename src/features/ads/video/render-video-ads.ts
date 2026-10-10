import { mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { selectExports } from "../../../core/design-directory.ts";
import type { ResolvedMarketingConfig } from "../../../core/load-marketing-config.ts";
import { resolveWorkspaceDirectory } from "../../../core/write-preview-workspace.ts";
import { adLedger } from "../ads-ledger.ts";
import { buildContactSheet, type SheetFrame } from "./build-contact-sheet.ts";
import { loadRemotion, type RemotionApi } from "./load-remotion.ts";
import {
  writeVideoWorkspace,
  type VideoWorkspace,
} from "./write-video-workspace.ts";

export type VideoAdRenderEvent =
  | { kind: "bundling"; percentage: number }
  | { kind: "rendering"; slug: string; language: string; percentage: number }
  | { kind: "rendered"; slug: string; language: string; filePath: string };

/** Bundles the generated Remotion project with Tailwind and the config's import aliases. */
async function bundleVideoAds(options: {
  config: ResolvedMarketingConfig;
  remotion: RemotionApi;
  workspace: VideoWorkspace;
  onEvent: (event: VideoAdRenderEvent) => void;
}): Promise<string> {
  const { config, remotion } = options;
  await remotion.ensureBrowser();
  return remotion.bundle({
    entryPoint: options.workspace.entryPath,
    rootDir: config.configDirectory,
    // Remotion reports bundling as 0 to 100 and rendering as 0 to 1.
    onProgress: (progress) =>
      options.onEvent({ kind: "bundling", percentage: progress / 100 }),
    webpackOverride: (webpackConfig) =>
      remotion.enableTailwind({
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          alias: { ...webpackConfig.resolve?.alias, ...config.aliases },
        },
      }),
  });
}

/**
 * Bundles the video ads with Remotion and renders each one to
 * `<output>/<language>/<slug>.mp4`. Omitting `slug` renders every design;
 * omitting `language` renders every configured language that has copy.
 */
export async function renderVideoAds(options: {
  config: ResolvedMarketingConfig;
  slug: string | undefined;
  language: string | undefined;
  onEvent: (event: VideoAdRenderEvent) => void;
}): Promise<void> {
  const { config } = options;
  const workspace = await writeVideoWorkspace(config);
  const { slugs, languages } = selectExports({
    kind: "video ad",
    availableSlugs: [
      ...new Set(workspace.compositions.map((composition) => composition.slug)),
    ],
    configuredLanguages: config.languages,
    slug: options.slug,
    language: options.language,
  });
  const selected = workspace.compositions.filter(
    (composition) =>
      slugs.includes(composition.slug) && languages.includes(composition.language),
  );
  if (selected.length === 0) return;

  // Fail early if the ledger is malformed, since the next ad depends on it.
  await adLedger.read(config.ads.ledgerPath);

  const remotion = await loadRemotion();
  const serveUrl = await bundleVideoAds({
    config,
    remotion,
    workspace,
    onEvent: options.onEvent,
  });

  for (const composition of selected) {
    const compositionConfig = await remotion.selectComposition({
      serveUrl,
      id: composition.id,
      inputProps: {},
    });
    const directory = path.join(config.ads.outputDirectory, composition.language);
    await mkdir(directory, { recursive: true });
    const filePath = path.join(directory, `${composition.slug}.mp4`);
    await remotion.renderMedia({
      composition: compositionConfig,
      serveUrl,
      codec: "h264",
      outputLocation: filePath,
      inputProps: {},
      onProgress: ({ progress }) =>
        options.onEvent({
          kind: "rendering",
          slug: composition.slug,
          language: composition.language,
          percentage: progress,
        }),
    });
    options.onEvent({
      kind: "rendered",
      slug: composition.slug,
      language: composition.language,
      filePath,
    });
  }
}

/**
 * Where review material (single frames, contact sheets) goes: the generated
 * workspace, never the output folder, which holds only finished assets.
 */
function reviewDirectory(options: {
  config: ResolvedMarketingConfig;
  language: string;
}): string {
  return path.join(
    resolveWorkspaceDirectory(options.config),
    "review",
    options.language,
  );
}

/**
 * Renders one frame of a video ad to a PNG so it can be looked at without
 * encoding the video. The file goes to the review workspace. Returns its path.
 */
export async function renderVideoAdStill(options: {
  config: ResolvedMarketingConfig;
  slug: string;
  language: string;
  frame: number;
  onEvent: (event: VideoAdRenderEvent) => void;
}): Promise<string> {
  const { config } = options;
  const workspace = await writeVideoWorkspace(config);
  const composition = workspace.compositions.find(
    (candidate) =>
      candidate.slug === options.slug && candidate.language === options.language,
  );
  if (composition === undefined)
    throw new Error(
      `No ${options.language} copy for video ad "${options.slug}". Available: ${workspace.compositions.map((candidate) => candidate.id).join(", ")}`,
    );

  const remotion = await loadRemotion();
  const serveUrl = await bundleVideoAds({
    config,
    remotion,
    workspace,
    onEvent: options.onEvent,
  });
  const compositionConfig = await remotion.selectComposition({
    serveUrl,
    id: composition.id,
    inputProps: {},
  });
  const directory = reviewDirectory({ config, language: options.language });
  await mkdir(directory, { recursive: true });
  const filePath = path.join(
    directory,
    `${options.slug}-frame-${String(options.frame).padStart(4, "0")}.png`,
  );
  await remotion.renderStill({
    composition: compositionConfig,
    serveUrl,
    frame: options.frame,
    output: filePath,
    inputProps: {},
  });
  return filePath;
}

/**
 * Renders a frame every `everySeconds` seconds, plus the last frame, and tiles
 * them into one contact sheet PNG in the review workspace. The bundle and the browser are opened once,
 * so a whole video can be reviewed for the cost of a single still.
 */
export async function renderVideoAdSheet(options: {
  config: ResolvedMarketingConfig;
  slug: string;
  language: string;
  everySeconds: number;
  onEvent: (event: VideoAdRenderEvent) => void;
}): Promise<string> {
  const { config } = options;
  const workspace = await writeVideoWorkspace(config);
  const composition = workspace.compositions.find(
    (candidate) =>
      candidate.slug === options.slug && candidate.language === options.language,
  );
  if (composition === undefined)
    throw new Error(
      `No ${options.language} copy for video ad "${options.slug}". Available: ${workspace.compositions.map((candidate) => candidate.id).join(", ")}`,
    );

  const remotion = await loadRemotion();
  const serveUrl = await bundleVideoAds({
    config,
    remotion,
    workspace,
    onEvent: options.onEvent,
  });
  const compositionConfig = await remotion.selectComposition({
    serveUrl,
    id: composition.id,
    inputProps: {},
  });
  const stepInFrames = Math.max(
    1,
    Math.round(options.everySeconds * compositionConfig.fps),
  );
  const lastFrame = compositionConfig.durationInFrames - 1;
  const frameNumbers: number[] = [];
  for (let frame = 0; frame < lastFrame; frame += stepInFrames)
    frameNumbers.push(frame);
  frameNumbers.push(lastFrame);

  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "marketing-sheet-"));
  const browser = await remotion.openBrowser("chrome");
  try {
    const frames: SheetFrame[] = [];
    for (const frame of frameNumbers) {
      const filePath = path.join(temporaryDirectory, `frame-${frame}.png`);
      await remotion.renderStill({
        composition: compositionConfig,
        serveUrl,
        frame,
        output: filePath,
        inputProps: {},
        puppeteerInstance: browser,
      });
      frames.push({
        filePath,
        label: `${(frame / compositionConfig.fps).toFixed(1)}s  f${frame}`,
      });
    }
    const directory = reviewDirectory({ config, language: options.language });
    await mkdir(directory, { recursive: true });
    const outputPath = path.join(directory, `${options.slug}-sheet.png`);
    await buildContactSheet({ frames, columns: 6, tileWidth: 270, outputPath });
    return outputPath;
  } finally {
    await browser.close({ silent: true });
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
