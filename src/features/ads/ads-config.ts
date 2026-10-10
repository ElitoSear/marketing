import zod from "zod";
import { mediaFormatSchema } from "../../core/media-format.ts";

/**
 * Ads are single fixed canvases, as an image (PNG) or a video (MP4). Both
 * share the ledger, output folder and notes; each medium has its own designs
 * directory and default size.
 */
export const adsConfigSchema = zod
  .strictObject({
    image: zod
      .strictObject({
        designs: zod.string().min(1).default("ads/image"),
        /** Default size of an image ad; a design can set its own. */
        format: mediaFormatSchema.prefault("feed-portrait"),
      })
      .prefault({}),
    video: zod
      .strictObject({
        designs: zod.string().min(1).default("ads/video"),
        /** Default size of a video ad; a design can set its own. */
        format: mediaFormatSchema.prefault("vertical"),
        framesPerSecond: zod.number().int().positive().default(30),
      })
      .prefault({}),
    output: zod.string().min(1).default("output/ads"),
    ledger: zod.string().min(1).default("ads/ledger.json"),
  })
  .prefault({});

export const AD_CANVAS_ID = "ad-canvas";
