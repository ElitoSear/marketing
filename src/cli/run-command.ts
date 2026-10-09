import { cancel, intro, outro } from "@clack/prompts";
import pc from "picocolors";

/**
 * Frames a command's output with the shared intro and outro and turns a thrown
 * error into a clean message with a non-zero exit code.
 */
export async function runCommand(options: {
  title: string;
  task: () => Promise<string>;
}): Promise<void> {
  intro(`${pc.bgCyan(pc.black(" marketing "))} ${pc.bold(options.title)}`);
  try {
    outro(pc.green(await options.task()));
  } catch (error) {
    cancel(pc.red(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  }
}
