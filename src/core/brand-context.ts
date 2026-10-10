import { createContext, useContext } from "react";
import type { BrandConfig } from "./marketing-config.ts";

export const BrandContext = createContext<BrandConfig | undefined>(undefined);

/**
 * The `brand` block of marketing.config.ts: the name plus every variable the
 * project added (a handle per platform, a website). Available to every design
 * the engine renders, so nothing about the brand is hardcoded in a design.
 */
export function useBrand(): BrandConfig {
  const brand = useContext(BrandContext);
  if (brand === undefined)
    throw new Error("useBrand must be used inside rendered media");
  return brand;
}
