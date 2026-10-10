import { createElement, type ComponentType, type ReactElement } from "react";
import type zod from "zod";
import {
  resolveMediaFormat,
  type MediaFormat,
  type MediaFormatInput,
} from "../../../core/media-format.ts";

export interface ImageAdDefinition {
  /** Set by the design; undefined means the size from `ads.image.format`. */
  format: MediaFormat | undefined;
  renderWithCopy: (rawCopy: unknown) => ReactElement;
}

/**
 * An image ad is a free-form React design on one fixed canvas plus a zod
 * schema for its copy. Each language supplies one copy file that must satisfy
 * the schema, so a missing or extra translated string fails loudly.
 */
export function defineImageAd<Schema extends zod.ZodType>(options: {
  format?: MediaFormatInput;
  copySchema: Schema;
  Design: ComponentType<{ copy: zod.infer<Schema> }>;
}): ImageAdDefinition {
  return {
    format:
      options.format === undefined
        ? undefined
        : resolveMediaFormat(options.format),
    renderWithCopy: (rawCopy) =>
      createElement(options.Design, {
        copy: options.copySchema.parse(rawCopy),
      }),
  };
}
