---
name: carousel
description: Design, review, translate and export brand carousels (Instagram/Facebook swipe posts) as per-slide PNGs, built as React + Tailwind designs with per-language copy. Use when asked to make, redesign, improve, translate or review a carousel, swipe post or social slides. Requires fresh trend research (last 90 days) and viewing your own exported slides before finishing.
---

# Carousel

Produces carousels that look made by a human designer, not generated from a template. Each carousel is its own free-form React design; this skill gives limits, principles and a process, not a layout to fill in.

Setup first: the `marketing` skill (finding or creating the project config, styles file, research, images). Engine, commands, file layout: `references/engine.md`. Hooks, slide spines, ranking signals: `references/hooks-and-structure.md`. Research: the `marketing` skill's `references/research-protocol.md`.

## Process

1. **Context.** Run `marketing config`. Read `agent.instructionsFile` (wins over this skill), every `agent.contextFiles` entry, the ledger (`carousel.ledgerPath`: what already exists) and the latest note in `carousel.inspirationDirectory`. Claim nothing the context files do not mark as verified.
2. **Research.** Required every time. Follow the research protocol: what works in the last 90 days, direct observation first, dated sources second. Look beyond this skill: styles, hooks, progress/swipe devices, CTAs, typography, imagery, anything that could improve this carousel.
3. **Concept.** One sentence naming the idea, the panorama thread (below), palette, layout logic, type pairing. Compare with the last 3 ledger entries; change at least two of those. Topic or goal unclear: ask once, otherwise proceed.
4. **Copy.** Write slide copy first (`copy.<language>.json`, languages from the config), then check it against `references/hooks-and-structure.md`. Plain human voice: no AI filler vocabulary, no stacked triads, at most one em dash per slide. Then the caption, with a captions skill if the project has one.
5. **Design with stand-ins.** `marketing carousel new <slug>`, then invent the layout in `<carousel.designsDirectory>/<slug>/`. Reuse the shared pieces in `references/engine.md` only where they fit, never another carousel's composition. Build the whole carousel with every picture, character and object as a placeholder first: a flat shape with the silhouette, size and position the final image is expected to take. Type, shapes and the panorama thread are final; images are not.
6. **Stage the pictures.** Export the placeholder version and judge it as a composition. For each placeholder ask what the image could do in this layout beyond occupying a box. Adjust the layout, then write a precise brief per image (subject, aspect ratio, which edge it touches, what it relates to, background it needs if cut out). Source or generate to that brief (`marketing` skill, `references/images.md`), process it, swap the real images in, export again. The real image never matches its placeholder; re-adjust position, scale, shadows, neighbours. Repeat until the pictures read as part of the layout.
7. **Look at it.** Final check on the finished export. Open every PNG with the Read tool and judge with your own eyes. Required: shrink to thumbnail (does the cover still read?), 3-second read per slide, contrast, nothing clipped or colliding, nothing important outside the safe area, seams between slides continuous, every language's export. Fix and re-export until a stranger scrolling past would stop. Say which defects you found and fixed.
8. **Close out.** `marketing carousel ledger-add ...`, run the project's lint and type-check, report paths and open questions. Nothing is posted or staged; the user posts.

## Hard limits

