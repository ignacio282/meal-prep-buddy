"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import type {
  DashboardSearchFilters,
  CalorieDensity,
  EffortLevel,
} from "@/features/dashboard/search-params";
import { serializeDashboardSearchParams } from "@/features/dashboard/search-params";
import { cn } from "@/lib/utils/cn";

type RandomizerStageRecipe = {
  caloriesPerServing: number;
  cuisine: string;
  fitReason: string;
  href: string;
  id: string;
  label: string;
  prepMinutes: number;
  primaryProtein: string;
  proteinGrams: number;
  title: string;
};

type RandomizerStageProps = Readonly<{
  availableCuisines: string[];
  availableDensities: CalorieDensity[];
  availableEfforts: EffortLevel[];
  availableProteins: string[];
  basePath: string;
  clearSuggestionFiltersHref: string;
  currentFilters: DashboardSearchFilters;
  noSuggestionMatches: boolean;
  selectedDensity: CalorieDensity;
  selectedEffort: EffortLevel;
  selectedSuggestionCuisine: string;
  selectedSuggestionProtein: string;
  suggestionInventory: Array<{
    cuisine: string;
    density: CalorieDensity;
    effort: EffortLevel;
    protein: string;
  }>;
  suggestedRecipes: RandomizerStageRecipe[];
}>;

type DraftFilters = {
  effort: EffortLevel | "";
  suggestionCuisine: string;
  suggestionDensity: CalorieDensity | "";
  suggestionProtein: string;
};

type FilterChipGroupProps = Readonly<{
  disabledOptions?: string[];
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  selectedValue: string;
}>;

const dragThreshold = 60;

const densityLabelMap: Record<CalorieDensity, string> = {
  lighter: "Lighter",
  balanced: "Balanced",
  "more-filling": "More filling",
};

const effortLabelMap: Record<EffortLevel, string> = {
  quick: "Quick",
  standard: "Standard",
  flexible: "Flexible",
};
const densityValueEntries = Object.entries(densityLabelMap) as Array<
  [CalorieDensity, string]
>;
const effortValueEntries = Object.entries(effortLabelMap) as Array<
  [EffortLevel, string]
>;

