---
name: marketing
description: Set up and use the @elitosear/marketing toolkit in any project. Finds or creates marketing.config.ts, learns the brand, writes the shared styles.css, sources or generates images and installs the carousel and ad skills. Use before any marketing-asset task (carousels, image ads, video ads) and whenever a project has no marketing folder yet.
---

# Marketing

Shared setup for every marketing asset. The CLI is `marketing` (package `@elitosear/marketing`). Run it the way the project's package manager runs local binaries (`pnpm exec marketing`, `npx marketing`, `yarn marketing`). `marketing --help` lists commands; `marketing <command> --help` lists options.

## 1. Find the project

Run `marketing config` from inside the project. It prints the resolved config as JSON with absolute paths: brand, languages, import aliases, image provider and the feature directories.

- JSON printed: use it.
- "No marketing.config.ts found": go to step 2.
- Command not found: the package is not installed; go to step 2.

Never hardcode paths or brand values (name, handles, website) in designs; read them from `brand` in `marketing config`.

## 2. Create it

1. Install `@elitosear/marketing` with the project's package manager, plus `react`, `react-dom`, `zod` and `tailwindcss` (v4) if absent.
2. Collect the brand name, social handles and languages from the repo (package.json, README, site metadata, i18n config, locale files). Ask the user for whatever the repo does not answer.
3. Run `marketing init <directory> --name <name> --handle <handle> --languages <codes> --provider <google|openai|none> --yes`. Put the directory where the project keeps such things (a sibling of `apps/` or `packages/` in a monorepo, otherwise `marketing/`).
4. Add the other brand variables to `brand` in `marketing.config.ts`: a handle per platform when they differ (`instagram`, `facebook`), a website, anything designs will need to show.
5. Write the styles file (step 3).
6. Run `marketing skill install` to install the feature skills.
7. Run `marketing doctor`.

## 3. Write the styles file

`styles.css` next to the config is the brand's look and the one Tailwind entry for every asset: `@import "tailwindcss"` (already scaffolded), then fonts, colours and `@theme` tokens. Every design imports it, as the scaffolds do, so all designs share one theme. Separate stylesheets per design collide, because the preview loads all designs on one page.

- Look in the project for the brand: global CSS, Tailwind `@theme` blocks, design tokens, font files, `@font-face`, framework font loaders, brand docs, logo files.
- Prefer `@import` of the project's own stylesheet over copying values; do not import Tailwind twice. Add `@font-face` rules for font files designs need.
- Define `--font-*` and `--color-*` theme entries so designs use `font-display`, `bg-brand`-style utilities. Name them after what the project already calls them.
- Nothing found, or several candidates: ask the user for colours, fonts and logo. Do not invent a palette.
- Check with `marketing dev`.

## 4. Know the project

Before any asset, find what the project already says about itself: product and positioning docs, brand guidelines, verified claims, roadmap, earlier campaigns, and agent instruction files (`AGENTS.md`, `CLAUDE.md`, similar). Read what is relevant; the project's instructions win over any skill. When something you need is missing (audience, offer, what may be claimed, tone), ask the user instead of guessing. Claim nothing the project has not confirmed.

## 5. Images

Sourcing, generation and cutouts: `references/images.md`.
