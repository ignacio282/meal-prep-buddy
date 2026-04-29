"use client";

import { useState } from "react";

import { ArrowRight, BookOpenText, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SearchField } from "@/components/ui/search-field";
import { SelectInput } from "@/components/ui/select-input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextField } from "@/components/ui/text-field";
import { AiRecipeImportPanel } from "@/features/recipes/ai-recipe-import-panel";
import type { AiRecipeDraft } from "@/features/recipes/ai-ingestion-schema";

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
  caloriesPerServing?: number;
  carbGrams?: number;
  cuisine?: string;
  fatGrams?: number;
  ingredients?: string[];
  prepMinutes?: number;
  primaryProtein?: string;
  proteinGrams?: number;
  servings?: number;
  sourceUrl: string | null;
  steps?: string[];
  tags?: string[];
  title?: string;
  totalCalories?: number;
}>;

type RecipeScalarFormValues = Readonly<{
  caloriesPerServing: string;
  carbGrams: string;
  cuisine: string;
  fatGrams: string;
  prepMinutes: string;
  primaryProtein: string;
  proteinGrams: string;
  servings: string;
  sourceUrl: string;
  title: string;
  totalCalories: string;
}>;

function normalizeInputValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function formatOptionalNumber(value: number | undefined) {
  return typeof value === "number" ? String(value) : "";
}

function getInitialScalarValues(
  initialValues: RecipeFormInitialValues | undefined,
): RecipeScalarFormValues {
  return {
    caloriesPerServing: formatOptionalNumber(
      initialValues?.caloriesPerServing,
    ),
    carbGrams: formatOptionalNumber(initialValues?.carbGrams),
    cuisine: initialValues?.cuisine ?? "",
    fatGrams: formatOptionalNumber(initialValues?.fatGrams),
    prepMinutes: formatOptionalNumber(initialValues?.prepMinutes),
    primaryProtein: initialValues?.primaryProtein ?? "",
    proteinGrams: formatOptionalNumber(initialValues?.proteinGrams),
    servings: formatOptionalNumber(initialValues?.servings),
    sourceUrl: initialValues?.sourceUrl ?? "",
    title: initialValues?.title ?? "",
    totalCalories: formatOptionalNumber(initialValues?.totalCalories),
  };
}

function formatNullableNumber(value: number | null) {
  return value === null ? "" : String(value);
}

function normalizeDraftList(values: string[], maxItems: number) {
  const normalizedValues = new Map<string, string>();

  values.forEach((value) => {
    const normalizedValue = normalizeInputValue(value);

    if (!normalizedValue) {
      return;
    }

    const normalizedKey = normalizedValue.toLowerCase();

    if (!normalizedValues.has(normalizedKey)) {
      normalizedValues.set(normalizedKey, normalizedValue);
    }
  });

  return [...normalizedValues.values()].slice(0, maxItems);
}

function normalizeDraftSelectValue(
  value: string | null,
  options: ReadonlyArray<SelectOption>,
) {
  if (!value) {
    return "Other";
  }

  const matchingOption = options.find(
    (option) => option.value.toLowerCase() === value.toLowerCase(),
  );

  return matchingOption?.value ?? "Other";
}

function normalizeDraftUrl(value: string | null) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).toString();
  } catch {
    return "";
  }
}

function hasCaseInsensitiveMatch(
  values: ReadonlyArray<string>,
  target: string,
) {
  const normalizedTarget = target.toLowerCase();

  return values.some((value) => value.toLowerCase() === normalizedTarget);
}

