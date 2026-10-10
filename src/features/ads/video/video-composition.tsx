import type { ComponentType } from "react";
import { BrandContext } from "../../../core/brand-context.ts";
import type { BrandConfig } from "../../../core/marketing-config.ts";
import { MediaFormatContext } from "../../../core/media-format-context.ts";
import type { MediaFormat } from "../../../core/media-format.ts";
import type { VideoAdDefinition } from "./video-ad-definition.ts";

/**
 * Turns a video ad into the component a Remotion `<Composition>` renders, with
 * the ad's format and the brand available to its design through
 * `useMediaFormat()` and `useBrand()`.
 */
export function createVideoComposition(options: {
  definition: VideoAdDefinition;
  format: MediaFormat;
  brand: BrandConfig;
}): ComponentType<{ copy: unknown }> {
  return function VideoAdComposition(props: { copy: unknown }) {
    return (
      <BrandContext.Provider value={options.brand}>
        <MediaFormatContext.Provider value={options.format}>
          {options.definition.renderWithCopy(props.copy)}
        </MediaFormatContext.Provider>
      </BrandContext.Provider>
    );
  };
}
