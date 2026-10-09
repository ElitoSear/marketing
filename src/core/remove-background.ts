import { mkdir } from "node:fs/promises";
import path from "node:path";
import envPaths from "env-paths";
import sharp from "sharp";

/**
 * BiRefNet (MIT-licensed weights) running locally. The model is about 1 GB
 * and downloads once into the user cache, shared by every project.
 */
const MODEL_IDENTIFIER = "onnx-community/BiRefNet-ONNX";

export function resolveModelCacheDirectory(): string {
  return path.join(envPaths("elitosear-marketing", { suffix: "" }).cache, "models");
}

export async function removeBackground(options: {
  inputPath: string;
  outputPath: string;
}): Promise<void> {
  // Loaded on demand: the transformers runtime is heavy and only this command needs it.
  const { AutoModel, AutoProcessor, env, RawImage } = await import(
    "@huggingface/transformers"
  );
  env.cacheDir = resolveModelCacheDirectory();

  const model = await AutoModel.from_pretrained(MODEL_IDENTIFIER, {
    dtype: "fp32",
  });
  const processor = await AutoProcessor.from_pretrained(MODEL_IDENTIFIER);

  const image = await RawImage.read(options.inputPath);
  const { pixel_values: pixelValues } = await processor(image);
  const { output_image: outputImage } = await model({ input_image: pixelValues });

  const mask = await RawImage.fromTensor(
    outputImage[0].sigmoid().mul(255).to("uint8"),
  ).resize(image.width, image.height);

  const { data: colorPixels, info } = await sharp(options.inputPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Interleave the mask as the alpha channel: R, G, B, A for every pixel.
  const pixelCount = info.width * info.height;
  const rgbaPixels = Buffer.alloc(pixelCount * 4);
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    rgbaPixels[pixelIndex * 4] = colorPixels[pixelIndex * 3];
    rgbaPixels[pixelIndex * 4 + 1] = colorPixels[pixelIndex * 3 + 1];
    rgbaPixels[pixelIndex * 4 + 2] = colorPixels[pixelIndex * 3 + 2];
    rgbaPixels[pixelIndex * 4 + 3] = mask.data[pixelIndex];
  }

  await mkdir(path.dirname(options.outputPath), { recursive: true });
  await sharp(rgbaPixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(options.outputPath);
}
