import zod from "zod";
import { mediaFormatSchema } from "../../core/media-format.ts";

export const carouselConfigSchema = zod
  .strictObject({
    designs: zod.string().min(1).default("carousels"),
    output: zod.string().min(1).default("output/carousels"),
    ledger: zod.string().min(1).default("carousels/ledger.json"),
    /**
     * Size of one slide: a preset name or an explicit size. The default is
     * the Instagram/Facebook 4:5 portrait carousel.
     */
    format: mediaFormatSchema.prefault("feed-portrait"),
  })
  .prefault({});

export const CAROUSEL_CANVAS_ID = "carousel-canvas";