- Slide size is `carousel.format` in the config (default 1080x1350, 4:5). Every slide the same size. Key content inside `safeWidth`, centred (the profile grid crops 4:5 to 3:4).
- Text readable on a phone: nothing important under about 3% of slide width in height (32px at 1080 wide).
- No invented numbers, testimonials, user counts, views or income. Figures the context files mark as estimated may appear only as clearly approximate (≈, "about", a range). No guaranteed outcomes. No competitor names on slides. No roadmap features presented as available.
- Platform-rule claims (algorithm, originality policy) only with a dated primary source; otherwise leave out.
- Original work: do not copy another creator's slides, script or layout. Take the idea, not the artwork.
- Brand: colours and fonts come from the styles file. Anything else needs a reason.
- No slide counter or "3/8" marks, no step numbering as decoration: the platform shows position.
- Brand on a slide, if shown: the logo mark plus the name, nothing beside it (no tagline, motto, subtitle). Name and handle come from the config, never hardcoded.
- Text tiers per slide: kicker (optional), title, body. Text inside artwork is part of the picture, not a tier, but still lives in the copy JSON so it translates; a word or two. No fourth tier: no chips, pills, badges, captions-under-body, footnotes. A label becomes a picture or folds into the body.
- The cover carries a swipe cue designed for this carousel (see principles). No stock chevron rows or "swipe" words by default.
- The closing slide's ask pairs with the icons of the actions it names (save, send, follow), drawn as part of the text, never a separate icon bar. Icons share the typography's weight, scale, colour logic.
- The cover is a strong visual, not a diagram of empty structure. If the hook needs a subtitle to make sense, fix the picture, not the font size. Every piece of text earns its place by telling the viewer something the picture and title do not; cut kickers and labels that do not.
- Layouts survive translation: Spanish runs about 25% longer than English. Anything below flowing text sits in the same flow (not absolutely positioned at a guessed y); fixed-size labels leave room to wrap. Export every language and look at all of it.
- Copy lives in per-language JSON validated by a zod schema; no user-facing text hardcoded in the design.

## Principles (each has a reason; break one only knowingly)

- **The cover earns the swipe.** Most of the result is decided there. Strong cover = one clear idea, a hook that opens a loop, a visual that stops the scroll at thumbnail size.
- **Visuals before cleverness.** People respond to what they see. Prefer imagery, scale, motion cues, surprise over symbols that need decoding.
- **Hierarchy by scale and space.** One dominant element per slide, generous whitespace, one idea per slide. If it needs a paragraph, it is two slides.
- **Make the swipe feel continuous.** Give the carousel a panorama thread: something running through the slides and crossing their edges so swiping reveals more of one picture. The canvas is one wide surface, so this is free. Invent a thread that fits the topic; do not reuse the last one.
- **Front-load value.** Best point on slide 2 or 3. Swipe-through decays with depth.
- **Design the swipe, don't label it.** The progress device and swipe cue are creative decisions of this carousel, invented to fit its topic and thread after researching what works now. A cue implies more beyond the frame: the design looks unfinished toward the direction of travel, or something pulls the eye that way, built from this carousel's own visual language. Often the thread already says "keep going"; then it is the cue. Small, never the loudest element, never a stock symbol.
- **Keep the eye fed.** Attention fades with repetition: every slide renews it with something not yet seen in this carousel (subject, scale, crop, medium, arrangement). Do not repeat a picture, pose or crop unless the repetition is the point. A recurring subject appears in clearly different treatments. Mixed media is welcome.
- **End with a focused ask.** Match the number and kind of asks to what the content invites; each extra option dilutes the rest. The product URL is the destination, not an extra ask. The recap slide works as a screenshot.
- **Variety is the brand.** Two carousels side by side on the profile grid must not look like the same template. The ledger exists to enforce that.
- **Make images stand out, not just sit in a frame.** No default bordered card around every picture. Decide per image: cutout with studio shadow, full-bleed crop, scale contrast, overlap with type, mock device, torn or cut shapes, something not listed. Images can be edited, restyled or relit when the design needs it (`image generate --input`). Sometimes an image works best as part of the composition, relating to the type, graphics or frame edges; other times a plain strong picture is right. Vary that relationship slide to slide and carousel to carousel; it is one option, not a habit.
- **Real imagery usually beats vector art.** Sourcing order and tools: the `marketing` skill, `references/images.md`.

## Inspiration

What works now lives in the dated notes in `carousel.inspirationDirectory`, written from your own research. Evidence of what stops people, never a template; do something that fits this topic. Study the relationships that make a post work: how type and image relate, what limits the palette, how dense each slide is, how continuation is signalled, what the ask looks like.
