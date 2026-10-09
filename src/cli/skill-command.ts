import { log } from "@clack/prompts";
import type { Command } from "commander";
import path from "node:path";
import pc from "picocolors";
import zod from "zod";
import { installSkills } from "../core/install-skill.ts";
import { loadMarketingConfig } from "../core/load-marketing-config.ts";
import { runCommand } from "./run-command.ts";

const optionsSchema = zod.object({ directory: zod.string().min(1).optional() });

const FALLBACK_SKILLS_DIRECTORY = ".agents/skills";

/**
 * The skills are copied unchanged, so the command works before a project has
 * a marketing.config.ts: the skills are what teach an agent to create it.
 */
async function resolveSkillsDirectory(
  directory: string | undefined,
): Promise<string> {
  if (directory !== undefined) return path.resolve(directory);
  const config = await loadMarketingConfig({
    startDirectory: process.cwd(),
  }).catch(() => undefined);
  return config?.agent.skillsDirectory ?? path.resolve(FALLBACK_SKILLS_DIRECTORY);
}

export function registerSkillCommand(program: Command) {
  const skill = program.command("skill").description("Manage the agent skills");
  skill
    .command("install")
    .alias("update")
    .description("Install or refresh the skills for coding agents")
    .option(
      "--directory <path>",
      `where to install; defaults to agent.skillsDirectory from the config, else ./${FALLBACK_SKILLS_DIRECTORY}`,
    )
    .action((rawOptions: unknown) =>
      runCommand({
        title: "Install skills",
        task: async () => {
          const options = optionsSchema.parse(rawOptions);
          const targetDirectory = await resolveSkillsDirectory(options.directory);
          const skillNames = await installSkills({ targetDirectory });
          for (const skillName of skillNames)
            log.success(`Wrote ${pc.cyan(path.join(targetDirectory, skillName))}`);
          return "Skills are up to date with this package version.";
        },
      }),
    );
}
