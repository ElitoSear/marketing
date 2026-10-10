import zod from "zod";
import { adsConfigSchema } from "../features/ads/ads-config.ts";
import { carouselConfigSchema } from "../features/carousel/carousel-config.ts";
import { imageProviderSchema } from "./image-provider.ts";
import { videoProviderSchema } from "./video-provider.ts";

/**
 * Free-form brand variables. Only `name` is required; add whatever designs and
 * agents need, such as a handle per platform (`instagram`, `facebook`), a
 * website or a tagline. Every value is text.
 */
const brand = zod
  .object({ name: zod.string().min(1) })
  .catchall(zod.string().min(1));

export type BrandConfig = zod.infer<typeof brand>;

/**
 * Every path is relative to the directory that holds marketing.config.ts.
 * Defaults live here so a config only states what differs from them.
 */
export const marketingConfigSchema = zod.strictObject({
  brand,
  /** Language codes; the first is the default shown in the preview. */
  languages: zod.array(zod.string().min(1)).min(1),
  /** Import aliases for designs, mapping an alias such as "@site-assets" to a directory. */
  aliases: zod.record(zod.string().min(1), zod.string().min(1)).default({}),
  imageProvider: imageProviderSchema.optional(),
  videoProvider: videoProviderSchema.optional(),
  carousel: carouselConfigSchema,
  ads: adsConfigSchema,
});

export type MarketingConfigInput = zod.input<typeof marketingConfigSchema>;

/** Gives marketing.config.ts autocomplete and type checking. */
export function defineMarketingConfig(
  config: MarketingConfigInput,
): MarketingConfigInput {
  return config;
}
