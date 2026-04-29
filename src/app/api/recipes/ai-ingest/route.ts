import { NextResponse } from "next/server";

import {
  parseRecipeWithOpenAI,
  RecipeIngestionError,
} from "@/server/ai/openai-recipe-ingestion";

export const runtime = "nodejs";

const statusByErrorCode: Record<RecipeIngestionError["code"], number> = {
  invalid_input: 400,
  invalid_output: 502,
  missing_openai_api_key: 503,
  model_error: 502,
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        code: "invalid_input",
        error: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  try {
    const parsedRecipe = await parseRecipeWithOpenAI(payload);

    return NextResponse.json(parsedRecipe);
  } catch (error) {
    if (error instanceof RecipeIngestionError) {
      return NextResponse.json(
        {
          code: error.code,
          error: error.message,
        },
        { status: statusByErrorCode[error.code] },
      );
    }

    return NextResponse.json(
      {
        code: "model_error",
        error: "The AI recipe ingestion request failed.",
      },
      { status: 502 },
    );
  }
}
