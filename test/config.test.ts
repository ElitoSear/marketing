import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { resolveMarketingConfig } from "../src/core/load-marketing-config.ts";

const configFilePath = path.resolve("project", "marketing", "marketing.config.ts");

test("resolves paths against the config file and fills defaults", () => {
  const config = resolveMarketingConfig({
    configFilePath,
    rawConfig: {
      brand: { name: "Acme", handle: "@acme" },
      styles: "./styles.css",
      languages: ["en"],
    },
    environment: {},
  });
  const directory = path.dirname(configFilePath);
  assert.equal(config.stylesPath, path.join(directory, "styles.css"));
  assert.equal(config.carousel.designsDirectory, path.join(directory, "designs"));
  assert.equal(config.carousel.ledgerPath, path.join(directory, "ledger.json"));
  assert.deepEqual(config.carousel.format, { width: 1080, height: 1350, safeWidth: 1012 });
  assert.equal(config.agent.skillsDirectory, path.resolve(directory, "../.agents/skills"));
});

test("rejects unknown keys", () => {
  assert.throws(() =>
    resolveMarketingConfig({
      configFilePath,
      rawConfig: {
        brand: { name: "Acme", handle: "@acme", logo: "./logo.svg" },
        styles: "./styles.css",
        languages: ["en"],
      },
      environment: {},
    }),
  );
});

test("accepts a custom slide format", () => {
  const config = resolveMarketingConfig({
    configFilePath,
    rawConfig: {
      brand: { name: "Acme", handle: "@acme" },
      styles: "./styles.css",
      languages: ["en"],
      carousel: { format: { width: 1080, height: 1920, safeWidth: 900 } },
    },
    environment: {},
  });
  assert.equal(config.carousel.format.height, 1920);
});
