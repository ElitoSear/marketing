import { createVertex } from "@ai-sdk/google-vertex";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { experimental_generateVideo as generateVideoWithSdk } from "ai";
import { readFile } from "node:fs/promises";
import mime from "mime-types";
import zod from "zod";
import { readEnvironmentVariable } from "./image-provider/read-environment-variable.ts";

/**
 * Video providers run on the Vercel AI SDK. Credentials are never stored in
 * the config: each provider names the environment variable holding its secret
 * and the CLI reads it at call time.
 */
export const videoProviderSchema = zod.discriminatedUnion("kind", [
  zod.strictObject({
    /** Veo on the Gemini Developer API (AI Studio). */
    kind: zod.literal("google"),
    model: zod.string().min(1),
    apiKeyEnv: zod.string().min(1),
  }),
  zod.strictObject({
    /** Veo on Vertex AI with a service-account key. */
    kind: zod.literal("vertex"),
    model: zod.string().min(1),
    /** Variable holding the whole service-account key file as one line of JSON. */
    serviceAccountEnv: zod.string().min(1),
    /** Region, for example "us-central1". */
    location: zod.string().min(1),
  }),
]);

export type VideoProviderConfig = zod.infer<typeof videoProviderSchema>;

/** Both providers return the same model type; the SDK does not export it by name. */
type VideoModel = ReturnType<ReturnType<typeof createGoogleGenerativeAI>["video"]>;

const serviceAccountSchema = zod.looseObject({
  project_id: zod.string().min(1),
  client_email: zod.string().min(1),
  private_key: zod.string().min(1),
});

function createVideoModel(options: {
  provider: VideoProviderConfig;
  model: string;
  environment: NodeJS.ProcessEnv;
}): VideoModel {
  const { provider, model, environment } = options;
  switch (provider.kind) {
    case "google":
      return createGoogleGenerativeAI({
        apiKey: readEnvironmentVariable(environment, provider.apiKeyEnv),
      }).video(model);
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
      }).video(model);
    }
  }
}

export interface GeneratedVideo {
  data: Uint8Array;
  /** File extension without the dot. */
  extension: string;
}

export interface VideoRequest {
  prompt: string;
  model: string;
  /** Image the clip starts from, to keep a real product or character faithful. */
  firstFramePath: string | undefined;
  /** Image the clip ends on. */
  lastFramePath: string | undefined;
  aspectRatio: `${number}:${number}` | undefined;
  durationInSeconds: number | undefined;
  resolution: `${number}x${number}` | undefined;
  withAudio: boolean;
  environment: NodeJS.ProcessEnv;
}

/**
 * Generates one clip. Clips are silent unless the caller asks for the model's
 * sound effects.
 */
export async function generateVideo(
  options: VideoRequest & { provider: VideoProviderConfig },
): Promise<GeneratedVideo> {
  const model = createVideoModel({
    provider: options.provider,
    model: options.model,
    environment: options.environment,
  });
  const frameImages = [];
  if (options.firstFramePath !== undefined)
    frameImages.push({
      image: await readFile(options.firstFramePath),
      frameType: "first_frame" as const,
    });
  if (options.lastFramePath !== undefined)
    frameImages.push({
      image: await readFile(options.lastFramePath),
      frameType: "last_frame" as const,
    });

  const { video } = await generateVideoWithSdk({
    model,
    prompt: options.prompt,
    aspectRatio: options.aspectRatio,
    duration: options.durationInSeconds,
    resolution: options.resolution,
    frameImages: frameImages.length === 0 ? undefined : frameImages,
    generateAudio: options.withAudio,
  });
  return {
    data: video.uint8Array,
    extension: mime.extension(video.mediaType) || "mp4",
  };
}
