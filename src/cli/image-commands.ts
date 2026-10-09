import { log, spinner } from "@clack/prompts";
import type { Command } from "commander";
import path from "node:path";
import pc from "picocolors";
import zod from "zod";
import { generateImageFile } from "../core/generate-image.ts";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";
import { removeBackground, resolveModelCacheDirectory } from "../core/remove-background.ts";
import { runCommand } from "./run-command.ts";

const generateOptionsSchema = zod.object({
  prompt: zod.string().min(1),
  output: zod.string().min(1),
  input: zod.array(zod.string()),
  model: zod.string().optional(),
  aspectRatio: zod.templateLiteral([zod.number(), ":", zod.number()]).optional(),
});

const removeBackgroundOptionsSchema = zod.object({
  input: zod.string().min(1),
  output: zod.string().min(1),
});

function collectValues(value: string, previous: string[]): string[] {
  return [...previous, value];
}

export function registerImageCommands(program: Command) {
  const image = program.command("image").description("Create and edit images");

  image
    .command("generate")
    .description("Generate an image with the provider from marketing.config.ts")
    .requiredOption("--prompt <text>", "what to generate")
    .requiredOption("--output <path>", "output path without extension")
    .option("--input <path>", "reference or source image (repeatable)", collectValues, [])
    .option("--model <name>", "overrides the configured model")
    .option("--aspect-ratio <ratio>", "for example 1:1 or 4:5")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Generate image",
        task: async () => {
          const options = generateOptionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({ startDirectory: process.cwd() });
          const progress = spinner();
          progress.start(`Asking ${config.imageProvider?.kind ?? "the provider"}`);
          const outputPath = await generateImageFile({
            config,
            prompt: options.prompt,
            model: options.model,
            inputPaths: options.input.map((inputPath) => path.resolve(inputPath)),
            aspectRatio: options.aspectRatio,
            outputBase: path.resolve(options.output),
          });
          progress.stop("Image received");
          log.success(`Saved ${pc.cyan(outputPath)}`);
          return "One image generated. It was billed to your provider account.";
        },
      }),
    );

  image
    .command("remove-background")
    .description("Cut the background out of an image, locally")
    .requiredOption("--input <path>", "source image")
    .requiredOption("--output <path>", "output png path")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Remove background",
        task: async () => {
          const options = removeBackgroundOptionsSchema.parse(rawOptions);
          const progress = spinner();
          progress.start(
            `Loading model (about 1 GB on first run, cached in ${resolveModelCacheDirectory()})`,
          );
          const outputPath = path.resolve(options.output);
          await removeBackground({
            inputPath: path.resolve(options.input),
            outputPath,
          });
          progress.stop("Background removed");
          log.success(`Saved ${pc.cyan(outputPath)}`);
          return "Check the cutout over a dark and a light background before using it.";
        },
      }),
    );
}
