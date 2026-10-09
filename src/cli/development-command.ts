import { log } from "@clack/prompts";
import type { Command } from "commander";
import pc from "picocolors";
import zod from "zod";
import { createPreviewServer, PREVIEW_PAGE_PATH } from "../core/create-preview-server.ts";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";
import { runCommand } from "./run-command.ts";

const optionsSchema = zod.object({ port: zod.coerce.number().int().optional() });

export function registerDevelopmentCommand(program: Command) {
  program
    .command("dev")
    .description("Start the live carousel preview")
    .option("--port <port>", "port to listen on")
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Carousel preview",
        task: async () => {
          const options = optionsSchema.parse(rawOptions);
          const config = await loadMarketingConfig({ startDirectory: process.cwd() });
          const server = await createPreviewServer({
            config,
            port: options.port,
            exportMode: false,
          });
          await server.listen();
          const baseUrl = server.resolvedUrls?.local[0];
          if (baseUrl === undefined) throw new Error("Vite did not report a local URL");
          log.info(`${config.brand.name} · ${config.languages.join(", ")}`);
          log.success(
            `Open ${pc.cyan(`${baseUrl.replace(/\/$/, "")}${PREVIEW_PAGE_PATH}`)}`,
          );
          return "Preview running. Press Ctrl+C to stop.";
        },
      }),
    );
}
