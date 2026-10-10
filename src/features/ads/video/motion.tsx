import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type SpringConfig,
} from "remotion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Motion building blocks for video ads. Every value is a pure function of the
 * current frame, so renders are deterministic. They carry no colours of their
 * own: the design passes them, and the project's styles supply the rest.
 */

/** Smooth settle with no bounce: the default for text and cards. */
export const SPRING_SMOOTH: SpringConfig = {
  damping: 18,
  stiffness: 120,
  mass: 0.9,
  overshootClamping: false,
};

/** Fast, slightly overshooting snap: for hits and the first beat. */
export const SPRING_SNAPPY: SpringConfig = {
  damping: 13,
  stiffness: 220,
  mass: 0.8,
  overshootClamping: false,
};

/**
 * Fade, rise and scale together. A lone fade reads as a default; three
 * properties moving as one reads as designed. `delayInFrames` staggers
 * siblings. `startOpacity` is how visible it is on its first frame: 0 for
 * something that arrives mid-scene, above 0 (for example 0.4) for the first
 * element after a hard cut, so the cut never lands on an empty frame.
 */
export function Entrance(props: {
  delayInFrames: number;
  startOpacity: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - props.delayInFrames,
    fps,
    config: SPRING_SMOOTH,
  });
  return (
    <div
      style={{
        opacity: interpolate(progress, [0, 1], [props.startOpacity, 1]),
        translate: `0px ${interpolate(progress, [0, 1], [40, 0])}px`,
        scale: interpolate(progress, [0, 1], [0.94, 1]),
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

/**
 * Words entering one after another. `gapInPixels` is in pixels on purpose:
 * `em` gaps resolve against the parent's font size, not the large type inside.
 */
export function WordReveal(props: {
  text: string;
  delayInFrames: number;
  framesPerWord: number;
  gapInPixels: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: props.gapInPixels,
        ...props.style,
      }}
    >
      {props.text.split(" ").map((word, wordIndex) => {
        const progress = spring({
          frame: frame - props.delayInFrames - wordIndex * props.framesPerWord,
          fps,
          config: SPRING_SNAPPY,
        });
        return (
          <span
            key={`${word}-${wordIndex}`}
            style={{
              display: "inline-block",
              opacity: progress,
              translate: `0px ${interpolate(progress, [0, 1], [30, 0])}px`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

/**
 * A scale snap on a cut: the cheapest pattern interrupt, and it needs no new
 * footage. `startFrame` is the frame of the cut.
 */
export function PunchIn(props: {
  startFrame: number;
  scaleTo: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - props.startFrame,
    fps,
    config: SPRING_SNAPPY,
  });
  return (
    <AbsoluteFill
      style={{
        scale: interpolate(progress, [0, 1], [1, props.scaleTo]),
        transformOrigin: "50% 45%",
      }}
    >
      {props.children}
    </AbsoluteFill>
  );
}

/**
 * A still picture that is always moving: slow zoom and drift across the whole
 * clip. `source` is a path inside the project's public folder (staticFile) or
 * an imported asset URL.
 */
export function KenBurns(props: {
  source: string;
  zoomFrom: number;
  zoomTo: number;
  isPublicFile: boolean;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const easing = Easing.inOut(Easing.quad);
  const scale = interpolate(frame, [0, durationInFrames], [props.zoomFrom, props.zoomTo], {
    easing,
  });
  const drift = interpolate(frame, [0, durationInFrames], [0, -24], { easing });
  return (
    <Img
      src={props.isPublicFile ? staticFile(props.source) : props.source}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        scale,
        translate: `${drift}px 0px`,
      }}
    />
  );
}

/**
 * A background that is never flat: two soft colour blobs drifting slowly over
 * a base colour. Pass colours from the brand's theme.
 */
export function Backdrop(props: {
  /** Any CSS colour: pick them from the brand. */
  baseColor: string;
  glowColor: string;
  accentColor: string;
}) {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  // Sizes follow the canvas so the glows look the same on any format.
  const glowSize = width * 1.1;
  const accentSize = width * 0.85;
  const driftX = Math.sin(frame / 55) * width * 0.045;
  const driftY = Math.cos(frame / 70) * width * 0.037;
  return (
    <AbsoluteFill style={{ backgroundColor: props.baseColor, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          top: -glowSize * 0.375,
          left: -glowSize * 0.25 + driftX,
          borderRadius: "50%",
          filter: "blur(50px)",
          background: `radial-gradient(circle, ${props.glowColor}, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: accentSize,
          height: accentSize,
          bottom: -accentSize * 0.45,
          right: -accentSize * 0.28 - driftY,
          borderRadius: "50%",
          filter: "blur(70px)",
          background: `radial-gradient(circle, ${props.accentColor}, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
}

const GRAIN_TILE_PIXELS = 220;
const GRAIN_IMAGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${GRAIN_TILE_PIXELS}' height='${GRAIN_TILE_PIXELS}'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='${GRAIN_TILE_PIXELS}' height='${GRAIN_TILE_PIXELS}' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

/**
 * Film grain that flickers frame to frame, with no asset file. Put it above
 * everything except the vignette; it makes flat gradients and mixed pictures
 * read as one photographed image.
 */
export function Grain(props: { opacity: number; blendMode: CSSProperties["mixBlendMode"] }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: GRAIN_IMAGE,
        backgroundSize: `${GRAIN_TILE_PIXELS}px`,
        backgroundPosition: `${(frame * 7) % GRAIN_TILE_PIXELS}px ${(frame * 13) % GRAIN_TILE_PIXELS}px`,
        opacity: props.opacity,
        mixBlendMode: props.blendMode,
      }}
    />
  );
}

/** Darkened corners that pull the eye to the centre; the topmost layer. */
export function Vignette(props: { strength: number }) {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 56%, rgba(0,0,0,${props.strength}) 100%)`,
      }}
    />
  );
}

export interface PointerWaypoint {
  x: number;
  y: number;
  /** The frame at which the pointer arrives here. */
  atFrame: number;
}

function pointerPosition(options: {
  frame: number;
  waypoints: PointerWaypoint[];
}): { x: number; y: number } {
  const { frame, waypoints } = options;
  const first = waypoints[0];
  const last = waypoints[waypoints.length - 1];
  if (first === undefined || last === undefined)
    throw new Error("Pointer needs at least one waypoint");
  if (frame <= first.atFrame) return { x: first.x, y: first.y };
  if (frame >= last.atFrame) return { x: last.x, y: last.y };
  const segmentIndex = waypoints.findIndex(
    (waypoint, index) =>
      waypoint.atFrame <= frame && frame < (waypoints[index + 1]?.atFrame ?? Infinity),
  );
  const from = waypoints[segmentIndex];
  const to = waypoints[segmentIndex + 1];
  if (from === undefined || to === undefined) return { x: last.x, y: last.y };
  const eased = Easing.inOut(Easing.cubic)(
    (frame - from.atFrame) / (to.atFrame - from.atFrame),
  );
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const distance = Math.hypot(deltaX, deltaY);
  // A human hand travels on a slight arc, not a straight line.
  const bow = distance === 0 ? 0 : Math.sin(Math.PI * eased) * distance * 0.1;
  return {
    x: from.x + deltaX * eased + (distance === 0 ? 0 : (-deltaY / distance) * bow),
    y: from.y + deltaY * eased + (distance === 0 ? 0 : (deltaX / distance) * bow),
  };
}

const PRESS_FRAMES = 18;
const RIPPLE_FRAMES = 16;

/**
 * A mouse pointer that performs an action: it moves between the waypoints
 * with eased motion on a slight arc, dips when it presses and sends out a
 * ripple. `pressFrames` are the frames of the clicks, so the design can make
 * the interface react on the same frame. Positions are in pixels on the
 * canvas; the tip of the arrow is the position.
 */
export function Pointer(props: {
  waypoints: PointerWaypoint[];
  pressFrames: number[];
  size: number;
  color: string;
  outlineColor: string;
}) {
  const frame = useCurrentFrame();
  const { x, y } = pointerPosition({ frame, waypoints: props.waypoints });
  const pressAges = props.pressFrames
    .map((pressFrame) => frame - pressFrame)
    .filter((age) => age >= 0 && age < PRESS_FRAMES);
  const latestAge = pressAges.length === 0 ? undefined : Math.min(...pressAges);
  const dip =
    latestAge === undefined
      ? 1
      : interpolate(latestAge, [0, 4, 10], [1, 0.82, 1], {
          extrapolateRight: "clamp",
        });
  const rippleProgress =
    latestAge === undefined || latestAge >= RIPPLE_FRAMES
      ? undefined
      : latestAge / RIPPLE_FRAMES;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        translate: `${x}px ${y}px`,
        pointerEvents: "none",
      }}
    >
      {rippleProgress === undefined ? null : (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: props.size * 2.2 * rippleProgress,
            height: props.size * 2.2 * rippleProgress,
            translate: "-50% -50%",
            borderRadius: "50%",
            border: `${Math.max(2, props.size * 0.06)}px solid ${props.color}`,
            opacity: 1 - rippleProgress,
          }}
        />
      )}
      <svg
        width={props.size}
        height={props.size}
        viewBox="0 0 24 24"
        style={{
          display: "block",
          overflow: "visible",
          scale: dip,
          transformOrigin: "4px 2px",
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))",
        }}
      >
        <path
          d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.7 L11.6 14 L17.5 14 Z"
          fill={props.color}
          stroke={props.outlineColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Text typed character by character with a blinking caret. Pair it with a
 * `Pointer` press, or let it fill a field as the beat begins.
 */
export function Typewriter(props: {
  text: string;
  startFrame: number;
  framesPerCharacter: number;
  caretColor: string;
}) {
  const frame = useCurrentFrame();
  const characterCount = Math.min(
    props.text.length,
    Math.max(0, Math.floor((frame - props.startFrame) / props.framesPerCharacter)),
  );
  const isTyping = characterCount < props.text.length;
  const caretVisible = isTyping || Math.floor(frame / 15) % 2 === 0;
  return (
    <span>
      {props.text.slice(0, characterCount)}
      <span style={{ color: props.caretColor, opacity: caretVisible ? 1 : 0 }}>
        |
      </span>
    </span>
  );
}
