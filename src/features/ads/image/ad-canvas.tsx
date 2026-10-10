import type { ComponentProps } from "react";
import { useMediaFormat } from "../../../core/media-format-context.ts";
import { AD_CANVAS_ID } from "../ads-config.ts";

/**
 * The fixed canvas of an image ad, sized by the ad's format. The exporter
 * screenshots exactly this element.
 */
export function AdCanvas({
  className,
  style,
  children,
  ...divProps
}: ComponentProps<"div">) {
  const format = useMediaFormat();
  return (
    <div
      {...divProps}
      id={AD_CANVAS_ID}
      data-width={format.width}
      data-height={format.height}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        width: format.width,
        height: format.height,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
