"use client";

import { startTransition, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  ExternalLink,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SelectInput } from "@/components/ui/select-input";
import { TextAreaComposer } from "@/components/ui/text-area-composer";
import { TextField } from "@/components/ui/text-field";
import { cn } from "@/lib/utils/cn";

import {
  activityPerWeekOptions,
  foodPreferenceSuggestions,
  mealsPerDayOptions,
  sexOptions,
  weekdayOptions,
} from "./constants";
import {
  onboardingMealPrepSchema,
  onboardingNutritionSchema,
  onboardingPreferencesSchema,
  onboardingProfileSchema,
} from "./schema";

type StepId = "profile" | "nutrition" | "preferences";

type OnboardingDraft = {
  age: string;
  sex: string;
  heightUnit: "imperial" | "metric";
  heightFeet: string;
  heightInches: string;
  heightCentimeters: string;
  initialWeight: string;
  weightUnit: "lb" | "kg";
  activityPerWeek: string;
  calorieTarget: string;
  mealsPerDay: string;
  likedFoodTags: string[];
  likedFoodInput: string;
  likedFoodNotes: string;
  dislikedFoods: string;
  dietaryRestrictions: string;
  cookDays: string[];
};

type ValidationErrors = Record<string, string>;

const steps = [
  {
    id: "profile",
    eyebrow: "Step 1",
    title: "Tell us about your defaults",
    description:
      "A few profile details help the dashboard feel grounded in your actual routine from the first recipe you save.",
    icon: Target,
  },
  {
    id: "nutrition",
    eyebrow: "Step 2",
    title: "Set your nutrition target",
    description:
      "Keep this practical. The app only needs the calorie target and meal cadence you want recipes to support.",
    icon: Sparkles,
  },
  {
    id: "preferences",
    eyebrow: "Step 3",
    title: "Define your meal prep preferences",
    description:
      "Save the foods you like, what to avoid, and your best cooking days so later flows can reuse them automatically.",
    icon: CalendarDays,
  },
] as const;

const defaultDraft: OnboardingDraft = {
  age: "",
  sex: "female",
  heightUnit: "imperial",
  heightFeet: "",
  heightInches: "",
  heightCentimeters: "",
  initialWeight: "",
  weightUnit: "lb",
  activityPerWeek: "1-2",
  calorieTarget: "",
  mealsPerDay: "3",
  likedFoodTags: [],
  likedFoodInput: "",
  likedFoodNotes: "",
  dislikedFoods: "",
  dietaryRestrictions: "",
  cookDays: ["sunday"],
};

function mapErrors(fieldErrors: Record<string, string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter((entry): entry is [string, string[]] => Boolean(entry[1]?.[0]))
      .map(([key, value]) => [key, value[0]]),
  );
}

function getStepForField(fieldName: string | undefined): StepId {
  if (!fieldName) {
    return "preferences";
  }

  if (
    [
      "age",
      "sex",
      "heightUnit",
      "heightFeet",
      "heightInches",
      "heightCentimeters",
      "initialWeight",
      "weightUnit",
      "activityPerWeek",
    ].includes(fieldName)
  ) {
    return "profile";
  }

  if (["calorieTarget", "mealsPerDay"].includes(fieldName)) {
    return "nutrition";
  }

  return "preferences";
}

