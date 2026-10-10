---
name: carousel
description: Design, review, translate and export brand carousels (Instagram/Facebook swipe posts) as per-slide PNGs, built as React + Tailwind designs with per-language copy. Use when asked to make, redesign, improve, translate or review a carousel, swipe post or social slides. Requires fresh trend research (last 90 days) and viewing your own exported slides before finishing.
---

# Carousel

Produces carousels that look made by a human designer, not generated from a template. Each carousel is its own free-form React design; this skill gives limits, principles and a process, not a layout to fill in.

Needs a marketing project: run `marketing config`; if none exists, set one up with `marketing init` (see `marketing --help`). Engine, commands, file layout: `references/engine.md`. Hooks, slide spines, narrative structures: `references/hooks-and-structure.md`.

## Process

1. **Context.** Run `marketing config`. Find what the project already says about itself: product and positioning docs, brand guidelines, verified claims, earlier campaigns, agent instruction files (`AGENTS.md`, `CLAUDE.md`), and the carousel ledger (`carousel.ledgerPath`: what already exists). Read what is relevant; the project's instructions win over this skill. Missing the audience, the offer or what may be claimed: ask the user. Claim nothing the project has not confirmed.
2. **Research.** Required every time: what works now for carousels, from roughly the last 90 days. Use three sources and keep going until each has given you real examples:
   - **The owner's taste.** With a browser and the user's Instagram already open in it, look at their account's Saved, Home, Explore and Reels through that open session. Never ask for or type a password; at a login wall or challenge, stop and tell the user.
   - **Direct observation.** At least a dozen real carousels and posts from competitors and adjacent niches, paged through slide by slide (public pages, hashtag and profile pages, the Meta Ad Library sorted by impressions). Ad libraries show paid ads only, so also look at organic posts. Do this research in every language the project publishes in, to learn the words that audience uses.
   - **Dated sources.** Platform announcements and other primary sources outrank blog posts, which are hypotheses. Say how big and how biased your sample is.

   A search that returns nothing or little means change the query (the audience's own words, synonyms, adjacent niches, another language), not move on. Start with fetch or any web-GET tool and report what came back empty or blocked. A browser shows what text cannot: ask the user before using one, then stay read-only. Open and page through posts; never like, follow, save, comment, message or click ads; keep a human pace (a dozen to two dozen posts, not hundreds); close the tabs you opened. No browser or no permission: ask for screenshots. Look beyond this skill. Keep what you find as inspiration for the concept, and list in the close-out what you saw (account or advertiser, date, what stops the scroll).
3. **Concept.** One sentence naming the idea, the panorama thread (below), palette, layout logic, type pairing. Compare with the last 3 ledger entries; change at least two of those. The angle must also differ from everything that already exists in the project (the ledger and the existing designs) and from any other asset being made at the same time. Name what grounds the concept: a real review, comment, post or confirmed claim. The project has none: say so and ask the user for some, or continue and state the gap in the close-out. Topic or goal unclear: ask once, otherwise proceed.
4. **Copy.** Write slide copy first (`copy.<language>.json`, languages from the config), then check it against `references/hooks-and-structure.md`. Plain human voice: no AI filler vocabulary, no stacked triads, no em dashes. Then the caption.
5. **Design with stand-ins.** `marketing carousel new <slug>`, then invent the layout in `<carousel.designsDirectory>/<slug>/`. Compute positions from `useCarouselCanvas()` and `useCarouselSlide()`, never from hardcoded pixel widths. Reuse the shared pieces in `references/engine.md` only where they fit, never another carousel's composition. Build the whole carousel with every picture, character and object as a placeholder first: a flat shape with the silhouette, size and position the final image is expected to take. Type, shapes and the panorama thread are final; images are not. Do this stage even when the pictures already exist: use flat stand-ins of the same size and position first, export, and judge the composition before swapping any picture in. Layout problems are cheapest to see here.
6. **Stage the pictures.** Export the placeholder version and judge it as a composition. For each placeholder ask what the image could do in this layout beyond occupying a box. Adjust the layout, then write a precise brief per image (subject, aspect ratio, which edge it touches, what it relates to, background it needs if cut out). Source or generate to that brief, process it, swap the real images in, export again. The real image never matches its placeholder; re-adjust position, scale, shadows, neighbours. Repeat until the pictures read as part of the layout.
7. **Look at it.** Final check on the finished export. Open every PNG with the Read tool and judge with your own eyes. Required: shrink to thumbnail (does the cover still read?), 3-second read per slide, contrast, nothing clipped or colliding, nothing important outside the safe insets, seams between slides continuous, every language's export. Fix and re-export until a stranger scrolling past would stop. Say which defects you found and fixed.
8. **Close out.** Write the post caption per language (a hook as the first line, a short body, the ask, a few relevant hashtags) and put it in your report with the paths. `marketing carousel ledger-add ...`, run the project's lint and type-check, report paths and open questions. Nothing is posted or staged; the user posts.

## Hard limits

- Slide size is `carousel.format` in the config (default `feed-portrait`, 1080x1350, 4:5). Every slide the same size. Key content inside the safe insets from `useMediaFormat().safeInsets` (the profile grid crops 4:5 to 3:4, so the default keeps 34px clear on each side).
- Text readable on a phone: nothing important under about 3% of slide width in height (32px at 1080 wide).
- No invented numbers, testimonials, user counts, views or income. Figures the project marks as estimated may appear only as clearly approximate (≈, "about", a range). No guaranteed outcomes. No competitor names on slides. No roadmap features presented as available.
- Platform-rule claims (algorithm, originality policy) only with a dated primary source; otherwise leave out.
- Brand: colours and fonts come from `styles.css`. Anything else needs a reason.
- No slide counter or "3/8" marks, no step numbering as decoration: the platform shows position.
- Brand on a slide, if shown: the logo mark plus the name, nothing beside it (no tagline, motto, subtitle). Brand name and handles come from `useBrand()` (the config's `brand`, a handle per platform when they differ), never hardcoded in a design or a copy file.
- Text tiers per slide: kicker (optional), title, body. Text inside artwork is part of the picture, not a tier, but still lives in the copy JSON so it translates; a word or two. No fourth tier: no chips, pills, badges, captions-under-body, footnotes. A label becomes a picture or folds into the body.
- The cover carries a swipe cue designed for this carousel (see principles). No stock chevron rows or "swipe" words by default.
- The closing slide's ask pairs with the icons of the actions it names (save, send, follow), drawn as part of the text, never a separate icon bar. Icons share the typography's weight, scale, colour logic.
- The cover is a strong visual, not a diagram of empty structure. If the hook needs a subtitle to make sense, fix the picture, not the font size. Every piece of text earns its place by telling the viewer something the picture and title do not; cut kickers and labels that do not.
- Layouts survive translation: Text length changes with the language, often by a quarter or more. Anything below flowing text sits in the same flow (not absolutely positioned at a guessed y); fixed-size labels leave room to wrap. Export every language and look at all of it.
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
- **Visual elements earn their place.** Every element on a slide has a job: show something, prove something, direct the eye or set the mood. The picture proves and the text names: when a slide lists steps or claims, each gets a visible consequence, not only a line of text. Decoration earns nothing.
- **Existing pictures are candidates, not defaults.** Rate each one before using it: catchy at thumbnail size, good quality, relevant to the message, and showing what the product is or does. Then choose the picture source by trust. Where a generated image would look cheap or untrustworthy, or would imply something false (physical products, real places, real people, results a customer must be able to believe), real images win: the project's own photography, product shots, customer photos, licensed stock, improved with composition, crop and cutouts, and never replaced by generated stand-ins for evidence. Where the product's output is itself generated or digital, or the picture is a supporting visual nobody reads as proof (a backdrop, a texture, a metaphor), generation is fine, and a good existing picture can be the reference input (`marketing image generate --input`) to keep a character, style or look across new scenes. When the project's pictures are few or weak, say so in the close-out with what you rejected and what you used instead, and ask the user for better ones.
- **Inspiration.** Treat what you found in research as direct reference: take its layouts, structures, scripts and visual treatments, and rework them into this brand's own design. Say in the close-out what inspired which decision.
- **Variety is the brand.** Two carousels side by side on the profile grid must not look like the same template. The ledger exists to enforce that.
- **Make images stand out, not just sit in a frame.** No default bordered card around every picture. Decide per image: cutout with studio shadow, full-bleed crop, scale contrast, overlap with type, mock device, torn or cut shapes, something not listed. Images can be edited, restyled or relit when the design needs it (`marketing image generate --input`). Sometimes an image works best as part of the composition, relating to the type, graphics or frame edges; other times a plain strong picture is right. Vary that relationship slide to slide and carousel to carousel.
- **Real imagery usually beats vector art.** Source in this order: the project's own artwork through the config's `aliases`, then free-licence stock (record source and licence beside the file), then `marketing image generate` and `marketing image remove-background` (`marketing image --help`). Generation bills the owner's provider account; never read or print the credential. Image models draw text badly: put words in the design, not in the image.

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
- A default palette for the category (warm beige and brass for anything premium, blue and purple for anything tech). Rotate away from the previous carousel's palette; lock one accent colour for the whole carousel.
- Generic placeholder content: "John Doe" names, round fake-perfect numbers, startup-sounding brand names, filler verbs (elevate, seamless, unleash).
- A fake product screenshot built from rectangles. Use a real screenshot, a generated image or no preview.
- A second typeface added to a headline for emphasis without a reason. A deliberate pairing is fine; keep size and line height steady so the line does not jump, and leave room for italic descenders.
- Three identical cards in a row as the default layout.
