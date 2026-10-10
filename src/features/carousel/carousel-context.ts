import { createContext, useContext } from "react";
import type { MediaFormat } from "../../core/media-format.ts";

export interface CarouselCanvasValue {
  slideCount: number;
  slideWidth: number;
  slideHeight: number;
  /** Width of the whole canvas: every slide side by side. */
  width: number;
  safeInsets: MediaFormat["safeInsets"];
}

export const CarouselCanvasContext = createContext<
  CarouselCanvasValue | undefined
>(undefined);

/**
 * Geometry of the whole canvas, for artwork that crosses slide edges. Works
 * anywhere inside `CarouselCanvas`, including outside any slide.
 */
export function useCarouselCanvas(): CarouselCanvasValue {
  const canvas = useContext(CarouselCanvasContext);
  if (canvas === undefined)
    throw new Error("useCarouselCanvas must be used inside CarouselCanvas");
  return canvas;
}

export interface CarouselSlideValue {
  slideIndex: number;
  /** Horizontal offset of the slide on the canvas. */
  left: number;
}

export const CarouselSlideContext = createContext<
  CarouselSlideValue | undefined
>(undefined);

/** Position of the slide this component renders in. Works inside `CarouselSlide` only. */
export function useCarouselSlide(): CarouselSlideValue {
  const slide = useContext(CarouselSlideContext);
  if (slide === undefined)
    throw new Error("useCarouselSlide must be used inside CarouselSlide");
  return slide;
}
