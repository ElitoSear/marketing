import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import type { ResolvedMarketingConfig } from "../../../core/load-marketing-config.ts";
import { loadRemotion } from "./load-remotion.ts";
import { writeVideoWorkspace } from "./write-video-workspace.ts";

/**
 * Opens Remotion Studio on the video ads. Resolves when the Studio exits,
 * so the command stays alive while it runs.
 */
export async function startVideoStudio(options: {
  config: ResolvedMarketingConfig;
  port: number | undefined;
}): Promise<void> {
  await loadRemotion();
  const workspace = await writeVideoWorkspace(options.config);
  const remotionCliDirectory = path.dirname(
    createRequire(import.meta.url).resolve("@remotion/cli/package.json"),
  );
  const argumentsList = [
    path.join(remotionCliDirectory, "remotion-cli.js"),
    "studio",
    workspace.entryPath,
    "--config",
    workspace.configPath,
  ];
  if (options.port !== undefined) argumentsList.push("--port", String(options.port));

  const studio = spawn(process.execPath, argumentsList, {
    cwd: options.config.configDirectory,
    stdio: "inherit",
  });
  await new Promise<void>((resolve, reject) => {
    studio.once("error", reject);
    studio.once("exit", (code) =>
      code === 0 || code === null
        ? resolve()
        : reject(new Error(`Remotion Studio exited with code ${code}`)),
    );
  });
}
