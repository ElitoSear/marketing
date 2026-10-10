import { log, spinner } from "@clack/prompts";
import type { Command } from "commander";
import path from "node:path";
import pc from "picocolors";
import zod from "zod";
import { listDesignLanguages, listDesignSlugs } from "../core/design-directory.ts";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";
import { adLedger, adLedgerEntrySchema } from "../features/ads/ads-ledger.ts";
import { createAd } from "../features/ads/create-ad.ts";
import {
  exportImageAds,
  listImageAdSlugs,
  type ImageAdExportEvent,
} from "../features/ads/image/export-image-ad.ts";
import {
  renderVideoAds,
  renderVideoAdSheet,
  renderVideoAdStill,
  type VideoAdRenderEvent,
} from "../features/ads/video/render-video-ads.ts";
import { startVideoStudio } from "../features/ads/video/start-video-studio.ts";
import { runCommand } from "./run-command.ts";

const mediumSchema = zod.enum(["image", "video"]);

const newOptionsSchema = zod.object({ medium: mediumSchema });

const exportOptionsSchema = zod.object({
  ad: zod.string().optional(),
  language: zod.string().optional(),
  medium: mediumSchema.optional(),
});

const stillOptionsSchema = zod.object({
  ad: zod.string().min(1),
  language: zod.string().optional(),
  frame: zod.coerce.number().int().nonnegative(),
});

const sheetOptionsSchema = zod.object({
  ad: zod.string().min(1),
  language: zod.string().optional(),
  every: zod.coerce.number().positive(),
});

const studioOptionsSchema = zod.object({
  port: zod.coerce.number().int().optional(),
});

const ledgerOptionsSchema = zod.object({
  slug: adLedgerEntrySchema.shape.slug,
  medium: adLedgerEntrySchema.shape.medium,
  concept: adLedgerEntrySchema.shape.concept,
  hook: adLedgerEntrySchema.shape.hook,
  palette: adLedgerEntrySchema.shape.palette,
  layout: adLedgerEntrySchema.shape.layout,
  typography: adLedgerEntrySchema.shape.typography,
  date: adLedgerEntrySchema.shape.created_at.optional(),
});

type ExportEvent = ImageAdExportEvent | VideoAdRenderEvent;

function describeEvent(event: ExportEvent): string | undefined {
  switch (event.kind) {
    case "skipped":
      return `${pc.yellow("skipped")} ${event.slug} (no ${event.language} copy)`;
    case "exported":
    case "rendered":
      return `${pc.green(event.kind)} ${event.slug} ${pc.dim(`[${event.language}]`)} → ${pc.cyan(event.filePath)}`;
    case "bundling":
      return `Bundling video ads ${Math.round(event.percentage * 100)}%`;
    case "rendering":
      return `Rendering ${event.slug} [${event.language}] ${Math.round(event.percentage * 100)}%`;
  }
}

