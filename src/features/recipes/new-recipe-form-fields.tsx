"use client";

import { useState } from "react";

import { ArrowRight, BookOpenText, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SearchField } from "@/components/ui/search-field";
import { SelectInput } from "@/components/ui/select-input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextField } from "@/components/ui/text-field";

type SelectOption = Readonly<{
  label: string;
  value: string;
}>;

type NewRecipeFormFieldsProps = Readonly<{
  cuisineOptions: ReadonlyArray<SelectOption>;
  existingIngredients: ReadonlyArray<string>;
  existingTags: ReadonlyArray<string>;
  initialValues?: RecipeFormInitialValues;
  proteinOptions: ReadonlyArray<SelectOption>;
  submitLabel?: string;
}>;

export type RecipeFormInitialValues = Readonly<{
  caloriesPerServing: number;
  carbGrams: number;
  cuisine: string;
  fatGrams: number;
  ingredients: string[];
  prepMinutes: number;
  primaryProtein: string;
  proteinGrams: number;
  servings: number;
  sourceUrl: string | null;
  steps: string[];
  tags: string[];
  title: string;
  totalCalories: number;
}>;

function normalizeInputValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function hasCaseInsensitiveMatch(values: ReadonlyArray<string>, target: string) {
  const normalizedTarget = target.toLowerCase();

  return values.some((value) => value.toLowerCase() === normalizedTarget);
}

function findCaseInsensitiveMatch(values: ReadonlyArray<string>, target: string) {
  const normalizedTarget = target.toLowerCase();

  return values.find((value) => value.toLowerCase() === normalizedTarget) ?? null;
}

function filterSuggestions({
  query,
  selectedValues,
  suggestions,
}: Readonly<{
  query: string;
  selectedValues: ReadonlyArray<string>;
  suggestions: ReadonlyArray<string>;
}>) {
  const normalizedQuery = normalizeInputValue(query).toLowerCase();

  return suggestions
    .filter((suggestion) => !hasCaseInsensitiveMatch(selectedValues, suggestion))
    .filter((suggestion) =>
      normalizedQuery ? suggestion.toLowerCase().includes(normalizedQuery) : true,
    )
    .slice(0, 8);
}

function SuggestionList({
  actionLabel,
  onAction,
  onSelect,
  suggestions,
}: Readonly<{
  actionLabel: string;
  onAction: () => void;
  onSelect: (value: string) => void;
  suggestions: ReadonlyArray<string>;
}>) {
  if (suggestions.length === 0) {
    return (
      <button
        className="text-button text-primary inline-flex items-center gap-2 self-start"
        onClick={onAction}
        type="button"
      >
        <Plus className="size-4" strokeWidth={2.2} />
        <span>{actionLabel}</span>
      </button>
    );
  }

  return (
    <div className="bg-background-light max-h-40 space-y-2 overflow-y-auto rounded-xl p-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          className="text-body text-foreground hover:bg-background flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors duration-200"
          onClick={() => onSelect(suggestion)}
          type="button"
        >
          <span>{suggestion}</span>
          <Plus className="text-primary size-4 shrink-0" strokeWidth={2.2} />
        </button>
      ))}
    </div>
  );
}

function EmptyListState({ children }: Readonly<{ children: string }>) {
  return <p className="text-caption text-foreground-muted">{children}</p>;
}

