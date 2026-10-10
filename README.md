# @elitosear/marketing

[![CI](https://github.com/ElitoSear/marketing/actions/workflows/ci.yml/badge.svg)](https://github.com/ElitoSear/marketing/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@elitosear/marketing)](https://www.npmjs.com/package/@elitosear/marketing)
[![license](https://img.shields.io/npm/l/@elitosear/marketing)](LICENSE)

Marketing assets for any brand from one `marketing.config.ts`: React + Tailwind carousels and image ads exported to PNG, video ads rendered with Remotion, image generation on the Vercel AI SDK, local background removal, and skills that teach coding agents the whole workflow.

- **Config-driven.** Brand, languages, slide format, image provider and directories live in one typed config. Nothing is tied to a project.
- **Agent-first.** The skills are static text that say what to do with the CLI. The agent finds or creates the config, reads it with `marketing config`, and writes the project's `styles.css` itself.
- **Modular.** A shared core (config, media formats, preview server, images) with features on top: carousels, image ads and video ads today.

## Install

```sh
pnpm add @elitosear/marketing react react-dom zod tailwindcss
pnpm exec marketing init marketing --name Acme --handle @acme --languages en,es --provider google --yes
pnpm exec marketing skill install
```

`init` writes the marketing folder: `marketing.config.ts`, an empty `styles.css`, a ledger for carousels and one for ads, and `.env.schema`. `skill install` copies the agent skills (`marketing`, `carousel`, `ad-design`) into the nearest `.agents/skills` above the working directory (or `./.agents/skills`; `--directory` overrides). Upgrade with `pnpm up @elitosear/marketing`, then run `skill install` again.

Requires Node 22+ and Google Chrome: the PNG exporter drives the installed Chrome, so no browser is downloaded. Video ads need Remotion, see [Video ads](#video-ads).

## Quick start

```sh
cd marketing
pnpm exec marketing carousel new first-post   # scaffold a design with copy per language
pnpm exec marketing dev                       # live preview
pnpm exec marketing carousel export           # one PNG per slide in output/carousels/<language>/<slug>/
pnpm exec marketing ads new first-ad --medium image
pnpm exec marketing ads export                # output/ads/<language>/<slug>.png
```

Put the project's fonts and design tokens in `styles.css` first. Designs get their look only from that file, which every design imports.

## Commands

| Command | Does |
| --- | --- |
| `init [directory]` | Scaffold the marketing folder |
| `config` | Print the resolved config as JSON (for agents) |
| `dev` | Live preview of carousels and image ads |
| `carousel new <slug>` | Scaffold a design with copy per language |
| `carousel list` | List designs, languages and ledger concepts |
| `carousel export` | Export one PNG per slide |
| `carousel ledger-add` | Record a finished carousel |
| `ads new <slug> --medium <image|video>` | Scaffold an ad design with copy per language |
| `ads list` | List ads, their medium and languages |
| `ads export` | Export image ads to PNG and video ads to MP4 |
| `ads sheet` | Render a contact sheet of a whole video ad to judge its motion |
| `ads still` | Render one frame of a video ad to a PNG |
| `ads studio` | Open Remotion Studio on the video ads |
| `video generate` | Generate a clip (`--audio` adds sound effects) with your video provider (billed, needs `--yes`) |
| `ads ledger-add` | Record a finished ad |
| `image generate` | Generate or edit an image with the configured provider |
| `image remove-background` | Cut out the subject locally |
| `skill install` | Install or refresh the agent skills |
| `doctor` | Check config, files and credentials |

Commands find `marketing.config.ts` by walking up from the working directory.

## Config

```ts
import { defineMarketingConfig } from "@elitosear/marketing/core/marketing-config";

export default defineMarketingConfig({
  brand: { name: "Acme", instagram: "@acme", facebook: "@acme.page" },
  languages: ["en", "es"],
  aliases: { "@site-assets": "../public/assets" },
  imageProvider: {
    kind: "google",
    model: "gemini-2.5-flash-image",
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  // Optional. Only needed for `marketing video generate` (Veo). Use kind "vertex"
  // with serviceAccountEnv and location for Vertex AI. Clips are silent unless `--audio` is passed.
  videoProvider: {
    kind: "google",
    model: "veo-3.1-fast-generate-preview",
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  carousel: {
    designs: "carousels",
    output: "output/carousels",
    ledger: "carousels/ledger.json",
    format: "feed-portrait",
  },
  ads: {
    image: { designs: "ads/image", format: "feed-portrait" },
    video: { designs: "ads/video", format: "vertical", framesPerSecond: 30 },
    output: "output/ads",
    ledger: "ads/ledger.json",
  },
});
```

`brand` is free-form: only `name` is required, and every other key is a variable of your own (a handle per platform, a website, a tagline) that designs and agents read from `marketing config`. Every path is relative to the config file, and every key above shows its default. Secrets stay in a `.env` next to the config; the config only names the variables.

### Formats

`format` is a preset name or an explicit `{ width, height, safeInsets }`. Safe insets are the margins that platform interfaces or crops can cover; key content stays inside them.

| Preset | Size | Safe insets |
| --- | --- | --- |
| `feed-portrait` | 1080 × 1350 | 34 px left and right (the profile grid crops 4:5 to 3:4) |
| `feed-square` | 1080 × 1080 | none |
| `feed-landscape` | 1200 × 628 | none |
| `vertical` | 1080 × 1920 | 220 px top, 500 px bottom, 180 px left and right: a 720 × 1200 band that clears the interface of TikTok, Reels, Stories and Shorts |

A carousel's format is the size of one slide. An ad design can set its own `format`, which overrides the config default.

### Styles

`styles.css` is the one file that holds the brand's look: it starts with `@import "tailwindcss"`, then your fonts, design tokens and `@theme` entries, usually by `@import`ing the project's own stylesheet. Every design imports it (the scaffolds do), so they share one theme; the engine never searches for one. Tailwind v4 is a peer dependency, and the engine's own components use inline styles, so they need no Tailwind setup.

### Image providers

Providers run on the [Vercel AI SDK](https://ai-sdk.dev).

| `kind` | Backend | Credentials |
| --- | --- | --- |
| `google` | Gemini Developer API | `apiKeyEnv` |
| `vertex` | Gemini on Vertex AI | `serviceAccountEnv` (service-account JSON on one line), `location` |
| `openai` | OpenAI Images | `apiKeyEnv` |
| `openai-compatible` | Any server with an OpenAI images endpoint | `apiKeyEnv`, `baseUrl` |

`image generate --input <file>` passes existing images to the model to edit them or keep a subject consistent. Generation bills your provider account.

### Background removal

`image remove-background` runs locally with BiRefNet (MIT weights). The first run downloads about 1 GB into your user cache, shared by every project.

## Designs

A carousel is `carousels/<slug>/design.tsx` exporting `defineCarousel({ slideCount, copySchema, Design })`, plus one `copy.<language>.json` per language that satisfies the design's zod schema. The whole carousel is one wide canvas of `slideCount` slides: artwork can cross slide edges, and the exporter screenshots one slide-sized window per slide.

Optional building blocks, each at its own path:

| Import (`@elitosear/marketing/...`) | Exports |
| --- | --- |
| `features/carousel/carousel-definition` | `defineCarousel` |
| `features/carousel/carousel-frame` | `CarouselCanvas`, `CarouselSlide` |
| `features/carousel/carousel-context` | `useCarouselCanvas`, `useCarouselSlide` |
| `core/media-format-context` | `useMediaFormat` (size and safe insets of the media being rendered) |
| `core/brand-context` | `useBrand` (the config's `brand`, in the preview and in video renders) |
| `components/emphasis-text` | `EmphasisText` (`*word*` emphasis that survives translation) |
| `components/icon-label` | `IconLabel` (an icon beside a label) |

## Ads

An ad is one fixed canvas with no slides, in two media that share the config, ledger, output folder and copy workflow.

**Image ads** live in `ads/image/<slug>/design.tsx`, export `defineImageAd({ copySchema, Design })` and render inside `AdCanvas`. They are exported to `output/ads/<language>/<slug>.png` like carousels, and appear in `marketing dev` at `?ad=<slug>&language=<code>`.

**Video ads** live in `ads/video/<slug>/design.tsx` and export `defineVideoAd({ durationInSeconds, copySchema, Design })`. The design is a React component that animates with Remotion's hooks; `ads export --medium video` renders `output/ads/<language>/<slug>.mp4`.

| Import (`@elitosear/marketing/...`) | Exports |
| --- | --- |
| `features/ads/image/image-ad-definition` | `defineImageAd` |
| `features/ads/image/ad-canvas` | `AdCanvas` |
| `features/ads/video/video-ad-definition` | `defineVideoAd` |
| `features/ads/video/motion` | `Entrance`, `WordReveal`, `PunchIn`, `KenBurns`, `Backdrop`, `Pointer`, `Typewriter`, `Grain`, `Vignette` (frame-driven motion building blocks) |

### Video ads

Remotion is an optional dependency with its own license: companies above a size threshold need a Remotion license, so check [the terms](https://www.remotion.dev/license) before using it. Install the same exact version of every package:

```sh
pnpm add --save-exact remotion @remotion/bundler @remotion/renderer @remotion/cli @remotion/tailwind-v4
```

Image-only projects never load Remotion. The first render downloads Chrome Headless Shell (about 120 MB) once. `ads studio` opens Remotion Studio, which needs a `tsconfig.json` next to your `package.json`; `ads sheet --ad <slug>` renders a contact sheet of the whole video and `ads still --ad <slug> --frame <n>` one frame, both as PNGs for review.

## Agent skills

`skill install` ships three skills:

- **`marketing`**: finds or creates the config, writes the styles file, learns the project's context (and asks you for what is missing), and covers image sourcing and generation.
- **`carousel`**: the process, hard limits and principles for designing, translating and exporting carousels.
- **`ad-design`**: the same for image and video ads, with a separate reference for Remotion.

The skills contain no project data and point at no project files. They tell the agent to run `marketing config`, find the project's own context and ask you when something is missing. `carousel` and `ad-design` research current examples read-only and ask before using a browser.

## Layout

```
src/core/               config, media formats, preview server, image providers, background removal, skill install
src/features/carousel/  design API, canvas and slide contexts, exporter, ledger
src/features/ads/       image ads (design API, canvas, exporter) and video ads (Remotion workspace, renderer)
src/components/         brand-agnostic React building blocks
src/cli/                one file per command group
skill/                  agent skills shipped in the package
templates/              starter files for `carousel new`
```

A new feature adds `src/features/<name>/`, a `<name>` block in the config schema, a command group in `src/cli/` and a skill in `skill/`.

## Development

```sh
pnpm install
pnpm type-check && pnpm lint && pnpm test
pnpm build
```

## Release

CI verifies every push and pull request. To publish, bump the version and push the tag:

```sh
npm version minor
git push --follow-tags
```

The `Release` workflow re-runs the checks, verifies that the tag matches `package.json` and publishes to npm with provenance through npm trusted publishing (OIDC), so no token is stored. The trusted publisher is configured once on npmjs.com for this repository and `release.yml`.

## License

[MIT](LICENSE)
