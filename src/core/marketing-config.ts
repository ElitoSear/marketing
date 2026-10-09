import zod from "zod";
import { carouselConfigSchema } from "../features/carousel/carousel-config.ts";
import { imageProviderSchema } from "./image-provider.ts";

/**
 * Every path is relative to the directory that holds marketing.config.ts.
 * Defaults live here so a config only states what differs from them.
 */
export const marketingConfigSchema = zod.strictObject({
  brand: zod.strictObject({
    name: zod.string().min(1),
    handle: zod.string().min(1),
  }),
  /**
   * Stylesheet the designs render with: fonts, design tokens and any
   * `@theme` entries. The agent that sets up the project writes it.
   */
  styles: zod.string().min(1),
  /** Language codes; the first is the default shown in the preview. */
  languages: zod.array(zod.string().min(1)).min(1),
  /** Import aliases for designs, mapping an alias such as "@site-assets" to a directory. */
  aliases: zod.record(zod.string().min(1), zod.string().min(1)).default({}),
  imageProvider: imageProviderSchema.optional(),
  carousel: carouselConfigSchema,
  agent: zod
    .strictObject({
      /** Where `marketing skill install` writes skills. */
      skillsDirectory: zod.string().min(1).default("../.agents/skills"),
      /** Files the agent reads first: positioning, verified claims, roadmap. */
      contextFiles: zod.array(zod.string().min(1)).default([]),
      /** Project-specific rules the agent reads before working: imagery sources, claim limits. */
      instructionsFile: zod.string().min(1).optional(),
    })
    .prefault({}),
});

export type MarketingConfigInput = zod.input<typeof marketingConfigSchema>;

/** Gives marketing.config.ts autocomplete and type checking. */
export function defineMarketingConfig(
  config: MarketingConfigInput,
): MarketingConfigInput {
  return config;
}
