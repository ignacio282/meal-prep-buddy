import { buildDashboardState, getRecipeDensity, getTargetPerMeal } from "@/features/dashboard/model";
import type { DashboardSearchFilters } from "@/features/dashboard/search-params";
import type { SavedRecipe } from "@/server/repositories/recipes";
import type { WeeklyPlan } from "@/server/repositories/weekly-plan";
import type { UserPreferences } from "@/server/repositories/user-preferences";

const preferencesFixture: UserPreferences = {
  id: "single-user",
  age: 30,
  sex: "female",
  heightUnit: "imperial",
  heightFeet: 5,
  heightInches: 6,
  heightCentimeters: null,
  initialWeight: 160,
  weightUnit: "lb",
  activityPerWeek: "3-4",
  calorieTarget: 2100,
  mealsPerDay: "3",
  likedFoodTags: ["Chicken", "Rice bowls"],
  likedFoodNotes: null,
  dislikedFoods: null,
  dietaryRestrictions: null,
  cookDays: ["sunday"],
  onboardingCompletedAt: "2026-04-20T10:00:00.000Z",
  updatedAt: "2026-04-20T10:00:00.000Z",
};

const recipeFixture = (overrides: Partial<SavedRecipe>): SavedRecipe => ({
  id: crypto.randomUUID(),
  title: "Default recipe",
  sourceUrl: null,
  sourceLabel: "Weekly prep",
  notes: null,
  primaryProtein: "Chicken",
  cuisine: "Asian",
  totalCalories: 1800,
  caloriesPerServing: 600,
  proteinGrams: 40,
  carbGrams: 45,
  fatGrams: 16,
  servings: 3,
  prepMinutes: 35,
  tags: ["High protein"],
  ingredients: ["Chicken", "Rice", "Broccoli"],
  steps: ["Cook", "Portion"],
  favorite: false,
  plannedThisWeek: false,
  createdAt: "2026-04-20T10:00:00.000Z",
  updatedAt: "2026-04-20T10:00:00.000Z",
  ...overrides,
});

const filtersFixture: DashboardSearchFilters = {
  search: "",
  libraryProtein: "",
  libraryCarbs: "",
  cuisine: "",
  favoritesOnly: false,
  sort: "recent",
  suggestionCuisine: "Asian",
  suggestionProtein: "Chicken",
  suggestionDensity: "balanced",
  effort: "standard",
  shuffle: 0,
  view: "library",
};

