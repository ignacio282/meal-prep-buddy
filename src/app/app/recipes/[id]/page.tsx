import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Heart,
  Pencil,
  ShoppingBasket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  getVeteranPreviewDashboardState,
  getVeteranPreviewRecipeById,
  veteranPreviewPreferences,
} from "@/features/dashboard/mock-data";
import {
  getDashboardPreviewMode,
  parseDashboardSearchParams,
  serializeDashboardSearchParams,
} from "@/features/dashboard/search-params";
import {
  toggleRecipeFavoriteAction,
  toggleRecipePlannedAction,
  updateRecipeNotesAction,
} from "@/features/recipes/actions";
import { getAppRedirectTarget } from "@/features/onboarding/route-state";
import { cn } from "@/lib/utils/cn";
import { getRecipeById } from "@/server/repositories/recipes";
import { getDashboardState } from "@/server/services/dashboard";
import { getOnboardingPreferences } from "@/server/services/onboarding";

type RecipeDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

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

export default async function RecipeDetailPage({
  params,
  searchParams,
}: RecipeDetailPageProps) {
  const resolvedSearchParams = await searchParams;
  const previewMode = getDashboardPreviewMode(resolvedSearchParams);
  const filters = parseDashboardSearchParams(resolvedSearchParams);
  const recipeId = (await params).id;
  const preferences =
    previewMode === "veteran"
      ? veteranPreviewPreferences
      : getOnboardingPreferences();
  const redirectTarget = previewMode ? null : getAppRedirectTarget(preferences);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  if (!preferences) {
    return null;
  }

  const recipe =
    previewMode === "veteran"
      ? getVeteranPreviewRecipeById(recipeId)
      : getRecipeById(recipeId);

  if (!recipe) {
    notFound();
  }

  const dashboardState =
    previewMode === "veteran"
      ? getVeteranPreviewDashboardState({
          ...filters,
          suggestionProtein: filters.suggestionProtein || "Chicken",
        })
      : getDashboardState(preferences, filters);
  const detailParams = new URLSearchParams();

  Object.entries(serializeDashboardSearchParams(filters)).forEach(
    ([key, value]) => {
      if (value) {
        detailParams.set(key, value);
      }
    },
  );

  if (previewMode === "veteran") {
    detailParams.set("preview", "veteran");
  }

  const returnTo = detailParams.toString()
    ? `/app/recipes/${recipe.id}?${detailParams.toString()}`
    : `/app/recipes/${recipe.id}`;
  const dashboardParams = new URLSearchParams(detailParams);

  dashboardParams.delete("preview");

  const dashboardBasePath =
    previewMode === "veteran" ? "/app/dashboard-preview" : "/app";
  const dashboardHref = dashboardParams.toString()
    ? `${dashboardBasePath}?${dashboardParams.toString()}`
    : dashboardBasePath;
  const recipeInWeeklyPlan =
    dashboardState.weeklyPlan.assignedRecipeIds.includes(recipe.id);
  const weeklyPlanFull =
    !recipeInWeeklyPlan && !dashboardState.weeklyPlan.hasOpenSlot;
  const wasJustCreated =
    resolvedSearchParams?.created === "1" ||
    (Array.isArray(resolvedSearchParams?.created) &&
      resolvedSearchParams.created[0] === "1");

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-6">
        <Link
          className="text-button text-primary inline-flex h-10 w-fit items-center gap-2"
          href={dashboardHref}
        >
          <ArrowLeft className="size-5" strokeWidth={2.2} />
          <span>Back</span>
        </Link>

        <header className="bg-background border-background-light rounded-3xl border px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-h1 text-foreground">{recipe.title}</h1>
              {recipe.sourceUrl ? (
                <Link
                  className="text-button text-primary mt-3 inline-flex items-center gap-2"
                  href={recipe.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>Open source</span>
                  <ExternalLink className="size-4" strokeWidth={2.2} />
                </Link>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <RecipeActionForm
                action={toggleRecipeFavoriteAction}
                recipeId={recipe.id}
                returnTo={returnTo}
              >
                <button
                  aria-label={recipe.favorite ? "Remove favorite" : "Favorite"}
                  className="text-button text-primary inline-flex h-12 items-center gap-2 rounded-full px-1"
                  type="submit"
                >
                  <Heart
                    className={cn("size-5", recipe.favorite && "fill-primary")}
                    strokeWidth={2}
                  />
                  <span>Favorite</span>
                </button>
              </RecipeActionForm>
            </div>
          </div>
        </header>

        {wasJustCreated ? (
          <SurfaceCard className="p-4" tone="raised">
            <div className="text-success rounded-xl border border-[hsl(var(--success)/0.18)] bg-[hsl(var(--success)/0.09)] px-4 py-3">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0"
                  strokeWidth={2.2}
                />
                <div className="space-y-1">
                  <p className="text-title">Recipe saved</p>
                  <p className="text-caption">
                    You can now find it in your library, add it to your weekly
                    plan, or use it in recipe suggestions.
                  </p>
                </div>
              </div>
            </div>
          </SurfaceCard>
        ) : null}

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <SurfaceCard className="flex h-full flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-h2 text-foreground">Recipe details</h2>
              {!previewMode ? (
                <Link
                  className="text-button text-primary inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-full px-1"
                  href={`/app/recipes/${recipe.id}/edit`}
                >
                  <Pencil className="size-4" strokeWidth={2.2} />
                  <span>Edit</span>
                </Link>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SurfaceCard className="space-y-1 p-4" tone="raised">
                  <p className="text-caption text-foreground-muted">
                    Per serving
                  </p>
                  <p className="text-title text-foreground">
                    {recipe.caloriesPerServing} cal
                  </p>
                </SurfaceCard>
                <SurfaceCard className="space-y-1 p-4" tone="raised">
                  <p className="text-caption text-foreground-muted">Protein</p>
                  <p className="text-title text-foreground">
                    {recipe.proteinGrams}g
                  </p>
                </SurfaceCard>
                <SurfaceCard className="space-y-1 p-4" tone="raised">
                  <p className="text-caption text-foreground-muted">
                    Prep time
                  </p>
                  <p className="text-title text-foreground">
                    {recipe.prepMinutes} min
                  </p>
                </SurfaceCard>
                <SurfaceCard className="space-y-1 p-4" tone="raised">
                  <p className="text-caption text-foreground-muted">Servings</p>
                  <p className="text-title text-foreground">
                    {recipe.servings}
                  </p>
                </SurfaceCard>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-caption text-primary inline-flex min-h-9 items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-3 py-2">
                  {recipe.cuisine}
                </span>
                <span className="text-caption text-primary inline-flex min-h-9 items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-3 py-2">
                  {recipe.primaryProtein}
                </span>
                {recipe.tags.map((tag) => (
                  <span
                    className="text-caption text-primary inline-flex min-h-9 items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-3 py-2"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {!recipeInWeeklyPlan ? (
              <div className="flex flex-wrap items-center gap-3">
                <RecipeActionForm
                  action={toggleRecipePlannedAction}
                  recipeId={recipe.id}
                  returnTo={returnTo}
                >
                  <Button
                    disabled={weeklyPlanFull}
                    icon={<CalendarDays className="size-5" strokeWidth={2.2} />}
                  >
                    {weeklyPlanFull ? "Weekly plan full" : "Add to weekly plan"}
                  </Button>
                </RecipeActionForm>
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-h2 text-foreground">Preparation</h2>
                <p className="text-body text-foreground-muted">
                  Follow the steps in order while you cook.
                </p>
              </div>
              <div className="space-y-3">
                {recipe.steps.map((step, index) => (
                  <SurfaceCard
                    key={`${recipe.id}-step-${index + 1}`}
                    className="flex gap-3 p-4"
                    tone="raised"
                  >
                    <span className="text-primary flex size-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-body text-foreground">{step}</p>
                  </SurfaceCard>
                ))}
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard
            className="flex h-full flex-col gap-5 p-6 sm:p-8"
            id="groceries"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShoppingBasket
                  className="text-primary size-5"
                  strokeWidth={2}
                />
                <h2 className="text-h2 text-foreground">What to buy</h2>
              </div>
              <p className="text-body text-foreground-muted">
                Check off ingredients as you gather them.
              </p>
            </div>

            <div className="flex-1 space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <label
                  key={`${recipe.id}-ingredient-${index + 1}`}
                  className="bg-background-light flex items-center gap-3 rounded-xl px-4 py-3"
                >
                  <input className="accent-primary size-4" type="checkbox" />
                  <span className="text-body text-foreground">
                    {ingredient}
                  </span>
                </label>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard className="space-y-4 p-6 sm:p-8">
          <div className="space-y-1">
            <h2 className="text-h2 text-foreground">Notes</h2>
            <p className="text-body text-foreground-muted">
              Save substitutions, reheating notes, or changes to try next time.
            </p>
          </div>
          {!previewMode ? (
            <form action={updateRecipeNotesAction} className="space-y-4">
              <input name="recipeId" type="hidden" value={recipe.id} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <textarea
                className="text-body bg-background-light placeholder:text-foreground-muted text-foreground hover:bg-surface focus:bg-surface min-h-32 w-full resize-y rounded-xl px-4 py-3 transition-colors duration-200 outline-none focus:ring-0"
                defaultValue={recipe.notes ?? ""}
                maxLength={1200}
                name="notes"
                placeholder="Add substitutions, reheating notes, or changes to try next time."
              />
              <Button type="submit" variant="secondary">
                Save notes
              </Button>
            </form>
          ) : (
            <div className="bg-background-light rounded-xl px-4 py-3">
              <p className="text-body text-foreground-muted">
                Notes can be added to saved recipes.
              </p>
            </div>
          )}
        </SurfaceCard>
      </div>
    </main>
  );
}
