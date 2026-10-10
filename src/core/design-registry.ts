export interface DesignRegistry<Definition> {
  listSlugs: () => string[];
  listLanguages: (slug: string) => string[];
  resolve: (options: { slug: string; language: string }) => {
    definition: Definition;
    copy: unknown;
  };
}

function requireMatch(options: {
  modulePath: string;
  pattern: RegExp;
}): RegExpExecArray {
  const match = options.pattern.exec(options.modulePath);
  if (match === null)
    throw new Error(`Unexpected design module path: ${options.modulePath}`);
  return match;
}

/**
 * Indexes the glob results the generated preview entry collects from a
 * designs directory: `<slug>/design.tsx` and `<slug>/copy.<language>.json`.
 */
export function createDesignRegistry<Definition>(options: {
  kind: string;
  designModules: Record<string, { default: Definition }>;
  copyModules: Record<string, unknown>;
}): DesignRegistry<Definition> {
  const designsBySlug = new Map<string, Definition>();
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
    resolve: ({ slug, language }) => {
      const definition = designsBySlug.get(slug);
      if (definition === undefined)
        throw new Error(
          `Unknown ${options.kind} "${slug}". Available: ${[...designsBySlug.keys()].join(", ")}`,
        );
      const copy = copyBySlugAndLanguage.get(slug)?.get(language);
      if (copy === undefined)
        throw new Error(
          `${options.kind} "${slug}" has no ${language} copy. Available: ${listLanguages(slug).join(", ")}`,
        );
      return { definition, copy };
    },
  };
}