describe("dashboard model", () => {
  it("calculates target calories per meal from onboarding defaults", () => {
    expect(getTargetPerMeal(preferencesFixture)).toBe(700);
  });

  it("classifies recipe density against the user's target per meal", () => {
    expect(
      getRecipeDensity(
        recipeFixture({
          caloriesPerServing: 520,
        }),
        preferencesFixture,
      ),
    ).toBe("lighter");

    expect(
      getRecipeDensity(
        recipeFixture({
          caloriesPerServing: 760,
        }),
        preferencesFixture,
      ),
    ).toBe("balanced");

    expect(
      getRecipeDensity(
        recipeFixture({
          caloriesPerServing: 900,
        }),
        preferencesFixture,
      ),
    ).toBe("more-filling");
  });

  it("filters the library and returns a matching shortlist for weekly picks", () => {
    const recipes = [
      recipeFixture({
        id: "chicken-balanced",
        title: "Chicken bowls",
        cuisine: "Mediterranean",
        caloriesPerServing: 720,
        prepMinutes: 40,
      }),
      recipeFixture({
        id: "chicken-heavy",
        title: "Loaded chicken pasta",
        cuisine: "Mediterranean",
        caloriesPerServing: 980,
        prepMinutes: 60,
      }),
      recipeFixture({
        id: "beef-balanced",
        title: "Beef rice bowls",
        primaryProtein: "Beef",
        caloriesPerServing: 710,
        prepMinutes: 32,
      }),
    ];

    const state = buildDashboardState(recipes, preferencesFixture, {
      ...filtersFixture,
      search: "bowl",
      suggestionCuisine: "Mediterranean",
    });

    expect(state.filteredRecipes).toHaveLength(2);
    expect(state.selectedSuggestionCuisine).toBe("Mediterranean");
    expect(state.suggestedRecipes[0]?.recipe.title).toBe("Chicken bowls");
    expect(state.suggestedRecipes).toHaveLength(2);
    expect(state.suggestedRecipes[0]?.label).toBe("Top choice");
    expect(state.suggestedRecipes[1]?.label).toBe("Something with Chicken");
    expect(state.plannedRecipes).toHaveLength(0);
    expect(state.noSuggestionMatches).toBe(false);
  });

  it("fills missing randomizer slots with same-protein and same-cuisine fallbacks", () => {
    const recipes = [
      recipeFixture({
        id: "exact",
        title: "Harissa chicken bowls",
        primaryProtein: "Chicken",
        cuisine: "Mediterranean",
        caloriesPerServing: 710,
        prepMinutes: 40,
      }),
      recipeFixture({
        id: "protein-fallback",
        title: "Chicken burrito tray",
        primaryProtein: "Chicken",
        cuisine: "Mexican",
        caloriesPerServing: 720,
        prepMinutes: 41,
      }),
      recipeFixture({
        id: "cuisine-fallback",
        title: "Mediterranean salmon plates",
        primaryProtein: "Salmon",
        cuisine: "Mediterranean",
        caloriesPerServing: 705,
        prepMinutes: 39,
      }),
    ];

    const state = buildDashboardState(recipes, preferencesFixture, {
      ...filtersFixture,
      suggestionCuisine: "Mediterranean",
      suggestionProtein: "Chicken",
      suggestionDensity: "balanced",
      effort: "standard",
      shuffle: 1,
      view: "randomizer",
    });

    expect(state.suggestedRecipes.map((suggestion) => suggestion.recipe.id)).toEqual([
      "exact",
      "protein-fallback",
      "cuisine-fallback",
    ]);
    expect(state.suggestedRecipes.map((suggestion) => suggestion.label)).toEqual([
      "Top choice",
      "Something with Chicken",
      "Something from the same Mediterranean",
    ]);
  });

  it("builds the weekly plan from persisted slots and dedupes exact grocery lines", () => {
    const recipes = [
      recipeFixture({
        id: "slot-one",
        title: "Chicken bowls",
        ingredients: ["Chicken", "Rice", "Cucumber"],
      }),
      recipeFixture({
        id: "slot-two",
        title: "Repeat chicken bowls",
        ingredients: ["Chicken", "Rice", "Yogurt"],
      }),
    ];
    const weeklyPlan: WeeklyPlan = {
      mealCount: 2,
      updatedAt: "2026-04-20T10:00:00.000Z",
      slots: [
        {
          slotIndex: 0,
          recipeId: "slot-one",
          updatedAt: "2026-04-20T10:00:00.000Z",
        },
        {
          slotIndex: 1,
          recipeId: "slot-two",
          updatedAt: "2026-04-20T10:00:00.000Z",
        },
        {
          slotIndex: 2,
          recipeId: null,
          updatedAt: "2026-04-20T10:00:00.000Z",
        },
      ],
    };

    const state = buildDashboardState(
      recipes,
      preferencesFixture,
      {
        ...filtersFixture,
        view: "weekly-plan",
      },
      weeklyPlan,
    );

    expect(state.summary.plannedCount).toBe(2);
    expect(state.weeklyPlan.mealCount).toBe(2);
    expect(state.weeklyPlan.shoppingList).toEqual([
      "Chicken",
      "Rice",
      "Cucumber",
      "Yogurt",
    ]);
    expect(state.weeklyPlan.assignedRecipeIds).toEqual(["slot-one", "slot-two"]);
  });
});
