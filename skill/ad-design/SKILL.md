---
name: ad-design
description: Design, review, translate and export brand ads as one fixed canvas, either image ads (PNG, React + Tailwind) or video ads (MP4, Remotion), with per-language copy. Use when asked to make, redesign, improve, translate or review an ad, ad creative, static ad, video ad, story ad or reel ad. Requires fresh research (last 90 days) and viewing your own export before finishing.
---

# Ad design

Produces ads that look made by a human designer, not generated from a template. Each ad is its own free-form design on one fixed canvas, with no slides; this skill gives limits, principles and a process, not a layout to fill in. Campaign strategy, budgets and targeting are out of scope.

Needs a marketing project: run `marketing config`; if none exists, set one up with `marketing init` (see `marketing --help`). Engine, commands, file layout: `references/engine.md`. Video ads: setup and API in `references/video.md`, and how a video should look, move and be edited in `references/video-craft.md` (read it before designing any video). Hooks, variants and platform text: `references/hooks-and-testing.md`. Physical or packaged products can use generated photorealistic clips when the look of the product is the selling point: `references/product-commercials.md`.

## Process

1. **Context.** Run `marketing config`. Find what the project already says about itself: product and positioning docs, brand guidelines, verified claims, earlier campaigns, customer reviews and ad comments, winning past ads, agent instruction files (`AGENTS.md`, `CLAUDE.md`), and the ad ledger (`ads.ledgerPath`: what already exists). Read what is relevant; the project's instructions win over this skill. Missing the audience, the offer, the placement or what may be claimed: ask the user. Claim nothing the project has not confirmed.
2. **Ground it.** Every concept traces to real material: a review, a comment, a winning ad, a claim the project confirms. Without that material, ask the user to supply it instead of generating from general knowledge, which produces the average ad of the category. If you continue anyway, say in the close-out what the concept rests on.
3. **Brief.** The one audience, the one message, the one action, the placement (it sets the format). Unclear: ask once, otherwise proceed with the most conservative reading.
4. **Medium.** Image or video. A video earns its cost only when time carries the message (a change, a sequence, a demonstration). Otherwise make an image ad. A video ad is not the image ad set in motion: it is designed for time, with its own hierarchy, rhythm and sound. Say which you chose and why. Generated video (`marketing video generate`) is billed per second: propose the shots, length and provider and wait for the owner's yes before generating anything.
5. **Research.** Required every time: what works now for this placement and medium, from roughly the last 90 days. Use three sources and keep going until each has given you real examples:
   - **The owner's taste.** With a browser and the user's Instagram already open in it, look at their account's Saved, Home, Explore and Reels through that open session. Never ask for or type a password; at a login wall or challenge, stop and tell the user.
   - **Direct observation.** At least a dozen real ads and posts from competitors and adjacent niches, watched or paged through in full (public pages, hashtag and profile pages, the Meta Ad Library sorted by impressions). Ad libraries show paid ads only, so also look at organic posts. Do this research in every language the project publishes in, to learn the words that audience uses.
   - **Dated sources.** Platform announcements and other primary sources outrank blog posts, which are hypotheses. Say how big and how biased your sample is.

   A search that returns nothing or little means change the query (the audience's own words, synonyms, adjacent niches, another language), not move on. Start with fetch or any web-GET tool and report what came back empty or blocked. A browser shows what text cannot: ask the user before using one, then stay read-only. Open and page through posts; never like, follow, save, comment, message or click ads; keep a human pace (a dozen to two dozen posts, not hundreds); close the tabs you opened. No browser or no permission: ask for screenshots. Look beyond this skill. Keep what you find as inspiration for the concept, and list in the close-out what you saw (account or advertiser, date, what stops the scroll).
6. **Concept.** One sentence naming the idea, the hook (picture, words and claim, see `references/hooks-and-testing.md`), palette, layout logic, type pairing. Compare with the last 3 ledger entries; change at least two of those. The angle must also differ from everything that already exists in the project (the ledger, the existing ads and carousels) and from any other asset being made at the same time.
7. **Copy.** Write `copy.<language>.json` first (languages from the config). Plain human voice: no AI filler vocabulary, no stacked triads, no em dashes. Headline, one supporting line, one call to action, nothing more unless the design needs a word or two inside the artwork. Write the platform text (primary text, headline, description) per language within the limits in `references/hooks-and-testing.md`, and put it in your report with the paths. An ad without its platform text is unfinished.
8. **Design with stand-ins.** For a video, settle the editing first: study references and choose the edit's signature moves, then write the beat sheet (each beat's start and length, picture, on-screen text and sound), as `references/video-craft.md` describes, and build from it. `marketing ads new <slug> --medium <image|video>`, then invent the layout in the design folder. Build with every picture as a placeholder first: a flat shape with the silhouette, size and position the final image will take. Type and shapes are final; images are not. Do this stage even when the pictures already exist: use flat stand-ins of the same size and position first, export, and judge the composition before swapping any picture in.
9. **Stage the pictures.** Export the placeholder version and judge it as a composition. Write a precise brief per image, source or generate it, swap the real images in, export again. The real image never matches its placeholder; re-adjust position, scale, shadows, neighbours.
10. **Look at it.** Final check on the finished export. Open the PNG with the Read tool (video: `marketing ads sheet`, a contact sheet of the whole video, then `marketing ads still` for any frame that needs a closer look) and judge with your own eyes. Required: shrink to thumbnail (does it still read?), 3-second read, contrast, nothing clipped or colliding, nothing important outside the safe insets, every language's export. Fix and re-export until a stranger scrolling past would stop. Say which defects you found and fixed.
11. **Close out.** `marketing ads ledger-add ...`, run the project's lint and type-check, report paths and open questions. Nothing is uploaded or published; the user publishes.

