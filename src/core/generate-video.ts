import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ResolvedMarketingConfig } from "./load-marketing-config.ts";
import { generateVideo as callVideoProvider } from "./video-provider.ts";

/**
 * Generates one clip (silent unless audio is requested) with the provider from marketing.config.ts and
 * writes `<outputBase>.<ext>` plus `<outputBase>.generated.json` recording the
 * prompt, inputs and model that produced it. Video is billed per second of
 * output, so callers confirm with the user first.
 */
export async function generateVideoFile(options: {
  config: ResolvedMarketingConfig;
  prompt: string;
  /** Overrides the model named in the config. */
  model: string | undefined;
  firstFramePath: string | undefined;
  lastFramePath: string | undefined;
  aspectRatio: `${number}:${number}` | undefined;
  durationInSeconds: number | undefined;
  resolution: `${number}x${number}` | undefined;
  withAudio: boolean;
  outputBase: string;
}): Promise<string> {
  const { config } = options;
  if (config.videoProvider === undefined)
    throw new Error(
      "No videoProvider in marketing.config.ts. Add one to generate video.",
    );
  const model = options.model ?? config.videoProvider.model;

  const video = await callVideoProvider({
    provider: config.videoProvider,
    prompt: options.prompt,
    model,
    firstFramePath: options.firstFramePath,
    lastFramePath: options.lastFramePath,
    aspectRatio: options.aspectRatio,
    durationInSeconds: options.durationInSeconds,
    resolution: options.resolution,
    withAudio: options.withAudio,
    environment: config.environment,
  });

  const outputPath = `${options.outputBase}.${video.extension}`;
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, video.data);
  await writeFile(
    `${options.outputBase}.generated.json`,
    JSON.stringify(
      {
        prompt: options.prompt,
        first_frame: options.firstFramePath,
        last_frame: options.lastFramePath,
        provider: config.videoProvider.kind,
        model,
        aspect_ratio: options.aspectRatio,
        duration_in_seconds: options.durationInSeconds,
        resolution: options.resolution,
        with_audio: options.withAudio,
        generated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  return outputPath;
}
