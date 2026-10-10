import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { resolveMarketingConfig } from "../src/core/load-marketing-config.ts";
import { MEDIA_FORMAT_PRESETS } from "../src/core/media-format.ts";

const configFilePath = path.resolve("project", "marketing", "marketing.config.ts");
const directory = path.dirname(configFilePath);

const minimalConfig = {
  brand: { name: "Acme", instagram: "@acme", facebook: "@acme.page" },
  languages: ["en"],
};

test("resolves paths against the config file and fills defaults", () => {
  const config = resolveMarketingConfig({
    configFilePath,
    rawConfig: minimalConfig,
    environment: {},
  });
  assert.equal(config.carousel.designsDirectory, path.join(directory, "carousels"));
  assert.equal(
    config.carousel.ledgerPath,
    path.join(directory, "carousels", "ledger.json"),
  );
  assert.deepEqual(config.carousel.format, MEDIA_FORMAT_PRESETS["feed-portrait"]);
  assert.equal(config.ads.image.designsDirectory, path.join(directory, "ads", "image"));
  assert.equal(config.ads.video.designsDirectory, path.join(directory, "ads", "video"));
  assert.equal(config.ads.ledgerPath, path.join(directory, "ads", "ledger.json"));
  assert.deepEqual(config.ads.image.format, MEDIA_FORMAT_PRESETS["feed-portrait"]);
  assert.deepEqual(config.ads.video.format, MEDIA_FORMAT_PRESETS.vertical);
  assert.equal(config.ads.video.framesPerSecond, 30);
});

test("keeps free-form brand variables and requires a name", () => {
  const config = resolveMarketingConfig({
    configFilePath,
    rawConfig: minimalConfig,
    environment: {},
  });
  assert.deepEqual(config.brand, {
    name: "Acme",
    instagram: "@acme",
    facebook: "@acme.page",
  });
  assert.throws(() =>
    resolveMarketingConfig({
      configFilePath,
      rawConfig: { ...minimalConfig, brand: { instagram: "@acme" } },
      environment: {},
    }),
  );
});

test("rejects unknown top-level keys", () => {
  assert.throws(() =>
    resolveMarketingConfig({
      configFilePath,
      rawConfig: { ...minimalConfig, theme: "dark" },
      environment: {},
    }),
  );
});

test("accepts a format preset by name", () => {
  const config = resolveMarketingConfig({
    configFilePath,
    rawConfig: { ...minimalConfig, ads: { image: { format: "feed-square" } } },
    environment: {},
  });
  assert.equal(config.ads.image.format.height, 1080);
});

test("accepts an explicit format and defaults its safe insets to none", () => {
  const config = resolveMarketingConfig({
    configFilePath,
    rawConfig: {
      ...minimalConfig,
      carousel: { format: { width: 1080, height: 1920 } },
    },
    environment: {},
  });
  assert.equal(config.carousel.format.height, 1920);
  assert.deepEqual(config.carousel.format.safeInsets, {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
});

test("rejects an unknown format preset", () => {
  assert.throws(() =>
    resolveMarketingConfig({
      configFilePath,
      rawConfig: { ...minimalConfig, carousel: { format: "billboard" } },
      environment: {},
    }),
  );
});

test("accepts a video provider and keeps it optional", () => {
  const withoutProvider = resolveMarketingConfig({
    configFilePath,
    rawConfig: minimalConfig,
    environment: {},
  });
  assert.equal(withoutProvider.videoProvider, undefined);
  const withProvider = resolveMarketingConfig({
    configFilePath,
    rawConfig: {
      ...minimalConfig,
      videoProvider: {
        kind: "google",
        model: "veo-3.1-generate-preview",
        apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
      },
    },
    environment: {},
  });
  assert.equal(withProvider.videoProvider?.kind, "google");
});
