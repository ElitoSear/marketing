import { useMemo, type ComponentProps } from "react";
import { useMediaFormat } from "../../core/media-format-context.ts";
import { CAROUSEL_CANVAS_ID } from "./carousel-config.ts";
import {
  CarouselCanvasContext,
  CarouselSlideContext,
  useCarouselCanvas,
} from "./carousel-context.ts";

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
  const format = useMediaFormat();
  const canvas = useMemo(
    () => ({
      slideCount,
      slideWidth: format.width,
      slideHeight: format.height,
      width: slideCount * format.width,
      safeInsets: format.safeInsets,
    }),
    [slideCount, format],
  );
  return (
    <CarouselCanvasContext.Provider value={canvas}>
      <div
        {...divProps}
        id={CAROUSEL_CANVAS_ID}
        data-slide-count={slideCount}
        className={className}
        style={{
          position: "relative",
          overflow: "hidden",
          width: canvas.width,
          height: canvas.slideHeight,
          ...style,
        }}
      >
        {children}
      </div>
    </CarouselCanvasContext.Provider>
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
  const canvas = useCarouselCanvas();
  const slide = useMemo(
    () => ({ slideIndex, left: slideIndex * canvas.slideWidth }),
    [slideIndex, canvas.slideWidth],
  );
  return (
    <CarouselSlideContext.Provider value={slide}>
      <div
        {...divProps}
        className={className}
        style={{
          position: "absolute",
          top: 0,
          left: slide.left,
          width: canvas.slideWidth,
          height: canvas.slideHeight,
          ...style,
        }}
      >
        {children}
      </div>
    </CarouselSlideContext.Provider>
  );
}
