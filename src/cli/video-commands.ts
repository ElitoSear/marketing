import { log, spinner } from "@clack/prompts";
import type { Command } from "commander";
import path from "node:path";
import pc from "picocolors";
import zod from "zod";
import { generateVideoFile } from "../core/generate-video.ts";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";
import { runCommand } from "./run-command.ts";

const generateOptionsSchema = zod.object({
  prompt: zod.string().min(1),
  output: zod.string().min(1),
  input: zod.string().min(1).optional(),
  lastFrame: zod.string().min(1).optional(),
  model: zod.string().optional(),
  aspectRatio: zod.templateLiteral([zod.number(), ":", zod.number()]).optional(),
  duration: zod.coerce.number().positive().optional(),
  resolution: zod.templateLiteral([zod.number(), "x", zod.number()]).optional(),
  audio: zod.boolean().optional(),
  yes: zod.boolean().optional(),
});

export function registerVideoCommands(program: Command) {
  const video = program.command("video").description("Create video clips");

  video
    .command("generate")
    .description(
      "Generate a clip (silent by default) with the videoProvider from marketing.config.ts. Billed per second: needs --yes after the owner agrees",
    )
    .requiredOption("--prompt <text>", "what to generate")
    .requiredOption("--output <path>", "output path without extension")
    .option("--input <path>", "image the clip starts from (keeps a real product faithful)")
    .option("--last-frame <path>", "image the clip ends on")
    .option("--model <name>", "overrides the configured model")
    .option("--aspect-ratio <ratio>", "for example 9:16 or 16:9")
    .option("--duration <seconds>", "length of the clip")
    .option("--resolution <size>", "for example 1080x1920")
    .option("--audio", "let the model add sound effects for the action")
    .option("--yes", "the owner has confirmed this generation and its cost")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Generate video",
        task: async () => {
          const options = generateOptionsSchema.parse(rawOptions);
          if (options.yes !== true)
            throw new Error(
              "Video generation is billed per second of output. Tell the owner the clip count, length and provider, and pass --yes only after they agree.",
            );
          const config = await loadMarketingConfig({ startDirectory: process.cwd() });
          const progress = spinner();
          progress.start(
            `Asking ${config.videoProvider?.kind ?? "the provider"} (a clip takes a few minutes)`,
          );
          const outputPath = await generateVideoFile({
            config,
            prompt: options.prompt,
            model: options.model,
            firstFramePath:
              options.input === undefined ? undefined : path.resolve(options.input),
            lastFramePath:
              options.lastFrame === undefined
                ? undefined
                : path.resolve(options.lastFrame),
            aspectRatio: options.aspectRatio,
            durationInSeconds: options.duration,
            resolution: options.resolution,
            withAudio: options.audio === true,
            outputBase: path.resolve(options.output),
          });
          progress.stop("Clip received");
          log.success(`Saved ${pc.cyan(outputPath)}`);
          return "One clip generated. It was billed to your provider account.";
        },
      }),
    );
}
