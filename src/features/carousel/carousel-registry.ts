import type { ReactElement } from "react";
import type { CarouselDefinition } from "./carousel-definition.ts";

export interface CarouselRegistry {
  listSlugs: () => string[];
  listLanguages: (slug: string) => string[];
  render: (slug: string, language: string) => ReactElement;
}

function requireMatch(options: {
  modulePath: string;
  pattern: RegExp;
}): RegExpExecArray {
  const match = options.pattern.exec(options.modulePath);
  if (match === null)
    throw new Error(`Unexpected carousel module path: ${options.modulePath}`);
  return match;
}

/**
 * Indexes the glob results the generated preview entry collects from the
 * designs directory: `<slug>/design.tsx` and `<slug>/copy.<language>.json`.
 */
export function createCarouselRegistry(options: {
  designModules: Record<string, { default: CarouselDefinition }>;
  copyModules: Record<string, unknown>;
}): CarouselRegistry {
  const designsBySlug = new Map<string, CarouselDefinition>();
  for (const [modulePath, designModule] of Object.entries(
    options.designModules,
  )) {
    const [, slug] = requireMatch({
      modulePath,
      pattern: /([^/]+)\/design\.tsx$/,
    });
    designsBySlug.set(slug, designModule.default);
  }

  const copyBySlugAndLanguage = new Map<string, Map<string, unknown>>();
  for (const [modulePath, copy] of Object.entries(options.copyModules)) {
    const [, slug, language] = requireMatch({
      modulePath,
      pattern: /([^/]+)\/copy\.([^/]+)\.json$/,
    });
    const copyByLanguage = copyBySlugAndLanguage.get(slug) ?? new Map();
    copyByLanguage.set(language, copy);
    copyBySlugAndLanguage.set(slug, copyByLanguage);
  }

  const listLanguages = (slug: string) => [
    ...(copyBySlugAndLanguage.get(slug)?.keys() ?? []),
  ];

  return {
    listSlugs: () => [...designsBySlug.keys()],
    listLanguages,
    render: (slug, language) => {
      const design = designsBySlug.get(slug);
      if (design === undefined)
        throw new Error(
          `Unknown carousel "${slug}". Available: ${[...designsBySlug.keys()].join(", ")}`,
        );
      const copy = copyBySlugAndLanguage.get(slug)?.get(language);
      if (copy === undefined)
        throw new Error(
          `Carousel "${slug}" has no ${language} copy. Available: ${listLanguages(slug).join(", ")}`,
        );
      return design.renderWithCopy(copy);
    },
  };
}
