"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Grip,
  Search,
  ShoppingBasket,
  Trash2,
} from "lucide-react";

import { SurfaceCard } from "@/components/ui/surface-card";
import {
  assignWeeklyPlanSlotAction,
  setWeeklyPlanMealCountAction,
  type WeeklyPlanActionState,
} from "@/features/weekly-plan/actions";
import { cn } from "@/lib/utils/cn";

export type WeeklyPlanBoardRecipe = {
  caloriesPerServing: number;
  cuisine: string;
  favorite: boolean;
  href: string;
  id: string;
  ingredients: string[];
  prepMinutes: number;
  proteinGrams: number;
  title: string;
};

type WeeklyPlanBoardProps = Readonly<{
  availableRecipes: WeeklyPlanBoardRecipe[];
  initialMealCount: 1 | 2 | 3;
  initialSlots: Array<{
    recipeId: string | null;
    slotIndex: number;
  }>;
  mode: "live" | "preview";
}>;

type SlotState = {
  recipeId: string | null;
  slotIndex: number;
};

function buildShoppingList(
  slots: Array<SlotState & { recipe: WeeklyPlanBoardRecipe | null }>,
) {
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

function normalizePreviewUpdate(
  nextMealCount: number,
  previousSlots: SlotState[],
  nextAssignment?: { recipeId: string | null; slotIndex: number },
) {
  const mealCount = nextMealCount <= 1 ? 1 : nextMealCount >= 3 ? 3 : 2;
  const nextSlots = previousSlots.map((slot) => {
    if (slot.slotIndex >= mealCount) {
      return { ...slot, recipeId: null };
    }

    if (nextAssignment && slot.slotIndex === nextAssignment.slotIndex) {
      return { ...slot, recipeId: nextAssignment.recipeId };
    }

    return slot;
  });

  return {
    mealCount: mealCount as 1 | 2 | 3,
    slots: nextSlots,
  };
}

export function WeeklyPlanBoard({
  availableRecipes,
  initialMealCount,
  initialSlots,
  mode,
}: WeeklyPlanBoardProps) {
  const [planState, setPlanState] = useState<WeeklyPlanActionState>({
    mealCount: initialMealCount,
    slots: initialSlots,
  });
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
  const [draggingRecipeId, setDraggingRecipeId] = useState<string | null>(null);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [isGroceryOpen, setIsGroceryOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const recipeMap = useMemo(
    () => new Map(availableRecipes.map((recipe) => [recipe.id, recipe] as const)),
    [availableRecipes],
  );
  const visibleSlots = useMemo(
    () =>
      planState.slots
        .filter((slot) => slot.slotIndex < planState.mealCount)
        .map((slot) => ({
          ...slot,
          recipe: slot.recipeId ? recipeMap.get(slot.recipeId) ?? null : null,
        })),
    [planState, recipeMap],
  );
  const shoppingList = useMemo(() => buildShoppingList(visibleSlots), [visibleSlots]);
  const visibleCheckedIngredients = checkedIngredients.filter((ingredient) =>
    shoppingList.includes(ingredient),
  );
  const filteredAvailableRecipes = useMemo(() => {
    const normalizedSearch = recipeSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return availableRecipes;
    }

    return availableRecipes.filter((recipe) =>
      [recipe.title, recipe.cuisine].join(" ").toLowerCase().includes(normalizedSearch),
    );
  }, [availableRecipes, recipeSearch]);

  function applyActionState(nextState: WeeklyPlanActionState) {
    setPlanState(nextState);
    setDragOverSlotIndex(null);
    setDraggingRecipeId(null);

    if (activeSlotIndex !== null && activeSlotIndex >= nextState.mealCount) {
      setActiveSlotIndex(null);
    }
  }

  function commitMealCount(nextMealCount: 1 | 2 | 3) {
    if (mode === "preview") {
      applyActionState(normalizePreviewUpdate(nextMealCount, planState.slots));
      return;
    }

    startTransition(() => {
      void setWeeklyPlanMealCountAction(nextMealCount).then(applyActionState);
    });
  }

  function commitSlot(slotIndex: number, recipeId: string | null) {
    setActiveSlotIndex(null);

    if (mode === "preview") {
      applyActionState(
        normalizePreviewUpdate(planState.mealCount, planState.slots, {
          slotIndex,
          recipeId,
        }),
      );
      return;
    }

    startTransition(() => {
      void assignWeeklyPlanSlotAction(slotIndex, recipeId).then(applyActionState);
    });
  }

  function handleDrop(slotIndex: number, recipeId: string) {
    if (!recipeMap.has(recipeId)) {
      return;
    }

    commitSlot(slotIndex, recipeId);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="bg-background-light inline-flex w-fit items-center rounded-full p-1">
          {[1, 2, 3].map((count) => (
            <button
              className={cn(
                "text-caption rounded-full px-4 py-2 transition-colors",
                planState.mealCount === count
                  ? "bg-primary text-foreground-white"
                  : "text-foreground-muted hover:text-foreground",
              )}
              key={count}
              onClick={() => commitMealCount(count as 1 | 2 | 3)}
              type="button"
            >
              {count} {count === 1 ? "meal" : "meals"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr] xl:items-stretch">
        <SurfaceCard
          className="flex h-[38rem] flex-col gap-4 overflow-hidden p-5 sm:p-6"
          tone="raised"
        >
          <div className="space-y-1">
            <h3 className="text-title text-foreground">Saved recipes</h3>
            <p className="text-caption text-foreground-muted">
              Search your saved recipes, then drag one into a meal slot or select a slot first.
            </p>
          </div>

          <label className="bg-background flex min-h-11 items-center gap-2 rounded-full px-3">
            <Search className="text-foreground-muted size-4" strokeWidth={2.2} />
            <input
              className="text-caption text-foreground placeholder:text-foreground-muted w-full bg-transparent outline-none"
              onChange={(event) => setRecipeSearch(event.target.value)}
              placeholder="Search saved recipes"
              type="text"
              value={recipeSearch}
            />
          </label>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {filteredAvailableRecipes.length === 0 ? (
              <div className="bg-background flex min-h-28 items-center justify-center rounded-2xl px-4 text-center">
                <p className="text-caption text-foreground-muted">
                  No saved recipes match this search.
                </p>
              </div>
            ) : (
              filteredAvailableRecipes.map((recipe) => (
                <SurfaceCard
                  className={cn(
                    "space-y-3 p-4",
                    activeSlotIndex !== null && "border-primary/30 cursor-pointer",
                  )}
                  draggable
                  key={recipe.id}
                  onClick={() => {
                    if (activeSlotIndex !== null) {
                      commitSlot(activeSlotIndex, recipe.id);
                    }
                  }}
                  onDragEnd={() => {
                    setDragOverSlotIndex(null);
                    setDraggingRecipeId(null);
                  }}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData("text/plain", recipe.id);
                    setDraggingRecipeId(recipe.id);
                  }}
                  tone="base"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-title text-foreground">{recipe.title}</p>
                      <p className="text-caption text-foreground-muted">
                        {recipe.caloriesPerServing} cal | {recipe.proteinGrams}g protein |{" "}
                        {recipe.prepMinutes} min
                      </p>
                    </div>
                    <Grip className="text-foreground-muted size-4 shrink-0" strokeWidth={2} />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--primary)/0.82)]">
                      {recipe.cuisine}
                    </span>
                    <div className="flex items-center gap-3">
                      {activeSlotIndex !== null ? (
                        <button
                          className="text-button text-primary inline-flex items-center gap-2"
                          onClick={(event) => {
                            event.preventDefault();
                            commitSlot(activeSlotIndex, recipe.id);
                          }}
                          type="button"
                        >
                          <CalendarDays className="size-4" strokeWidth={2.2} />
                          <span>Use for meal {activeSlotIndex + 1}</span>
                        </button>
                      ) : null}
                      <Link
                        className="text-button text-primary inline-flex items-center gap-2"
                        href={recipe.href}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span>View recipe</span>
                        <ArrowRight className="size-4" strokeWidth={2.2} />
                      </Link>
                    </div>
                  </div>
                </SurfaceCard>
              ))
            )}
          </div>
        </SurfaceCard>

        <div className="flex h-[38rem] flex-col gap-4">
          {visibleSlots.map((slot) => {
            const hasRecipe = Boolean(slot.recipe);
            const active = activeSlotIndex === slot.slotIndex;
            const dragOver = dragOverSlotIndex === slot.slotIndex;

            return (
              <div
                className={cn(
                  "w-full min-h-0 flex-1 rounded-[1.5rem] border p-5 transition-colors",
                  hasRecipe
                    ? "bg-background-light border-transparent"
                    : "bg-background border-[hsl(var(--primary)/0.28)] border-dashed",
                  active && "border-primary bg-[hsl(var(--primary)/0.06)]",
                  dragOver && "border-primary bg-[hsl(var(--primary)/0.08)]",
                )}
                key={slot.slotIndex}
                onDragLeave={() =>
                  setDragOverSlotIndex((current) =>
                    current === slot.slotIndex ? null : current,
                  )
                }
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverSlotIndex(slot.slotIndex);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const recipeId = event.dataTransfer.getData("text/plain") || draggingRecipeId;

                  if (recipeId) {
                    handleDrop(slot.slotIndex, recipeId);
                  }
                }}
              >
                <div className="flex h-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <div className="space-y-1">
                      <p className="text-caption text-foreground-muted">
                        Meal {slot.slotIndex + 1}
                      </p>
                      {slot.recipe ? (
                        <Link
                          className="text-title text-foreground hover:text-primary"
                          href={slot.recipe.href}
                        >
                          {slot.recipe.title}
                        </Link>
                      ) : (
                        <p className="text-foreground text-[3rem] leading-none font-semibold">
                          {slot.slotIndex + 1}
                        </p>
                      )}
                    </div>

                    {slot.recipe ? (
                      <>
                        <p className="text-caption text-foreground-muted">
                          {slot.recipe.caloriesPerServing} cal | {slot.recipe.proteinGrams}g protein |{" "}
                          {slot.recipe.prepMinutes} min
                        </p>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--primary)/0.82)]">
                            {slot.recipe.cuisine}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-caption text-foreground-muted max-w-[34rem]">
                        Add a recipe to this slot, or leave it empty for now.
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 lg:mt-0 lg:justify-end lg:self-end lg:pt-0">
                    {slot.recipe ? (
                      <button
                        className="text-button text-foreground inline-flex items-center gap-2"
                        onClick={() => commitSlot(slot.slotIndex, null)}
                        type="button"
                      >
                        <Trash2 className="size-4" strokeWidth={2.2} />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <button
                        className="text-button text-primary inline-flex items-center gap-2"
                        onClick={() => setActiveSlotIndex(slot.slotIndex)}
                        type="button"
                      >
                        <span>Select a meal</span>
                        <ArrowRight className="size-4" strokeWidth={2.2} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SurfaceCard className="space-y-4 p-5 sm:p-6" tone="raised">
        <button
          aria-expanded={isGroceryOpen}
          className="text-foreground flex min-h-14 w-full items-center justify-between"
          onClick={() => setIsGroceryOpen((current) => !current)}
          type="button"
        >
          <div className="flex items-center gap-2">
            <ShoppingBasket className="text-primary size-5" strokeWidth={2} />
            <span className="text-title">What to buy</span>
            <span className="text-caption text-foreground-muted">
              {shoppingList.length} {shoppingList.length === 1 ? "item" : "items"}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "text-foreground-muted size-5 transition-transform",
              isGroceryOpen && "rotate-180",
            )}
            strokeWidth={2.2}
          />
        </button>

        {isGroceryOpen ? (
          <>
            <div className="flex items-center gap-2">
              <p className="text-caption text-foreground-muted">
                This list combines the ingredients from the meals in your plan.
              </p>
            </div>

            {shoppingList.length === 0 ? (
            <p className="text-caption text-foreground-muted">
              Add at least one meal to build your shopping list.
            </p>
          ) : (
            <div className="divide-background-light border-background-light overflow-hidden rounded-2xl border divide-y">
              {shoppingList.map((ingredient) => (
                <label className="flex items-center gap-3 px-1 py-3" key={ingredient}>
                  <input
                    checked={visibleCheckedIngredients.includes(ingredient)}
                    className="accent-primary size-4"
                    onChange={() =>
                      setCheckedIngredients((current) =>
                        current.includes(ingredient)
                          ? current.filter((item) => item !== ingredient)
                          : [...current, ingredient],
                      )
                    }
                    type="checkbox"
                  />
                  <span className="text-body text-foreground">{ingredient}</span>
                </label>
              ))}
            </div>
          )}
          </>
        ) : null}
      </SurfaceCard>

      {isPending ? (
        <p className="text-caption text-foreground-muted">Updating your weekly plan...</p>
      ) : null}
    </div>
  );
}
