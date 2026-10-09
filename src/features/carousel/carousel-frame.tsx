import type { ComponentProps } from "react";
import { CAROUSEL_CANVAS_ID } from "./carousel-config.ts";
import { useCarouselFormat } from "./carousel-format-context.ts";

/**
 * The whole carousel as one wide canvas: `slideCount` slides side by side.
 * Artwork may cross slide boundaries; the exporter screenshots one
 * slide-sized window of the canvas per slide.
 */
export function CarouselCanvas({
  slideCount,
  className,
  style,
  children,
  ...divProps
}: ComponentProps<"div"> & { slideCount: number }) {
  const format = useCarouselFormat();
  return (
    <div
      {...divProps}
      id={CAROUSEL_CANVAS_ID}
      data-slide-count={slideCount}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        width: slideCount * format.width,
        height: format.height,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A slide-sized region of the canvas, for content that belongs to one slide. */
export function CarouselSlide({
  slideIndex,
  className,
  style,
  children,
  ...divProps
}: ComponentProps<"div"> & { slideIndex: number }) {
  const format = useCarouselFormat();
  return (
    <div
      {...divProps}
      className={`absolute top-0 ${className ?? ""}`}
      style={{
        left: slideIndex * format.width,
        width: format.width,
        height: format.height,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
