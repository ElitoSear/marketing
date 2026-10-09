import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import zod from "zod";
import type { CarouselDefinition } from "./carousel-definition.ts";
import type { CarouselFormat } from "./carousel-config.ts";
import { CarouselFormatContext } from "./carousel-format-context.ts";
import { createCarouselRegistry } from "./carousel-registry.ts";

const PREVIEW_SCALE = 0.25;

function CarouselIndex(props: {
  slugs: string[];
  defaultLanguage: string;
}) {
  return (
    <ul className="p-8 font-text">
      {props.slugs.map((slug) => (
        <li key={slug}>
          <a
            className="underline"
            href={`?carousel=${slug}&language=${props.defaultLanguage}`}
          >
            {slug}
          </a>
        </li>
      ))}
    </ul>
  );
}

export interface PreviewOptions {
  format: CarouselFormat;
  languages: string[];
  designModules: Record<string, { default: CarouselDefinition }>;
  copyModules: Record<string, unknown>;
}

/**
 * Mounts the carousel preview. `?carousel=<slug>&language=<code>` shows one
 * carousel at 25% scale; adding `export=true` renders it at full size for the
 * exporter.
 */
export function renderPreview(options: PreviewOptions) {
  const registry = createCarouselRegistry({
    designModules: options.designModules,
    copyModules: options.copyModules,
  });
  const [defaultLanguage] = options.languages;
  if (defaultLanguage === undefined)
    throw new Error("The config lists no languages");

  const searchParams = new URLSearchParams(window.location.search);
  const slug = searchParams.get("carousel");
  let content: ReactElement;
  if (slug === null) {
    content = (
      <CarouselIndex
        slugs={registry.listSlugs()}
        defaultLanguage={defaultLanguage}
      />
    );
  } else {
    const language = zod.literal(options.languages).parse(
      searchParams.get("language"),
    );
    const carousel = registry.render(slug, language);
    content =
      searchParams.get("export") === "true" ? (
        carousel
      ) : (
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${PREVIEW_SCALE})`,
            width: options.format.width * 10,
            height: options.format.height,
          }}
        >
          {carousel}
        </div>
      );
  }

  const rootElement = document.getElementById("root");
  if (rootElement === null) throw new Error("Missing #root element");
  createRoot(rootElement).render(
    <CarouselFormatContext.Provider value={options.format}>
      {content}
    </CarouselFormatContext.Provider>,
  );
}
