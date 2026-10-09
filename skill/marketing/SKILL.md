---
name: marketing
description: Set up and use the @elitosear/marketing toolkit in any project. Finds or creates marketing.config.ts, learns the brand, writes the styles file, researches competitors, generates images. Use before any marketing-asset task (carousels, ads) and whenever a project has no marketing folder yet.
---

# Marketing

Shared setup for every marketing skill. The CLI is `marketing` (package `@elitosear/marketing`). Run it the way the project's package manager runs local binaries (`pnpm exec marketing`, `npx marketing`, `yarn marketing`). `marketing --help` lists commands; `marketing <command> --help` lists options.

## 1. Find the project

Run `marketing config` from inside the project. It prints the resolved config as JSON with absolute paths: brand, styles file, languages, import aliases, image provider, feature directories, agent files.

- JSON printed: use it. Read `agent.instructionsFile` and every `agent.contextFiles` entry first. Project instructions win over any skill.
- "No marketing.config.ts found": go to step 2.
- Command not found: the package is not installed; go to step 2.

Never hardcode paths, brand name or handle in designs or notes; read them from `marketing config`.

## 2. Create it

1. Install the package with the project's package manager: `@elitosear/marketing`, plus `react`, `react-dom`, `zod` if absent. The package lives on GitHub Packages: `.npmrc` needs `@elitosear:registry=https://npm.pkg.github.com` and the user needs a token with `read:packages`. Never ask to see the token; the user sets it.
2. Collect brand name, social handle and languages from the repo (package.json, README, site metadata, i18n config, locale files). Ask the user for whatever the repo does not answer.
3. Run `marketing init <directory> --name <name> --handle <handle> --languages <codes> --provider <google|openai|none> --yes`. Put the directory where the project keeps such things (a sibling of `apps/` or `packages/` in a monorepo, otherwise `marketing/`).
4. Write the styles file (step 3).
5. Run `marketing skill install` to install the feature skills.
6. Run `marketing doctor`.

## 3. Write the styles file

`styles` in the config points to a CSS file. Designs get fonts, colours and tokens only through it. The CLI never searches for them; you supply them.

- Look in the project: global CSS, Tailwind `@theme` blocks, design tokens, font files, `@font-face`, framework font loaders, brand docs, logo files.
- Prefer `@import` of the project's own stylesheet over copying values. Add `@font-face` rules for font files designs need.
- Define `--font-*` and `--color-*` theme entries so designs use `font-display`, `bg-brand`-style utilities. Name them after what the project already calls them.
- Nothing found, or several candidates: ask the user for colours, fonts and logo. Do not invent a palette.
- Check with `marketing dev`.

## 4. Research

Every asset starts with fresh research: `references/research-protocol.md`.

## 5. Images

Sourcing, generation and cutouts: `references/images.md`.
