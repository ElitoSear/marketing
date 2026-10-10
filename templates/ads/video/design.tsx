import { useMediaFormat } from "@elitosear/marketing/core/media-format-context";
import {
  Backdrop,
  Entrance,
  Grain,
  PunchIn,
  Vignette,
} from "@elitosear/marketing/features/ads/video/motion";
import { defineVideoAd } from "@elitosear/marketing/features/ads/video/video-ad-definition";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import "../../../styles.css";
import { copySchema, type Copy } from "./design/copy-schema.ts";

/*
 * A starting point, not a layout: three beats on hard cuts (hook, point, ask),
 * a backdrop that is never flat, grain and vignette on top, and a call to
 * action that holds. The backdrop colours are placeholders: pass the brand's
 * own, and invent the real composition.
 */

function Design(props: { copy: Copy }) {
  const { fps } = useVideoConfig();
  const { safeInsets } = useMediaFormat();
  const hookEnd = Math.round(2.4 * fps);
  const pointEnd = Math.round(5 * fps);
  // Absolutely positioned beats ignore their parent's padding, so each beat
  // takes the safe insets itself.
  const safePadding = {
    paddingTop: safeInsets.top,
    paddingBottom: safeInsets.bottom,
    paddingLeft: safeInsets.left,
    paddingRight: safeInsets.right,
  };
  return (
    <AbsoluteFill className="text-white">
      <Backdrop baseColor="black" glowColor="gray" accentColor="white" />
      <AbsoluteFill>
        <Sequence durationInFrames={hookEnd} premountFor={fps}>
          <PunchIn startFrame={0} scaleTo={1.06}>
            <AbsoluteFill className="justify-center" style={safePadding}>
              <h1 className="text-[120px] leading-none font-extrabold tracking-tight">
                {props.copy.headline}
              </h1>
            </AbsoluteFill>
          </PunchIn>
        </Sequence>
        <Sequence from={hookEnd} durationInFrames={pointEnd - hookEnd} premountFor={fps}>
          <AbsoluteFill className="justify-center gap-8" style={safePadding}>
            <Entrance delayInFrames={0} startOpacity={0.4}>
              <p className="text-[64px] leading-tight font-semibold">
                {props.copy.body}
              </p>
            </Entrance>
          </AbsoluteFill>
        </Sequence>
        <Sequence from={pointEnd} premountFor={fps}>
          <AbsoluteFill className="justify-center gap-10" style={safePadding}>
            <Entrance delayInFrames={0} startOpacity={0.4}>
              <p className="text-[96px] leading-none font-extrabold tracking-tight">
                {props.copy.call_to_action}
              </p>
            </Entrance>
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>
      <Grain opacity={0.06} blendMode="overlay" />
      <Vignette strength={0.25} />
    </AbsoluteFill>
  );
}

export default defineVideoAd({ durationInSeconds: 7.5, copySchema, Design });
