# Product commercials (generated video)

For a physical or packaged product, a photorealistic 3D-style commercial made of generated clips can carry the product's look, and it combines with built features such as screens, text and graphics in the same ad. It is optional, costly and risky for faithfulness. Use it only when the product's look, texture, material or motion is the selling point and no real footage exists. Never as the default.

## Gate: the owner confirms first

Video generation is billed per second of output and a clip takes minutes. Before any generation:

1. Say the shot list (one line per clip), the length of each, the provider and model from `videoProvider`, and that every retry is billed again.
2. Wait for a clear yes. A yes to the ad is not a yes to the generation.
3. Generate only what was approved: `marketing video generate --prompt ... --output ... --yes`. Without `--yes` the command refuses.

If `videoProvider` is not configured, tell the owner what to add to `marketing.config.ts` (`marketing doctor` checks it) instead of working around it.

## Faithfulness

A model invents details. A product that must be recognizable (shape, label, logo, text, colours) is protected by:

- Starting the clip from a real product photo or a cutout (`--input`, optionally `--last-frame`), so the model animates the real thing.
- Keeping text and logos out of the generated clip. Add them afterwards as crisp layers in the composition.
- Reviewing every clip frame by frame (`ads sheet`) against the real product. A drifting label, extra part or changed proportion means regenerate or cut that moment.

## Sound in clips

Clips are silent unless `--audio` is passed. Video models can produce convincing sound effects for the action in a shot (an impact, a pour, a click, ambience) when the prompt describes them, so add a short **Sound** line to the brief naming only the effects that belong to what is on screen, and generate with `--audio` when they help. Do not ask the model for music or speech; those follow `video-craft.md`. You cannot hear: list every clip generated with audio so the owner can listen before anything ships.

## Prompt skeleton

One clip is one shot with one action. Write the prompt as a short brief with these parts, in plain sentences:

- **Subject**: the product, described by its true shape, material, colour and finish.
- **Action**: the single motion (it rotates, it is placed, a part opens, a substance flows). Only motions that physically make sense.
- **Camera**: lens feel, angle and one movement (slow push-in, orbit, tilt, locked).
- **Setting and light**: surface, background and the lighting (soft key, rim light, reflections, shadows) that sells the material.
- **Look**: photoreal, high detail, true-to-life materials, shallow depth of field where it helps, natural motion at real-world speed.
- **Sound** (only with `--audio`): the effects the action makes.
- **Avoid**: warped geometry, melting edges, extra objects, morphing, floating parts, text or logos rendered in the scene, flicker.

Keep the same subject, lighting and palette wording across clips so the cuts match.

## Shot grammar

Plan 3 to 6 short shots instead of one long one: an establishing reveal, a detail on the material, the product in use or in motion, and a hero closing frame that holds for the call to action. Vary scale and angle between cuts, keep each shot about 2 to 5 seconds, and cut on motion. Edit them in a video ad like any other footage (`video-craft.md`), with the real logo, text and call to action built in the composition.

## Review

Render with `ads sheet`, judge the clips against the real product, and list every generated clip (prompt, model, cost) in the close-out. The `.generated.json` beside each clip records the prompt and inputs.
