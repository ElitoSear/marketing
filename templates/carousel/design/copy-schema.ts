import zod from "zod";

export const copySchema = zod.strictObject({
  slides: zod
    .array(zod.strictObject({ title: zod.string(), body: zod.string() }))
    .length(3),
});

export type Copy = zod.infer<typeof copySchema>;
