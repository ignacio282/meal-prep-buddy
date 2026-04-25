import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { getAppRedirectTarget } from "@/features/onboarding/route-state";
import { updateRecipeAction } from "@/features/recipes/actions";
import {
  NewRecipeFormFields,
  type RecipeFormInitialValues,
} from "@/features/recipes/new-recipe-form-fields";
import { cuisineOptions, proteinOptions } from "@/features/recipes/options";
import { getRecipeById, listRecipes } from "@/server/repositories/recipes";
import { getOnboardingPreferences } from "@/server/services/onboarding";

type EditRecipePageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

function getDistinctRecipeValues(values: string[]) {
  const distinctValues = new Map<string, string>();

  values.forEach((value) => {
    const normalizedValue = value.trim().replace(/\s+/g, " ");

    if (!normalizedValue) {
      return;
    }

    const normalizedKey = normalizedValue.toLowerCase();

    if (!distinctValues.has(normalizedKey)) {
      distinctValues.set(normalizedKey, normalizedValue);
    }
  });

  return [...distinctValues.values()].sort((left, right) => left.localeCompare(right));
}

function mapRecipeToInitialValues(
  recipe: NonNullable<ReturnType<typeof getRecipeById>>,
): RecipeFormInitialValues {
  return {
    caloriesPerServing: recipe.caloriesPerServing,
    carbGrams: recipe.carbGrams,
    cuisine: recipe.cuisine,
    fatGrams: recipe.fatGrams,
    ingredients: recipe.ingredients,
    prepMinutes: recipe.prepMinutes,
    primaryProtein: recipe.primaryProtein,
    proteinGrams: recipe.proteinGrams,
    servings: recipe.servings,
    sourceUrl: recipe.sourceUrl,
    steps: recipe.steps,
    tags: recipe.tags,
    title: recipe.title,
    totalCalories: recipe.totalCalories,
  };
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const preferences = getOnboardingPreferences();
  const redirectTarget = getAppRedirectTarget(preferences);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const recipeId = (await params).id;
  const recipe = getRecipeById(recipeId);

  if (!recipe) {
    notFound();
  }

  const recipes = listRecipes();
  const existingTags = getDistinctRecipeValues(recipes.flatMap((item) => item.tags));
  const existingIngredients = getDistinctRecipeValues(
    recipes.flatMap((item) => item.ingredients),
  );

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6">
        <Link
          className="text-button text-primary inline-flex h-10 w-fit items-center gap-2"
          href={`/app/recipes/${recipe.id}`}
        >
          <ArrowLeft className="size-5" strokeWidth={2.2} />
          <span>Back</span>
        </Link>

        <header className="bg-background border-background-light rounded-3xl border px-6 py-6 sm:px-8">
          <div className="space-y-2">
            <h1 className="text-h1 text-foreground">Edit recipe</h1>
            <p className="text-body text-foreground-muted max-w-[42rem]">
              Update the recipe details, ingredients, and preparation steps.
            </p>
          </div>
        </header>

        <form action={updateRecipeAction} className="grid gap-6">
          <input name="recipeId" type="hidden" value={recipe.id} />
          <NewRecipeFormFields
            cuisineOptions={cuisineOptions}
            existingIngredients={existingIngredients}
            existingTags={existingTags}
            initialValues={mapRecipeToInitialValues(recipe)}
            proteinOptions={proteinOptions}
            submitLabel="Update recipe"
          />
        </form>
      </div>
    </main>
  );
}
