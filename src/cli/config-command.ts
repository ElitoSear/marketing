import type { Command } from "commander";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";

/**
 * Prints the resolved config as JSON (absolute paths, no secrets) so an agent
 * can read brand, directories and languages instead of guessing them.
 */
export function registerConfigCommand(program: Command) {
  program
    .command("config")
    .description("Print the resolved config as JSON")
    .action(async () => {
      try {
        const { environment: _unused, ...config } = await loadMarketingConfig({
          startDirectory: process.cwd(),
        });
        console.log(JSON.stringify(config, null, 2));
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      }
    });
}