## Hard limits

- Size is `ads.image.format` or `ads.video.format` in the config, or the design's own `format`. Presets: `feed-portrait` 1080x1350, `feed-square` 1080x1080, `feed-landscape` 1200x628, `vertical` 1080x1920. Key content inside the safe insets (`useMediaFormat().safeInsets`): vertical placements draw their interface over the top, bottom and right edge (the `vertical` insets leave a 720x1200 band that works on every one of them), and the profile grid crops 4:5 to 3:4.
- Text readable on a phone: nothing important under about 3% of the canvas width in height (32px at 1080 wide).
- No invented numbers, testimonials, user counts, ratings, views or income. Figures the project marks as estimated may appear only as clearly approximate. No guaranteed outcomes. No competitor names. No roadmap features presented as available.
- Respect the placement's advertising policy: no claims about a viewer's personal attributes, no before/after promises of health or money outcomes, no fake interface elements (fake buttons, notifications, play controls). Check any policy claim against a dated primary source or leave it out.
- Brand: colours and fonts come from `styles.css`. Anything else needs a reason. Brand shown: the logo mark plus the name; brand name and handles come from `useBrand()` (the config's `brand`, a handle per platform when they differ), never hardcoded in a design or a copy file.
- No video generation without the owner's confirmation of shots, length, provider and cost.
- No synthesized audio: music, voiceover and effects are real recordings or absent, apart from effects a video model generates inside a clip (`references/video-craft.md`, Sound).
- One message and one call to action. Every extra element dilutes the first.
- Layouts survive translation: Text length changes with the language, often by a quarter or more. Anything below flowing text sits in the same flow; fixed-size labels leave room to wrap. Export every language and look at all of it.
- Copy lives in per-language JSON validated by a zod schema; no user-facing text hardcoded in the design.

## Principles (each has a reason; break one only knowingly)

- **The first second decides.** The hook is a visual that breaks the feed's rhythm at thumbnail size, not a logo or a title card. If it needs a subtitle to make sense, fix the picture.
- **Visuals before cleverness.** Prefer imagery, scale and contrast over symbols that need decoding.
- **Hierarchy by scale and space.** One dominant element, generous whitespace.
- **Say it without sound.** Most views are muted: the message works with the sound off, and audio only adds to it.
- **Front-load the point, end on the ask.** The offer or payoff appears early; the call to action is the last thing held on screen, long enough to read twice.
- **Make images stand out, not just sit in a frame.** No default bordered card around every picture. Decide per image: cutout with studio shadow, full-bleed crop, scale contrast, overlap with type, mock device. Real imagery usually beats vector art: source in this order, the project's own artwork through the config's `aliases`, then free-licence stock (record source and licence beside the file), then `marketing image generate` and `marketing image remove-background` (`marketing image --help`). Generation bills the owner's provider account; never read or print the credential. Image models draw text badly: put words in the design, not in the image.
- **Visual elements earn their place.** Every element on screen, and every beat of a video, has a job: show something, prove something, direct the eye or set the mood. The picture proves and the text names: when a message lists steps or claims, each gets a visible consequence, not only a line of text. Decoration earns nothing.
- **Existing pictures are candidates, not defaults.** Rate each one before using it: catchy at thumbnail size, good quality, relevant to the message, and showing what the product is or does. Then choose the picture source by trust. Where a generated image would look cheap or untrustworthy, or would imply something false (physical products, real places, real people, results a customer must be able to believe), real images win: the project's own photography, product shots, customer photos, licensed stock, improved with composition, crop and cutouts, and never replaced by generated stand-ins for evidence. Where the product's output is itself generated or digital, or the picture is a supporting visual nobody reads as proof (a backdrop, a texture, a metaphor), generation is fine, and a good existing picture can be the reference input (`marketing image generate --input`) to keep a character, style or look across new scenes. When the project's pictures are few or weak, say so in the close-out with what you rejected and what you used instead, and ask the user for better ones.
- **Inspiration.** Treat what you found in research as direct reference: take its layouts, structures, scripts and visual treatments, and rework them into this brand's own design. Say in the close-out what inspired which decision.
- **Video is motion design.** It earns attention with hierarchy, whitespace, texture, rhythm and sound, not with a slideshow and fades. A reviewer who sees a flat background, centred text on a gradient and opacity-only entrances is looking at the generic result.
- **Variety is the brand.** Two ads side by side in a feed must not look like the same template. The ledger exists to enforce that; cycle through formats (comparison, one big number or fact, review quote, founder message, question and answer, grid) instead of settling on a favourite.
- **Test-ready.** An ad is one hypothesis. A variant differs from it in one decision (hook picture, on-ramp or offer), so the result says something.

## Translation

Write each language for its own audience; never translate from the first. Start from the message and the feeling, and write it the way a native creator would say it in a caption.

- **Learn the audience's words.** During research, look at content in that language and market and see what people call the thing: which terms they borrowed, which they translated, which they leave in English. A literal rendering of an English label is usually wrong, and a term that is natural in one language can sound invented in another.
- **Use the form native speakers actually use.** Terms, acronyms and category names differ by language: one may be kept in the source language, another translated, another shortened locally. Take the form that audience uses, confirmed in content from that market, not the one the source language suggests.
- **Cut word-for-word habits.** Anything that exists only to mirror the source: its sentence rhythm and word order, idioms rendered literally, its connective and filler phrases. A line that reads as translated is rewritten from the idea, not edited.
- **Match register and region** to the project's own copy in that language (informal or formal address, regional vocabulary).
- **Read every line aloud as a native would say it.** Then list the lines you are least sure of, with the alternative you considered, in the close-out so a native speaker can review them. Never claim a line was checked by a native speaker.

## Avoid the template look

These are the signatures of generated design; use one only on purpose.

- Pure black text on white, a neon glow, an AI-purple gradient, gradient headline text.
- A default palette for the category (warm beige and brass for anything premium, blue and purple for anything tech). Rotate away from the previous ad's palette; lock one accent colour per ad.
- Generic placeholder content: "John Doe" names, round fake-perfect numbers, startup-sounding brand names, filler verbs (elevate, seamless, unleash).
- A fake product screenshot built from rectangles. Use a real screenshot, a generated image or no preview.
- A second typeface added to a headline for emphasis without a reason. A deliberate pairing is fine; keep size and line height steady so the line does not jump, and leave room for italic descenders.
- A centred headline over a stock gradient as the default layout.
