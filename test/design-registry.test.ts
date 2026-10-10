import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import zod from "zod";
import { createDesignRegistry } from "../src/core/design-registry.ts";
import { createLedger } from "../src/core/ledger.ts";
import { selectExports } from "../src/core/design-directory.ts";

const registry = createDesignRegistry({
  kind: "Ad",
  designModules: { "/ads/image/spring-sale/design.tsx": { default: "design" } },
  copyModules: {
    "/ads/image/spring-sale/copy.en.json": { headline: "Hello" },
    "/ads/image/spring-sale/copy.es.json": { headline: "Hola" },
  },
});

test("indexes designs by folder name and copy by language", () => {
  assert.deepEqual(registry.listSlugs(), ["spring-sale"]);
  assert.deepEqual(registry.listLanguages("spring-sale"), ["en", "es"]);
  assert.deepEqual(registry.resolve({ slug: "spring-sale", language: "es" }), {
    definition: "design",
    copy: { headline: "Hola" },
  });
});

test("names what is available when a design or language is missing", () => {
  assert.throws(
    () => registry.resolve({ slug: "autumn", language: "en" }),
    /Unknown Ad "autumn". Available: spring-sale/,
  );
  assert.throws(
    () => registry.resolve({ slug: "spring-sale", language: "fr" }),
    /no fr copy. Available: en, es/,
  );
});

test("narrows exports to the requested slug and language", () => {
  const selection = selectExports({
    kind: "ad",
    availableSlugs: ["a", "b"],
    configuredLanguages: ["en", "es"],
    slug: "b",
    language: undefined,
  });
  assert.deepEqual(selection, { slugs: ["b"], languages: ["en", "es"] });
  assert.throws(() =>
    selectExports({
      kind: "ad",
      availableSlugs: ["a"],
      configuredLanguages: ["en"],
      slug: "z",
      language: undefined,
    }),
  );
});

test("a ledger replaces the entry with the same slug", async () => {
  const entrySchema = zod.strictObject({ slug: zod.string(), concept: zod.string() });
  const ledger = createLedger(entrySchema);
  const directory = await mkdtemp(path.join(os.tmpdir(), "ledger-"));
  const ledgerPath = path.join(directory, "ledger.json");
  await writeFile(ledgerPath, "[]\n");
  await ledger.write({ ledgerPath, entry: { slug: "a", concept: "first" } });
  await ledger.write({ ledgerPath, entry: { slug: "b", concept: "other" } });
  await ledger.write({ ledgerPath, entry: { slug: "a", concept: "second" } });
  assert.deepEqual(await ledger.read(ledgerPath), [
    { slug: "b", concept: "other" },
    { slug: "a", concept: "second" },
  ]);
});
