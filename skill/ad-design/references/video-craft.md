# Video craft

What separates a video ad that looks designed from one that looks generated, and how to edit one that holds attention.

## The generic look, and its fixes

Untrained video generation produces linear motion, opacity-only fades, everything arriving at once, flat backgrounds, centred text, no texture and no stillness. Each rule below removes one of those.

### Composition and hierarchy

- **One dominant element per beat.** The eye needs one place to land. Scale contrast does the work: hero type 80 to 140px at 1080 wide, support type a fraction of that, then space. Whitespace is a decision; an off-centre composition with a clear anchor beats a centred stack.
- **Never a flat background.** Build every scene in layers, bottom to top: a living background (slow colour blobs or a gradient that drifts), the pictures, the graphics and type, a colour grade that unifies mixed sources, then grain and vignette on top. `features/ads/video/motion` has `Backdrop` (you pass its three colours: use the brand's), `Grain` and `Vignette` for this.
- **Typography is the design.** A display face at heavy weight for hero lines, a quiet sans for support, tight tracking on large type, a loaded font (never a system default). Emphasise one word per headline with colour, an underline, or a shape that scales in behind it a few frames after the word lands.
- **One hero colour.** A dark or light base, one hero colour, one accent, neutrals, roughly 60/30/10. The hero colour appears on at most one element per frame because that is how it directs the eye; a glow goes on that element only.
- **Pictures move and carry texture.** Every still gets a slow zoom and drift (`KenBurns`), alternating direction between shots. Mask pictures into rounded cards with a shadow, or run them full bleed, and let the grade and grain tie mismatched sources together. Draw icons in the brand colours; emoji ignore the palette and break the one-hero-colour rule.
- **Spacing in pixels.** `em` gaps around big type resolve against the parent's font size and collapse; use pixel values.

### Show it happening

- **The picture proves, the text names.** A video earns its length by demonstrating. When the message lists steps, features or claims, each one gets a visible consequence on screen (something appears, fills in, changes, moves), not only a line of text being ticked. Ask of every beat: what does the viewer see change?
- **Build progressively.** Start from an empty or incomplete state (a blank canvas, an empty page, a timeline with no clips, a grey placeholder) and let each beat add a visible piece, so the picture is richer after every beat and the end shows the finished thing. The viewer stays to watch it complete.
- **Simulate the interaction when the product is operated.** A pointer, a finger or a keystroke that performs the action makes cause and effect visible: it travels to the control with eased motion on a slightly curved path, slows near the target, presses with feedback within two or three frames (a scale dip, a ripple, a state change), and the result follows the press. Typing appears character by character, toggles flip, lists scroll, things drag. The pointer also leads the eye to the next thing to read. `Pointer` and `Typewriter` do this.
- **Use more than one lane.** Give the frame regions with different jobs, for example the steps in one region and the thing being built in another, so the eye always has something moving to follow. One region dominates; the others support.
- **Every visual earns its place**, as the pictures rule in `SKILL.md` says: each element on screen shows, proves, directs the eye or sets the mood. A frame that is only text on a background is a missed chance unless the type is itself the picture and moves with enough scale and rhythm to carry it.
- **Real imagery follows the trust rule**: real footage, photographs and product output wherever a generated stand-in would look cheap.

### Motion

- **No linear motion.** Every `interpolate` has a bezier or spring easing and clamps both sides. Scale animations use `output: "perceptual-scale"` so growth looks even. Entrances prefer `spring`.
- **Entrances move two or three properties together** (fade, rise, scale), and siblings are staggered by 3 to 6 frames. Nothing enters simultaneously. `Entrance` and `WordReveal` do this.
- **Exits exist and are faster than entrances** (about 10 frames against 20).
- **Idle elements breathe.** Anything on screen longer than two seconds gets slight sine-wave motion so it never freezes.
- **Holds are a tool.** A fast move, then a still beat of 15 to 20 frames, then the next move. Constant motion reads amateur; contrast reads expensive. Plan at least three still moments.
- **Motion blur on fast moves** (more than about 30px a frame), with `@remotion/motion-blur`.
- **Hard cuts are the default in ads.** When a bridge helps, use an 8 to 14 frame whip pan, scale-through or mask wipe. In `TransitionSeries`, a transition shortens the timeline and an overlay (a light leak) does not.
- **Never cut to an empty frame.** The first frame after a cut already shows its main element; give `Entrance` a `startOpacity` above 0 for it.

### Editing rhythm

- **Write a beat sheet before any code**: for each beat, its start and length, the picture, the on-screen text and the sound. A typical shape is hook (0 to 1.5s), context (one line, still moving), a body of three or four beats, a payoff that is the biggest moment, and a calm call to action that holds for at least two seconds.
- **Something new every two to four seconds**: a cut, a punch-in (`PunchIn`), a caption pop, an insert, a change of scale between wide, tight and graphic. Keep the intervals uneven; a metronome reads as boredom and a flat middle loses the viewer.
- **One idea per video.** Open a loop in the hook, close it at the payoff. A second idea is a second video.
- **Cut on the beat when there is music**: frames per beat is `fps * 60 / BPM`; put cuts and hits on multiples of it. Choose the track first when you can.
- **Loops**: for 7 to 15 second videos, make the last frame match the first so a replay is invisible.

### The hook (first 1.5 seconds)

- **Frame 0 is a finished picture.** No logo, no countdown, no fade up from black, no throat clearing. Something moves within the first 15 frames.
- **Three layers that complement each other**: the picture stops the thumb, the spoken or headline line opens the loop, and on-screen text of three to eight words sharpens the claim for someone watching muted. Check it muted, and check it as a paused frame: compose the opening as if it was just paused mid-action, so the viewer wants to press play.
- **The first frame matches the first line matches the call to action.** The promise made in the hook is the promise the button pays off.
- **Open a loop visually.** An empty or incomplete state that is plainly about to fill in, or an action about to happen (a pointer approaching a control), makes the viewer wait for the result. The frame is still finished and striking; it only promises a payoff.
- Opening moves and variant testing: `hooks-and-testing.md`.

### Captions and on-screen text

- Burn captions in; never rely on platform captions. For voiceover, word-timed karaoke captions (active word in the accent colour, two to four words a page, heavy weight, large) carry the content and double as pattern interrupts. For a native, organic look, use the static style: white fill, black outline, no pill, full visibility from the first frame of its window.
- Headline text sits in the safe insets and reads in one glance on a phone. Captions match the voiceover word for word.

### Sound

Sound is real or absent. Never synthesize audio yourself: no programmatic tones or noise, generated music or synthetic voice. The one exception is sound effects from a video model clip (`product-commercials.md`), which are recorded as part of a generated shot. Synthesized sound reads as fake and makes the whole ad feel wrong; silence is better.

- **When sound earns its place**: a human voice that carries the message, cuts built on a musical beat, or an impact that is the point of a moment. A quiet, low-motion format (a story-style ad with little movement) ships without audio, because it is designed to work muted anyway.
- **Where real sound comes from, in order**: audio the project already has (a sounds folder, earlier ads); free-licence libraries (for example Mixkit, Pixabay, Freesound, YouTube Audio Library, Uppbeat), taking only what the licence allows for commercial ads and recording source, author and licence beside the file as for images; and the user. When a library needs a login, a captcha or a licence acceptance, stop and ask the user, with a short list of exactly which sounds to get and where. Never work around a login. A voiceover comes from a recording the user supplies.
- **You cannot hear.** Choose by name, tags and duration, keep it sparse (a music bed at low volume, effects only where a cut or a hit needs one), and list every sound file used in the close-out so the user can listen before anything ships.
- **Mix**: put an effect on a major entrance starting 2 to 3 frames before the visual lands (early feels synced, late feels broken); a riser into a cut and a hit on the cut; music low (about 0.2 to 0.3 volume), ducked further under a voice, and faded out over the last 0.8 seconds. Bake music into paid ads; for organic posts, attaching a trending sound in the app usually reaches further.

### Placement notes

- Instagram shows a Reel cropped to 4:5 in the feed (about 285px lost at the top and bottom of 1080x1920) and to a centre 1:1 square on the profile grid. Keep the hook frame's key content, and the brand mark, inside that centre square (roughly y 420 to 1500).
- Design the hook text, the product and the call to action inside the centre 1:1 square when one master must reframe to 9:16, 4:5 and 1:1. Re-centre rather than letterbox: black bars read as an ad.

### Variants

One variable per variant (the hook picture, the on-ramp or the offer), everything else identical. Keep copy in the per-language JSON and every testable string a prop so one design renders many versions. Make each variant's hook and call to action a matched pair.

## Editing taste

The rules above make an edit correct. Taste makes it look chosen by a person, and it comes from studying edits and committing to a point of view.

1. **Study references first.** From research, pick three to five edits you would be proud to have made (the owner's saved posts, the strongest ads in the library). Decompose each into an edit spec: shot length and number of cuts, what changes at each cut (subject, scale, angle), caption style and position, type moves, zooms and shakes, transitions, where sound lands, how the hook and the ending are built. Read patterns ("a hard cut and a small punch-in on every new sentence"), not a list of timestamps, and look at frames: an edit cannot be read from a description.
2. **Choose three to five signature moves** for this ad and repeat them: a scale snap on every key word, one kind of wipe, text that follows the subject, one recurring sound. A signature repeated is taste; ten different effects is noise.
3. **Shape the tempo.** Decide where it accelerates and where it holds. The contrast between fast and still is what reads as edited.
4. **Be restrained.** Every effect needs a reason in the message. If an effect you like competes with the point, cut it.
5. **Make it this brand's.** If the edit could be any brand's ad, find the move only this product has: its own output as the footage, its own interface, its character in the cutouts, its own vocabulary on screen.

## Generated imagery and cutouts

Video gets more from image generation and background removal than a still does, because pictures can be layered and moved. Generate only where it will not look cheap or untrustworthy (the pictures rule in `SKILL.md`): for physical products and real results, use real footage and photos and give them the same layering and motion.

- **Generate the footage you do not have** when the product's output is itself generated or digital, or the shot is a supporting visual nobody reads as proof. Stills in one consistent style (lock the style words and lighting in the prompt, vary only the subject, generate at the final aspect ratio) become shots with `KenBurns`, parallax and cuts. Use an existing picture as the reference input (`marketing image generate --input`) to keep a character or look across a whole sequence.
- **Cut subjects out** (`marketing image remove-background`), real photographs included, to build depth: the product in front of a moving backdrop, a cutout scaled and nudged on the beat, a sticker-style outline, text passing behind a subject. Check each cutout over a light and a dark background first.
- **Check the first and last second of every generated clip**: generated motion drifts there.

## Looking at it

Run `marketing ads sheet --ad <slug> --every 0.5` and open the contact sheet with the Read tool. It shows the whole video at once, which is what the review needs. Check:

- Hierarchy: one clear anchor per beat, and whitespace that looks chosen.
- No empty frames, especially the first frame after a cut and the first frame of the video.
- Something new on screen every two to four seconds, and no flat stretch.
- Text inside the safe insets, nothing clipped, nothing touching an edge.
- Contrast on every frame the text appears; the hero colour on one element per frame.
- Holds exist, and the call to action sits on screen for its full time.
- The last two seconds, then each language.

Then fix, re-render the sheet and look again; deliver only after a clean pass. Quarter-speed playback in `marketing ads studio` exposes easing flaws invisible at full speed.

## Common failures

- Layer order wrong: grain and vignette must be on top, the grade above the content.
- Missing clamp, so an element shows before it enters or after it exits.
- `durationInFrames` longer than the content, leaving dead air at the end.
- A hero font left at its default weight, or a font that did not load.
- One giant component instead of small reusable pieces and a theme.
- Describing the result instead of rendering it and looking.
