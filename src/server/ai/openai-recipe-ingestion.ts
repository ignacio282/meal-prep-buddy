import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  aiRecipeParseRequestSchema,
  aiRecipeParseResponseSchema,
  type AiRecipeParseResponse,
} from "@/features/recipes/ai-ingestion-schema";
import { cuisineOptions, proteinOptions } from "@/features/recipes/options";
import { serverEnv } from "@/lib/env/server";

type RecipeIngestionErrorCode =
  | "invalid_input"
  | "invalid_output"
  | "missing_openai_api_key"
  | "model_error";

type OpenAIRecipeParseClient = {
  responses: {
    parse: (request: {
      input: Array<{ content: string; role: "system" | "user" }>;
      model: string;
      text: { format: unknown };
    }) => Promise<{ output_parsed: unknown }>;
  };
};

type ParseRecipeWithOpenAIOptions = Readonly<{
  apiKey?: string | null;
  client?: OpenAIRecipeParseClient;
  model?: string;
}>;

export class RecipeIngestionError extends Error {
  readonly code: RecipeIngestionErrorCode;

  constructor(code: RecipeIngestionErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const proteinValues = proteinOptions.map((option) => option.value).join(", ");
const cuisineValues = cuisineOptions.map((option) => option.value).join(", ");

const recipeExtractionPrompt = [
  "You extract meal prep recipes into structured data for a personal recipe library.",
  "Use only the user's provided recipe text. Do not invent recipe facts, nutrition, serving counts, prep time, or source URLs.",
  "When a value is missing or uncertain, use null for scalar fields and add a short question or confidence note.",
  `For primaryProtein, prefer one of: ${proteinValues}. Use null when unclear.`,
  `For cuisine, prefer one of: ${cuisineValues}. Use null when unclear.`,
  "Keep ingredients as practical shopping/prep lines and steps as concise preparation instructions.",
  "Tags should describe reusable meal prep traits, not generic praise.",
].join("\n");

function createOpenAIClient(apiKey: string | null | undefined) {
  if (!apiKey) {
    throw new RecipeIngestionError(
      "missing_openai_api_key",
      "OPENAI_API_KEY is required to use AI recipe ingestion.",
    );
  }

  return new OpenAI({
    apiKey,
  });
}

export async function parseRecipeWithOpenAI(
  payload: unknown,
  options: ParseRecipeWithOpenAIOptions = {},
): Promise<AiRecipeParseResponse> {
  const parsedPayload = aiRecipeParseRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new RecipeIngestionError(
      "invalid_input",
      "Recipe text must be between 30 and 12000 characters.",
    );
  }

  const apiKey = "apiKey" in options ? options.apiKey : serverEnv.OPENAI_API_KEY;
  const client = options.client ?? createOpenAIClient(apiKey);
  const model = options.model ?? serverEnv.OPENAI_MODEL;

  try {
    const response = await client.responses.parse({
      model,
      input: [
        {
          role: "system",
          content: recipeExtractionPrompt,
        },
        {
          role: "user",
          content: [
            "Extract this recipe draft for review before saving.",
            parsedPayload.data.answers
              ? `Additional user answers:\n${parsedPayload.data.answers}`
              : "",
            `Recipe text:\n${parsedPayload.data.recipeText}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
      text: {
        format: zodTextFormat(aiRecipeParseResponseSchema, "recipe_draft"),
      },
    });

    const parsedResponse = aiRecipeParseResponseSchema.safeParse(
      response.output_parsed,
    );

    if (!parsedResponse.success) {
      throw new RecipeIngestionError(
        "invalid_output",
        "The AI response did not match the expected recipe draft shape.",
      );
    }

    return parsedResponse.data;
  } catch (error) {
    if (error instanceof RecipeIngestionError) {
      throw error;
    }

    throw new RecipeIngestionError(
      "model_error",
      "The AI recipe ingestion request failed.",
    );
  }
}
