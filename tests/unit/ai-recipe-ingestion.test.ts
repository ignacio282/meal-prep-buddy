import {
  parseRecipeWithOpenAI,
  RecipeIngestionError,
} from "@/server/ai/openai-recipe-ingestion";

const validDraftResponse = {
  confidenceNotes: ["Macros were provided by the user."],
  draft: {
    caloriesPerServing: 450,
    carbGrams: 42,
    cuisine: "Mediterranean",
    fatGrams: 14,
    ingredients: ["Chicken breast", "Cooked rice"],
    notes: null,
    prepMinutes: 35,
    primaryProtein: "Chicken",
    proteinGrams: 38,
    servings: 4,
    sourceUrl: "https://example.com/harissa",
    steps: ["Season the chicken.", "Portion into containers."],
    tags: ["High protein", "Meal prep"],
    title: "Harissa Chicken Bowls",
    totalCalories: 1800,
  },
  questions: ["Confirm whether the rice is cooked before measuring."],
};

function buildMockClient(outputParsed: unknown) {
  return {
    responses: {
      parse: vi.fn(async () => ({
        output_parsed: outputParsed,
      })),
    },
  };
}

describe("parseRecipeWithOpenAI", () => {
  it("returns a structured recipe draft from the parsed OpenAI response", async () => {
    const client = buildMockClient(validDraftResponse);

    await expect(
      parseRecipeWithOpenAI(
        {
          recipeText:
            "Harissa chicken bowls with rice, four servings, 450 calories per serving.",
        },
        { client, model: "test-model" },
      ),
    ).resolves.toEqual(validDraftResponse);

    expect(client.responses.parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "test-model",
        text: expect.any(Object),
      }),
    );
  });

  it("rejects short or invalid recipe input before calling OpenAI", async () => {
    const client = buildMockClient(validDraftResponse);

    await expect(
      parseRecipeWithOpenAI({ recipeText: "too short" }, { client }),
    ).rejects.toMatchObject({
      code: "invalid_input",
    });

    expect(client.responses.parse).not.toHaveBeenCalled();
  });

  it("returns a controlled error when OPENAI_API_KEY is missing", async () => {
    await expect(
      parseRecipeWithOpenAI(
        {
          recipeText:
            "Harissa chicken bowls with rice, four servings, 450 calories per serving.",
        },
        { apiKey: null },
      ),
    ).rejects.toMatchObject({
      code: "missing_openai_api_key",
    });
  });

  it("rejects model output that does not match the recipe draft schema", async () => {
    const client = buildMockClient({
      draft: {
        title: "Missing required response fields",
      },
    });

    await expect(
      parseRecipeWithOpenAI(
        {
          recipeText:
            "Harissa chicken bowls with rice, four servings, 450 calories per serving.",
        },
        { client },
      ),
    ).rejects.toMatchObject({
      code: "invalid_output",
    });
  });

  it("wraps OpenAI client failures in a model error", async () => {
    const client = {
      responses: {
        parse: vi.fn(async () => {
          throw new Error("provider unavailable");
        }),
      },
    };

    await expect(
      parseRecipeWithOpenAI(
        {
          recipeText:
            "Harissa chicken bowls with rice, four servings, 450 calories per serving.",
        },
        { client },
      ),
    ).rejects.toBeInstanceOf(RecipeIngestionError);

    await expect(
      parseRecipeWithOpenAI(
        {
          recipeText:
            "Harissa chicken bowls with rice, four servings, 450 calories per serving.",
        },
        { client },
      ),
    ).rejects.toMatchObject({
      code: "model_error",
    });
  });
});
