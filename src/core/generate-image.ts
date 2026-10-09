import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateImage as callImageProvider } from "./image-provider.ts";
import type { ResolvedMarketingConfig } from "./load-marketing-config.ts";

/**
 * Generates one image with the provider from marketing.config.ts and writes
 * `<outputBase>.<ext>` plus `<outputBase>.generated.json` recording the prompt,
 * inputs and model that produced it.
 */
export async function generateImageFile(options: {
  config: ResolvedMarketingConfig;
  prompt: string;
  /** Overrides the model named in the config. */
  model: string | undefined;
  inputPaths: string[];
  aspectRatio: `${number}:${number}` | undefined;
  outputBase: string;
}): Promise<string> {
  const { config } = options;
  if (config.imageProvider === undefined)
    throw new Error(
      "No imageProvider in marketing.config.ts. Add one to generate images.",
    );
  const model = options.model ?? config.imageProvider.model;

  const image = await callImageProvider({
    provider: config.imageProvider,
    prompt: options.prompt,
    model,
    inputPaths: options.inputPaths,
    aspectRatio: options.aspectRatio,
    environment: config.environment,
  });

  const outputPath = `${options.outputBase}.${image.extension}`;
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, image.data);
  await writeFile(
    `${options.outputBase}.generated.json`,
    JSON.stringify(
      {
        prompt: options.prompt,
        inputs: options.inputPaths,
        provider: config.imageProvider.kind,
        model,
        aspect_ratio: options.aspectRatio,
            generated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  return outputPath;
}
