import { ArrowRight, Clock3, Heart } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import { Chip } from "./chip";
import { SurfaceCard } from "./surface-card";

type RecipeCardProps = Readonly<{
  calories: string;
  category: string;
  duration: string;
  favorited?: boolean;
  macros: string[];
  secondaryCalories?: string;
  title: string;
  variant?: "full" | "condensed";
}>;

export function RecipeCard({
  calories,
  category,
  duration,
  favorited = false,
  macros,
  secondaryCalories,
  title,
  variant = "full",
}: RecipeCardProps) {
  const fullVariant = variant === "full";

  return (
    <SurfaceCard className="p-6" tone="raised">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-title text-foreground max-w-[18rem]">{title}</h3>
        <span className="text-foreground-muted">
          <Heart
            className={cn("size-5", favorited && "fill-primary text-primary")}
            strokeWidth={2}
          />
        </span>
      </div>

      {fullVariant ? (
        <div className="mt-2 space-y-2">
          <div className="space-y-1">
            <div className="text-body text-foreground flex flex-wrap items-center gap-3">
              <span>{calories}</span>
              {secondaryCalories ? <span>|</span> : null}
              {secondaryCalories ? <span>{secondaryCalories}</span> : null}
            </div>
            <div className="text-caption text-foreground-muted flex flex-wrap items-center gap-2">
              {macros.map((macro, index) => (
                <span key={macro}>
                  {index > 0 ? <span className="mr-2">&bull;</span> : null}
                  {macro}
                </span>
              ))}
            </div>
          </div>

          <div className="text-caption text-foreground-muted flex items-center gap-2">
            <Clock3 className="size-4" strokeWidth={2} />
            <span>{duration}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Chip>{category}</Chip>
            <ArrowRight className="text-foreground size-5" strokeWidth={2.2} />
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="text-caption text-foreground-muted flex flex-wrap items-center gap-2">
            <span>{macros[0]}</span>
            <span>&bull;</span>
            <span>
              {calories}
              {secondaryCalories ? ` | ${secondaryCalories}` : ""}
            </span>
            <span>&bull;</span>
            <span>{duration}</span>
          </div>
          <ArrowRight
            className="text-foreground size-5 shrink-0"
            strokeWidth={2.2}
          />
        </div>
      )}
    </SurfaceCard>
  );
}
