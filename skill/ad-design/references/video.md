# Video ads (Remotion)

A video ad is a React design that changes with the frame, rendered to MP4 by Remotion. Everything in `engine.md` about copy, languages, styles and images applies. How it should look, move and be edited: `video-craft.md`, which you read before designing. This file covers setup and the API.

## Setup

Remotion is an optional dependency, and its license is separate from this package's: companies above a size threshold need a Remotion license. Tell the user to check the terms before the first video. Install the same exact version of `remotion`, `@remotion/bundler`, `@remotion/renderer`, `@remotion/cli` and `@remotion/tailwind-v4` in the project; the commands fail with this list when one is missing. Add `@remotion/transitions` and `@remotion/motion-blur` the same way when a design uses them. The first export downloads Chrome Headless Shell (about 120 MB) once.

The Remotion root is the folder with the nearest `package.json`; it needs a `tsconfig.json` too (Remotion Studio refuses to start without one).

## Writing a design

`defineVideoAd({ format?, durationInSeconds, framesPerSecond?, copySchema, Design })`. `Design` is an ordinary React component that receives `copy`. Animate with Remotion's own API, imported from `remotion`:

- `useCurrentFrame()` and `useVideoConfig()` (`fps`, `width`, `height`, `durationInFrames`).
- `interpolate` with `Easing.bezier(...)` or `Easing.spring(...)`, clamped on both sides; `spring` for entrances.
- `Sequence` to place a part at a time (set `premountFor={fps}`), `TransitionSeries` for scenes that need transitions or overlays, `AbsoluteFill` for full-canvas layers, `Img` and `staticFile` for images, `OffthreadVideo` for clips, `Audio` for sound.
- Express time in seconds multiplied by `fps`, never as raw frame counts, so the pacing survives a frame-rate change.

Building blocks from `@elitosear/marketing/features/ads/video/motion`, each a pure function of the frame: `Entrance` (fade, rise and scale together), `WordReveal` (staggered words), `PunchIn` (a scale snap on a cut), `KenBurns` (a moving still), `Backdrop` (a living background), `Pointer` (a cursor that travels, curves, slows and presses with a ripple, synced to frames you give it), `Typewriter` (text typed character by character with a caret), `Grain`, `Vignette`, and the spring presets `SPRING_SMOOTH` and `SPRING_SNAPPY`. Use them where they fit and compose your own for the rest.

The format defaults to `ads.video.format` (`vertical`, 1080x1920) and `ads.video.framesPerSecond` (30). Read it with `useMediaFormat()` (including `safeInsets`) instead of hardcoding pixels, and read the brand with `useBrand()`.

Renders are deterministic: no `Date.now()`, no `Math.random()`, no network requests while rendering, no CSS transitions. The same inputs produce the same MP4, which is what makes variants and re-renders comparable.

## Safe area

Keep captions and everything load-bearing inside the safe insets. On `vertical` they leave a 720x1200 band (220px clear at the top, 500px at the bottom, 180px at each side), the worst case across TikTok, Reels, Stories and Shorts, whose interface covers the edges. These numbers drift with app updates; re-check them now and then. Absolutely positioned layers (`AbsoluteFill`) ignore their parent's padding, so apply the insets to each layer.

## Commands

- `marketing ads sheet --ad <slug> [--every <seconds>]` renders a frame every few seconds into one contact sheet PNG (default one a second; use 0.5 for fast cuts). Open it with the Read tool: it is the way to judge a video.
- `marketing ads still --ad <slug> --frame <n>` renders one frame for a closer look.
- `marketing ads studio` opens Remotion Studio for scrubbing, quarter-speed playback and live editing.
- `marketing ads export --medium video` renders the MP4s. The agent cannot watch a video, so judge motion through the sheet and describe the timing in the close-out for the user to review.

Sheets and frames are review material: they are written to `.marketing/review/<language>/` (generated, gitignored), never to the output folder, which holds only the finished MP4s and PNGs.
