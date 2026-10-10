import { log } from "@clack/prompts";
import type { Command } from "commander";
import { findUp } from "find-up-simple";
import os from "node:os";
import path from "node:path";
import pc from "picocolors";
import zod from "zod";
import { installSkills } from "../core/install-skill.ts";
import { runCommand } from "./run-command.ts";

const optionsSchema = zod.object({ directory: zod.string().min(1).optional() });

const AGENTS_DIRECTORY_NAME = ".agents";

/**
 * Installs next to the project's existing `.agents` directory when one is
 * found above the working directory, otherwise into `./.agents/skills`. The
 * `.agents` directory in the user's home folder holds their global skills, so
 * it never counts as a project's.
 */
async function resolveSkillsDirectory(
  directory: string | undefined,
): Promise<string> {
  if (directory !== undefined) return path.resolve(directory);
  const agentsDirectory = await findUp(AGENTS_DIRECTORY_NAME, {
    cwd: process.cwd(),
    type: "directory",
  });
  const isProjectDirectory =
    agentsDirectory !== undefined &&
    agentsDirectory !== path.join(os.homedir(), AGENTS_DIRECTORY_NAME);
  return path.join(
    isProjectDirectory ? agentsDirectory : path.resolve(AGENTS_DIRECTORY_NAME),
    "skills",
  );
}

export function registerSkillCommand(program: Command) {
  const skill = program.command("skill").description("Manage the agent skills");
  skill
    .command("install")
    .alias("update")
    .description("Install or refresh the skills for coding agents")
    .option(
      "--directory <path>",
      "where to install; defaults to skills/ in the nearest .agents directory above the working directory, else ./.agents/skills",
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
