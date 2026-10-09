/** Names the missing variable and never echoes any value. */
export function readEnvironmentVariable(
  environment: NodeJS.ProcessEnv,
  name: string,
): string {
  const value = environment[name];
  if (value === undefined || value === "")
    throw new Error(
      `Environment variable ${name} is not set. Set it in the .env file next to marketing.config.ts.`,
    );
  return value;
}
