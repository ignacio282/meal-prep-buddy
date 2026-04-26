import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowRight,
  ArrowUpDown,
  BookOpenText,
  CalendarDays,
  Check,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Heart,
  Leaf,
  Plus,
  Search,
  Sparkles,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { DashboardState } from "@/features/dashboard/model";
import { DashboardViewTransition } from "@/features/dashboard/dashboard-view-transition";
import {
  carbLevelOptions,
  dashboardViewOptions,
  recipeSortOptions,
  serializeDashboardSearchParams,
  type DashboardSearchFilters,
  type DashboardView,
} from "@/features/dashboard/search-params";
import { RandomizerStage } from "@/features/dashboard/randomizer-stage";
import { toggleRecipeFavoriteAction } from "@/features/recipes/actions";
import { WeeklyPlanBoard } from "@/features/weekly-plan/weekly-plan-board";
import { cn } from "@/lib/utils/cn";

type DashboardHomePageProps = Readonly<{
  addRecipeHref?: string;
  basePath?: string;
  buildRecipeHref?: (recipeId: string) => string;
  dashboardState: DashboardState;
  filters: DashboardSearchFilters;
  previewMode?: boolean;
  previewNote?: string;
  previewStatus?: string;
  returnTo: string;
}>;

type FloatingMenuOption = Readonly<{
  href: string;
  label: string;
  selected: boolean;
}>;

