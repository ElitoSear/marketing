import { createElement, type ComponentType, type ReactElement } from "react";
import type zod from "zod";
import {
  resolveMediaFormat,
  type MediaFormat,
  type MediaFormatInput,
} from "../../../core/media-format.ts";

export interface VideoAdDefinition {
  /** Set by the design; undefined means the size from `ads.video.format`. */
  format: MediaFormat | undefined;
  durationInSeconds: number;
  /** Set by the design; undefined means `ads.video.framesPerSecond`. */
  framesPerSecond: number | undefined;
  renderWithCopy: (rawCopy: unknown) => ReactElement;
}

/**
 * A video ad is a Remotion composition plus a zod schema for its copy. The
 * design animates with Remotion's own hooks (`useCurrentFrame`, `interpolate`,
 * `Sequence`); each language supplies one copy file that must satisfy the
 * schema, so a missing or extra translated string fails loudly.
 */
export function defineVideoAd<Schema extends zod.ZodType>(options: {
  format?: MediaFormatInput;
  durationInSeconds: number;
  framesPerSecond?: number;
  copySchema: Schema;
  Design: ComponentType<{ copy: zod.infer<Schema> }>;
}): VideoAdDefinition {
  return {
    format:
      options.format === undefined
        ? undefined
        : resolveMediaFormat(options.format),
    durationInSeconds: options.durationInSeconds,
    framesPerSecond: options.framesPerSecond,
    renderWithCopy: (rawCopy) =>
      createElement(options.Design, {
        copy: options.copySchema.parse(rawCopy),
      }),
  };
}
