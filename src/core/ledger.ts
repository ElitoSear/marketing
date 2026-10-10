import { readFile, writeFile } from "node:fs/promises";
import zod from "zod";

/**
 * A ledger is a JSON array with one entry per finished asset. The next
 * asset's author reads it and must pick a visibly different concept, so
 * output never looks like one template.
 */
export function createLedger<Entry extends { slug: string }>(
  entrySchema: zod.ZodType<Entry>,
) {
  const ledgerSchema = zod.array(entrySchema);
  async function read(ledgerPath: string): Promise<Entry[]> {
    return ledgerSchema.parse(JSON.parse(await readFile(ledgerPath, "utf8")));
  }
  return {
    read,
    /** Adds the entry, or replaces the existing one with the same slug. */
    async write(options: { ledgerPath: string; entry: Entry }): Promise<void> {
      const ledger = await read(options.ledgerPath);
      const otherEntries = ledger.filter(
        (entry) => entry.slug !== options.entry.slug,
      );
      await writeFile(
        options.ledgerPath,
        `${JSON.stringify([...otherEntries, options.entry], null, 2)}\n`,
      );
    },
  };
}
