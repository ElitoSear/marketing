import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MarketingConfigInput } from "./marketing-config.ts";

type ImageProviderKind = "google" | "openai";

const IMAGE_PROVIDER_PRESETS: Record<
  ImageProviderKind,
  { imageProvider: NonNullable<MarketingConfigInput["imageProvider"]>; environmentVariable: string }
> = {
  google: {
    imageProvider: {
      kind: "google",
      model: "gemini-2.5-flash-image",
      apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
    },
    environmentVariable: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  openai: {
    imageProvider: {
      kind: "openai",
      model: "gpt-image-1",
      apiKeyEnv: "OPENAI_API_KEY",
    },
    environmentVariable: "OPENAI_API_KEY",
  },
};

export const IMAGE_PROVIDER_KINDS = Object.keys(
  IMAGE_PROVIDER_PRESETS,
) as ImageProviderKind[];

const STYLES_STUB = `@import "tailwindcss";
@source "./";

/*
 * The brand's look: @font-face rules, :root variables and @theme entries
 * (fonts, colours). Every design imports this file, so they share one theme.
 */
`;

export interface ScaffoldProjectOptions {
  /** Directory that receives marketing.config.ts and the folders around it. */
  directory: string;
  brandName: string;
  /** Written as the `handle` brand variable; undefined writes none. */
  brandHandle: string | undefined;
  languages: string[];
  imageProviderKind: ImageProviderKind | undefined;
}

export interface ScaffoldedProject {
  configFilePath: string;
  createdPaths: string[];
}

/** Writes the config, an empty stylesheet, empty carousel and ad ledgers, and env schema. */
export async function scaffoldProject(
  options: ScaffoldProjectOptions,
): Promise<ScaffoldedProject> {
  const preset =
    options.imageProviderKind === undefined
      ? undefined
      : IMAGE_PROVIDER_PRESETS[options.imageProviderKind];
  const rawConfig: MarketingConfigInput = {
    brand:
      options.brandHandle === undefined
        ? { name: options.brandName }
        : { name: options.brandName, handle: options.brandHandle },
    languages: options.languages,
    imageProvider: preset?.imageProvider,
  };

  await mkdir(path.join(options.directory, "carousels"), { recursive: true });
  await mkdir(path.join(options.directory, "ads"), { recursive: true });
  // JSON is valid TypeScript; unquoting plain keys makes the file read like hand-written config.
  const configLiteral = JSON.stringify(rawConfig, null, 2).replaceAll(
    /^(\s*)"([A-Za-z_]\w*)":/gm,
    "$1$2:",
  );
  const files: Array<{ fileName: string; content: string }> = [
    {
      fileName: "marketing.config.ts",
      content: `import { defineMarketingConfig } from "@elitosear/marketing/core/marketing-config";\n\nexport default defineMarketingConfig(${configLiteral});\n`,
    },
    { fileName: "styles.css", content: STYLES_STUB },
    // Lets TypeScript accept the stylesheet imports every design starts with.
    { fileName: "env.d.ts", content: 'declare module "*.css";\n' },
    { fileName: path.join("carousels", "ledger.json"), content: "[]\n" },
    { fileName: path.join("ads", "ledger.json"), content: "[]\n" },
    { fileName: ".gitignore", content: "output\n.marketing\n.env\n" },
    {
      fileName: ".env.schema",
      content:
        preset === undefined
          ? "# Add the environment variable named by imageProvider in marketing.config.ts.\n"
          : `# Read by the imageProvider in marketing.config.ts.\n${preset.environmentVariable}=\n`,
    },
  ];
  for (const file of files)
    await writeFile(path.join(options.directory, file.fileName), file.content);

  return {
    configFilePath: path.join(options.directory, "marketing.config.ts"),
    createdPaths: files.map((file) => path.join(options.directory, file.fileName)),
  };
}
