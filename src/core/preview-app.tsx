import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import zod from "zod";
import type { CarouselDefinition } from "../features/carousel/carousel-definition.ts";
import type { ImageAdDefinition } from "../features/ads/image/image-ad-definition.ts";
import { createDesignRegistry } from "./design-registry.ts";
import { BrandContext } from "./brand-context.ts";
import type { BrandConfig } from "./marketing-config.ts";
import { MediaFormatContext } from "./media-format-context.ts";
import type { MediaFormat } from "./media-format.ts";

/** A carousel is shown as a thin strip of slides; an ad is shown at half size. */
const CAROUSEL_PREVIEW_SCALE = 0.25;
const AD_PREVIEW_SCALE = 0.5;

interface DesignGroup<Definition> {
  format: MediaFormat;
  designModules: Record<string, { default: Definition }>;
  copyModules: Record<string, unknown>;
}

export interface PreviewOptions {
  brand: BrandConfig;
  languages: string[];
  carousels: DesignGroup<CarouselDefinition>;
  imageAds: DesignGroup<ImageAdDefinition>;
}

function DesignIndex(props: {
  title: string;
  queryName: string;
  slugs: string[];
  defaultLanguage: string;
}) {
  if (props.slugs.length === 0) return null;
  return (
    <section>
      <h2>{props.title}</h2>
      <ul>
        {props.slugs.map((slug) => (
          <li key={slug}>
            <a
              href={`?${props.queryName}=${slug}&language=${props.defaultLanguage}`}
            >
              {slug}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ScaledPreview(props: {
  scale: number;
  format: MediaFormat;
  /** Width of the unscaled box; a carousel is several slides wide. */
  width: number;
  children: ReactElement;
}) {
  return (
    <div
      style={{
        transformOrigin: "top left",
        transform: `scale(${props.scale})`,
        width: props.width,
        height: props.format.height,
      }}
    >
      {props.children}
    </div>
  );
}

/**
 * Mounts the preview. `?carousel=<slug>&language=<code>` shows one carousel
 * and `?ad=<slug>&language=<code>` one image ad, both scaled down; adding
 * `export=true` renders at full size for the exporter.
 */
export function renderPreview(options: PreviewOptions) {
  const carouselRegistry = createDesignRegistry({
    kind: "Carousel",
    designModules: options.carousels.designModules,
    copyModules: options.carousels.copyModules,
  });
  const adRegistry = createDesignRegistry({
    kind: "Ad",
    designModules: options.imageAds.designModules,
    copyModules: options.imageAds.copyModules,
  });
  const [defaultLanguage] = options.languages;
  if (defaultLanguage === undefined)
    throw new Error("The config lists no languages");

  const searchParams = new URLSearchParams(window.location.search);
  const carouselSlug = searchParams.get("carousel");
  const adSlug = searchParams.get("ad");
  const exportMode = searchParams.get("export") === "true";

  const parseLanguage = () =>
    zod.literal(options.languages).parse(searchParams.get("language"));

  let content: ReactElement;
  let format: MediaFormat = options.carousels.format;
  if (carouselSlug !== null) {
    const { definition, copy } = carouselRegistry.resolve({
      slug: carouselSlug,
      language: parseLanguage(),
    });
    const carousel = definition.renderWithCopy(copy);
    content = exportMode ? (
      carousel
    ) : (
      <ScaledPreview
        scale={CAROUSEL_PREVIEW_SCALE}
        format={format}
        width={format.width * 10}
      >
        {carousel}
      </ScaledPreview>
    );
  } else if (adSlug !== null) {
    const { definition, copy } = adRegistry.resolve({
      slug: adSlug,
      language: parseLanguage(),
    });
    const ad = definition.renderWithCopy(copy);
    format = definition.format ?? options.imageAds.format;
    content = exportMode ? (
      ad
    ) : (
      <ScaledPreview
        scale={AD_PREVIEW_SCALE}
        format={format}
        width={format.width}
      >
        {ad}
      </ScaledPreview>
    );
  } else {
    content = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          padding: 32,
          fontFamily: "sans-serif",
        }}
      >
        <DesignIndex
          title="Carousels"
          queryName="carousel"
          slugs={carouselRegistry.listSlugs()}
          defaultLanguage={defaultLanguage}
        />
        <DesignIndex
          title="Ads"
          queryName="ad"
          slugs={adRegistry.listSlugs()}
          defaultLanguage={defaultLanguage}
        />
      </div>
    );
  }

  const rootElement = document.getElementById("root");
  if (rootElement === null) throw new Error("Missing #root element");
  createRoot(rootElement).render(
    <BrandContext.Provider value={options.brand}>
      <MediaFormatContext.Provider value={format}>
        {content}
      </MediaFormatContext.Provider>
    </BrandContext.Provider>,
  );
}
