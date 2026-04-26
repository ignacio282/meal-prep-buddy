export const dashboardViewOptions = [
  { label: "Library", value: "library" },
  { label: "Weekly Plan", value: "weekly-plan" },
  { label: "Randomizer", value: "randomizer" },
] as const;

export const recipeSortOptions = [
  { label: "Recently added", value: "recent" },
  { label: "Highest protein", value: "protein" },
  { label: "Quickest", value: "quick" },
  { label: "Lowest calories", value: "calories" },
] as const;

export const carbLevelOptions = [
  { label: "Any carbs", value: "" },
  { label: "Lower carb", value: "lower" },
  { label: "Balanced carbs", value: "balanced" },
  { label: "Higher carb", value: "higher" },
] as const;

export const densityOptions = [
  { label: "Lighter", value: "lighter" },
  { label: "Balanced", value: "balanced" },
  { label: "More filling", value: "more-filling" },
] as const;

export const effortOptions = [
  { label: "Quick", value: "quick" },
  { label: "Standard", value: "standard" },
  { label: "Flexible", value: "flexible" },
] as const;

export type DashboardView = (typeof dashboardViewOptions)[number]["value"];
export type RecipeSort = (typeof recipeSortOptions)[number]["value"];
export type CarbLevel = (typeof carbLevelOptions)[number]["value"];
export type CalorieDensity = (typeof densityOptions)[number]["value"];
export type EffortLevel = (typeof effortOptions)[number]["value"];

export type DashboardSearchFilters = {
  cuisine: string;
  effort: EffortLevel;
  favoritesOnly: boolean;
  libraryCarbs: CarbLevel;
  libraryProtein: string;
  search: string;
  shuffle: number;
  sort: RecipeSort;
  suggestionCuisine: string;
  suggestionDensity: CalorieDensity;
  suggestionProtein: string;
  view: DashboardView;
};

export type DashboardPreviewMode = "veteran";

type RawSearchParams =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

function getValue(
  searchParams: RawSearchParams,
  key: string,
): string | undefined {
  if (!searchParams) {
    return undefined;
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? undefined;
  }

  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function isDashboardView(value: string | undefined): value is DashboardView {
  return dashboardViewOptions.some((option) => option.value === value);
}

function isRecipeSort(value: string | undefined): value is RecipeSort {
  return recipeSortOptions.some((option) => option.value === value);
}

function isDensity(value: string | undefined): value is CalorieDensity {
  return densityOptions.some((option) => option.value === value);
}

function isEffort(value: string | undefined): value is EffortLevel {
  return effortOptions.some((option) => option.value === value);
}

export function getDashboardSearchParamValue(
  searchParams: RawSearchParams,
  key: string,
) {
  return getValue(searchParams, key);
}

export function getDashboardPreviewMode(
  searchParams: RawSearchParams,
): DashboardPreviewMode | null {
  return getValue(searchParams, "preview") === "veteran" ? "veteran" : null;
}

export function parseDashboardSearchParams(
  searchParams: RawSearchParams,
): DashboardSearchFilters {
  const sortValue = getValue(searchParams, "sort");
  const densityValue = getValue(searchParams, "density");
  const effortValue = getValue(searchParams, "effort");
  const shuffleValue = Number(getValue(searchParams, "shuffle") ?? "0");
  const viewValue = getValue(searchParams, "view");

  return {
    search: getValue(searchParams, "search")?.trim() ?? "",
    libraryProtein: getValue(searchParams, "libraryProtein")?.trim() ?? "",
    libraryCarbs:
      carbLevelOptions.find(
        (option) => option.value === getValue(searchParams, "libraryCarbs"),
      )?.value ?? "",
    cuisine: getValue(searchParams, "cuisine")?.trim() ?? "",
    favoritesOnly: getValue(searchParams, "favorites") === "1",
    sort: isRecipeSort(sortValue) ? sortValue : "recent",
    suggestionCuisine:
      getValue(searchParams, "suggestionCuisine")?.trim() ?? "",
    suggestionProtein:
      getValue(searchParams, "suggestionProtein")?.trim() ?? "",
    suggestionDensity: isDensity(densityValue) ? densityValue : "balanced",
    effort: isEffort(effortValue) ? effortValue : "standard",
    shuffle: Number.isFinite(shuffleValue) ? shuffleValue : 0,
    view: isDashboardView(viewValue) ? viewValue : "library",
  };
}

export function serializeDashboardSearchParams(
  filters: DashboardSearchFilters,
) {
  return {
    cuisine: filters.cuisine,
    density: filters.suggestionDensity,
    effort: filters.effort,
    favorites: filters.favoritesOnly ? "1" : "",
    libraryCarbs: filters.libraryCarbs,
    libraryProtein: filters.libraryProtein,
    search: filters.search,
    shuffle: String(filters.shuffle),
    sort: filters.sort,
    suggestionCuisine: filters.suggestionCuisine,
    suggestionProtein: filters.suggestionProtein,
    view: filters.view,
  };
}
