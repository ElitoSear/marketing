import { log, spinner } from "@clack/prompts";
import type { Command } from "commander";
import { readdir } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import zod from "zod";
import {
  carouselLedgerEntrySchema,
  readCarouselLedger,
  writeCarouselLedgerEntry,
} from "../features/carousel/carousel-ledger.ts";
import { createCarousel } from "../features/carousel/create-carousel.ts";
import {
  exportCarousels,
  listCarouselSlugs,
  type ExportEvent,
} from "../features/carousel/export-carousel.ts";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";
import { runCommand } from "./run-command.ts";

const exportOptionsSchema = zod.object({
  carousel: zod.string().optional(),
  language: zod.string().optional(),
});

const ledgerOptionsSchema = zod.object({
  slug: carouselLedgerEntrySchema.shape.slug,
  concept: carouselLedgerEntrySchema.shape.concept,
  panoramaThread: carouselLedgerEntrySchema.shape.panorama_thread,
  palette: carouselLedgerEntrySchema.shape.palette,
  layout: carouselLedgerEntrySchema.shape.layout,
  typography: carouselLedgerEntrySchema.shape.typography,
  date: carouselLedgerEntrySchema.shape.created_at.optional(),
});

function describeEvent(event: ExportEvent): string {
  if (event.kind === "skipped")
    return `${pc.yellow("skipped")} ${event.slug} (no ${event.language} copy)`;
  return `${pc.green("exported")} ${event.slug} ${pc.dim(`[${event.language}]`)} ${event.slideCount} slides → ${pc.cyan(event.directory)}`;
}

export function registerCarouselCommands(program: Command) {
  const carousel = program
    .command("carousel")
    .description("Work with carousels");

  carousel
    .command("new")
    .argument("<slug>", "lowercase words joined by hyphens")
    .description("Scaffold a carousel design with copy for every language")
    .action((slug: string) =>
      runCommand({
        title: `New carousel ${slug}`,
        task: async () => {
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const createdPaths = await createCarousel({ config, slug });
          for (const createdPath of createdPaths)
            log.success(path.relative(process.cwd(), createdPath));
          return "Edit design.tsx and the copy files, then run `marketing dev`.";
        },
      }),
    );

  carousel
    .command("list")
    .description("List carousels with their languages")
    .action(() =>
      runCommand({
        title: "Carousels",
        task: async () => {
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const ledger = await readCarouselLedger(config.carousel.ledgerPath);
          const slugs = await listCarouselSlugs(config);
          for (const slug of slugs) {
            const files = await readdir(
              path.join(config.carousel.designsDirectory, slug),
            );
            const languages = files
              .map((file) => /^copy\.(.+)\.json$/.exec(file)?.[1])
              .filter((language) => language !== undefined);
            const concept = ledger.find((entry) => entry.slug === slug)?.concept;
            log.message(
              `${pc.bold(slug)} ${pc.dim(`[${languages.join(", ")}]`)}${concept === undefined ? "" : `\n${pc.dim(concept)}`}`,
            );
          }
          return `${slugs.length} carousel${slugs.length === 1 ? "" : "s"}`;
        },
      }),
    );

  carousel
    .command("export")
    .description("Export carousels to PNGs, one per slide, in the installed Chrome")
    .option("--carousel <slug>", "export only this carousel")
    .option("--language <code>", "export only this language")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Export carousels",
        task: async () => {
          const options = exportOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const events: ExportEvent[] = [];
          const progress = spinner();
          progress.start("Starting preview and Chrome");
          try {
            await exportCarousels({
              config,
              slug: options.carousel,
              language: options.language,
              onEvent: (event) => {
                events.push(event);
                progress.message(describeEvent(event));
              },
            });
          } catch (error) {
            progress.error("Export failed");
            throw error;
          }
          progress.stop("Export finished");
          for (const event of events) log.message(describeEvent(event));
          const exported = events.filter((event) => event.kind === "exported");
          return `${exported.length} export${exported.length === 1 ? "" : "s"} written to ${config.carousel.outputDirectory}`;
        },
      }),
    );

  carousel
    .command("ledger-add")
    .description("Record a finished carousel in the ledger")
    .requiredOption("--slug <slug>")
    .requiredOption("--concept <text>", "one sentence naming the idea")
    .requiredOption("--panorama-thread <text>", "what runs through the slides")
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
          await writeCarouselLedgerEntry({
            ledgerPath: config.carousel.ledgerPath,
            entry: {
              slug: options.slug,
              created_at: options.date ?? new Date().toISOString().slice(0, 10),
              concept: options.concept,
              panorama_thread: options.panoramaThread,
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
