import { createContext, useContext } from "react";
import type { CarouselFormat } from "./carousel-config.ts";

export const CarouselFormatContext = createContext<CarouselFormat | undefined>(
  undefined,
);

/** The slide size from marketing.config.ts, available to every design the preview renders. */
export function useCarouselFormat(): CarouselFormat {
  const format = useContext(CarouselFormatContext);
  if (format === undefined)
    throw new Error("useCarouselFormat must be used inside a rendered carousel");
  return format;
}
