import zod from "zod";
import { createLedger } from "../../core/ledger.ts";

/** One entry per finished ad, image or video. */
export const adLedgerEntrySchema = zod.strictObject({
  slug: zod.string().min(1),
  medium: zod.enum(["image", "video"]),
  created_at: zod.iso.date(),
  concept: zod.string().min(1),
  hook: zod.string().min(1),
  palette: zod.string().min(1),
  layout: zod.string().min(1),
  typography: zod.string().min(1),
});
export type AdLedgerEntry = zod.infer<typeof adLedgerEntrySchema>;

export const adLedger = createLedger(adLedgerEntrySchema);
