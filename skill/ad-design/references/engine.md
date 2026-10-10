# Engine (`@elitosear/marketing`), ads

An ad is one fixed canvas. Image ads are React + Tailwind designs rendered by Vite and screenshotted to PNG with Playwright driving the installed Chrome (no browser download). Video ads are Remotion compositions rendered to MP4: `video.md`. The `marketing` CLI is the only interface; run it the way the project's package manager runs local binaries. Paths and settings come from `marketing config`.

## Project layout

Config file directory (the "marketing folder"):

```
marketing.config.ts              brand, languages, aliases, image provider, ads settings
styles.css                       the brand's fonts and tokens and the Tailwind entry; every design imports it
<ads.ledger>                     one entry per finished ad, image or video
<ads.image.designs>/<slug>/
  design.tsx                     default export defineImageAd({ copySchema, Design })
  design/                        supporting pieces (schema, art) for this design
  copy.<language>.json           one file per language, validated by the design's schema
<ads.video.designs>/<slug>/      same layout, default export defineVideoAd({ durationInSeconds, copySchema, Design })
<ads.output>/<language>/<slug>.png|mp4   generated, gitignored
.marketing/                      generated preview and Remotion files, gitignored, never edited
```

Slugs are unique across image and video ads.

## Commands

| Command | Does |
| --- | --- |
| `config` | Prints the resolved config as JSON |
| `ads new <slug> --medium <image\|video>` | Scaffolds a design with starter copy for every language |
| `ads list` | Lists ads with medium, languages and ledger concepts |
| `dev [--port]` | Live preview; open the printed URL, then `?ad=<slug>&language=<code>` (image ads, shown at 50% scale) |
| `ads export [--ad <slug>] [--language <code>] [--medium <image\|video>]` | Exports PNG and MP4; omit a flag to export everything |
| `ads sheet --ad <slug> [--every <seconds>] [--language <code>]` | Renders a frame every few seconds of a video ad into one contact sheet PNG: the way to judge motion |
| `ads still --ad <slug> --frame <n> [--language <code>]` | Renders one frame of a video ad to a PNG to look at |
| `ads studio [--port]` | Opens Remotion Studio on the video ads |
| `video generate --prompt ... --output ... [--input img] [--last-frame img] [--duration s] [--aspect-ratio 9:16] [--audio] --yes` | Generates one clip (silent unless `--audio`) with `videoProvider`. Billed: refuses without `--yes`, pass it only after the owner agrees |
| `ads ledger-add --slug ... --medium ... --concept ... --hook ... --palette ... --layout ... --typography ...` | Records a finished ad |
| `image generate`, `image remove-background` | Image sourcing tools; see `marketing image --help` |
| `skill install` | Refreshes the skills after a package upgrade |
| `doctor` | Checks config, files, credentials |

## How an image ad works

- Wrap the design in `<AdCanvas>`: it is the fixed canvas, sized by the ad's format, and the element the exporter screenshots. Position anything inside it.
- The format is `ads.image.format` unless the design passes `format` (a preset name such as `feed-square` or `vertical`, or `{ width, height, safeInsets }`) to `defineImageAd`.
- Copy: define a strict zod schema next to the design; every language file must satisfy it, so a missing or extra string fails. Mark emphasis with `*word*` in the string and render with `EmphasisText`; translators move markers with the words.
- Adding a language: add its code to `languages` in the config, then add `copy.<language>.json` per design. Fonts must cover the script. Translate meaning and voice, not word for word; adapt examples and niche to the audience. If a longer language breaks the layout, fix the design.
- Images: put files in the design folder and import them so Vite serves them. External URLs may not load during export.
- Fonts and colours: only from `styles.css`, which every design imports (`import "../../../styles.css"` from `<ads.image.designs>/<slug>/design.tsx`). Add what a design needs there.

## Shared pieces

Optional building blocks, each imported from its own path. Use only where they fit; a design may draw its own.

| Import path (`@elitosear/marketing/...`) | Exports |
| --- | --- |
| `features/ads/image/image-ad-definition` | `defineImageAd` |
| `features/ads/image/ad-canvas` | `AdCanvas` (div props pass through) |
| `features/ads/video/video-ad-definition` | `defineVideoAd` |
| `features/ads/video/motion` | `Entrance`, `WordReveal`, `PunchIn`, `KenBurns`, `Backdrop`, `Pointer`, `Typewriter`, `Grain`, `Vignette`, `SPRING_SMOOTH`, `SPRING_SNAPPY` (frame-driven motion building blocks) |
| `core/brand-context` | `useBrand()` → the config's `brand`: `name` plus every variable the project defined (handles, website). Works in the preview and in video renders |
| `core/media-format-context` | `useMediaFormat()` → `{ width, height, safeInsets: { top, right, bottom, left } }` |
| `components/emphasis-text` | `EmphasisText`: `*word*` emphasis; props `text`, `emphasisClassName`, span props |
| `components/icon-label` | `IconLabel`: `icon` node plus children as label; span props |

## Ledger entry

`ads ledger-add` writes this shape:

```json
{
  "slug": "example",
  "medium": "image",
  "created_at": "2026-01-01",
  "concept": "one sentence",
  "hook": "what stops the scroll",
  "palette": "colors in words",
  "layout": "composition logic",
  "typography": "type voices and sizes"
}
```
