const { parseRecipeWithOpenAIMock } = vi.hoisted(() => ({
  parseRecipeWithOpenAIMock: vi.fn(),
}));

vi.mock("@/server/ai/openai-recipe-ingestion", () => {
  class MockRecipeIngestionError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }

  return {
    parseRecipeWithOpenAI: parseRecipeWithOpenAIMock,
    RecipeIngestionError: MockRecipeIngestionError,
  };
});

import { POST } from "@/app/api/recipes/ai-ingest/route";
import { RecipeIngestionError } from "@/server/ai/openai-recipe-ingestion";

const validParsedRecipe = {
  confidenceNotes: [],
  draft: {
    caloriesPerServing: 450,
    carbGrams: 42,
    cuisine: "Mediterranean",
    fatGrams: 14,
    ingredients: ["Chicken breast"],
    notes: null,
    prepMinutes: 35,
    primaryProtein: "Chicken",
    proteinGrams: 38,
    servings: 4,
    sourceUrl: null,
    steps: ["Cook chicken."],
    tags: ["High protein"],
    title: "Chicken Bowls",
    totalCalories: 1800,
  },
  questions: [],
};

describe("POST /api/recipes/ai-ingest", () => {
  beforeEach(() => {
    parseRecipeWithOpenAIMock.mockReset();
  });

  it("returns the parsed recipe draft", async () => {
    parseRecipeWithOpenAIMock.mockResolvedValue(validParsedRecipe);

    const response = await POST(
      new Request("http://localhost/api/recipes/ai-ingest", {
        method: "POST",
        body: JSON.stringify({
          recipeText:
            "Chicken bowls with rice, four servings, 450 calories per serving.",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(validParsedRecipe);
  });

  it("returns a controlled validation error for invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/recipes/ai-ingest", {
        method: "POST",
        body: "{",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      code: "invalid_input",
    });
    expect(parseRecipeWithOpenAIMock).not.toHaveBeenCalled();
  });

  it("maps missing OpenAI configuration to a service-unavailable response", async () => {
    parseRecipeWithOpenAIMock.mockRejectedValue(
      new RecipeIngestionError(
        "missing_openai_api_key",
        "OPENAI_API_KEY is required to use AI recipe ingestion.",
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/recipes/ai-ingest", {
        method: "POST",
        body: JSON.stringify({
          recipeText:
            "Chicken bowls with rice, four servings, 450 calories per serving.",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      code: "missing_openai_api_key",
    });
  });
});
