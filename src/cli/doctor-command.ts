import { log } from "@clack/prompts";
import type { Command } from "commander";
import path from "node:path";
import pc from "picocolors";
import { fileExists } from "../core/design-directory.ts";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";
import { adLedger } from "../features/ads/ads-ledger.ts";
import { carouselLedger } from "../features/carousel/carousel-ledger.ts";
import { runCommand } from "./run-command.ts";

async function isReadable(read: () => Promise<unknown>): Promise<boolean> {
  return read().then(
    () => true,
    () => false,
  );
}

export function registerDoctorCommand(program: Command) {
  program
    .command("doctor")
    .description("Check the config, files and credentials")
    .action(() =>
      runCommand({
        title: "Doctor",
        task: async () => {
          const config = await loadMarketingConfig({
            startDirectory: process.cwd(),
          });
          const relative = (target: string) =>
            path.relative(process.cwd(), target) || ".";
          const checks: Array<{ label: string; passed: boolean }> = [
            { label: `config ${relative(config.configFilePath)}`, passed: true },
            {
              label: `carousel ledger ${relative(config.carousel.ledgerPath)}`,
              passed: await isReadable(() =>
                carouselLedger.read(config.carousel.ledgerPath),
              ),
            },
            {
              label: `ad ledger ${relative(config.ads.ledgerPath)}`,
              passed: await isReadable(() => adLedger.read(config.ads.ledgerPath)),
            },
          ];
          for (const [alias, directory] of Object.entries(config.aliases))
            checks.push({
              label: `alias ${alias}`,
              passed: await fileExists(directory),
            });
          const provider = config.imageProvider;
          if (provider === undefined) {
            log.warn(
              "No imageProvider configured: `marketing image generate` is unavailable.",
            );
          } else {
            const variableName =
              provider.kind === "vertex"
                ? provider.serviceAccountEnv
                : provider.apiKeyEnv;
            checks.push({
              label: `${provider.kind} credential in ${variableName}`,
              passed: (config.environment[variableName] ?? "") !== "",
            });
          }
          const videoProvider = config.videoProvider;
          if (videoProvider !== undefined) {
            const variableName =
              videoProvider.kind === "vertex"
                ? videoProvider.serviceAccountEnv
                : videoProvider.apiKeyEnv;
            checks.push({
              label: `video ${videoProvider.kind} credential in ${variableName}`,
              passed: (config.environment[variableName] ?? "") !== "",
            });
          }
          for (const check of checks)
            log.message(
              `${check.passed ? pc.green("✔") : pc.red("✖")} ${check.label}`,
            );
          const failed = checks.filter((check) => !check.passed).length;
          if (failed > 0)
            throw new Error(`${failed} check${failed === 1 ? "" : "s"} failed`);
          return "Everything is in place.";
        },
      }),
    );
}