export function registerAdsCommands(program: Command) {
  const ads = program
    .command("ads")
    .description("Work with ads: image ads (PNG) and video ads (MP4, Remotion)");

  ads
    .command("new")
    .argument("<slug>", "lowercase words joined by hyphens")
    .requiredOption("--medium <medium>", "image or video")
    .description("Scaffold an ad design with copy for every language")
    .action((slug: string, rawOptions: unknown) =>
      runCommand({
        title: `New ad ${slug}`,
        task: async () => {
          const options = newOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const createdPaths = await createAd({
            config,
            medium: options.medium,
            slug,
          });
          for (const createdPath of createdPaths)
            log.success(path.relative(process.cwd(), createdPath));
          return options.medium === "image"
            ? "Edit design.tsx and the copy files, then run `marketing dev`."
            : "Edit design.tsx and the copy files, then run `marketing ads studio`.";
        },
      }),
    );

  ads
    .command("list")
    .description("List ads with their medium, languages and ledger concepts")
    .action(() =>
      runCommand({
        title: "Ads",
        task: async () => {
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const ledger = await adLedger.read(config.ads.ledgerPath);
          let count = 0;
          for (const medium of ["image", "video"] as const) {
            const designsDirectory = config.ads[medium].designsDirectory;
            for (const slug of await listDesignSlugs(designsDirectory)) {
              const languages = await listDesignLanguages(
                path.join(designsDirectory, slug),
              );
              const concept = ledger.find((entry) => entry.slug === slug)?.concept;
              log.message(
                `${pc.bold(slug)} ${pc.dim(`${medium} [${languages.join(", ")}]`)}${concept === undefined ? "" : `\n${pc.dim(concept)}`}`,
              );
              count += 1;
            }
          }
          return `${count} ad${count === 1 ? "" : "s"}`;
        },
      }),
    );

  ads
    .command("export")
    .description(
      "Export ads: image ads to PNG in the installed Chrome, video ads to MP4 with Remotion",
    )
    .option("--ad <slug>", "export only this ad")
    .option("--language <code>", "export only this language")
    .option("--medium <medium>", "export only image or video ads")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Export ads",
        task: async () => {
          const options = exportOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const imageSlugs = await listImageAdSlugs(config);
          const videoSlugs = await listDesignSlugs(config.ads.video.designsDirectory);
          if (
            options.ad !== undefined &&
            !imageSlugs.includes(options.ad) &&
            !videoSlugs.includes(options.ad)
          )
            throw new Error(
              `Unknown ad "${options.ad}". Available: ${[...imageSlugs, ...videoSlugs].join(", ")}`,
            );
          // A named ad runs only in the medium that has it.
          const includeImage =
            options.medium !== "video" &&
            (options.ad === undefined || imageSlugs.includes(options.ad));
          const includeVideo =
            options.medium !== "image" &&
            (options.ad === undefined || videoSlugs.includes(options.ad));

          const events: ExportEvent[] = [];
          const progress = spinner();
          progress.start("Starting");
          const onEvent = (event: ExportEvent) => {
            const description = describeEvent(event);
            if (event.kind === "exported" || event.kind === "rendered" || event.kind === "skipped")
              events.push(event);
            if (description !== undefined) progress.message(description);
          };
          try {
            if (includeImage)
              await exportImageAds({
                config,
                slug: options.ad,
                language: options.language,
                onEvent,
              });
            if (includeVideo)
              await renderVideoAds({
                config,
                slug: options.ad,
                language: options.language,
                onEvent,
              });
          } catch (error) {
            progress.error("Export failed");
            throw error;
          }
          progress.stop("Export finished");
          for (const event of events) {
            const description = describeEvent(event);
            if (description !== undefined) log.message(description);
          }
          const written = events.filter((event) => event.kind !== "skipped");
          return `${written.length} export${written.length === 1 ? "" : "s"} written to ${config.ads.outputDirectory}`;
        },
      }),
    );

  ads
    .command("still")
    .description("Render one frame of a video ad to a PNG to look at it")
    .requiredOption("--ad <slug>", "the video ad")
    .requiredOption("--frame <number>", "frame to render, counted from 0")
    .option("--language <code>", "defaults to the first configured language")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Video ad frame",
        task: async () => {
          const options = stillOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const [defaultLanguage] = config.languages;
          if (defaultLanguage === undefined)
            throw new Error("The config lists no languages");
          const filePath = await renderVideoAdStill({
            config,
            slug: options.ad,
            language: options.language ?? defaultLanguage,
            frame: options.frame,
            onEvent: () => undefined,
          });
          return `Frame written to ${filePath}`;
        },
      }),
    );

  ads
    .command("sheet")
    .description(
      "Render a frame every few seconds of a video ad into one contact sheet PNG to judge its motion",
    )
    .requiredOption("--ad <slug>", "the video ad")
    .option("--every <seconds>", "seconds between frames", "1")
    .option("--language <code>", "defaults to the first configured language")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Video ad contact sheet",
        task: async () => {
          const options = sheetOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const [defaultLanguage] = config.languages;
          if (defaultLanguage === undefined)
            throw new Error("The config lists no languages");
          const filePath = await renderVideoAdSheet({
            config,
            slug: options.ad,
            language: options.language ?? defaultLanguage,
            everySeconds: options.every,
            onEvent: () => undefined,
          });
          return `Contact sheet written to ${filePath}`;
        },
      }),
    );

  ads
    .command("studio")
    .description("Open Remotion Studio on the video ads")
    .option("--port <port>", "port to listen on")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Remotion Studio",
        task: async () => {
          const options = studioOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          await startVideoStudio({ config, port: options.port });
          return "Studio closed.";
        },
      }),
    );

  ads
    .command("ledger-add")
    .description("Record a finished ad in the ledger")
    .requiredOption("--slug <slug>")
    .requiredOption("--medium <medium>", "image or video")
    .requiredOption("--concept <text>", "one sentence naming the idea")
    .requiredOption("--hook <text>", "what stops the scroll in the first second")
    .requiredOption("--palette <text>", "colors in words")
    .requiredOption("--layout <text>", "composition logic")
    .requiredOption("--typography <text>", "type voices and sizes")
    .option("--date <yyyy-mm-dd>", "defaults to today")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Add ledger entry",
        task: async () => {
          const options = ledgerOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          await adLedger.write({
            ledgerPath: config.ads.ledgerPath,
            entry: {
              slug: options.slug,
              medium: options.medium,
              created_at: options.date ?? new Date().toISOString().slice(0, 10),
              concept: options.concept,
              hook: options.hook,
              palette: options.palette,
              layout: options.layout,
              typography: options.typography,
            },
          });
          return `Ledger updated for ${options.slug}`;
        },
      }),
    );
}
