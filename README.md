# @elitosear/marketing

[![CI](https://github.com/ElitoSear/marketing/actions/workflows/ci.yml/badge.svg)](https://github.com/ElitoSear/marketing/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@elitosear/marketing)](https://www.npmjs.com/package/@elitosear/marketing)
[![license](https://img.shields.io/npm/l/@elitosear/marketing)](LICENSE)

Marketing assets for any brand from one `marketing.config.ts`: React + Tailwind carousel designs exported to PNG, image generation on the Vercel AI SDK, local background removal, and skills that teach coding agents the whole workflow.

- **Config-driven.** Brand, languages, slide format, image provider and directories live in one typed config. Nothing is tied to a project.
- **Agent-first.** The skills are static text. The agent finds or creates the config, reads it with `marketing config`, and supplies the project's styles itself.
- **Modular.** A shared core (config, preview server, images) with features on top. Carousels ship today; more formats follow.

## Install

```sh
pnpm add @elitosear/marketing react react-dom zod
pnpm exec marketing init marketing --name Acme --handle @acme --languages en,es --provider google --yes
pnpm exec marketing skill install
```

`init` writes the marketing folder: `marketing.config.ts`, an empty `styles.css`, `ledger.json`, `designs/` and `.env.schema`. `skill install` copies the agent skills (`marketing`, `carousel`) into `.agents/skills`, or into `agent.skillsDirectory` when a config exists. Upgrade with `pnpm up @elitosear/marketing`, then run `skill install` again.

Requires Node 22+ and Google Chrome: the exporter drives the installed Chrome, so no browser is downloaded.

## Quick start

```sh
cd marketing
pnpm exec marketing carousel new first-post   # scaffold a design with copy per language
pnpm exec marketing dev                       # live preview
pnpm exec marketing carousel export           # one PNG per slide in output/<language>/<slug>/
```

Put the project's fonts and design tokens in `styles.css` first. Designs get their look only from that file.

## Commands

| Command | Does |
| --- | --- |
| `init [directory]` | Scaffold the marketing folder |
| `config` | Print the resolved config as JSON (for agents) |
| `dev` | Live carousel preview |
| `carousel new <slug>` | Scaffold a design with copy per language |
| `carousel list` | List designs, languages and ledger concepts |
| `carousel export` | Export one PNG per slide |
| `carousel ledger-add` | Record a finished carousel |
| `image generate` | Generate or edit an image with the configured provider |
| `image remove-background` | Cut out the subject locally |
| `skill install` | Install or refresh the agent skills |
| `doctor` | Check config, files and credentials |

Commands find `marketing.config.ts` by walking up from the working directory.

## Config

```ts
import { defineMarketingConfig } from "@elitosear/marketing/core/marketing-config";

export default defineMarketingConfig({
  brand: { name: "Acme", handle: "@acme" },
  styles: "./styles.css",
  languages: ["en", "es"],
  aliases: { "@site-assets": "../public/assets" },
  imageProvider: {
    kind: "google",
    model: "gemini-2.5-flash-image",
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  carousel: {
    designs: "designs",
    output: "output",
    ledger: "ledger.json",
    format: { width: 1080, height: 1350, safeWidth: 1012 },
    inspirationDirectory: "../docs/inspiration",
  },
  agent: {
    skillsDirectory: "../.agents/skills",
    contextFiles: ["../docs/positioning.md"],
    instructionsFile: "./project-rules.md",
  },
});
```

Every path is relative to the config file. Secrets stay in a `.env` next to the config; the config only names the variables.

### Styles

`styles` is a CSS file the project owns: fonts, design tokens, `@theme` entries. Tailwind is loaded for you. The engine never searches for a theme; the person or agent setting up the project writes this file, usually by `@import`ing the project's own stylesheet.

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

A design is `designs/<slug>/design.tsx` exporting `defineCarousel({ slideCount, copySchema, Design })`, plus one `copy.<language>.json` per language that satisfies the design's zod schema. The whole carousel is one wide canvas of `slideCount` slides: artwork can cross slide edges, and the exporter screenshots one slide-sized window per slide.

Optional building blocks, each at its own path:

| Import (`@elitosear/marketing/...`) | Exports |
| --- | --- |
| `features/carousel/carousel-definition` | `defineCarousel` |
| `features/carousel/carousel-frame` | `CarouselCanvas`, `CarouselSlide` |
| `features/carousel/carousel-format-context` | `useCarouselFormat` |
| `components/emphasis-text` | `EmphasisText` (`*word*` emphasis that survives translation) |
| `components/icon-label` | `IconLabel` (an icon beside a label) |

## Agent skills

`skill install` ships two skills:

- **`marketing`**: finds or creates the config, writes the styles file, researches competitors with fetch first and a browser only with your permission, and covers image sourcing and generation.
- **`carousel`**: the process, hard limits and principles for designing, translating and exporting carousels.

The skills contain no project data. They tell the agent to run `marketing config` and use what it prints.

## Layout

```
src/core/               config, preview server, image providers, background removal, skill install
src/features/carousel/  design API, registry, preview, exporter, ledger
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