function buildDashboardHref(basePath: string, filters: DashboardSearchFilters) {
  const params = new URLSearchParams();

  Object.entries(serializeDashboardSearchParams(filters)).forEach(
    ([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    },
  );

  const queryString = params.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

function buildRecipeHrefWithFilters(
  recipeId: string,
  basePath: string,
  filters: DashboardSearchFilters,
) {
  const params = new URLSearchParams();

  Object.entries(serializeDashboardSearchParams(filters)).forEach(
    ([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    },
  );

  const queryString = params.toString();

  return queryString
    ? `${basePath}/recipes/${recipeId}?${queryString}`
    : `${basePath}/recipes/${recipeId}`;
}

function HiddenInputs({
  filters,
  omit,
}: Readonly<{
  filters: DashboardSearchFilters;
  omit: string[];
}>) {
  return Object.entries(serializeDashboardSearchParams(filters)).map(
    ([key, value]) =>
      omit.includes(key) || !value ? null : (
        <input key={key} name={key} type="hidden" value={value} />
      ),
  );
}

function RecipeActionForm({
  action,
  children,
  recipeId,
  returnTo,
}: Readonly<{
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  recipeId: string;
  returnTo: string;
}>) {
  return (
    <form action={action}>
      <input name="recipeId" type="hidden" value={recipeId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      {children}
    </form>
  );
}

function DashboardFloatingNav({
  activeView,
  buildViewHref,
}: Readonly<{
  activeView: DashboardView;
  buildViewHref: (view: DashboardView) => string;
}>) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <nav className="bg-background/94 border-background-light pointer-events-auto rounded-full border p-2 backdrop-blur">
        <ul className="flex items-center gap-2">
          {dashboardViewOptions.map((option) => {
            const active = option.value === activeView;
            const Icon =
              option.value === "library"
                ? BookOpenText
                : option.value === "weekly-plan"
                  ? CalendarDays
                  : Sparkles;

            return (
              <li key={option.value}>
                <Link
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                    active
                      ? "bg-background-light text-foreground"
                      : "text-foreground-muted hover:text-foreground",
                  )}
                  href={buildViewHref(option.value)}
                >
                  <Icon className="size-4" strokeWidth={2.2} />
                  <span>{option.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function FloatingMenu({
  icon,
  label,
  selectedLabel,
  options,
  widthClassName = "min-w-[12rem]",
}: Readonly<{
  icon: ReactNode;
  label: string;
  options: FloatingMenuOption[];
  selectedLabel?: string;
  widthClassName?: string;
}>) {
  return (
    <details className="group relative">
      <summary className="bg-background-light border-background-light text-caption text-foreground inline-flex min-h-11 list-none items-center gap-2 rounded-full border px-3 py-2 transition-colors hover:border-[hsl(var(--primary)/0.35)] [&::-webkit-details-marker]:hidden">
        <span className="text-foreground-muted">{icon}</span>
        <span className="whitespace-nowrap">{selectedLabel || label}</span>
        <ChevronDown
          className="text-foreground-muted size-4 transition-transform group-open:rotate-180"
          strokeWidth={2.2}
        />
      </summary>

      <div
        className={cn(
          "bg-background border-background-light absolute top-full left-0 z-10 mt-2 rounded-2xl border p-2",
          widthClassName,
        )}
      >
        <div className="space-y-1">
          {options.map((option) => (
            <Link
              className={cn(
                "text-caption text-foreground hover:bg-background-light flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors",
                option.selected && "bg-background-light",
              )}
              href={option.href}
              key={option.href}
            >
              <span>{option.label}</span>
              {option.selected ? (
                <Check className="text-primary size-4" strokeWidth={2.4} />
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}

function SearchMenu({
  filters,
}: Readonly<{
  filters: DashboardSearchFilters;
}>) {
  return (
    <form className="group" method="get">
      <HiddenInputs filters={filters} omit={["search"]} />
      <label className="bg-background-light border-background-light text-caption text-foreground inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 transition-all focus-within:w-[16rem] focus-within:border-[hsl(var(--primary)/0.35)] hover:border-[hsl(var(--primary)/0.35)]">
        <Search className="text-foreground-muted size-4" strokeWidth={2.2} />
        <input
          className={cn(
            "text-caption placeholder:text-foreground-muted bg-transparent transition-all outline-none",
            filters.search ? "w-[12rem]" : "w-0 group-focus-within:w-[12rem]",
          )}
          defaultValue={filters.search}
          name="search"
          placeholder="Search recipes"
          type="text"
        />
        <span
          className={cn(
            "text-foreground-muted whitespace-nowrap transition-opacity group-focus-within:opacity-0",
            filters.search && "hidden",
          )}
        >
          Search
        </span>
      </label>
    </form>
  );
}

function DashboardRecipeCard({
  buildRecipeHref,
  recipe,
  returnTo,
}: Readonly<{
  buildRecipeHref: (recipeId: string) => string;
  recipe: DashboardState["filteredRecipes"][number];
  returnTo: string;
}>) {
  const recipeHref = buildRecipeHref(recipe.id);

  return (
    <SurfaceCard className="flex h-full flex-col gap-3 p-5" tone="raised">
      <div className="flex items-start justify-between gap-4">
        <Link
          className="text-title text-foreground hover:text-primary max-w-[18rem]"
          href={recipeHref}
        >
          {recipe.title}
        </Link>

        <RecipeActionForm
          action={toggleRecipeFavoriteAction}
          recipeId={recipe.id}
          returnTo={returnTo}
        >
          <button
            aria-label={
              recipe.favorite ? "Remove favorite" : "Save as favorite"
            }
            className="text-foreground-muted hover:text-primary transition-colors"
            type="submit"
          >
            <Heart
              className={cn(
                "size-5",
                recipe.favorite && "fill-primary text-primary",
              )}
              strokeWidth={2}
            />
          </button>
        </RecipeActionForm>
      </div>

      <p className="text-caption text-foreground-muted">
        {recipe.caloriesPerServing} cal / serving | {recipe.proteinGrams}g
        protein | {recipe.prepMinutes} min
      </p>

      <div>
        <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--primary)/0.82)]">
          {recipe.cuisine}
        </span>
      </div>

      <div className="mt-auto pt-2">
        <Link
          className="text-button text-primary inline-flex items-center gap-2"
          href={recipeHref}
        >
          <span>View recipe</span>
          <ChevronRight className="size-4" strokeWidth={2.2} />
        </Link>
      </div>
    </SurfaceCard>
  );
}

function LibraryView({
  addRecipeHref,
  basePath,
  buildRecipeHref,
  clearLibraryFiltersHref,
  dashboardState,
  filters,
  returnTo,
}: Readonly<{
  addRecipeHref: string;
  basePath: string;
  buildRecipeHref: (recipeId: string) => string;
  clearLibraryFiltersHref: string;
  dashboardState: DashboardState;
  filters: DashboardSearchFilters;
  returnTo: string;
}>) {
  const buildLibraryHref = (nextFilters: Partial<DashboardSearchFilters>) =>
    buildDashboardHref(basePath, {
      ...filters,
      ...nextFilters,
      view: "library",
    });
  const selectedSortLabel =
    recipeSortOptions.find((option) => option.value === filters.sort)?.label ??
    "Recently added";
  const selectedCarbLabel =
    carbLevelOptions.find((option) => option.value === filters.libraryCarbs)
      ?.label ?? "";
  const selectedCuisineLabel = filters.cuisine
    ? `Cuisine: ${filters.cuisine}`
    : "Cuisine";
  const selectedProteinLabel = filters.libraryProtein
    ? `Protein: ${filters.libraryProtein}`
    : "Protein";
  const selectedCarbsDisplay = filters.libraryCarbs
    ? `Carbs: ${selectedCarbLabel}`
    : "Carbs";
  const selectedSortDisplay =
    filters.sort === "recent"
      ? "Sort by: Date added"
      : `Sort by: ${selectedSortLabel}`;

  return (
    <div className="mt-10 space-y-6">
      <div className="space-y-2">
        <h2 className="text-foreground font-hero text-[2.6rem] leading-[1.02] font-extrabold sm:text-[3.1rem]">
          My library
        </h2>
        <p className="text-body text-foreground-muted">
          Your saved recipes in one place. Search or filter them to find what
          you want to cook this week.
        </p>
        <p className="text-caption text-foreground-muted">
          {dashboardState.summary.savedCount} saved |{" "}
          {dashboardState.summary.favoriteCount} favorites
        </p>
      </div>

      <SurfaceCard className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <SearchMenu filters={filters} />

            <FloatingMenu
              icon={<UtensilsCrossed className="size-4" strokeWidth={2.1} />}
              label="Protein"
              options={[
                {
                  href: buildLibraryHref({ libraryProtein: "" }),
                  label: "Any protein",
                  selected: !filters.libraryProtein,
                },
                ...dashboardState.availableProteins.map((protein) => ({
                  href: buildLibraryHref({ libraryProtein: protein }),
                  label: protein,
                  selected: protein === filters.libraryProtein,
                })),
              ]}
              selectedLabel={selectedProteinLabel}
            />

            <FloatingMenu
              icon={<Wheat className="size-4" strokeWidth={2.1} />}
              label="Carbs"
              options={carbLevelOptions.map((option) => ({
                href: buildLibraryHref({ libraryCarbs: option.value }),
                label: option.label,
                selected: option.value === filters.libraryCarbs,
              }))}
              selectedLabel={selectedCarbsDisplay}
            />

            <FloatingMenu
              icon={<Leaf className="size-4" strokeWidth={2.1} />}
              label="Cuisine"
              options={[
                {
                  href: buildLibraryHref({ cuisine: "" }),
                  label: "Any cuisine",
                  selected: !filters.cuisine,
                },
                ...dashboardState.availableCuisines.map((cuisine) => ({
                  href: buildLibraryHref({ cuisine }),
                  label: cuisine,
                  selected: cuisine === filters.cuisine,
                })),
              ]}
              selectedLabel={selectedCuisineLabel}
            />

            <FloatingMenu
              icon={<ArrowUpDown className="size-4" strokeWidth={2.1} />}
              label="Sort"
              options={recipeSortOptions.map((option) => ({
                href: buildLibraryHref({ sort: option.value }),
                label: option.label,
                selected: option.value === filters.sort,
              }))}
              selectedLabel={selectedSortDisplay}
            />
          </div>

          <div className="flex items-center">
            <Link
              className="text-button bg-primary text-foreground-white inline-flex h-12 items-center gap-2 rounded-full px-4 transition-all duration-200 hover:translate-y-[-1px]"
              href={addRecipeHref}
            >
              <Plus className="size-5" strokeWidth={2.2} />
              <span>Add recipe</span>
            </Link>
          </div>
        </div>

        {dashboardState.filteredRecipes.length === 0 ? (
          <SurfaceCard className="p-6 sm:p-8" tone="raised">
            <EmptyState
              action={
                <Link
                  className="text-button text-primary inline-flex h-12 items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.28)] px-4"
                  href={clearLibraryFiltersHref}
                >
                  <span>Clear filters</span>
                  <ArrowRight className="size-5" strokeWidth={2.2} />
                </Link>
              }
              description="No recipes match these filters. Clear them or change them to see more saved recipes."
              icon={<Search className="size-5" strokeWidth={2} />}
              title="No matches right now"
            />
          </SurfaceCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboardState.filteredRecipes.map((recipe) => (
              <DashboardRecipeCard
                buildRecipeHref={buildRecipeHref}
                key={recipe.id}
                recipe={recipe}
                returnTo={returnTo}
              />
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function WeeklyPlanView({
  buildRecipeHref,
  dashboardState,
  previewMode = false,
}: Readonly<{
  buildRecipeHref: (recipeId: string) => string;
  dashboardState: DashboardState;
  previewMode?: boolean;
}>) {
  const ingredientCount = dashboardState.weeklyPlan.shoppingList.length;

  return (
    <div className="mt-10 space-y-6">
      <div className="space-y-2">
        <h2 className="text-foreground font-hero text-[2.6rem] leading-[1.02] font-extrabold sm:text-[3.1rem]">
          Weekly plan
        </h2>
        <p className="text-body text-foreground-muted">
          Build your plan for the week by assigning recipes to each meal slot.
          The shopping list updates from the meals you add here.
        </p>
        <p className="text-caption text-foreground-muted">
          {dashboardState.summary.plannedCount} in plan | {ingredientCount}{" "}
          ingredients to shop
        </p>
      </div>

      <SurfaceCard className="space-y-6 p-6 sm:p-8">
        <WeeklyPlanBoard
          availableRecipes={dashboardState.weeklyPlan.availableRecipes.map(
            (recipe) => ({
              id: recipe.id,
              title: recipe.title,
              caloriesPerServing: recipe.caloriesPerServing,
              proteinGrams: recipe.proteinGrams,
              prepMinutes: recipe.prepMinutes,
              cuisine: recipe.cuisine,
              ingredients: recipe.ingredients,
              href: buildRecipeHref(recipe.id),
              favorite: recipe.favorite,
            }),
          )}
          initialMealCount={dashboardState.weeklyPlan.mealCount}
          initialSlots={dashboardState.weeklyPlan.slots.map((slot) => ({
            slotIndex: slot.slotIndex,
            recipeId: slot.recipeId,
          }))}
          mode={previewMode ? "preview" : "live"}
        />
      </SurfaceCard>
    </div>
  );
}

function RandomizerView({
  basePath,
  buildRecipeHref,
  clearSuggestionFiltersHref,
  dashboardState,
  filters,
}: Readonly<{
  basePath: string;
  buildRecipeHref: (recipeId: string) => string;
  clearSuggestionFiltersHref: string;
  dashboardState: DashboardState;
  filters: DashboardSearchFilters;
}>) {
  return (
    <div className="mt-10 space-y-6">
      <div className="space-y-2">
        <h2 className="text-foreground font-hero text-[2.6rem] leading-[1.02] font-extrabold sm:text-[3.1rem]">
          What should I cook?
        </h2>
        <p className="text-body text-foreground-muted">
          Choose what kind of meal you want, then shuffle to see recipes that
          match your filters.
        </p>
        <p className="text-caption text-foreground-muted">
          {dashboardState.availableProteins.length} proteins in your library
        </p>
      </div>

      <SurfaceCard className="p-6 sm:p-8">
        <RandomizerStage
          availableCuisines={dashboardState.availableCuisines}
          availableDensities={dashboardState.availableSuggestionDensities}
          availableEfforts={dashboardState.availableSuggestionEfforts}
          availableProteins={dashboardState.availableProteins}
          basePath={basePath}
          clearSuggestionFiltersHref={clearSuggestionFiltersHref}
          currentFilters={filters}
          key={[
            dashboardState.selectedSuggestionProtein,
            dashboardState.selectedSuggestionCuisine,
            dashboardState.selectedDensity,
            dashboardState.selectedEffort,
            filters.shuffle,
          ].join(":")}
          noSuggestionMatches={dashboardState.noSuggestionMatches}
          selectedDensity={dashboardState.selectedDensity}
          selectedEffort={dashboardState.selectedEffort}
          selectedSuggestionCuisine={dashboardState.selectedSuggestionCuisine}
          selectedSuggestionProtein={dashboardState.selectedSuggestionProtein}
          suggestionInventory={dashboardState.suggestionInventory}
          suggestedRecipes={dashboardState.suggestedRecipes.map(
            (suggestion) => ({
              id: suggestion.recipe.id,
              title: suggestion.recipe.title,
              href: buildRecipeHref(suggestion.recipe.id),
              label: suggestion.label,
              fitReason: suggestion.fitReason,
              primaryProtein: suggestion.recipe.primaryProtein,
              cuisine: suggestion.recipe.cuisine,
              caloriesPerServing: suggestion.recipe.caloriesPerServing,
              proteinGrams: suggestion.recipe.proteinGrams,
              prepMinutes: suggestion.recipe.prepMinutes,
            }),
          )}
        />
      </SurfaceCard>
    </div>
  );
}

export function DashboardHomePage({
  addRecipeHref = "/app/recipes/new",
  basePath = "/app",
  buildRecipeHref,
  dashboardState,
  filters,
  previewMode = false,
  previewNote,
  previewStatus,
  returnTo,
}: DashboardHomePageProps) {
  const recipeHrefBuilder =
    buildRecipeHref ??
    ((recipeId: string) =>
      buildRecipeHrefWithFilters(recipeId, "/app", filters));
  const buildViewHref = (view: DashboardView) =>
    buildDashboardHref(basePath, { ...filters, view });
  const clearLibraryFiltersHref = buildDashboardHref(basePath, {
    ...filters,
    cuisine: "",
    favoritesOnly: false,
    libraryCarbs: "",
    libraryProtein: "",
    search: "",
    sort: "recent",
    view: "library",
  });
  const clearSuggestionFiltersHref = buildDashboardHref(basePath, {
    ...filters,
    effort: "standard",
    shuffle: 0,
    suggestionCuisine: "",
    suggestionDensity: "balanced",
    suggestionProtein: "",
    view: "randomizer",
  });

  return (
    <main className="min-h-screen px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-32 xl:px-8">
      <div className="mx-auto flex w-full max-w-[78rem] flex-col gap-6">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-foreground-white flex size-11 items-center justify-center rounded-2xl">
              <ChefHat className="size-5" strokeWidth={2.2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-foreground text-title">Meal Prep Buddy</p>
              {previewStatus ? (
                <p className="text-caption text-foreground-muted">
                  {previewStatus}
                </p>
              ) : null}
            </div>
          </div>

          {previewNote ? (
            <p className="text-caption text-foreground-muted">{previewNote}</p>
          ) : null}
        </header>

        <DashboardViewTransition view={filters.view}>
          {dashboardState.summary.savedCount === 0 ? (
            <SurfaceCard className="space-y-6 p-6 sm:p-8">
              <EmptyState
                action={
                  <Link
                    className="text-button bg-primary text-foreground-white inline-flex h-12 items-center gap-2 rounded-full px-4"
                    href={addRecipeHref}
                  >
                    <span>Add first recipe</span>
                    <ArrowRight className="size-5" strokeWidth={2.2} />
                  </Link>
                }
                description="Add your first recipe to start browsing, planning meals, and building a shopping list."
                icon={<BookOpenText className="size-5" strokeWidth={2} />}
                title="No recipes saved yet"
              />
            </SurfaceCard>
          ) : filters.view === "library" ? (
            <LibraryView
              addRecipeHref={addRecipeHref}
              basePath={basePath}
              buildRecipeHref={recipeHrefBuilder}
              clearLibraryFiltersHref={clearLibraryFiltersHref}
              dashboardState={dashboardState}
              filters={filters}
              returnTo={returnTo}
            />
          ) : filters.view === "weekly-plan" ? (
            <WeeklyPlanView
              buildRecipeHref={recipeHrefBuilder}
              dashboardState={dashboardState}
              previewMode={previewMode}
            />
          ) : (
            <RandomizerView
              basePath={basePath}
              buildRecipeHref={recipeHrefBuilder}
              clearSuggestionFiltersHref={clearSuggestionFiltersHref}
              dashboardState={dashboardState}
              filters={filters}
            />
          )}
        </DashboardViewTransition>
      </div>

      <DashboardFloatingNav
        activeView={filters.view}
        buildViewHref={buildViewHref}
      />
    </main>
  );
}
