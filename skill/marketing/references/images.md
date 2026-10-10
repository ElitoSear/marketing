# Images

## Sourcing order

Stop at the first source that is good enough. Judge by looking at the image, not by availability.

1. **The project's own artwork**, through the import aliases in `marketing config` (`aliases`). On-brand, honest proof of output. Skip pictures showing a third-party logo or trademark. Rate every candidate before using it: is it catchy at thumbnail size, good quality, relevant to the message, and does it show what the product is or does? A project's own pictures can be few or weak; ask the user for better ones before reaching for generation, and prefer real images wherever a generated one would look cheap or untrustworthy.
2. **Free-licence stock** (Unsplash, Pexels, Pixabay; Openverse for Creative Commons). Still images only. Save into the design's own folder; record source URL, author and licence in `sources.json` beside them. Reject weak, generic or watermarked images.
3. **AI generation** (`marketing image generate`), then `marketing image remove-background` for cutouts. Use it where generated imagery is credible: the product's output is itself generated or digital, or the picture is a supporting visual nobody reads as proof (a backdrop, a texture, a metaphor). There, pass a good project picture with `--input` to keep its character, style or look across new scenes. Do not generate evidence for physical products, real places, real people or results a customer must be able to believe; use real photography for those.

Mixing generated or real images with vector drawing is welcome.

## Generate

`marketing image generate --prompt <text> --output <path-without-extension> [--input <file>]... [--model <name>] [--aspect-ratio <w:h>]`

- Provider: `imageProvider` in `marketing config`. No provider configured: tell the user, or use sources 1 and 2.
- The secret lives in the environment variable the config names, in the `.env` next to the config. Never read, print or ask for it; the user sets it.
- It bills the owner's provider account. One generation at a time.
- `--input` (repeatable) passes existing images to change light, depth, background or style, or to keep a subject consistent. Say in the prompt what each input is and what to change.
- Output: `<name>.<ext>` plus `<name>.generated.json` (prompt, model). For a cutout, ask for a plain solid background, then remove it.

## Remove background

`marketing image remove-background --input <file> --output <file.png>`

Runs locally with BiRefNet (MIT weights). First run downloads about 1 GB into the user cache, shared by every project. Check the result over a dark and a light background before using it.

## Icons

Not limited to one set. Search free-licence icon or illustration sets that suit the style; judge candidates by looking at them. Record source and licence in `sources.json` beside the files and import them as assets. An icon library already in the project is a fallback; it reads as website UI.
