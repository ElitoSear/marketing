import zod from "zod";

const safeInsetsSchema = zod.strictObject({
  top: zod.number().int().nonnegative().default(0),
  right: zod.number().int().nonnegative().default(0),
  bottom: zod.number().int().nonnegative().default(0),
  left: zod.number().int().nonnegative().default(0),
});

/**
 * Pixel size of one piece of media (a carousel slide, an ad, a video frame)
 * and the margins platform interfaces or crops can cover. Key content stays
 * inside the safe insets.
 */
export interface MediaFormat {
  width: number;
  height: number;
  safeInsets: { top: number; right: number; bottom: number; left: number };
}

/**
 * Common placements. The Instagram profile grid crops 4:5 posts to 3:4. The
 * vertical safe insets are the worst case of TikTok and Instagram Reels,
 * Stories and Shorts: their interface covers the top, the bottom and the
 * right edge, which leaves a 720 by 1200 band that works on all of them.
 */
export const MEDIA_FORMAT_PRESETS = {
  "feed-portrait": {
    width: 1080,
    height: 1350,
    safeInsets: { top: 0, right: 34, bottom: 0, left: 34 },
  },
  "feed-square": {
    width: 1080,
    height: 1080,
    safeInsets: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  "feed-landscape": {
    width: 1200,
    height: 628,
    safeInsets: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  vertical: {
    width: 1080,
    height: 1920,
    safeInsets: { top: 220, right: 180, bottom: 500, left: 180 },
  },
} as const satisfies Record<string, MediaFormat>;

export type MediaFormatPresetName = keyof typeof MEDIA_FORMAT_PRESETS;

const PRESET_NAMES = Object.keys(MEDIA_FORMAT_PRESETS) as [
  MediaFormatPresetName,
  ...MediaFormatPresetName[],
];

/** A preset name, or an explicit size with optional safe insets. */
export const mediaFormatSchema = zod
  .union([
    zod.enum(PRESET_NAMES),
    zod.strictObject({
      width: zod.number().int().positive(),
      height: zod.number().int().positive(),
      safeInsets: safeInsetsSchema.prefault({}),
    }),
  ])
  .transform(
    (format): MediaFormat =>
      typeof format === "string" ? MEDIA_FORMAT_PRESETS[format] : format,
  );

export type MediaFormatInput = zod.input<typeof mediaFormatSchema>;

export function resolveMediaFormat(input: MediaFormatInput): MediaFormat {
  return mediaFormatSchema.parse(input);
}
