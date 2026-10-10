import path from "node:path";
import { loadConfig } from "c12";
import { findUp } from "find-up-simple";
import type { ImageProviderConfig } from "./image-provider.ts";
import type { VideoProviderConfig } from "./video-provider.ts";
import type { MediaFormat } from "./media-format.ts";
import { marketingConfigSchema, type BrandConfig } from "./marketing-config.ts";

const CONFIG_FILE_NAMES = [
  "marketing.config.ts",
  "marketing.config.mts",
  "marketing.config.js",
  "marketing.config.mjs",
];

/** The config with every path made absolute, so no command depends on the working directory. */
export interface ResolvedMarketingConfig {
  configFilePath: string;
  configDirectory: string;
  brand: BrandConfig;
  languages: string[];
  aliases: Record<string, string>;
  imageProvider: ImageProviderConfig | undefined;
  videoProvider: VideoProviderConfig | undefined;
  carousel: {
    designsDirectory: string;
    outputDirectory: string;
    ledgerPath: string;
    format: MediaFormat;
  };
  ads: {
    image: { designsDirectory: string; format: MediaFormat };
    video: {
      designsDirectory: string;
      format: MediaFormat;
      framesPerSecond: number;
    };
    outputDirectory: string;
    ledgerPath: string;
  };
  /** Environment after the .env file next to the config was loaded. */
  environment: NodeJS.ProcessEnv;
}

/** Validates a raw config object and resolves its paths against the config file's directory. */
export function resolveMarketingConfig(options: {
  configFilePath: string;
  rawConfig: unknown;
  environment: NodeJS.ProcessEnv;
}): ResolvedMarketingConfig {
  const config = marketingConfigSchema.parse(options.rawConfig);
  const configDirectory = path.dirname(options.configFilePath);
  const resolveFromConfig = (relativePath: string) =>
    path.resolve(configDirectory, relativePath);

  return {
    configFilePath: options.configFilePath,
    configDirectory,
    brand: config.brand,
    languages: config.languages,
    aliases: Object.fromEntries(
      Object.entries(config.aliases).map(([alias, directory]) => [
        alias,
        resolveFromConfig(directory),
      ]),
    ),
    imageProvider: config.imageProvider,
    videoProvider: config.videoProvider,
    carousel: {
      designsDirectory: resolveFromConfig(config.carousel.designs),
      outputDirectory: resolveFromConfig(config.carousel.output),
      ledgerPath: resolveFromConfig(config.carousel.ledger),
      format: config.carousel.format,
    },
    ads: {
      image: {
        designsDirectory: resolveFromConfig(config.ads.image.designs),
        format: config.ads.image.format,
      },
      video: {
        designsDirectory: resolveFromConfig(config.ads.video.designs),
        format: config.ads.video.format,
        framesPerSecond: config.ads.video.framesPerSecond,
      },
      outputDirectory: resolveFromConfig(config.ads.output),
      ledgerPath: resolveFromConfig(config.ads.ledger),
    },
    environment: options.environment,
  };
}

export async function loadMarketingConfig(options: {
  startDirectory: string;
}): Promise<ResolvedMarketingConfig> {
  // The nearest directory wins; within it, the first supported file name.
  const candidates = (
    await Promise.all(
      CONFIG_FILE_NAMES.map((fileName) =>
        findUp(fileName, { cwd: options.startDirectory }),
      ),
    )
  ).filter((candidate) => candidate !== undefined);
  const configFilePath = candidates.toSorted(
    (first, second) => second.length - first.length,
  )[0];
  if (configFilePath === undefined)
    throw new Error(
      `No marketing.config.ts found in ${options.startDirectory} or any parent directory. Run \`marketing init\` first.`,
    );
  // c12 also loads the .env file next to the config into process.env.
  const { config: rawConfig } = await loadConfig({
    cwd: path.dirname(configFilePath),
    configFile: "marketing.config",
    dotenv: true,
    rcFile: false,
    packageJson: false,
    globalRc: false,
  });
  return resolveMarketingConfig({
    configFilePath,
    rawConfig,
    environment: process.env,
  });
}
