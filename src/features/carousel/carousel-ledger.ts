import { readFile, writeFile } from "node:fs/promises";
import zod from "zod";

/**
 * One entry per finished carousel. The next carousel's author reads this and
 * must pick a visibly different concept, so posts never look like one template.
 */
export const carouselLedgerEntrySchema = zod.strictObject({
  slug: zod.string().min(1),
  created_at: zod.iso.date(),
  concept: zod.string().min(1),
  panorama_thread: zod.string().min(1),
  palette: zod.string().min(1),
  layout: zod.string().min(1),
  typography: zod.string().min(1),
});
export type CarouselLedgerEntry = zod.infer<typeof carouselLedgerEntrySchema>;

export const carouselLedgerSchema = zod.array(carouselLedgerEntrySchema);
export type CarouselLedger = zod.infer<typeof carouselLedgerSchema>;

export async function readCarouselLedger(
  ledgerPath: string,
): Promise<CarouselLedger> {
  return carouselLedgerSchema.parse(JSON.parse(await readFile(ledgerPath, "utf8")));
}

/** Adds the entry, or replaces the existing one with the same slug. */
export async function writeCarouselLedgerEntry(options: {
  ledgerPath: string;
  entry: CarouselLedgerEntry;
}): Promise<void> {
  const ledger = await readCarouselLedger(options.ledgerPath);
  const otherEntries = ledger.filter((entry) => entry.slug !== options.entry.slug);
  await writeFile(
    options.ledgerPath,
    `${JSON.stringify([...otherEntries, options.entry], null, 2)}\n`,
  );
}
