import { createContext, useContext } from "react";
import type { MediaFormat } from "./media-format.ts";

export const MediaFormatContext = createContext<MediaFormat | undefined>(
  undefined,
);

/**
 * The size and safe insets of the media being rendered: one slide of a
 * carousel, an ad, a video frame. Every design the engine renders can call it.
 */
export function useMediaFormat(): MediaFormat {
  const format = useContext(MediaFormatContext);
  if (format === undefined)
    throw new Error("useMediaFormat must be used inside rendered media");
  return format;
}
