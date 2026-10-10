import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ResolvedMarketingConfig } from "./load-marketing-config.ts";

const WORKSPACE_DIRECTORY_NAME = ".marketing";

export function resolveWorkspaceDirectory(
  config: ResolvedMarketingConfig,
): string {
  return path.join(config.configDirectory, WORKSPACE_DIRECTORY_NAME);
}

/** Import specifier from the workspace directory to a file, in the form bundlers expect. */
function relativeSpecifier(options: {
  workspaceDirectory: string;
  target: string;
}): string {
  const relativePath = path
    .relative(options.workspaceDirectory, options.target)
    .split(path.sep)
    .join("/");
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

/**
 * Writes the throwaway files the preview server needs next to the config: an
 * HTML page and the entry that globs the project's designs. Styling comes
 * from the stylesheets the designs import themselves. The directory ignores
 * itself in git and is rewritten on every run, so nothing in it is edited by hand.
 */
export async function writePreviewWorkspace(
  config: ResolvedMarketingConfig,
): Promise<string> {
  const workspaceDirectory = resolveWorkspaceDirectory(config);
  await mkdir(workspaceDirectory, { recursive: true });

  const specifier = (target: string) =>
    relativeSpecifier({ workspaceDirectory, target });
  const carouselsSpecifier = specifier(config.carousel.designsDirectory);
  const imageAdsSpecifier = specifier(config.ads.image.designsDirectory);

  await writeFile(path.join(workspaceDirectory, ".gitignore"), "*\n");
  await writeFile(
    path.join(workspaceDirectory, "preview.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marketing preview</title>
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        scrollbar-gutter: auto;
        background: transparent;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./entry.tsx"></script>
  </body>
</html>
`,
  );
  await writeFile(
    path.join(workspaceDirectory, "entry.tsx"),
    `import { renderPreview } from "@elitosear/marketing/core/preview-app";

renderPreview({
  brand: ${JSON.stringify(config.brand)},
  languages: ${JSON.stringify(config.languages)},
  carousels: {
    format: ${JSON.stringify(config.carousel.format)},
    designModules: import.meta.glob("${carouselsSpecifier}/*/design.tsx", { eager: true }),
    copyModules: import.meta.glob("${carouselsSpecifier}/*/copy.*.json", {
      eager: true,
      import: "default",
    }),
  },
  imageAds: {
    format: ${JSON.stringify(config.ads.image.format)},
    designModules: import.meta.glob("${imageAdsSpecifier}/*/design.tsx", { eager: true }),
    copyModules: import.meta.glob("${imageAdsSpecifier}/*/copy.*.json", {
      eager: true,
      import: "default",
    }),
  },
});
`,
  );
  return workspaceDirectory;
}
