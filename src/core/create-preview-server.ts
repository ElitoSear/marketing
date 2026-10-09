import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createServer, searchForWorkspaceRoot, type ViteDevServer } from "vite";
import type { ResolvedMarketingConfig } from "./load-marketing-config.ts";
import { PACKAGE_ROOT } from "./package-paths.ts";
import { writePreviewWorkspace } from "./write-preview-workspace.ts";

export const PREVIEW_PAGE_PATH = "/.marketing/preview.html";

export async function createPreviewServer(options: {
  config: ResolvedMarketingConfig;
  /** Fixed port, or undefined to pick a free one. */
  port: number | undefined;
  /**
   * Export mode turns off file watching and hot reload: a file change in the
   * middle of the screenshot loop would reload the page under the camera.
   */
  exportMode: boolean;
}): Promise<ViteDevServer> {
  const { config, exportMode } = options;
  const workspaceDirectory = await writePreviewWorkspace(config);
  return createServer({
    root: config.configDirectory,
    configFile: false,
    cacheDir: path.join(workspaceDirectory, "vite-cache"),
    logLevel: exportMode ? "warn" : "info",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: config.aliases,
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      exclude: ["@elitosear/marketing"],
      // Dependencies are found by crawling the entry and the designs up front.
      // Finding one late would re-optimize mid-run and leave two copies of React
      // in the page.
      entries: [
        path.join(workspaceDirectory, "entry.tsx"),
        path.join(config.carousel.designsDirectory, "**", "*.tsx"),
      ],
      include: [
        "react",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom/client",
      ],
    },
    server: {
      port: options.port ?? 0,
      hmr: !exportMode,
      watch: exportMode ? null : undefined,
      fs: {
        allow: [searchForWorkspaceRoot(config.configDirectory), PACKAGE_ROOT],
      },
    },
  });
}
