// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";

import { DashboardHomePage } from "@/features/dashboard/dashboard-home-page";
import { buildDashboardState } from "@/features/dashboard/model";
import type { DashboardSearchFilters } from "@/features/dashboard/search-params";
import type { SavedRecipe } from "@/server/repositories/recipes";
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
  title: "Harissa Chicken Bowls",
  sourceUrl: null,
  sourceLabel: "Sunday reset rotation",
  notes: null,
  primaryProtein: "Chicken",
  cuisine: "Mediterranean",
  totalCalories: 2200,
  caloriesPerServing: 550,
  proteinGrams: 44,
  carbGrams: 40,
  fatGrams: 18,
  servings: 4,
  prepMinutes: 35,
  tags: ["High protein"],
  ingredients: ["Chicken", "Rice", "Cucumber"],
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
  suggestionCuisine: "Mediterranean",
  suggestionProtein: "Chicken",
  suggestionDensity: "balanced",
  effort: "standard",
  shuffle: 0,
  view: "library",
};

describe("DashboardHomePage", () => {
  it("renders the calmer library view without subtitles or grocery shortcuts on cards", () => {
    const recipes = [
      recipeFixture({
        plannedThisWeek: true,
      }),
    ];

    render(
      <DashboardHomePage
        dashboardState={buildDashboardState(
          recipes,
          preferencesFixture,
          filtersFixture,
        )}
        filters={filtersFixture}
        returnTo="/app?view=library"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "My library" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Library" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Weekly Plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Randomizer" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Add recipe" })).toHaveLength(1);
    expect(screen.getByText("Protein")).toBeInTheDocument();
    expect(screen.getByText("Carbs")).toBeInTheDocument();
    expect(screen.getByText("Cuisine")).toBeInTheDocument();
    expect(screen.getByText("Sort by: Date added")).toBeInTheDocument();
    expect(screen.getByText("1 saved | 0 favorites")).toBeInTheDocument();
    expect(screen.queryByText("Sunday reset rotation")).not.toBeInTheDocument();
    expect(screen.queryByText("This week")).not.toBeInTheDocument();
    expect(screen.queryByText("Open groceries")).not.toBeInTheDocument();
  });

  it("renders the randomizer prompt before the user commits a shuffle", () => {
    const recipes = [
      recipeFixture({
        id: "primary",
        title: "Harissa Chicken Bowls",
        cuisine: "Mediterranean",
        caloriesPerServing: 650,
      }),
      recipeFixture({
        id: "alternate",
        title: "Chicken Rice Bake",
        cuisine: "Mediterranean",
        caloriesPerServing: 670,
        createdAt: "2026-04-19T10:00:00.000Z",
      }),
    ];

    render(
      <DashboardHomePage
        dashboardState={buildDashboardState(recipes, preferencesFixture, {
          ...filtersFixture,
          view: "randomizer",
        })}
        filters={{
          ...filtersFixture,
          view: "randomizer",
        }}
        returnTo="/app?view=randomizer"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "What should I cook?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("How filling")).toBeInTheDocument();
    expect(screen.getByText("Prep time")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Shuffle recipes/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose your filters")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Previous/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Next/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a curated randomizer card without ingredient chips or a full-plan CTA", () => {
    const recipes = [
      recipeFixture({
        id: "primary",
        title: "Harissa Chicken Bowls",
        cuisine: "Mediterranean",
        ingredients: ["Extra-firm tofu", "Rice noodles", "Peanut butter"],
        plannedThisWeek: true,
      }),
    ];

    render(
      <DashboardHomePage
        dashboardState={buildDashboardState(recipes, preferencesFixture, {
          ...filtersFixture,
          shuffle: 1,
          view: "randomizer",
        })}
        filters={{
          ...filtersFixture,
          shuffle: 1,
          view: "randomizer",
        }}
        returnTo="/app?view=randomizer&shuffle=1"
      />,
    );

    expect(screen.getByText("Top choice")).toBeInTheDocument();
    expect(screen.queryByText("Extra-firm tofu")).not.toBeInTheDocument();
    expect(screen.queryByText("Weekly plan full")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Previous/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Next/i }),
    ).not.toBeInTheDocument();
  });
});
