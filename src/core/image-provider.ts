import { createVertex } from "@ai-sdk/google-vertex";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  generateImage as generateImageWithSdk,
  NoImageGeneratedError,
  type ImageModel,
} from "ai";
import { readFile } from "node:fs/promises";
import mime from "mime-types";
import zod from "zod";
import { readEnvironmentVariable } from "./image-provider/read-environment-variable.ts";

/**
 * Providers run on the Vercel AI SDK. Credentials are never stored in the
 * config: each provider names the environment variable holding its secret and
 * the CLI reads it at call time.
 */
export const imageProviderSchema = zod.discriminatedUnion("kind", [
  zod.strictObject({
    /** Gemini Developer API (AI Studio). */
    kind: zod.literal("google"),
    model: zod.string().min(1),
    apiKeyEnv: zod.string().min(1),
  }),
  zod.strictObject({
    /** Gemini on Vertex AI with a service-account key. */
    kind: zod.literal("vertex"),
    model: zod.string().min(1),
    /** Variable holding the whole service-account key file as one line of JSON. */
    serviceAccountEnv: zod.string().min(1),
    /** Region, for example "global" or "us-central1". */
    location: zod.string().min(1),
  }),
  zod.strictObject({
    kind: zod.literal("openai"),
    model: zod.string().min(1),
    apiKeyEnv: zod.string().min(1),
  }),
  zod.strictObject({
    /** Any vendor that serves the OpenAI images API at `baseUrl`. */
    kind: zod.literal("openai-compatible"),
    model: zod.string().min(1),
    apiKeyEnv: zod.string().min(1),
    baseUrl: zod.url(),
  }),
]);

export type ImageProviderConfig = zod.infer<typeof imageProviderSchema>;

const serviceAccountSchema = zod.looseObject({
  project_id: zod.string().min(1),
  client_email: zod.string().min(1),
  private_key: zod.string().min(1),
});

function createImageModel(options: {
  provider: ImageProviderConfig;
  model: string;
  environment: NodeJS.ProcessEnv;
}): ImageModel {
  const { provider, model, environment } = options;
  switch (provider.kind) {
    case "google":
      return createGoogleGenerativeAI({
        apiKey: readEnvironmentVariable(environment, provider.apiKeyEnv),
      }).image(model);
    case "vertex": {
      const credentials = serviceAccountSchema.parse(
        JSON.parse(
          readEnvironmentVariable(environment, provider.serviceAccountEnv),
        ),
      );
      return createVertex({
        project: credentials.project_id,
        location: provider.location,
        googleAuthOptions: {
          credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          },
        },
      }).image(model);
    }
    case "openai":
      return createOpenAI({
        apiKey: readEnvironmentVariable(environment, provider.apiKeyEnv),
      }).image(model);
    case "openai-compatible":
      return createOpenAICompatible({
        name: "openai-compatible",
        baseURL: provider.baseUrl,
        apiKey: readEnvironmentVariable(environment, provider.apiKeyEnv),
      }).imageModel(model);
  }
}

export interface GeneratedImage {
  data: Uint8Array;
  /** File extension without the dot. */
  extension: string;
}

export interface ImageRequest {
  prompt: string;
  model: string;
  /** Reference or source images, to edit an image or keep a subject consistent. */
  inputPaths: string[];
  aspectRatio: `${number}:${number}` | undefined;
  environment: NodeJS.ProcessEnv;
}

/**
 * Gemini image models occasionally answer with text only, mostly when the
 * prompt also asks for text rendered onto the picture. An identical retry
 * usually succeeds.
 */
const MAXIMUM_ATTEMPTS = 3;

export async function generateImage(
  options: ImageRequest & { provider: ImageProviderConfig },
): Promise<GeneratedImage> {
  const imageModel = createImageModel({
    provider: options.provider,
    model: options.model,
    environment: options.environment,
  });
  const images = await Promise.all(
    options.inputPaths.map((inputPath) => readFile(inputPath)),
  );
  const prompt =
    images.length === 0 ? options.prompt : { images, text: options.prompt };

  for (let attempt = 1; ; attempt += 1) {
    try {
      const { image } = await generateImageWithSdk({
        model: imageModel,
        prompt,
        aspectRatio: options.aspectRatio,
      });
      return {
        data: image.uint8Array,
        extension: mime.extension(image.mediaType) || "png",
      };
    } catch (error) {
      if (!NoImageGeneratedError.isInstance(error) || attempt >= MAXIMUM_ATTEMPTS)
        throw error;
    }
  }
}