export function NewRecipeFormFields({
  cuisineOptions,
  existingIngredients,
  existingTags,
  initialValues,
  proteinOptions,
  submitLabel = "Save recipe",
}: NewRecipeFormFieldsProps) {
  const [tagQuery, setTagQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tags ?? [],
  );
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    initialValues?.ingredients ?? [],
  );
  const [stepInput, setStepInput] = useState("");
  const [steps, setSteps] = useState<string[]>(initialValues?.steps ?? []);

  const visibleTagSuggestions = filterSuggestions({
    query: tagQuery,
    selectedValues: selectedTags,
    suggestions: existingTags,
  });
  const visibleIngredientSuggestions = filterSuggestions({
    query: ingredientQuery,
    selectedValues: selectedIngredients,
    suggestions: existingIngredients,
  });
  const normalizedTagQuery = normalizeInputValue(tagQuery);
  const normalizedIngredientQuery = normalizeInputValue(ingredientQuery);
  const normalizedStepInput = normalizeInputValue(stepInput);
  const canAddTag =
    normalizedTagQuery.length > 0 &&
    visibleTagSuggestions.length === 0 &&
    !hasCaseInsensitiveMatch(selectedTags, normalizedTagQuery);
  const canAddIngredient =
    normalizedIngredientQuery.length > 0 &&
    visibleIngredientSuggestions.length === 0 &&
    !hasCaseInsensitiveMatch(selectedIngredients, normalizedIngredientQuery);

  function addTag(value: string) {
    const normalizedValue = normalizeInputValue(value);
    const matchingSuggestion = findCaseInsensitiveMatch(existingTags, normalizedValue);
    const nextValue = matchingSuggestion ?? normalizedValue;

    if (!nextValue || hasCaseInsensitiveMatch(selectedTags, nextValue)) {
      return;
    }

    setSelectedTags((currentTags) => [...currentTags, nextValue]);
    setTagQuery("");
  }

  function addIngredient(value: string) {
    const normalizedValue = normalizeInputValue(value);
    const matchingSuggestion = findCaseInsensitiveMatch(
      existingIngredients,
      normalizedValue,
    );
    const nextValue = matchingSuggestion ?? normalizedValue;

    if (!nextValue || hasCaseInsensitiveMatch(selectedIngredients, nextValue)) {
      return;
    }

    setSelectedIngredients((currentIngredients) => [...currentIngredients, nextValue]);
    setIngredientQuery("");
  }

  function addStep() {
    if (!normalizedStepInput) {
      return;
    }

    setSteps((currentSteps) => [...currentSteps, normalizedStepInput]);
    setStepInput("");
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SurfaceCard className="flex h-full flex-col gap-6 p-6 sm:p-8">
          <div className="space-y-1">
            <h2 className="text-h2 text-foreground">Recipe information</h2>
            <p className="text-body text-foreground-muted">
              Add the main details, then assign tags.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <TextField
              defaultValue={initialValues?.title}
              label="Recipe title"
              name="title"
              placeholder="Grilled chicken rice bowls"
              required
            />
            <TextField
              defaultValue={initialValues?.sourceUrl ?? undefined}
              helperText="Optional."
              label="Source URL"
              name="sourceUrl"
              placeholder="https://example.com/recipe"
              type="url"
            />
            <div className="space-y-4 lg:col-span-2">
              <SearchField
                helperText="Search existing tags or add a new one."
                label="Tags"
                onChange={(event) => setTagQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    if (visibleTagSuggestions.length > 0) {
                      addTag(visibleTagSuggestions[0]);
                      return;
                    }

                    if (canAddTag) {
                      addTag(normalizedTagQuery);
                    }
                  }
                }}
                placeholder="Search or add a tag"
                value={tagQuery}
              />

              {visibleTagSuggestions.length > 0 || canAddTag ? (
                <SuggestionList
                  actionLabel="Add new tag"
                  onAction={() => addTag(normalizedTagQuery)}
                  onSelect={addTag}
                  suggestions={visibleTagSuggestions}
                />
              ) : null}

              {selectedTags.length > 0 ? (
                <div className="flex max-h-32 flex-wrap gap-3 overflow-y-auto pr-1">
                  {selectedTags.map((tag) => (
                    <button
                      aria-label={`Remove tag ${tag}`}
                      key={tag}
                      onClick={() =>
                        setSelectedTags((currentTags) =>
                          currentTags.filter((currentTag) => currentTag !== tag),
                        )
                      }
                      type="button"
                    >
                      <Chip removable selected>
                        {tag}
                      </Chip>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyListState>No tags added yet.</EmptyListState>
              )}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-6 p-6 sm:p-8">
          <div className="space-y-1">
            <h2 className="text-h2 text-foreground">Macros and characteristics</h2>
            <p className="text-body text-foreground-muted">
              Fill in the numbers and descriptors you want to keep with the recipe.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput
              defaultValue={initialValues?.primaryProtein}
              label="Primary protein"
              name="primaryProtein"
              options={[...proteinOptions]}
              required
            />
            <SelectInput
              defaultValue={initialValues?.cuisine}
              label="Cuisine"
              name="cuisine"
              options={[...cuisineOptions]}
              required
            />
            <TextField
              defaultValue={initialValues?.prepMinutes}
              label="Prep time (minutes)"
              min={1}
              name="prepMinutes"
              placeholder="35"
              required
              type="number"
            />
            <TextField
              defaultValue={initialValues?.servings}
              label="Servings"
              min={1}
              name="servings"
              placeholder="4"
              required
              type="number"
            />
            <TextField
              defaultValue={initialValues?.totalCalories}
              label="Total calories"
              min={1}
              name="totalCalories"
              placeholder="1800"
              required
              type="number"
            />
            <TextField
              defaultValue={initialValues?.caloriesPerServing}
              label="Calories per serving"
              min={1}
              name="caloriesPerServing"
              placeholder="450"
              required
              type="number"
            />
            <TextField
              defaultValue={initialValues?.proteinGrams}
              label="Protein per serving (g)"
              min={1}
              name="proteinGrams"
              placeholder="38"
              required
              type="number"
            />
            <TextField
              defaultValue={initialValues?.carbGrams}
              label="Carbs per serving (g)"
              min={1}
              name="carbGrams"
              placeholder="42"
              required
              type="number"
            />
            <TextField
              defaultValue={initialValues?.fatGrams}
              label="Fat per serving (g)"
              min={1}
              name="fatGrams"
              placeholder="14"
              required
              type="number"
            />
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-6 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-h2 text-foreground">Ingredients and preparation</h2>
          <p className="text-body text-foreground-muted">
            Add items on the left and review the current lists on the right.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:gap-10">
          <div className="space-y-6">
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-title text-foreground">Ingredients</h3>
                <p className="text-caption text-foreground-muted">
                  Search existing ingredients or add a new one.
                </p>
              </div>

              <SearchField
                onChange={(event) => setIngredientQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    if (visibleIngredientSuggestions.length > 0) {
                      addIngredient(visibleIngredientSuggestions[0]);
                      return;
                    }

                    if (canAddIngredient) {
                      addIngredient(normalizedIngredientQuery);
                    }
                  }
                }}
                placeholder="Search or add an ingredient"
                value={ingredientQuery}
              />

              {visibleIngredientSuggestions.length > 0 || canAddIngredient ? (
                <SuggestionList
                  actionLabel="Add new ingredient"
                  onAction={() => addIngredient(normalizedIngredientQuery)}
                  onSelect={addIngredient}
                  suggestions={visibleIngredientSuggestions}
                />
              ) : null}
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-title text-foreground">Steps</h3>
                <p className="text-caption text-foreground-muted">
                  Add each step in the order you want it to appear.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <TextField
                    onChange={(event) => setStepInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addStep();
                      }
                    }}
                    placeholder="Season and sear the chicken."
                    value={stepInput}
                  />
                </div>
                <Button
                  className="sm:shrink-0"
                  icon={<Plus className="size-4" strokeWidth={2.2} />}
                  onClick={addStep}
                  variant="secondary"
                >
                  Add step
                </Button>
              </div>
            </section>
          </div>

          <div className="space-y-6 xl:border-l xl:border-background-light xl:pl-10">
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-title text-foreground">Ingredient list</h3>
                <p className="text-caption text-foreground-muted">
                  Added ingredients appear here.
                </p>
              </div>

              {selectedIngredients.length > 0 ? (
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {selectedIngredients.map((ingredient) => (
                    <SurfaceCard
                      className="flex items-center justify-between gap-3 px-4 py-3"
                      key={ingredient}
                      tone="raised"
                    >
                      <span className="text-body text-foreground">{ingredient}</span>
                      <button
                        aria-label={`Remove ingredient ${ingredient}`}
                        className="text-foreground-muted hover:text-foreground inline-flex items-center justify-center transition-colors duration-200"
                        onClick={() =>
                          setSelectedIngredients((currentIngredients) =>
                            currentIngredients.filter(
                              (currentIngredient) => currentIngredient !== ingredient,
                            ),
                          )
                        }
                        type="button"
                      >
                        <X className="size-4" strokeWidth={2.2} />
                      </button>
                    </SurfaceCard>
                  ))}
                </div>
              ) : (
                <EmptyListState>No ingredients added yet.</EmptyListState>
              )}
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-title text-foreground">Step list</h3>
                <p className="text-caption text-foreground-muted">
                  Added steps appear here.
                </p>
              </div>

              {steps.length > 0 ? (
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {steps.map((step, index) => (
                    <SurfaceCard
                      className="flex items-start gap-3 px-4 py-3"
                      key={`${step}-${index + 1}`}
                      tone="raised"
                    >
                      <span className="bg-[hsl(var(--primary)/0.12)] text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                        {index + 1}
                      </span>
                      <p className="text-body min-w-0 flex-1 text-foreground">{step}</p>
                      <button
                        aria-label={`Remove step ${index + 1}`}
                        className="text-foreground-muted hover:text-foreground inline-flex items-center justify-center transition-colors duration-200"
                        onClick={() =>
                          setSteps((currentSteps) =>
                            currentSteps.filter((_, currentIndex) => currentIndex !== index),
                          )
                        }
                        type="button"
                      >
                        <X className="size-4" strokeWidth={2.2} />
                      </button>
                    </SurfaceCard>
                  ))}
                </div>
              ) : (
                <EmptyListState>No steps added yet.</EmptyListState>
              )}
            </section>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-[hsl(var(--primary)/0.12)] text-primary rounded-full p-3">
            <BookOpenText className="size-5" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <p className="text-title text-foreground">Ready to save?</p>
            <p className="text-caption text-foreground-muted">
              Check the details, then save the recipe.
            </p>
          </div>
        </div>

        <Button icon={<ArrowRight className="size-5" strokeWidth={2.2} />} type="submit">
          {submitLabel}
        </Button>
      </SurfaceCard>

      {selectedTags.map((tag) => (
        <input key={`tag-${tag}`} name="tags" type="hidden" value={tag} />
      ))}
      {selectedIngredients.map((ingredient) => (
        <input
          key={`ingredient-${ingredient}`}
          name="ingredients"
          type="hidden"
          value={ingredient}
        />
      ))}
      {steps.map((step, index) => (
        <input key={`step-${index + 1}`} name="steps" type="hidden" value={step} />
      ))}
    </>
  );
}
