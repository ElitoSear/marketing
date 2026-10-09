import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ResolvedMarketingConfig } from "./load-marketing-config.ts";
import { PACKAGE_ROOT } from "./package-paths.ts";

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
 * HTML page, the entry that globs the project's designs, and the stylesheet
 * that wires Tailwind to the project's styles. The directory ignores itself in git and is
 * rewritten on every run, so nothing in it is edited by hand.
 */
export async function writePreviewWorkspace(
  config: ResolvedMarketingConfig,
): Promise<string> {
  const workspaceDirectory = resolveWorkspaceDirectory(config);
  await mkdir(workspaceDirectory, { recursive: true });

  const specifier = (target: string) =>
    relativeSpecifier({ workspaceDirectory, target });
  const designsSpecifier = specifier(config.carousel.designsDirectory);
  // Tailwind lives next to this package, not necessarily in the project's own
  // node_modules, so the stylesheet imports it by file path.
  const tailwindStylesheet = createRequire(import.meta.url).resolve(
    "tailwindcss/index.css",
  );

  await writeFile(path.join(workspaceDirectory, ".gitignore"), "*\n");
  await writeFile(
    path.join(workspaceDirectory, "preview.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Carousel preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./entry.tsx"></script>
  </body>
</html>
`,
  );
  await writeFile(
    path.join(workspaceDirectory, "styles.css"),
    `@import "${specifier(tailwindStylesheet)}";
@import "${specifier(config.stylesPath)}";
@source "${specifier(path.join(PACKAGE_ROOT, "dist"))}";

html,
body {
  margin: 0;
  padding: 0;
  background: transparent;
}
`,
  );
  await writeFile(
    path.join(workspaceDirectory, "entry.tsx"),
    `import "./styles.css";
import { renderPreview } from "@elitosear/marketing/features/carousel/preview-app";

renderPreview({
  format: ${JSON.stringify(config.carousel.format)},
  languages: ${JSON.stringify(config.languages)},
  designModules: import.meta.glob("${designsSpecifier}/*/design.tsx", { eager: true }),
  copyModules: import.meta.glob("${designsSpecifier}/*/copy.*.json", {
    eager: true,
    import: "default",
  }),
});
`,
  );
  return workspaceDirectory;
}
