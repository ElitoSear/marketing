# Changelog

## 0.2.0

- Ads: image ads (`defineImageAd`, `AdCanvas`, PNG export) and video ads (`defineVideoAd`, Remotion, MP4 export) behind `marketing ads new|list|export|still|studio|ledger-add`, with the `ad-design` skill. Remotion is an optional peer dependency.
- Video ads: `marketing ads sheet` (a contact sheet of a whole video), `ads/video/motion` building blocks (`Entrance`, `WordReveal`, `PunchIn`, `KenBurns`, `Backdrop`, `Pointer`, `Typewriter`, `Grain`, `Vignette`), a starter template with layered background, hard cuts and a held call to action, and a video craft reference for the `ad-design` skill (composition, motion, editing rhythm and taste, hooks, captions, sound, generated imagery and cutouts). The skill asks for demonstrations that build progressively and simulate interaction, and forbids synthesized audio (real recordings or silence; video-model effects inside a clip are allowed). `marketing video generate` creates clips (silent unless `--audio`) with Veo (Gemini API or Vertex AI) from a `videoProvider` in the config, optionally from a first and last frame, and refuses to run without `--yes`; the skill gates it on the owner's confirmation and has a product-commercials reference. Sheets and single frames are review material and are written to `.marketing/review/`, never to `output/`.
- Shared media layer: `useMediaFormat()` and format presets (`feed-portrait`, `feed-square`, `feed-landscape`, `vertical`) with safe insets.
- `useBrand()` hands the config's `brand` to every design, in the preview and in video renders.
- Carousels: `useCarouselCanvas()` and `useCarouselSlide()` expose slide count, slide size, total width, slide index and offset.
- `marketing dev` previews carousels and image ads.
- Breaking: `format` is a preset name or `{ width, height, safeInsets }` (replaces `safeWidth`); `useCarouselFormat` is replaced by `useMediaFormat`; `@elitosear/marketing/features/carousel/preview-app` moved to `core/preview-app`.
- Breaking: `styles` is gone from the config. `styles.css` is the one Tailwind entry and every design imports it (`tailwindcss` v4 is now a peer dependency); the `agent` block and the `inspirationDirectory` keys are gone too, and `skill install` writes to the nearest `.agents/skills`.
- Breaking: `brand` is free-form. Only `name` is required; `handle` is now an ordinary variable, so a config can carry one handle per platform (`instagram`, `facebook`) or anything else designs need. `init --handle` is optional.
- Skills: `ad-design` added; research now treats what it finds as inspiration to build on, and generated copy uses no em dashes; the skills no longer reference project instruction files or a research protocol, and ask the user for missing context. Research covers the owner's own taste, a dozen or more real examples and retries on thin searches; angles must differ from existing assets; the stand-in stage is required even with existing pictures; carousels deliver a caption and ads deliver platform text. Existing pictures are rated and used as references for generated scenes instead of defaults, and copy is written natively per language, not translated word for word.
- Breaking: defaults moved to `carousels/` (designs), `carousels/ledger.json` and `output/carousels`; ads use `ads/image`, `ads/video`, `ads/ledger.json` and `output/ads`.

## 0.1.1

- Lint with `@elitosear/eslint-rules` 0.2.0.
- Releases publish to npm through trusted publishing.

## 0.1.0

First release: React carousel designs exported to PNG, config-driven image generation on the Vercel AI SDK, local background removal and static agent skills (`marketing`, `carousel`), behind one `marketing` CLI.