function findCaseInsensitiveMatch(
  values: ReadonlyArray<string>,
  target: string,
) {
  const normalizedTarget = target.toLowerCase();

  return (
    values.find((value) => value.toLowerCase() === normalizedTarget) ?? null
  );
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
    .filter(
      (suggestion) => !hasCaseInsensitiveMatch(selectedValues, suggestion),
    )
    .filter((suggestion) =>
      normalizedQuery
        ? suggestion.toLowerCase().includes(normalizedQuery)
        : true,
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
  const [formValues, setFormValues] = useState(() =>
    getInitialScalarValues(initialValues),
  );
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

  function updateFormValue(
    key: keyof RecipeScalarFormValues,
    value: string,
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function applyAiDraft(draft: AiRecipeDraft) {
    setFormValues({
      caloriesPerServing: formatNullableNumber(draft.caloriesPerServing),
      carbGrams: formatNullableNumber(draft.carbGrams),
      cuisine: normalizeDraftSelectValue(draft.cuisine, cuisineOptions),
      fatGrams: formatNullableNumber(draft.fatGrams),
      prepMinutes: formatNullableNumber(draft.prepMinutes),
      primaryProtein: normalizeDraftSelectValue(
        draft.primaryProtein,
        proteinOptions,
      ),
      proteinGrams: formatNullableNumber(draft.proteinGrams),
      servings: formatNullableNumber(draft.servings),
      sourceUrl: normalizeDraftUrl(draft.sourceUrl),
      title: draft.title ?? "",
      totalCalories: formatNullableNumber(draft.totalCalories),
    });
    setSelectedTags(normalizeDraftList(draft.tags, 8));
    setSelectedIngredients(normalizeDraftList(draft.ingredients, 40));
    setSteps(normalizeDraftList(draft.steps, 20));
    setTagQuery("");
    setIngredientQuery("");
    setStepInput("");
  }

  function addTag(value: string) {
    const normalizedValue = normalizeInputValue(value);
    const matchingSuggestion = findCaseInsensitiveMatch(
      existingTags,
      normalizedValue,
    );
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

    setSelectedIngredients((currentIngredients) => [
      ...currentIngredients,
      nextValue,
    ]);
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
      <AiRecipeImportPanel onApplyDraft={applyAiDraft} />

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
              label="Recipe title"
              name="title"
              onChange={(event) => updateFormValue("title", event.target.value)}
              placeholder="Grilled chicken rice bowls"
              required
              value={formValues.title}
            />
            <TextField
              helperText="Optional."
              label="Source URL"
              name="sourceUrl"
              onChange={(event) =>
                updateFormValue("sourceUrl", event.target.value)
              }
              placeholder="https://example.com/recipe"
              type="url"
              value={formValues.sourceUrl}
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
                          currentTags.filter(
                            (currentTag) => currentTag !== tag,
                          ),
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
            <h2 className="text-h2 text-foreground">
              Macros and characteristics
            </h2>
            <p className="text-body text-foreground-muted">
              Fill in the numbers and descriptors you want to keep with the
              recipe.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <SelectInput
              label="Primary protein"
              name="primaryProtein"
              onChange={(event) =>
                updateFormValue("primaryProtein", event.target.value)
              }
              options={[...proteinOptions]}
              placeholder="Choose protein"
              required
              value={formValues.primaryProtein}
            />
            <SelectInput
              label="Cuisine"
              name="cuisine"
              onChange={(event) =>
                updateFormValue("cuisine", event.target.value)
              }
              options={[...cuisineOptions]}
              placeholder="Choose cuisine"
              required
              value={formValues.cuisine}
            />
            <TextField
              label="Prep time (minutes)"
              min={1}
              name="prepMinutes"
              onChange={(event) =>
                updateFormValue("prepMinutes", event.target.value)
              }
              placeholder="35"
              required
              type="number"
              value={formValues.prepMinutes}
            />
            <TextField
              label="Servings"
              min={1}
              name="servings"
              onChange={(event) =>
                updateFormValue("servings", event.target.value)
              }
              placeholder="4"
              required
              type="number"
              value={formValues.servings}
            />
            <TextField
              label="Total calories"
              min={1}
              name="totalCalories"
              onChange={(event) =>
                updateFormValue("totalCalories", event.target.value)
              }
              placeholder="1800"
              required
              type="number"
              value={formValues.totalCalories}
            />
            <TextField
              label="Calories per serving"
              min={1}
              name="caloriesPerServing"
              onChange={(event) =>
                updateFormValue("caloriesPerServing", event.target.value)
              }
              placeholder="450"
              required
              type="number"
              value={formValues.caloriesPerServing}
            />
            <TextField
              label="Protein per serving (g)"
              min={1}
              name="proteinGrams"
              onChange={(event) =>
                updateFormValue("proteinGrams", event.target.value)
              }
              placeholder="38"
              required
              type="number"
              value={formValues.proteinGrams}
            />
            <TextField
              label="Carbs per serving (g)"
              min={1}
              name="carbGrams"
              onChange={(event) =>
                updateFormValue("carbGrams", event.target.value)
              }
              placeholder="42"
              required
              type="number"
              value={formValues.carbGrams}
            />
            <TextField
              label="Fat per serving (g)"
              min={1}
              name="fatGrams"
              onChange={(event) =>
                updateFormValue("fatGrams", event.target.value)
              }
              placeholder="14"
              required
              type="number"
              value={formValues.fatGrams}
            />
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-6 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-h2 text-foreground">
            Ingredients and preparation
          </h2>
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

          <div className="xl:border-background-light space-y-6 xl:border-l xl:pl-10">
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
                      <span className="text-body text-foreground">
                        {ingredient}
                      </span>
                      <button
                        aria-label={`Remove ingredient ${ingredient}`}
                        className="text-foreground-muted hover:text-foreground inline-flex items-center justify-center transition-colors duration-200"
                        onClick={() =>
                          setSelectedIngredients((currentIngredients) =>
                            currentIngredients.filter(
                              (currentIngredient) =>
                                currentIngredient !== ingredient,
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
                      <span className="text-primary flex size-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-semibold">
                        {index + 1}
                      </span>
                      <p className="text-body text-foreground min-w-0 flex-1">
                        {step}
                      </p>
                      <button
                        aria-label={`Remove step ${index + 1}`}
                        className="text-foreground-muted hover:text-foreground inline-flex items-center justify-center transition-colors duration-200"
                        onClick={() =>
                          setSteps((currentSteps) =>
                            currentSteps.filter(
                              (_, currentIndex) => currentIndex !== index,
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
                <EmptyListState>No steps added yet.</EmptyListState>
              )}
            </section>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="text-primary rounded-full bg-[hsl(var(--primary)/0.12)] p-3">
            <BookOpenText className="size-5" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <p className="text-title text-foreground">Ready to save?</p>
            <p className="text-caption text-foreground-muted">
              Check the details, then save the recipe.
            </p>
          </div>
        </div>

        <Button
          icon={<ArrowRight className="size-5" strokeWidth={2.2} />}
          type="submit"
        >
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
        <input
          key={`step-${index + 1}`}
          name="steps"
          type="hidden"
          value={step}
        />
      ))}
    </>
  );
}
