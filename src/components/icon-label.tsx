import type { ComponentProps, ReactNode } from "react";

/**
 * A label with an icon beside it. The icon is any node (an SVG, an image, an
 * icon-library component); size, colour, gap and placement come from
 * `className`. Every other prop passes through to the span.
 */
export function IconLabel({
  icon,
  className,
  children,
  ...spanProps
}: ComponentProps<"span"> & { icon: ReactNode }) {
  return (
    <span
      {...spanProps}
      className={`inline-flex items-center ${className ?? ""}`}
    >
      {icon}
      {children}
    </span>
  );
}
