import type {
  CarbLevel,
  CalorieDensity,
  DashboardSearchFilters,
  EffortLevel,
  RecipeSort,
} from "@/features/dashboard/search-params";
import type { SavedRecipe } from "@/server/repositories/recipes";
import type {
  WeeklyPlan,
  WeeklyPlanMealCount,
} from "@/server/repositories/weekly-plan";
import type { UserPreferences } from "@/server/repositories/user-preferences";

export type SuggestedRecipe = {
  fitReason: string;
  label: string;
  recipe: SavedRecipe;
};

export type DashboardWeeklyPlanSlot = {
  recipe: SavedRecipe | null;
  recipeId: string | null;
  slotIndex: number;
};

export type DashboardWeeklyPlanState = {
  assignedRecipeIds: string[];
  availableRecipes: SavedRecipe[];
  filledSlotCount: number;
  hasOpenSlot: boolean;
  mealCount: WeeklyPlanMealCount;
  shoppingList: string[];
  slots: DashboardWeeklyPlanSlot[];
};

export type DashboardState = {
  availableCuisines: string[];
  availableSuggestionDensities: CalorieDensity[];
  availableSuggestionEfforts: EffortLevel[];
  availableProteins: string[];
  filteredRecipes: SavedRecipe[];
  needsMoreRecipes: boolean;
  noSuggestionMatches: boolean;
  plannedRecipes: SavedRecipe[];
  selectedDensity: CalorieDensity;
  selectedEffort: EffortLevel;
  selectedSuggestionCuisine: string;
  selectedSuggestionProtein: string;
  suggestedRecipes: SuggestedRecipe[];
  suggestionInventory: Array<{
    cuisine: string;
    density: CalorieDensity;
    effort: EffortLevel;
    protein: string;
  }>;
  summary: {
    favoriteCount: number;
    plannedCount: number;
    savedCount: number;
    targetPerMeal: number;
  };
  weeklyPlan: DashboardWeeklyPlanState;
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function sortRecipes(recipes: SavedRecipe[], sort: RecipeSort) {
  return [...recipes].sort((left, right) => {
    switch (sort) {
      case "protein":
        return right.proteinGrams - left.proteinGrams;
      case "quick":
        return left.prepMinutes - right.prepMinutes;
      case "calories":
        return left.caloriesPerServing - right.caloriesPerServing;
      case "recent":
      default:
        return right.createdAt.localeCompare(left.createdAt);
    }
  });
}

function sortRecipesForWeeklyPlanRail(recipes: SavedRecipe[]) {
  return [...recipes].sort((left, right) => {
    if (left.favorite !== right.favorite) {
      return Number(right.favorite) - Number(left.favorite);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

function recipeMatchesLibraryFilters(
  recipe: SavedRecipe,
  filters: DashboardSearchFilters,
) {
  const normalizedSearch = normalize(filters.search);

  if (normalizedSearch) {
    const haystack = [
      recipe.title,
      recipe.primaryProtein,
      recipe.cuisine,
      recipe.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(normalizedSearch)) {
      return false;
    }
  }

  if (
    filters.libraryProtein &&
    normalize(recipe.primaryProtein) !== normalize(filters.libraryProtein)
  ) {
    return false;
  }

  if (
    filters.libraryCarbs &&
    getRecipeCarbLevel(recipe) !== filters.libraryCarbs
  ) {
    return false;
  }

  if (
    filters.cuisine &&
    normalize(recipe.cuisine) !== normalize(filters.cuisine)
  ) {
    return false;
  }

  if (filters.favoritesOnly && !recipe.favorite) {
    return false;
  }

  return true;
}

function getShuffleWeight(recipeId: string, seed: number) {
  let hash = seed + 17;

  // Keep recipe suggestions stable for a given shuffle value without storing order.
  for (let index = 0; index < recipeId.length; index += 1) {
    hash = (hash * 31 + recipeId.charCodeAt(index)) % 1000003;
  }

  return hash;
}

function sortRecipesForSuggestionSeed(recipes: SavedRecipe[], seed: number) {
  return [...recipes].sort(
    (left, right) =>
      getShuffleWeight(left.id, seed) - getShuffleWeight(right.id, seed),
  );
}

function buildFitReason(
  recipe: SavedRecipe,
  preferences: UserPreferences,
  density: CalorieDensity,
) {
  const densitySentence =
    density === "lighter"
      ? "A lighter pick that still stays satisfying."
      : density === "balanced"
        ? "Right around your usual meal size."
        : "A more filling option for hungrier days.";

  return `${densitySentence} It brings ${recipe.proteinGrams}g protein and takes about ${recipe.prepMinutes} minutes.`;
}

function rankSuggestionCandidates(
  recipes: SavedRecipe[],
  seed: number,
  getScore: (recipe: SavedRecipe) => number,
) {
  return [...recipes].sort((left, right) => {
    const scoreDifference = getScore(right) - getScore(left);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return getShuffleWeight(left.id, seed) - getShuffleWeight(right.id, seed);
  });
}

function getSuggestedRecipes(
  recipes: SavedRecipe[],
  preferences: UserPreferences,
  filters: DashboardSearchFilters,
) {
  if (recipes.length === 0) {
    return [];
  }

  const availableProteins = uniqueSorted(
    recipes.map((recipe) => recipe.primaryProtein),
  );
  const selectedProtein =
    filters.suggestionProtein &&
    availableProteins.includes(filters.suggestionProtein)
      ? filters.suggestionProtein
      : availableProteins[0];
  const availableCuisines = uniqueSorted(
    recipes.map((recipe) => recipe.cuisine),
  );
  const selectedCuisine =
    filters.suggestionCuisine &&
    availableCuisines.includes(filters.suggestionCuisine)
      ? filters.suggestionCuisine
      : availableCuisines[0];

  const exactMatches = rankSuggestionCandidates(
    recipes.filter((recipe) => {
      if (normalize(recipe.primaryProtein) !== normalize(selectedProtein)) {
        return false;
      }

      if (normalize(recipe.cuisine) !== normalize(selectedCuisine)) {
        return false;
      }

      if (getRecipeDensity(recipe, preferences) !== filters.suggestionDensity) {
        return false;
      }

      return getRecipeEffort(recipe) === filters.effort;
    }),
    filters.shuffle,
    () => 0,
  );

  const sameProteinMatches = rankSuggestionCandidates(
    recipes.filter(
      (recipe) =>
        normalize(recipe.primaryProtein) === normalize(selectedProtein),
    ),
    filters.shuffle,
    (recipe) =>
      (normalize(recipe.cuisine) === normalize(selectedCuisine) ? 4 : 0) +
      (getRecipeDensity(recipe, preferences) === filters.suggestionDensity
        ? 2
        : 0) +
      (getRecipeEffort(recipe) === filters.effort ? 1 : 0),
  );

  const sameCuisineMatches = rankSuggestionCandidates(
    recipes.filter(
      (recipe) => normalize(recipe.cuisine) === normalize(selectedCuisine),
    ),
    filters.shuffle,
    (recipe) =>
      (normalize(recipe.primaryProtein) === normalize(selectedProtein)
        ? 4
        : 0) +
      (getRecipeDensity(recipe, preferences) === filters.suggestionDensity
        ? 2
        : 0) +
      (getRecipeEffort(recipe) === filters.effort ? 1 : 0),
  );

  const chosenRecipeIds = new Set<string>();
  const curatedSuggestions: SuggestedRecipe[] = [];
  const slots = [
    {
      label: "Top choice",
      pools: [exactMatches, sameProteinMatches, sameCuisineMatches],
    },
    {
      label: `Something with ${selectedProtein}`,
      pools: [exactMatches, sameProteinMatches, sameCuisineMatches],
    },
    {
      label: `Something from the same ${selectedCuisine}`,
      pools: [exactMatches, sameCuisineMatches, sameProteinMatches],
    },
  ] as const;

  slots.forEach((slot) => {
    const recipe =
      slot.pools
        .flatMap((pool) => pool)
        .find((candidate) => !chosenRecipeIds.has(candidate.id)) ?? null;

    if (!recipe) {
      return;
    }

    chosenRecipeIds.add(recipe.id);
    curatedSuggestions.push({
      recipe,
      label: slot.label,
      fitReason: buildFitReason(recipe, preferences, filters.suggestionDensity),
    });
  });

  return curatedSuggestions;
}

function buildFallbackWeeklyPlan(recipes: SavedRecipe[]): WeeklyPlan {
  const plannedRecipes = recipes
    .filter((recipe) => recipe.plannedThisWeek)
    .slice(0, 3);
  const mealCount = Math.max(
    1,
    Math.min(3, plannedRecipes.length || 1),
  ) as WeeklyPlanMealCount;

  // Older recipe toggles still feed the dashboard until a persisted plan exists.
  return {
    mealCount,
    slots: [0, 1, 2].map((slotIndex) => ({
      slotIndex,
      recipeId: plannedRecipes[slotIndex]?.id ?? null,
      updatedAt: new Date(0).toISOString(),
    })),
    updatedAt: new Date(0).toISOString(),
  };
}

function buildShoppingList(slots: DashboardWeeklyPlanSlot[]) {
  const seenIngredients = new Set<string>();
  const shoppingList: string[] = [];

  slots.forEach((slot) => {
    slot.recipe?.ingredients.forEach((ingredient) => {
      const normalizedIngredient = ingredient.trim();

      if (!normalizedIngredient || seenIngredients.has(normalizedIngredient)) {
        return;
      }

      seenIngredients.add(normalizedIngredient);
      shoppingList.push(normalizedIngredient);
    });
  });

  return shoppingList;
}

function buildWeeklyPlanState(
  allRecipes: SavedRecipe[],
  weeklyPlan: WeeklyPlan,
): DashboardWeeklyPlanState {
  const recipeMap = new Map(
    allRecipes.map((recipe) => [recipe.id, recipe] as const),
  );
  const visibleSlots = weeklyPlan.slots
    .filter((slot) => slot.slotIndex < weeklyPlan.mealCount)
    .map((slot) => ({
      slotIndex: slot.slotIndex,
      recipeId: slot.recipeId,
      recipe: slot.recipeId ? (recipeMap.get(slot.recipeId) ?? null) : null,
    }));

  return {
    mealCount: weeklyPlan.mealCount,
    slots: visibleSlots,
    availableRecipes: sortRecipesForWeeklyPlanRail(allRecipes),
    shoppingList: buildShoppingList(visibleSlots),
    filledSlotCount: visibleSlots.filter((slot) => slot.recipe).length,
    hasOpenSlot: visibleSlots.some((slot) => !slot.recipeId),
    assignedRecipeIds: visibleSlots
      .map((slot) => slot.recipeId)
      .filter((recipeId): recipeId is string => Boolean(recipeId)),
  };
}

export function normalizeMealsPerDay(
  mealsPerDay: UserPreferences["mealsPerDay"],
) {
  return mealsPerDay === "5+" ? 5 : Number(mealsPerDay);
}

export function getTargetPerMeal(preferences: UserPreferences) {
  return Math.round(
    preferences.calorieTarget / normalizeMealsPerDay(preferences.mealsPerDay),
  );
}

export function getRecipeDensity(
  recipe: SavedRecipe,
  preferences: UserPreferences,
): CalorieDensity {
  const targetPerMeal = getTargetPerMeal(preferences);
  const lowerBound = targetPerMeal * 0.9;
  const upperBound = targetPerMeal * 1.1;

  if (recipe.caloriesPerServing < lowerBound) {
    return "lighter";
  }

  if (recipe.caloriesPerServing > upperBound) {
    return "more-filling";
  }

  return "balanced";
}

export function getRecipeEffort(recipe: SavedRecipe): EffortLevel {
  if (recipe.prepMinutes <= 30) {
    return "quick";
  }

  if (recipe.prepMinutes <= 50) {
    return "standard";
  }

  return "flexible";
}

export function getRecipeCarbLevel(recipe: SavedRecipe): CarbLevel {
  if (recipe.carbGrams <= 30) {
    return "lower";
  }

  if (recipe.carbGrams <= 55) {
    return "balanced";
  }

  return "higher";
}

export function buildDashboardState(
  allRecipes: SavedRecipe[],
  preferences: UserPreferences,
  filters: DashboardSearchFilters,
  persistedWeeklyPlan?: WeeklyPlan,
): DashboardState {
  const availableProteins = uniqueSorted(
    allRecipes.map((recipe) => recipe.primaryProtein),
  );
  const availableCuisines = uniqueSorted(
    allRecipes.map((recipe) => recipe.cuisine),
  );
  const seededRecipes = sortRecipesForSuggestionSeed(
    allRecipes,
    filters.shuffle,
  );
  const defaultSuggestionRecipe = seededRecipes[0] ?? null;
  const availableSuggestionDensities = uniqueSorted(
    allRecipes.map((recipe) => getRecipeDensity(recipe, preferences)),
  ) as CalorieDensity[];
  const availableSuggestionEfforts = uniqueSorted(
    allRecipes.map((recipe) => getRecipeEffort(recipe)),
  ) as EffortLevel[];
  const selectedSuggestionProtein =
    filters.suggestionProtein &&
    availableProteins.includes(filters.suggestionProtein)
      ? filters.suggestionProtein
      : (defaultSuggestionRecipe?.primaryProtein ?? "");
  const selectedSuggestionCuisine =
    filters.suggestionCuisine &&
    availableCuisines.includes(filters.suggestionCuisine)
      ? filters.suggestionCuisine
      : (defaultSuggestionRecipe?.cuisine ?? "");
  const selectedDensity = availableSuggestionDensities.includes(
    filters.suggestionDensity,
  )
    ? filters.suggestionDensity
    : defaultSuggestionRecipe
      ? getRecipeDensity(defaultSuggestionRecipe, preferences)
      : "balanced";
  const selectedEffort = availableSuggestionEfforts.includes(filters.effort)
    ? filters.effort
    : defaultSuggestionRecipe
      ? getRecipeEffort(defaultSuggestionRecipe)
      : "standard";
  const nextFilters = {
    ...filters,
    effort: selectedEffort,
    suggestionCuisine: selectedSuggestionCuisine,
    suggestionDensity: selectedDensity,
    suggestionProtein: selectedSuggestionProtein,
  };
  const filteredRecipes = sortRecipes(
    allRecipes.filter((recipe) =>
      recipeMatchesLibraryFilters(recipe, nextFilters),
    ),
    nextFilters.sort,
  );
  const suggestedRecipes = getSuggestedRecipes(
    allRecipes,
    preferences,
    nextFilters,
  );
  const weeklyPlan = buildWeeklyPlanState(
    allRecipes,
    persistedWeeklyPlan ?? buildFallbackWeeklyPlan(allRecipes),
  );

  return {
    availableCuisines,
    availableSuggestionDensities,
    availableSuggestionEfforts,
    availableProteins,
    filteredRecipes,
    needsMoreRecipes: allRecipes.length > 0 && allRecipes.length < 4,
    noSuggestionMatches: allRecipes.length > 0 && suggestedRecipes.length === 0,
    plannedRecipes: weeklyPlan.slots
      .map((slot) => slot.recipe)
      .filter((recipe): recipe is SavedRecipe => Boolean(recipe)),
    selectedDensity,
    selectedEffort,
    selectedSuggestionCuisine,
    selectedSuggestionProtein,
    suggestedRecipes,
    suggestionInventory: allRecipes.map((recipe) => ({
      protein: recipe.primaryProtein,
      cuisine: recipe.cuisine,
      density: getRecipeDensity(recipe, preferences),
      effort: getRecipeEffort(recipe),
    })),
    summary: {
      savedCount: allRecipes.length,
      favoriteCount: allRecipes.filter((recipe) => recipe.favorite).length,
      plannedCount: weeklyPlan.filledSlotCount,
      targetPerMeal: getTargetPerMeal(preferences),
    },
    weeklyPlan,
  };
}
