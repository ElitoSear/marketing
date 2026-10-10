import type { ComponentProps, ReactNode } from "react";

/**
 * A label with an icon beside it. The icon is any node (an SVG, an image, an
 * icon-library component); size, colour, gap and placement come from
 * `className`. Every other prop passes through to the span.
 */
export function IconLabel({
  icon,
  style,
  children,
  ...spanProps
}: ComponentProps<"span"> & { icon: ReactNode }) {
  return (
    <span
      {...spanProps}
      style={{ display: "inline-flex", alignItems: "center", ...style }}
    >
      {icon}
      {children}
    </span>
  );
}
