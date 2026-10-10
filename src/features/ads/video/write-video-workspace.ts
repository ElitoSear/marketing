import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  copyFilePath,
  fileExists,
  listDesignSlugs,
} from "../../../core/design-directory.ts";
import type { ResolvedMarketingConfig } from "../../../core/load-marketing-config.ts";
import { resolveWorkspaceDirectory } from "../../../core/write-preview-workspace.ts";

export interface VideoComposition {
  id: string;
  slug: string;
  language: string;
}

export interface VideoWorkspace {
  directory: string;
  entryPath: string;
  configPath: string;
  compositions: VideoComposition[];
}

/** Import specifier from the workspace directory to a file, in the form bundlers expect. */
function specifierFrom(options: { directory: string; target: string }): string {
  const relativePath = path
    .relative(options.directory, options.target)
    .split(path.sep)
    .join("/");
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

/**
 * Writes the throwaway Remotion project next to the config: a root that
 * registers one composition per video ad and language, and a Remotion config
 * carrying the Tailwind and alias webpack override. Styling comes from the
 * stylesheets the designs import themselves. Rewritten on every run.
 */
export async function writeVideoWorkspace(
  config: ResolvedMarketingConfig,
): Promise<VideoWorkspace> {
  const directory = path.join(resolveWorkspaceDirectory(config), "video");
  await mkdir(directory, { recursive: true });
  const specifier = (target: string) => specifierFrom({ directory, target });
  const { designsDirectory, format, framesPerSecond } = config.ads.video;

  const compositions: VideoComposition[] = [];
  const imports: string[] = [];
  const entries: string[] = [];
  for (const slug of await listDesignSlugs(designsDirectory)) {
    const designName = `design${compositions.length}`;
    const designImport = `import ${designName} from "${specifier(path.join(designsDirectory, slug, "design.tsx"))}";`;
    const slugEntries: string[] = [];
    for (const language of config.languages) {
      const copyPath = copyFilePath({ designsDirectory, slug, language });
      if (!(await fileExists(copyPath))) continue;
      const copyName = `copy${compositions.length}`;
      const id = `${slug}-${language}`;
      imports.push(`import ${copyName} from "${specifier(copyPath)}";`);
      slugEntries.push(
        `  { id: "${id}", definition: ${designName}, copy: ${copyName} },`,
      );
      compositions.push({ id, slug, language });
    }
    if (slugEntries.length === 0) continue;
    imports.unshift(designImport);
    entries.push(...slugEntries);
  }

  await writeFile(
    path.join(directory, "root.tsx"),
    `import { Composition } from "remotion";
import { createVideoComposition } from "@elitosear/marketing/features/ads/video/video-composition";
${imports.join("\n")}

const BRAND = ${JSON.stringify(config.brand)};
const DEFAULT_FORMAT = ${JSON.stringify(format)};
const DEFAULT_FRAMES_PER_SECOND = ${framesPerSecond};

const videoAds = [
${entries.join("\n")}
].map((videoAd) => {
  const format = videoAd.definition.format ?? DEFAULT_FORMAT;
  const framesPerSecond =
    videoAd.definition.framesPerSecond ?? DEFAULT_FRAMES_PER_SECOND;
  return {
    id: videoAd.id,
    copy: videoAd.copy,
    format,
    framesPerSecond,
    durationInFrames: Math.round(
      videoAd.definition.durationInSeconds * framesPerSecond,
    ),
    component: createVideoComposition({
      definition: videoAd.definition,
      format,
      brand: BRAND,
    }),
  };
});

export function Root() {
  return (
    <>
      <style>{"html, body { margin: 0; overflow: hidden; scrollbar-gutter: auto; }"}</style>
      {videoAds.map((videoAd) => (
        <Composition
          key={videoAd.id}
          id={videoAd.id}
          component={videoAd.component}
          durationInFrames={videoAd.durationInFrames}
          fps={videoAd.framesPerSecond}
          width={videoAd.format.width}
          height={videoAd.format.height}
          defaultProps={{ copy: videoAd.copy }}
        />
      ))}
    </>
  );
}
`,
  );
  const entryPath = path.join(directory, "index.ts");
  await writeFile(
    entryPath,
    `import { registerRoot } from "remotion";
import { Root } from "./root.tsx";

registerRoot(Root);
`,
  );
  const configPath = path.join(directory, "remotion.config.ts");
  await writeFile(
    configPath,
    `import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

const ALIASES: Record<string, string> = ${JSON.stringify(config.aliases)};

Config.overrideWebpackConfig((webpackConfig) =>
  enableTailwind({
    ...webpackConfig,
    resolve: {
      ...webpackConfig.resolve,
      alias: { ...webpackConfig.resolve?.alias, ...ALIASES },
    },
  }),
);
`,
  );
  return { directory, entryPath, configPath, compositions };
}
