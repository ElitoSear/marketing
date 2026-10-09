import { createElement, type ComponentType, type ReactElement } from "react";
import type zod from "zod";

export interface CarouselDefinition {
  slideCount: number;
  renderWithCopy: (rawCopy: unknown) => ReactElement;
}

/**
 * A carousel is a free-form React design plus a zod schema for its copy. The
 * design owns layout and art; each language supplies one copy file that must
 * satisfy the schema, so a missing or extra translated string fails loudly.
 */
export function defineCarousel<Schema extends zod.ZodType>(options: {
  slideCount: number;
  copySchema: Schema;
  Design: ComponentType<{ copy: zod.infer<Schema> }>;
}): CarouselDefinition {
  return {
    slideCount: options.slideCount,
    renderWithCopy: (rawCopy) =>
      createElement(options.Design, {
        copy: options.copySchema.parse(rawCopy),
      }),
  };
}
