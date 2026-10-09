#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import zod from "zod";
import { registerCarouselCommands } from "./cli/carousel-commands.ts";
import { registerConfigCommand } from "./cli/config-command.ts";
import { registerDevelopmentCommand } from "./cli/development-command.ts";
import { registerDoctorCommand } from "./cli/doctor-command.ts";
import { registerImageCommands } from "./cli/image-commands.ts";
import { registerInitializeCommand } from "./cli/initialize-command.ts";
import { registerSkillCommand } from "./cli/skill-command.ts";
import { PACKAGE_ROOT } from "./core/package-paths.ts";

const { version } = zod
  .object({ version: zod.string() })
  .parse(
    JSON.parse(await readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8")),
  );

const program = new Command()
  .name("marketing")
  .description("Marketing assets, images and agent skills for your brand")
  .version(version);

registerInitializeCommand(program);
registerDevelopmentCommand(program);
registerCarouselCommands(program);
registerImageCommands(program);
registerSkillCommand(program);
registerConfigCommand(program);
registerDoctorCommand(program);

await program.parseAsync();
