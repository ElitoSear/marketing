import zod from "zod";

/**
 * Pixel size of one slide. The defaults are the Instagram/Facebook 4:5
 * portrait carousel; set another size for squares, stories or other networks.
 */
export const carouselFormatSchema = zod
  .strictObject({
    width: zod.number().int().positive().default(1080),
    height: zod.number().int().positive().default(1350),
    /**
     * Width centred in the slide that survives a crop (the Instagram profile
     * grid crops 4:5 posts to 3:4). Key content stays inside it.
     */
    safeWidth: zod.number().int().positive().default(1012),
  })
  .prefault({});

export type CarouselFormat = zod.infer<typeof carouselFormatSchema>;

export const carouselConfigSchema = zod
  .strictObject({
    designs: zod.string().min(1).default("designs"),
    output: zod.string().min(1).default("output"),
    ledger: zod.string().min(1).default("ledger.json"),
    format: carouselFormatSchema,
    /** Where the agent saves dated research notes. */
    inspirationDirectory: zod.string().min(1).optional(),
  })
  .prefault({});

export const CAROUSEL_CANVAS_ID = "carousel-canvas";
