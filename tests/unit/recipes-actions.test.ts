import {
  createRecipeAction,
  updateRecipeAction,
  updateRecipeNotesAction,
} from "@/features/recipes/actions";
import {
  createRecipe,
  updateRecipe,
  updateRecipeNotes,
} from "@/server/repositories/recipes";

const { redirectMock, revalidatePathMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/repositories/recipes", () => ({
  createRecipe: vi.fn(() => ({ id: "recipe-1" })),
  toggleRecipeFavorite: vi.fn(),
  updateRecipe: vi.fn(() => ({ id: "recipe-1" })),
  updateRecipeNotes: vi.fn(() => ({ id: "recipe-1" })),
}));

vi.mock("@/server/repositories/weekly-plan", () => ({
  toggleRecipeInWeeklyPlan: vi.fn(),
}));

function buildRecipeFormData() {
  const formData = new FormData();

  formData.set("title", "Harissa Chicken Bowls");
  formData.set("sourceUrl", "https://example.com/harissa");
  formData.set("primaryProtein", "Chicken");
  formData.set("cuisine", "Mediterranean");
  formData.set("totalCalories", "1800");
  formData.set("caloriesPerServing", "450");
  formData.set("proteinGrams", "38");
  formData.set("carbGrams", "42");
  formData.set("fatGrams", "14");
  formData.set("servings", "4");
  formData.set("prepMinutes", "35");
  formData.append("tags", "High protein");
  formData.append("tags", "Meal prep");
  formData.append("ingredients", "Chicken breast");
  formData.append("ingredients", "Cooked rice");
  formData.append("steps", "Season the chicken.");
  formData.append("steps", "Portion into containers.");

  return formData;
}

describe("createRecipeAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    revalidatePathMock.mockClear();
    vi.mocked(createRecipe).mockClear();
    vi.mocked(updateRecipe).mockClear();
    vi.mocked(updateRecipeNotes).mockClear();
  });

  it("accepts repeated tag, ingredient, and step values from the form", async () => {
    await createRecipeAction(buildRecipeFormData());

    expect(createRecipe).toHaveBeenCalledWith({
      caloriesPerServing: 450,
      carbGrams: 42,
      cuisine: "Mediterranean",
      fatGrams: 14,
      ingredients: ["Chicken breast", "Cooked rice"],
      notes: undefined,
      prepMinutes: 35,
      primaryProtein: "Chicken",
      proteinGrams: 38,
      servings: 4,
      sourceLabel: undefined,
      sourceUrl: "https://example.com/harissa",
      steps: ["Season the chicken.", "Portion into containers."],
      tags: ["High protein", "Meal prep"],
      title: "Harissa Chicken Bowls",
      totalCalories: 1800,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/app");
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/recipes/new");
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/recipes/recipe-1");
    expect(redirectMock).toHaveBeenCalledWith(
      "/app/recipes/recipe-1?created=1",
    );
  });

  it("updates an existing recipe from repeated form values", async () => {
    const formData = buildRecipeFormData();

    formData.set("recipeId", "recipe-1");

    await updateRecipeAction(formData);

    expect(updateRecipe).toHaveBeenCalledWith("recipe-1", {
      caloriesPerServing: 450,
      carbGrams: 42,
      cuisine: "Mediterranean",
      fatGrams: 14,
      ingredients: ["Chicken breast", "Cooked rice"],
      notes: undefined,
      prepMinutes: 35,
      primaryProtein: "Chicken",
      proteinGrams: 38,
      servings: 4,
      sourceLabel: undefined,
      sourceUrl: "https://example.com/harissa",
      steps: ["Season the chicken.", "Portion into containers."],
      tags: ["High protein", "Meal prep"],
      title: "Harissa Chicken Bowls",
      totalCalories: 1800,
    });
    expect(redirectMock).toHaveBeenCalledWith(
      "/app/recipes/recipe-1?updated=1",
    );
  });

  it("saves recipe notes and returns to the detail page", async () => {
    const formData = new FormData();

    formData.set("recipeId", "recipe-1");
    formData.set("returnTo", "/app/recipes/recipe-1");
    formData.set("notes", "Use less salt next time.");

    await updateRecipeNotesAction(formData);

    expect(updateRecipeNotes).toHaveBeenCalledWith(
      "recipe-1",
      "Use less salt next time.",
    );
    expect(redirectMock).toHaveBeenCalledWith("/app/recipes/recipe-1");
  });
});
