import { confirm, isCancel, log, note, select, text } from "@clack/prompts";
import type { Command } from "commander";
import { access } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import zod from "zod";
import { resolveAddCommand, resolveRunCommand } from "../core/resolve-run-command.ts";
import { IMAGE_PROVIDER_KINDS, scaffoldProject } from "../core/scaffold-project.ts";
import { runCommand } from "./run-command.ts";

const providerChoiceSchema = zod.enum([...IMAGE_PROVIDER_KINDS, "none"]);

const optionsSchema = zod.object({
  name: zod.string().min(1).optional(),
  handle: zod.string().min(1).optional(),
  languages: zod.string().min(1).optional(),
  provider: providerChoiceSchema.optional(),
  yes: zod.boolean().optional(),
});
type Options = zod.infer<typeof optionsSchema>;

const CANCELLED_MESSAGE = "Cancelled, nothing was written";

async function exists(filePath: string): Promise<boolean> {
  return access(filePath).then(
    () => true,
    () => false,
  );
}

async function askText(options: Parameters<typeof text>[0]): Promise<string> {
  const answer = await text(options);
  if (isCancel(answer)) throw new Error(CANCELLED_MESSAGE);
  return answer;
}

async function askSelect(
  options: Parameters<typeof select<string>>[0],
): Promise<string> {
  const answer = await select(options);
  if (isCancel(answer)) throw new Error(CANCELLED_MESSAGE);
  return answer;
}

async function askConfirm(
  options: Parameters<typeof confirm>[0],
): Promise<boolean> {
  const answer = await confirm(options);
  if (isCancel(answer)) throw new Error(CANCELLED_MESSAGE);
  return answer;
}

function requireValue(value: string | undefined): string | undefined {
  return value === undefined || value === "" ? "Required" : undefined;
}

export function registerInitializeCommand(program: Command) {
  program
    .command("init")
    .argument("[directory]", "where to create the marketing folder", "marketing")
    .description("Set up marketing in this project")
    .option("--name <name>", "brand name")
    .option("--handle <handle>", "social handle, for example @brand; more brand variables go in marketing.config.ts")
    .option("--languages <codes>", "comma-separated language codes")
    .option("--provider <kind>", "image provider: google, openai or none")
    .option("-y, --yes", "accept defaults and skip prompts")
    .action((directory: string, rawOptions: unknown) =>
      runCommand({
        title: "Set up marketing",
        task: async () => {
          const options = optionsSchema.parse(rawOptions);
          const interactive = options.yes !== true;
          const targetDirectory = path.resolve(directory);
          if (await exists(path.join(targetDirectory, "marketing.config.ts")))
            throw new Error(`${directory}/marketing.config.ts already exists`);

          const brandName =
            options.name ??
            (interactive
              ? await askText({ message: "Brand name", validate: requireValue })
              : undefined);
          if (brandName === undefined) throw new Error("Pass --name <name>");
          const answeredHandle =
            options.handle ??
            (interactive
              ? await askText({
                  message: "Social handle (optional, Enter to skip)",
                  initialValue: "",
                })
              : undefined);
          const brandHandle =
            answeredHandle === undefined || answeredHandle === ""
              ? undefined
              : answeredHandle;
          const languageCodes =
            options.languages ??
            (interactive
              ? await askText({
                  message: "Languages, comma-separated (the first is the default)",
                  initialValue: "en",
                })
              : "en");
          const languages = languageCodes
            .split(",")
            .map((code) => code.trim())
            .filter((code) => code !== "");
          const provider =
            options.provider ??
            providerChoiceSchema.parse(
              interactive
                ? await askSelect({
                    message: "Image generation provider",
                    options: [
                      { value: "google", label: "Google Gemini" },
                      { value: "openai", label: "OpenAI" },
                      { value: "none", label: "None for now" },
                    ],
                  })
                : "none",
            );
          const scaffolded = await scaffoldProject({
            directory: targetDirectory,
            brandName,
            brandHandle,
            languages,
            imageProviderKind: provider === "none" ? undefined : provider,
          });
          for (const createdPath of scaffolded.createdPaths)
            log.success(path.relative(process.cwd(), createdPath));

          const runCommandText = await resolveRunCommand({
            directory: process.cwd(),
            binary: "marketing",
          });
          const addCommandText = await resolveAddCommand({
            directory: process.cwd(),
            packages: ["@elitosear/marketing", "react", "react-dom", "zod", "tailwindcss"],
          });
          note(
            [
              `1. ${pc.cyan(addCommandText)}`,
              `2. ${pc.cyan(`cd ${path.relative(process.cwd(), targetDirectory) || "."}`)}`,
              `3. Put the brand's fonts and colours in styles.css; every design imports it.`,
              `4. ${pc.cyan(`${runCommandText} skill install`)} gives your coding agent the skills.`,
              `5. ${pc.cyan(`${runCommandText} carousel new my-first-carousel`)}, then ${pc.cyan(`${runCommandText} dev`)}.`,
            ].join("\n"),
            "Next steps",
          );
          return `${brandName} is set up.`;
        },
      }),
    );
}
