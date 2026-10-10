import zod from "zod";
import { createLedger } from "../../core/ledger.ts";

/** One entry per finished carousel. */
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

export const carouselLedger = createLedger(carouselLedgerEntrySchema);
