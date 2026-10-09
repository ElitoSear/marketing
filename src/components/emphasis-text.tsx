import { Fragment, type ComponentProps } from "react";

/**
 * Renders copy where `*word*` marks emphasis. Translators move the markers
 * with the words, so emphasis survives any language's word order. Emphasised
 * segments are spans styled by `emphasisClassName`; every other prop passes
 * through to the wrapping span.
 */
export function EmphasisText({
  text,
  emphasisClassName,
  ...spanProps
}: Omit<ComponentProps<"span">, "children"> & {
  text: string;
  emphasisClassName: string;
}) {
  return (
    <span {...spanProps}>
      {text.split("*").map((segment, segmentIndex) =>
        segmentIndex % 2 === 1 ? (
          <span key={segmentIndex} className={emphasisClassName}>
            {segment}
          </span>
        ) : (
          <Fragment key={segmentIndex}>{segment}</Fragment>
        ),
      )}
    </span>
  );
}
