import sharp, { type OverlayOptions } from "sharp";

export interface SheetFrame {
  filePath: string;
  /** Printed under the tile, for example "1.5s  f45". */
  label: string;
}

const LABEL_HEIGHT_PIXELS = 36;

function labelSvg(options: { width: number; text: string }): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${LABEL_HEIGHT_PIXELS}"><rect width="100%" height="100%" fill="#111"/><text x="10" y="25" font-family="sans-serif" font-size="20" fill="#fff">${options.text}</text></svg>`,
  );
}

/**
 * Tiles frames left to right, top to bottom, into one PNG with a label under
 * each, so the motion of a whole video can be judged in a single image.
 */
export async function buildContactSheet(options: {
  frames: SheetFrame[];
  columns: number;
  tileWidth: number;
  outputPath: string;
}): Promise<void> {
  const { frames, columns, tileWidth } = options;
  const firstFrame = frames[0];
  if (firstFrame === undefined) throw new Error("A contact sheet needs frames");
  const metadata = await sharp(firstFrame.filePath).metadata();
  if (metadata.width === undefined || metadata.height === undefined)
    throw new Error(`Cannot read the size of ${firstFrame.filePath}`);
  const tileHeight = Math.round((metadata.height / metadata.width) * tileWidth);
  const cellHeight = tileHeight + LABEL_HEIGHT_PIXELS;
  const rows = Math.ceil(frames.length / columns);

  const composites: OverlayOptions[] = [];
  for (const [frameIndex, frame] of frames.entries()) {
    const left = (frameIndex % columns) * tileWidth;
    const top = Math.floor(frameIndex / columns) * cellHeight;
    composites.push(
      {
        input: await sharp(frame.filePath)
          .resize(tileWidth, tileHeight)
          .toBuffer(),
        left,
        top,
      },
      {
        input: labelSvg({ width: tileWidth, text: frame.label }),
        left,
        top: top + tileHeight,
      },
    );
  }
  await sharp({
    create: {
      width: columns * tileWidth,
      height: rows * cellHeight,
      channels: 3,
      background: "#111",
    },
  })
    .composite(composites)
    .png()
    .toFile(options.outputPath);
}
