# Engine (`@elitosear/marketing`)

React + Tailwind designs rendered by Vite, exported to PNG with Playwright driving the installed Chrome (no browser download). The `marketing` CLI is the only interface; run it the way the project's package manager runs local binaries. Paths and settings come from `marketing config`.

## Project layout

Config file directory (the "marketing folder"):

```
marketing.config.ts         brand, languages, aliases, image provider, carousel and ads settings
styles.css                  the brand's fonts and tokens and the Tailwind entry; every design imports it
<carousel.ledger>           one entry per finished carousel (carousels only; ads have their own)
<carousel.designs>/<slug>/
  design.tsx                default export defineCarousel({ slideCount, copySchema, Design })
  design/                   supporting pieces (schema, art, slide text) for this design
  copy.<language>.json      one file per language, validated by the design's schema
<carousel.output>/<language>/<slug>/slide-NN.png   generated, gitignored
.marketing/                 generated preview files, gitignored, never edited
```

## Commands

| Command | Does |
| --- | --- |
| `config` | Prints the resolved config as JSON |
| `carousel new <slug>` | Scaffolds a design with starter copy for every language |
| `carousel list` | Lists designs, languages and ledger concepts |
| `dev [--port]` | Live preview of carousels and image ads; open the printed URL, then `?carousel=<slug>&language=<code>` (shown at 25% scale) |
| `carousel export [--carousel <slug>] [--language <code>]` | Exports PNGs; omit a flag to export everything |
| `carousel ledger-add --slug ... --concept ... --panorama-thread ... --palette ... --layout ... --typography ...` | Records a finished carousel |
| `image generate`, `image remove-background` | See the `marketing` skill, `references/images.md` |
| `skill install` | Refreshes the skills after a package upgrade |
| `doctor` | Checks config, files, credentials |

## How a design works

- The carousel is one wide canvas, `slideCount` slides side by side (`carousel.format` sets the slide size: a preset name such as `feed-portrait`, or `{ width, height, safeInsets }`). Place artwork anywhere on it; an element can straddle two slides, which is how a panorama thread works. Content that belongs to one slide goes in `<CarouselSlide slideIndex={n}>`.
- The exporter keeps a slide-sized viewport and shifts the canvas to each slide.
- Copy: define a strict zod schema next to the design; every language file must satisfy it, so a missing or extra string fails. Mark emphasis with `*word*` in the string and render with `EmphasisText`; translators move markers with the words.
- Adding a language: add its code to `languages` in the config, then add `copy.<language>.json` per design. Fonts must cover the script. Translate meaning and voice, not word for word; adapt examples and niche to the audience. If a longer language breaks the layout, fix the design.
- Images: put files in the design folder and import them so Vite serves them. External URLs may not load during export.
- Fonts and colours: only from `styles.css`, which every design imports (`import "../../styles.css"` from `<carousel.designs>/<slug>/design.tsx`). Add what a design needs there.

## Shared pieces

Optional building blocks, each imported from its own path. Use only where they fit; a design may draw its own.

| Import path (`@elitosear/marketing/...`) | Exports |
| --- | --- |
| `features/carousel/carousel-definition` | `defineCarousel` |
| `features/carousel/carousel-frame` | `CarouselCanvas`, `CarouselSlide` (div props pass through) |
| `core/brand-context` | `useBrand()` → the config's `brand`: `name` plus every variable the project defined (handles, website). Works in the preview and in video renders |
| `core/media-format-context` | `useMediaFormat()` → `{ width, height, safeInsets: { top, right, bottom, left } }`: the slide size. Works anywhere, including in the component that renders `CarouselCanvas` |
| `features/carousel/carousel-context` | `useCarouselCanvas()` → `{ slideCount, slideWidth, slideHeight, width, safeInsets }` (inside `CarouselCanvas`, for artwork that crosses slides; `width` is the whole canvas). `useCarouselSlide()` → `{ slideIndex, left }` (inside `CarouselSlide`) |
| `components/emphasis-text` | `EmphasisText`: `*word*` emphasis; props `text`, `emphasisClassName`, span props |
| `components/icon-label` | `IconLabel`: `icon` node plus children as label; span props |

## Ledger entry

`carousel ledger-add` writes this shape:

```json
{
  "slug": "example",
  "created_at": "2026-01-01",
  "concept": "one sentence",
  "panorama_thread": "what runs through the slides",
  "palette": "colors in words",
  "layout": "composition logic",
  "typography": "type voices and sizes"
}
```
