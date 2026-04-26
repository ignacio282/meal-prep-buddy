import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { NewRecipeFormFields } from "@/features/recipes/new-recipe-form-fields";
import { createRecipeAction } from "@/features/recipes/actions";
import { cuisineOptions, proteinOptions } from "@/features/recipes/options";
import { getAppRedirectTarget } from "@/features/onboarding/route-state";
import { listRecipes } from "@/server/repositories/recipes";
import { getOnboardingPreferences } from "@/server/services/onboarding";

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

  return [...distinctValues.values()].sort((left, right) =>
    left.localeCompare(right),
  );
}

export default function NewRecipePage() {
  const preferences = getOnboardingPreferences();
  const redirectTarget = getAppRedirectTarget(preferences);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const recipes = listRecipes();
  const existingTags = getDistinctRecipeValues(
    recipes.flatMap((recipe) => recipe.tags),
  );
  const existingIngredients = getDistinctRecipeValues(
    recipes.flatMap((recipe) => recipe.ingredients),
  );

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6">
        <header className="bg-background border-background-light rounded-3xl border px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-h1 text-foreground">Add new recipe</h1>
              <p className="text-body text-foreground-muted max-w-[42rem]">
                Enter the main details, then add tags, ingredients, and steps.
              </p>
            </div>

            <Link
              className="text-button text-primary inline-flex h-12 items-center gap-2"
              href="/app"
            >
              <ArrowLeft className="size-5" strokeWidth={2.2} />
              <span>Back</span>
            </Link>
          </div>
        </header>

        <form action={createRecipeAction} className="grid gap-6">
          <NewRecipeFormFields
            cuisineOptions={cuisineOptions}
            existingIngredients={existingIngredients}
            existingTags={existingTags}
            proteinOptions={proteinOptions}
          />
        </form>
      </div>
    </main>
  );
}