function SegmentedControl<TValue extends string>({
  onChange,
  options,
  value,
}: Readonly<{
  onChange: (nextValue: TValue) => void;
  options: ReadonlyArray<{ label: string; value: TValue }>;
  value: TValue;
}>) {
  return (
    <div className="bg-background-light inline-flex w-fit items-center gap-1 rounded-full p-1">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            className={cn(
              "text-button rounded-full px-4 py-2 transition-colors duration-200",
              selected
                ? "bg-primary text-foreground-white"
                : "text-foreground-muted hover:text-foreground",
            )}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function DesktopStepRail({
  currentStep,
}: Readonly<{
  currentStep: StepId;
}>) {
  const activeIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const active = step.id === currentStep;
        const completed = index < activeIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border text-sm font-semibold",
                  active || completed
                    ? "text-foreground-white border-[hsl(var(--foreground-white)/0.88)] bg-[hsl(var(--foreground-white)/0.12)]"
                    : "border-[hsl(var(--foreground-white)/0.34)] text-[hsl(var(--foreground-white)/0.72)]",
                )}
              >
                {completed ? (
                  <Check className="size-4" strokeWidth={2.6} />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 ? (
                <span className="mt-2 block h-12 w-px bg-[hsl(var(--foreground-white)/0.24)]" />
              ) : null}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "size-4",
                    active
                      ? "text-foreground-white"
                      : "text-[hsl(var(--foreground-white)/0.72)]",
                  )}
                  strokeWidth={2.1}
                />
                <p className="text-caption text-[hsl(var(--foreground-white)/0.76)]">
                  {step.eyebrow}
                </p>
              </div>
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-title",
                    active
                      ? "text-foreground-white"
                      : "text-[hsl(var(--foreground-white)/0.78)]",
                  )}
                >
                  {step.title}
                </p>
                <p className="text-caption max-w-[14rem] text-[hsl(var(--foreground-white)/0.62)]">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MobileStepRail({
  currentStep,
}: Readonly<{
  currentStep: StepId;
}>) {
  const activeIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex items-center gap-3 lg:hidden">
      {steps.map((step, index) => {
        const active = step.id === currentStep;
        const completed = index < activeIndex;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full border text-sm font-semibold",
                active || completed
                  ? "border-primary text-primary bg-[hsl(var(--primary)/0.12)]"
                  : "border-background-light bg-background text-foreground-muted",
              )}
            >
              {completed ? (
                <Check className="size-4" strokeWidth={2.4} />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 ? (
              <span className="bg-background-light block h-px w-8" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function WeekdayPicker({
  onToggle,
  selectedValues,
}: Readonly<{
  onToggle: (value: string) => void;
  selectedValues: string[];
}>) {
  return (
    <div className="flex flex-wrap gap-3">
      {weekdayOptions.map((option) => {
        const selected = selectedValues.includes(option.value);

        return (
          <button
            key={option.value}
            className={cn(
              "text-button min-w-[4.5rem] rounded-full px-4 py-2 transition-colors duration-200",
              selected
                ? "bg-primary text-foreground-white"
                : "bg-background-light text-foreground hover:text-primary",
            )}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function TagInput({
  inputValue,
  onAdd,
  onChange,
  onRemove,
  tags,
}: Readonly<{
  inputValue: string;
  onAdd: (value: string) => void;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  tags: string[];
}>) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        {foodPreferenceSuggestions.map((suggestion) => {
          const selected = tags.includes(suggestion);

          return (
            <button
              key={suggestion}
              className={cn(
                "text-button rounded-full px-4 py-2 transition-colors duration-200",
                selected
                  ? "bg-primary text-foreground-white"
                  : "bg-background-light text-foreground hover:text-primary",
              )}
              onClick={() => onAdd(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="text-body bg-background-light placeholder:text-foreground-muted min-h-12 flex-1 rounded-md px-4 transition-colors duration-200 outline-none focus:ring-0"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd(inputValue);
            }
          }}
          placeholder="Add another food preference"
          value={inputValue}
        />
        <Button
          className="sm:px-5"
          icon={<ArrowRight className="size-5" strokeWidth={2.2} />}
          onClick={() => onAdd(inputValue)}
          variant="secondary"
        >
          Add
        </Button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <button key={tag} onClick={() => onRemove(tag)} type="button">
              <Chip removable selected>
                {tag}
              </Chip>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepId>("profile");
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentStepIndex = useMemo(
    () => steps.findIndex((step) => step.id === currentStep),
    [currentStep],
  );

  const currentStepContent = steps[currentStepIndex];

  function updateDraft<K extends keyof OnboardingDraft>(
    key: K,
    value: OnboardingDraft[K],
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
  }

  function validateCurrentStep() {
    const stepPayload = {
      age: draft.age,
      sex: draft.sex,
      heightUnit: draft.heightUnit,
      heightFeet: draft.heightFeet,
      heightInches: draft.heightInches,
      heightCentimeters: draft.heightCentimeters,
      initialWeight: draft.initialWeight,
      weightUnit: draft.weightUnit,
      activityPerWeek: draft.activityPerWeek,
      calorieTarget: draft.calorieTarget,
      mealsPerDay: draft.mealsPerDay,
      likedFoodTags: draft.likedFoodTags,
      likedFoodNotes: draft.likedFoodNotes,
      dislikedFoods: draft.dislikedFoods,
      dietaryRestrictions: draft.dietaryRestrictions,
      cookDays: draft.cookDays,
    };

    const schema =
      currentStep === "profile"
        ? onboardingProfileSchema
        : currentStep === "nutrition"
          ? onboardingNutritionSchema
          : onboardingMealPrepSchema;

    const parsed = schema.safeParse(stepPayload);

    if (!parsed.success) {
      const fieldErrors = mapErrors(parsed.error.flatten().fieldErrors);
      setErrors(fieldErrors);
      setCurrentStep(getStepForField(Object.keys(fieldErrors)[0]));
      return false;
    }

    setErrors({});
    return true;
  }

  function toggleCookDay(day: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      cookDays: currentDraft.cookDays.includes(day)
        ? currentDraft.cookDays.filter((item) => item !== day)
        : [...currentDraft.cookDays, day],
    }));
  }

  function addFoodTag(tag: string) {
    const normalizedTag = tag.trim();

    if (!normalizedTag) {
      return;
    }

    setDraft((currentDraft) => ({
      ...currentDraft,
      likedFoodTags: currentDraft.likedFoodTags.includes(normalizedTag)
        ? currentDraft.likedFoodTags
        : [...currentDraft.likedFoodTags, normalizedTag],
      likedFoodInput: "",
    }));
  }

  function removeFoodTag(tag: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      likedFoodTags: currentDraft.likedFoodTags.filter((item) => item !== tag),
    }));
  }

  function goToNextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    setCurrentStep(steps[currentStepIndex + 1]?.id ?? currentStep);
  }

  async function handleSubmit() {
    const payload = {
      age: draft.age,
      sex: draft.sex,
      heightUnit: draft.heightUnit,
      heightFeet: draft.heightFeet,
      heightInches: draft.heightInches,
      heightCentimeters: draft.heightCentimeters,
      initialWeight: draft.initialWeight,
      weightUnit: draft.weightUnit,
      activityPerWeek: draft.activityPerWeek,
      calorieTarget: draft.calorieTarget,
      mealsPerDay: draft.mealsPerDay,
      likedFoodTags: draft.likedFoodTags,
      likedFoodNotes: draft.likedFoodNotes,
      dislikedFoods: draft.dislikedFoods,
      dietaryRestrictions: draft.dietaryRestrictions,
      cookDays: draft.cookDays,
    };

    const parsedPayload = onboardingPreferencesSchema.safeParse(payload);

    if (!parsedPayload.success) {
      const fieldErrors = mapErrors(parsedPayload.error.flatten().fieldErrors);
      setErrors(fieldErrors);
      setCurrentStep(getStepForField(Object.keys(fieldErrors)[0]));
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        body: JSON.stringify(parsedPayload.data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const responsePayload = (await response.json()) as {
          errors?: {
            fieldErrors?: Record<string, string[] | undefined>;
          };
        };

        const fieldErrors = mapErrors(
          responsePayload.errors?.fieldErrors ?? {},
        );
        setErrors(fieldErrors);
        setCurrentStep(getStepForField(Object.keys(fieldErrors)[0]));
        setSubmitError("We could not save your onboarding details yet.");
        return;
      }

      startTransition(() => {
        router.push("/app");
        router.refresh();
      });
    } catch {
      setSubmitError(
        "Something went wrong while saving your onboarding details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[24rem_minmax(0,1fr)]">
      <aside className="bg-primary relative hidden overflow-hidden lg:flex lg:flex-col">
        <div className="text-foreground-white relative z-10 flex h-full flex-col px-8 py-10">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[hsl(var(--foreground-white)/0.12)]">
              <ChefHat className="size-6" strokeWidth={2.2} />
            </div>
            <div className="space-y-1">
              <p className="text-caption text-[hsl(var(--foreground-white)/0.72)]">
                Meal Prep Buddy
              </p>
              <p className="text-title text-foreground-white">
                First-time setup
              </p>
            </div>
          </div>

          <div className="mt-14 space-y-4">
            <p className="text-caption text-[hsl(var(--foreground-white)/0.72)]">
              Set up once, reuse every week
            </p>
            <h1 className="font-hero text-foreground-white text-[2.5rem] leading-[1.08] font-extrabold">
              Build the defaults that keep meal prep practical.
            </h1>
            <p className="text-body max-w-[18rem] text-[hsl(var(--foreground-white)/0.76)]">
              This setup gives future recipe ingestion, library browsing, and
              weekly planning a stable starting point.
            </p>
          </div>

          <div className="mt-14 flex-1">
            <DesktopStepRail currentStep={currentStep} />
          </div>

          <div className="space-y-3">
            <p className="text-caption text-[hsl(var(--foreground-white)/0.72)]">
              Current focus
            </p>
            <p className="text-title text-foreground-white">
              {currentStepContent.title}
            </p>
            <p className="text-body max-w-[18rem] text-[hsl(var(--foreground-white)/0.72)]">
              {currentStepContent.description}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute right-[-5rem] bottom-[-7rem] size-[20rem] rounded-full border border-[hsl(var(--foreground-white)/0.16)] bg-[radial-gradient(circle_at_center,hsl(var(--foreground-white)/0.22),transparent_68%)]" />
        <div className="pointer-events-none absolute bottom-16 left-[-4rem] size-32 rounded-full border border-[hsl(var(--foreground-white)/0.1)] bg-[hsl(var(--foreground-white)/0.06)]" />
      </aside>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-[38rem]">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-foreground-white flex size-10 items-center justify-center rounded-2xl">
                  <ChefHat className="size-5" strokeWidth={2.2} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-caption text-foreground-muted">
                    Meal Prep Buddy
                  </p>
                  <p className="text-title text-foreground">First-time setup</p>
                </div>
              </div>
              <p className="text-caption text-foreground-muted">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>

            <MobileStepRail currentStep={currentStep} />

            <div className="space-y-3">
              <p className="text-caption text-primary">
                {currentStepContent.eyebrow}
              </p>
              <h2 className="text-foreground font-hero text-[2.5rem] leading-[1.08] font-extrabold sm:text-[2.9rem]">
                {currentStepContent.title}
              </h2>
              <p className="text-body text-foreground-muted max-w-[34rem]">
                {currentStepContent.description}
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-10">
            {currentStep === "profile" ? (
              <div className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    errorText={errors.age}
                    label="Age"
                    min={13}
                    onChange={(event) => updateDraft("age", event.target.value)}
                    placeholder="28"
                    type="number"
                    value={draft.age}
                  />
                  <SelectInput
                    errorText={errors.sex}
                    label="Sex"
                    onChange={(event) => updateDraft("sex", event.target.value)}
                    options={[...sexOptions]}
                    value={draft.sex}
                  />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-caption text-foreground">Height</p>
                    <SegmentedControl
                      onChange={(nextValue) => {
                        updateDraft("heightUnit", nextValue);
                        updateDraft(
                          "weightUnit",
                          nextValue === "metric" ? "kg" : "lb",
                        );
                      }}
                      options={[
                        { label: "Imperial", value: "imperial" },
                        { label: "Metric", value: "metric" },
                      ]}
                      value={draft.heightUnit}
                    />
                  </div>

                  {draft.heightUnit === "imperial" ? (
                    <div className="grid gap-6 sm:grid-cols-2">
                      <TextField
                        errorText={errors.heightFeet}
                        label="Feet"
                        onChange={(event) =>
                          updateDraft("heightFeet", event.target.value)
                        }
                        placeholder="5"
                        type="number"
                        value={draft.heightFeet}
                      />
                      <TextField
                        errorText={errors.heightInches}
                        label="Inches"
                        onChange={(event) =>
                          updateDraft("heightInches", event.target.value)
                        }
                        placeholder="10"
                        type="number"
                        value={draft.heightInches}
                      />
                    </div>
                  ) : (
                    <TextField
                      errorText={errors.heightCentimeters}
                      label="Height in centimeters"
                      onChange={(event) =>
                        updateDraft("heightCentimeters", event.target.value)
                      }
                      placeholder="178"
                      type="number"
                      value={draft.heightCentimeters}
                    />
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <TextField
                    errorText={errors.initialWeight}
                    label="Initial weight"
                    onChange={(event) =>
                      updateDraft("initialWeight", event.target.value)
                    }
                    placeholder={draft.weightUnit === "lb" ? "185" : "84"}
                    type="number"
                    value={draft.initialWeight}
                  />
                  <div className="space-y-2">
                    <p className="text-caption text-foreground">Unit</p>
                    <SegmentedControl
                      onChange={(nextValue) =>
                        updateDraft("weightUnit", nextValue)
                      }
                      options={[
                        { label: "lb", value: "lb" },
                        { label: "kg", value: "kg" },
                      ]}
                      value={draft.weightUnit}
                    />
                  </div>
                </div>

                <SelectInput
                  errorText={errors.activityPerWeek}
                  helperText="A simple range is enough for the first planning version."
                  label="How many times do you exercise per week?"
                  onChange={(event) =>
                    updateDraft("activityPerWeek", event.target.value)
                  }
                  options={[...activityPerWeekOptions]}
                  value={draft.activityPerWeek}
                />
              </div>
            ) : null}

            {currentStep === "nutrition" ? (
              <div className="space-y-8">
                <TextField
                  errorText={errors.calorieTarget}
                  helperText="Use the daily calorie number you want meal prep to support."
                  label="Calorie target"
                  onChange={(event) =>
                    updateDraft("calorieTarget", event.target.value)
                  }
                  placeholder="2150"
                  type="number"
                  value={draft.calorieTarget}
                />

                <SelectInput
                  errorText={errors.mealsPerDay}
                  helperText="This helps the app think in portions and prep cadence."
                  label="How many times do you eat per day?"
                  onChange={(event) =>
                    updateDraft("mealsPerDay", event.target.value)
                  }
                  options={[...mealsPerDayOptions]}
                  value={draft.mealsPerDay}
                />

                <div className="space-y-3 rounded-xl bg-[hsl(var(--background-light)/0.7)] px-5 py-4">
                  <p className="text-title text-foreground">
                    Need help finding your calorie target?
                  </p>
                  <p className="text-body text-foreground-muted">
                    Use a calorie calculator first, then come back and enter the
                    target you want this app to support.
                  </p>
                  <Link
                    className="text-button text-primary inline-flex items-center gap-2"
                    href="https://www.calculator.net/calorie-calculator.html"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>Open calorie calculator</span>
                    <ExternalLink className="size-4" strokeWidth={2.2} />
                  </Link>
                </div>
              </div>
            ) : null}

            {currentStep === "preferences" ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-caption text-foreground">
                    Foods you like to eat
                  </p>
                  <TagInput
                    inputValue={draft.likedFoodInput}
                    onAdd={addFoodTag}
                    onChange={(value) => updateDraft("likedFoodInput", value)}
                    onRemove={removeFoodTag}
                    tags={draft.likedFoodTags}
                  />
                </div>

                <TextAreaComposer
                  helperText="Optional notes for cuisines, meal styles, or foods you prefer to prep often."
                  label="Food preference notes"
                  onChange={(event) =>
                    updateDraft("likedFoodNotes", event.target.value)
                  }
                  placeholder="I usually prefer high-protein bowls, wraps, pasta, and easy chicken meals."
                  rows={4}
                  value={draft.likedFoodNotes}
                />

                <TextAreaComposer
                  helperText="Foods you want the app to avoid recommending or prioritizing."
                  label="Foods to avoid"
                  onChange={(event) =>
                    updateDraft("dislikedFoods", event.target.value)
                  }
                  placeholder="Mushrooms, olives, very spicy sauces..."
                  rows={3}
                  value={draft.dislikedFoods}
                />

                <TextAreaComposer
                  helperText="Dietary restrictions or non-negotiables."
                  label="Dietary restrictions"
                  onChange={(event) =>
                    updateDraft("dietaryRestrictions", event.target.value)
                  }
                  placeholder="Lactose-sensitive, gluten-free, halal..."
                  rows={3}
                  value={draft.dietaryRestrictions}
                />

                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-caption text-foreground">
                      Best days to cook
                    </p>
                    <p className="text-body text-foreground-muted">
                      Pick the days when meal prep is most realistic for you.
                    </p>
                  </div>
                  <WeekdayPicker
                    onToggle={toggleCookDay}
                    selectedValues={draft.cookDays}
                  />
                  {errors.cookDays ? (
                    <p className="text-caption text-danger">
                      {errors.cookDays}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {submitError ? (
              <div className="text-danger rounded-xl bg-[hsl(var(--danger)/0.08)] px-4 py-3">
                <p className="text-body">{submitError}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[hsl(var(--foreground)/0.08)] pt-8">
              <Button
                className="px-4"
                disabled={currentStepIndex === 0 || isSubmitting}
                icon={<ArrowLeft className="size-5" strokeWidth={2.2} />}
                onClick={() =>
                  setCurrentStep(steps[currentStepIndex - 1]?.id ?? currentStep)
                }
                variant="secondary"
              >
                Back
              </Button>

              <div className="flex items-center gap-4">
                <p className="text-caption text-foreground-muted hidden sm:block">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
                {currentStepIndex < steps.length - 1 ? (
                  <Button
                    className="px-5"
                    icon={<ArrowRight className="size-5" strokeWidth={2.2} />}
                    onClick={goToNextStep}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    className="px-5"
                    disabled={isSubmitting}
                    icon={<Check className="size-5" strokeWidth={2.2} />}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? "Saving..." : "Save and enter dashboard"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
