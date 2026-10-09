import { detect, resolveCommand } from "package-manager-detector";

/** How to run a locally installed binary with the project's package manager, for example `pnpm exec marketing`. */
export async function resolveRunCommand(options: {
  directory: string;
  binary: string;
}): Promise<string> {
  const detected = await detect({ cwd: options.directory });
  const resolved = resolveCommand(detected?.agent ?? "npm", "execute-local", [
    options.binary,
  ]);
  if (resolved === null)
    throw new Error(
      "Cannot resolve how to run a local binary with this package manager",
    );
  return [resolved.command, ...resolved.args].join(" ");
}

/** The package manager's command to add dependencies, for example `pnpm add react`. */
export async function resolveAddCommand(options: {
  directory: string;
  packages: string[];
}): Promise<string> {
  const detected = await detect({ cwd: options.directory });
  const resolved = resolveCommand(detected?.agent ?? "npm", "add", options.packages);
  if (resolved === null)
    throw new Error("Cannot resolve how to add packages with this package manager");
  return [resolved.command, ...resolved.args].join(" ");
}