function buildStageHref(basePath: string, filters: DashboardSearchFilters) {
  const params = new URLSearchParams();

  Object.entries(serializeDashboardSearchParams(filters)).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

function FilterChipGroup({
  disabledOptions = [],
  label,
  onSelect,
  options,
  selectedValue,
}: FilterChipGroupProps) {
  return (
    <div className="space-y-3">
      <p className="text-caption text-foreground-muted">{label}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = option === selectedValue;
            const disabled = disabledOptions.includes(option);

            return (
              <button
                className={cn(
                  "bg-background border-background-light text-caption inline-flex min-h-11 items-center rounded-full border px-4 transition-colors",
                  selected
                    ? "bg-foreground text-background border-foreground"
                    : disabled
                      ? "text-foreground-muted border-background-light opacity-45"
                      : "text-foreground hover:border-[hsl(var(--primary)/0.28)]",
                )}
                disabled={disabled}
                key={option}
                onClick={() => onSelect(option)}
                type="button"
              >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getRelativePosition(index: number, activeIndex: number, total: number) {
  if (total <= 1) {
    return 0;
  }

  let offset = index - activeIndex;
  const half = total / 2;

  if (offset > half) {
    offset -= total;
  }

  if (offset < -half) {
    offset += total;
  }

  return Math.max(-1, Math.min(1, offset));
}

function getCardMotionState(position: number, prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      opacity: position === 0 ? 1 : 0.7,
      scale: 1,
      x: 0,
      zIndex: position === 0 ? 30 : 20,
    };
  }

  if (position === -1) {
    return { opacity: 0.45, scale: 0.9, x: -120, zIndex: 10 };
  }

  if (position === 1) {
    return { opacity: 0.45, scale: 0.9, x: 120, zIndex: 10 };
  }

  return { opacity: 1, scale: 1, x: 0, zIndex: 30 };
}

export function RandomizerStage({
  availableCuisines,
  availableDensities,
  availableEfforts,
  availableProteins,
  basePath,
  clearSuggestionFiltersHref,
  currentFilters,
  noSuggestionMatches,
  selectedDensity,
  selectedEffort,
  selectedSuggestionCuisine,
  selectedSuggestionProtein,
  suggestionInventory,
  suggestedRecipes,
}: RandomizerStageProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [isPending, startTransition] = useTransition();
  const hasCommittedResults =
    currentFilters.shuffle > 0 &&
    Boolean(currentFilters.suggestionProtein) &&
    Boolean(currentFilters.suggestionCuisine);
  const initialDraftFilters: DraftFilters = hasCommittedResults
    ? {
        suggestionProtein: selectedSuggestionProtein,
        suggestionCuisine: selectedSuggestionCuisine,
        suggestionDensity: selectedDensity,
        effort: selectedEffort,
      }
    : {
        suggestionProtein: "",
        suggestionCuisine: "",
        suggestionDensity: "",
        effort: "",
      };
  const [activeIndex, setActiveIndex] = useState(0);
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(initialDraftFilters);

  const stageRecipes = useMemo(
    () =>
      suggestedRecipes.map((recipe, index) => ({
        ...recipe,
        position: getRelativePosition(index, activeIndex, suggestedRecipes.length),
      })),
    [activeIndex, suggestedRecipes],
  );
  const densityOptions = availableDensities.map((option) => ({
    value: option,
    label: densityLabelMap[option],
  }));
  const effortOptions = availableEfforts.map((option) => ({
    value: option,
    label: effortLabelMap[option],
  }));

  const activeRecipe =
    suggestedRecipes.length > 0
      ? suggestedRecipes[activeIndex % suggestedRecipes.length]
      : null;
  const allSelectionsMade = Boolean(
    draftFilters.suggestionProtein &&
      draftFilters.suggestionCuisine &&
      draftFilters.suggestionDensity &&
      draftFilters.effort,
  );
  const isDirty =
    draftFilters.suggestionProtein !==
      (hasCommittedResults ? selectedSuggestionProtein : "") ||
    draftFilters.suggestionCuisine !==
      (hasCommittedResults ? selectedSuggestionCuisine : "") ||
    draftFilters.suggestionDensity !==
      (hasCommittedResults ? selectedDensity : "") ||
    draftFilters.effort !== (hasCommittedResults ? selectedEffort : "");
  const shouldShowSelectionPrompt = !allSelectionsMade || isDirty;

  function hasCompatibleRecipe(
    overrides: Partial<DraftFilters>,
  ) {
    const candidate = {
      suggestionProtein: overrides.suggestionProtein ?? draftFilters.suggestionProtein,
      suggestionCuisine: overrides.suggestionCuisine ?? draftFilters.suggestionCuisine,
      suggestionDensity: overrides.suggestionDensity ?? draftFilters.suggestionDensity,
      effort: overrides.effort ?? draftFilters.effort,
    };

    return suggestionInventory.some((recipe) => {
      if (
        candidate.suggestionProtein &&
        recipe.protein !== candidate.suggestionProtein
      ) {
        return false;
      }

      if (
        candidate.suggestionCuisine &&
        recipe.cuisine !== candidate.suggestionCuisine
      ) {
        return false;
      }

      if (
        candidate.suggestionDensity &&
        recipe.density !== candidate.suggestionDensity
      ) {
        return false;
      }

      if (candidate.effort && recipe.effort !== candidate.effort) {
        return false;
      }

      return true;
    });
  }

  const disabledProteins = availableProteins.filter(
    (option) => !hasCompatibleRecipe({ suggestionProtein: option }),
  );
  const disabledCuisines = availableCuisines.filter(
    (option) => !hasCompatibleRecipe({ suggestionCuisine: option }),
  );
  const disabledDensityLabels = densityOptions
    .filter((option) => !hasCompatibleRecipe({ suggestionDensity: option.value }))
    .map((option) => option.label);
  const disabledEffortLabels = effortOptions
    .filter((option) => !hasCompatibleRecipe({ effort: option.value }))
    .map((option) => option.label);

  function cycle(direction: "next" | "previous") {
    if (suggestedRecipes.length <= 1) {
      return;
    }

    setActiveIndex((current) => {
      if (direction === "next") {
        return (current + 1) % suggestedRecipes.length;
      }

      return (current - 1 + suggestedRecipes.length) % suggestedRecipes.length;
    });
  }

  function handleShuffle() {
    if (!allSelectionsMade) {
      return;
    }

    const nextHref = buildStageHref(basePath, {
      ...currentFilters,
      effort: draftFilters.effort || "standard",
      shuffle: currentFilters.shuffle + 1,
      suggestionCuisine: draftFilters.suggestionCuisine,
      suggestionDensity: draftFilters.suggestionDensity || "balanced",
      suggestionProtein: draftFilters.suggestionProtein,
      view: "randomizer",
    });

    startTransition(() => {
      window.location.assign(nextHref);
    });
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x <= -dragThreshold) {
      cycle("next");
      return;
    }

    if (info.offset.x >= dragThreshold) {
      cycle("previous");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
      <SurfaceCard className="space-y-6 p-6" tone="raised">
        <FilterChipGroup
          disabledOptions={disabledProteins}
          label="Protein"
          onSelect={(value) =>
            setDraftFilters((current) => ({ ...current, suggestionProtein: value }))
          }
          options={availableProteins}
          selectedValue={draftFilters.suggestionProtein}
        />

        <FilterChipGroup
          disabledOptions={disabledCuisines}
          label="Cuisine"
          onSelect={(value) =>
            setDraftFilters((current) => ({ ...current, suggestionCuisine: value }))
          }
          options={availableCuisines}
          selectedValue={draftFilters.suggestionCuisine}
        />

        <FilterChipGroup
          disabledOptions={disabledDensityLabels}
          label="How filling"
          onSelect={(value) =>
            setDraftFilters((current) => ({
              ...current,
              suggestionDensity:
                densityValueEntries.find(([, label]) => label === value)?.[0] ??
                current.suggestionDensity,
            }))
          }
          options={densityOptions.map((option) => option.label)}
          selectedValue={
            draftFilters.suggestionDensity
              ? densityLabelMap[draftFilters.suggestionDensity]
              : ""
          }
        />

        <FilterChipGroup
          disabledOptions={disabledEffortLabels}
          label="Prep time"
          onSelect={(value) =>
            setDraftFilters((current) => ({
              ...current,
              effort:
                effortValueEntries.find(([, label]) => label === value)?.[0] ??
                current.effort,
            }))
          }
          options={effortOptions.map((option) => option.label)}
          selectedValue={
            draftFilters.effort ? effortLabelMap[draftFilters.effort] : ""
          }
        />

        <Button
          disabled={isPending || !allSelectionsMade}
          icon={<Sparkles className="size-5" strokeWidth={2.2} />}
          onClick={handleShuffle}
        >
          Shuffle recipes
        </Button>
      </SurfaceCard>

      {shouldShowSelectionPrompt ? (
        <div className="flex min-h-[32rem] items-center justify-center rounded-[2rem]">
          <div className="max-w-[26rem] space-y-3 text-center">
            <div className="bg-[hsl(var(--primary)/0.12)] text-primary mx-auto flex size-14 items-center justify-center rounded-full">
              <ChefHat className="size-6" strokeWidth={2} />
            </div>
            <p className="text-title text-foreground">
              {allSelectionsMade
                ? "Shuffle to see matching recipes"
                : "Choose your filters"}
            </p>
            <p className="text-body text-foreground-muted">
              {allSelectionsMade
                ? "Your recipe options will appear here after you shuffle."
                : "Select a protein, cuisine, meal size, and prep time to see recipes that fit."}
            </p>
          </div>
        </div>
      ) : noSuggestionMatches || suggestedRecipes.length === 0 || !activeRecipe ? (
        <div className="flex min-h-[32rem] items-center justify-center rounded-[2rem]">
          <div className="max-w-[24rem] space-y-4 text-center">
            <p className="text-title text-foreground">No recipes match these filters</p>
            <p className="text-body text-foreground-muted">
              Try a different combination, or reset the filters and start again.
            </p>
            <div className="flex justify-center">
              <Link
                className="text-button text-primary inline-flex h-12 items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.28)] px-4"
                href={clearSuggestionFiltersHref}
              >
                <span>Reset randomizer</span>
                <ArrowRight className="size-5" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5 p-2 sm:p-4">
          <div className="relative h-[28rem] overflow-hidden rounded-[1.75rem]">
            <AnimatePresence initial={false}>
              {stageRecipes.map((recipe) => {
                const motionState = getCardMotionState(recipe.position, prefersReducedMotion);
                const isActive = recipe.position === 0;

                return (
                  <motion.div
                    animate={motionState}
                    className="absolute inset-0 flex items-center justify-center"
                    drag={isActive && !prefersReducedMotion ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    key={recipe.id}
                    onClick={() => setActiveIndex(suggestedRecipes.findIndex((item) => item.id === recipe.id))}
                    onDragEnd={handleDragEnd}
                    transition={{ duration: prefersReducedMotion ? 0.18 : 0.34, ease: [0.22, 1, 0.36, 1] }}
                    style={{ zIndex: motionState.zIndex }}
                  >
                    <SurfaceCard
                      className={cn(
                        "flex min-h-[24.5rem] w-[19.5rem] flex-col justify-between p-5 transition-opacity",
                        !isActive && "pointer-events-none",
                      )}
                      tone="raised"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--primary)/0.8)]">
                            {recipe.label}
                          </p>
                          <Link
                            className="text-title text-foreground hover:text-primary line-clamp-2"
                            href={recipe.href}
                          >
                            {recipe.title}
                          </Link>
                          <p className="text-caption text-foreground-muted">
                            {recipe.caloriesPerServing} cal | {recipe.proteinGrams}g protein |{" "}
                            {recipe.prepMinutes} min
                          </p>
                        </div>

                        <div>
                          <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.12)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--primary)/0.82)]">
                            {recipe.cuisine}
                          </span>
                        </div>

                        {isActive ? (
                          <p className="text-caption text-foreground-muted">
                            {recipe.fitReason}
                          </p>
                        ) : null}
                      </div>

                      {isActive ? (
                        <div className="space-y-3">
                          <Link
                            className="text-button text-primary inline-flex items-center gap-2"
                            href={recipe.href}
                          >
                            <span>View recipe</span>
                            <ChevronRight className="size-4" strokeWidth={2.2} />
                          </Link>
                        </div>
                      ) : (
                        <div className="text-button text-primary inline-flex items-center gap-2 opacity-90">
                          <span>Preview</span>
                          <ChevronRight className="size-4" strokeWidth={2.2} />
                        </div>
                      )}
                    </SurfaceCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {suggestedRecipes.length > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <Button
                className="min-w-[8.5rem]"
                icon={<ArrowLeft className="size-4" strokeWidth={2.2} />}
                onClick={() => cycle("previous")}
                variant="secondary"
              >
                Previous
              </Button>
              <p className="text-caption text-foreground-muted">
                {activeIndex + 1} of {suggestedRecipes.length}
              </p>
              <Button
                className="min-w-[8.5rem]"
                icon={<ArrowRight className="size-4" strokeWidth={2.2} />}
                onClick={() => cycle("next")}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
