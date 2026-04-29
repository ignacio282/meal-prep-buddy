"use client";

import { useState } from "react";

import { Check, Send, Sparkles, X } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { TextAreaComposer } from "@/components/ui/text-area-composer";
import type {
  AiRecipeDraft,
  AiRecipeParseResponse,
} from "@/features/recipes/ai-ingestion-schema";

type AiRecipeImportPanelProps = Readonly<{
  onApplyDraft: (draft: AiRecipeDraft) => void;
}>;

type AiIngestErrorResponse = Readonly<{
  error?: string;
}>;

function getDraftSummary(draft: AiRecipeDraft) {
  return [
    draft.title,
    draft.servings ? `${draft.servings} servings` : null,
    draft.caloriesPerServing
      ? `${draft.caloriesPerServing} cal / serving`
      : null,
    draft.proteinGrams ? `${draft.proteinGrams}g protein` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

export function AiRecipeImportPanel({
  onApplyDraft,
}: AiRecipeImportPanelProps) {
  const [open, setOpen] = useState(false);
  const [recipeText, setRecipeText] = useState("");
  const [result, setResult] = useState<AiRecipeParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const trimmedRecipeText = recipeText.trim();
  const canSubmit = trimmedRecipeText.length >= 30 && !submitting;

  async function parseRecipe() {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/recipes/ai-ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeText: trimmedRecipeText,
        }),
      });

      if (!response.ok) {
        const payload = (await response
          .json()
          .catch(() => ({}))) as AiIngestErrorResponse;

        throw new Error(payload.error || "AI recipe import failed.");
      }

      const payload = (await response.json()) as AiRecipeParseResponse;

      setResult(payload);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "AI recipe import failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function closePanel() {
    setOpen(false);
  }

  function applyDraft() {
    if (!result) {
      return;
    }

    onApplyDraft(result.draft);
    closePanel();
  }

  return (
    <>
      <SurfaceCard className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="text-primary rounded-full bg-[hsl(var(--primary)/0.12)] p-3">
            <Sparkles className="size-5" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <p className="text-title text-foreground">
              Experimental AI import
            </p>
            <p className="text-caption text-foreground-muted">
              Paste recipe text, then review the draft before saving.
            </p>
          </div>
        </div>

        <Button
          icon={<Sparkles className="size-4" strokeWidth={2.2} />}
          onClick={() => setOpen(true)}
          type="button"
          variant="secondary"
        >
          Try AI import
        </Button>
      </SurfaceCard>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[hsl(var(--foreground)/0.18)] px-4 py-4 backdrop-blur-sm sm:items-center sm:py-8">
          <SurfaceCard
            aria-modal="true"
            className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto p-6 sm:p-8"
            role="dialog"
          >
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-h2 text-foreground">AI recipe import</p>
                  <p className="text-body text-foreground-muted">
                    Send the recipe in your own words. The draft will stay
                    editable after you apply it.
                  </p>
                </div>

                <button
                  aria-label="Close AI recipe import"
                  className="text-foreground-muted hover:text-foreground inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors"
                  onClick={closePanel}
                  type="button"
                >
                  <X className="size-5" strokeWidth={2.2} />
                </button>
              </div>

              <div className="bg-background-light rounded-xl p-4">
                <TextAreaComposer
                  disabled={submitting}
                  label="Recipe message"
                  onChange={(event) => setRecipeText(event.target.value)}
                  placeholder="Paste the recipe, notes, ingredients, steps, and any nutrition details you trust."
                  value={recipeText}
                />
              </div>

              {error ? (
                <AlertBanner title="AI import unavailable" tone="warning">
                  {error}
                </AlertBanner>
              ) : null}

              {result ? (
                <div className="bg-background-light space-y-4 rounded-xl p-4">
                  <div className="space-y-1">
                    <p className="text-title text-foreground">
                      Extracted draft
                    </p>
                    <p className="text-caption text-foreground-muted">
                      {getDraftSummary(result.draft) ||
                        "Review the extracted recipe fields before applying."}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-caption text-foreground font-semibold">
                        Ingredients
                      </p>
                      <p className="text-caption text-foreground-muted">
                        {result.draft.ingredients.length} extracted
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-caption text-foreground font-semibold">
                        Steps
                      </p>
                      <p className="text-caption text-foreground-muted">
                        {result.draft.steps.length} extracted
                      </p>
                    </div>
                  </div>

                  {result.confidenceNotes.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-caption text-foreground font-semibold">
                        Confidence notes
                      </p>
                      <ul className="text-caption text-foreground-muted list-disc space-y-1 pl-4">
                        {result.confidenceNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {result.questions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-caption text-foreground font-semibold">
                        Questions to review
                      </p>
                      <ul className="text-caption text-foreground-muted list-disc space-y-1 pl-4">
                        {result.questions.map((question) => (
                          <li key={question}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button onClick={closePanel} type="button" variant="tertiary">
                  Cancel
                </Button>
                {result ? (
                  <Button
                    icon={<Check className="size-4" strokeWidth={2.2} />}
                    onClick={applyDraft}
                    type="button"
                  >
                    Apply draft
                  </Button>
                ) : (
                  <Button
                    disabled={!canSubmit}
                    icon={<Send className="size-4" strokeWidth={2.2} />}
                    onClick={parseRecipe}
                    type="button"
                  >
                    {submitting ? "Reading recipe..." : "Send to AI"}
                  </Button>
                )}
              </div>
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </>
  );
}
