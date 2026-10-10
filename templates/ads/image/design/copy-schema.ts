import zod from "zod";

export const copySchema = zod.strictObject({
  headline: zod.string(),
  body: zod.string(),
  call_to_action: zod.string(),
});

export type Copy = zod.infer<typeof copySchema>;
