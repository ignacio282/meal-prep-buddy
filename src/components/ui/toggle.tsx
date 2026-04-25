import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ToggleProps = Readonly<{
  checked?: boolean;
  description?: string;
  label: string;
  leading?: ReactNode;
}>;

export function Toggle({
  checked = false,
  description,
  label,
  leading,
}: ToggleProps) {
  return (
    <div className="bg-background-light flex items-center justify-between gap-4 rounded-xl px-4 py-3">
      <div className="flex items-start gap-2">
        {leading ? <span className="text-primary mt-1">{leading}</span> : null}
        <div className="space-y-1">
          <p className="text-title text-foreground">{label}</p>
          {description ? (
            <p className="text-caption text-foreground-muted">{description}</p>
          ) : null}
        </div>
      </div>

      <div
        aria-checked={checked}
        aria-label={label}
        className={cn(
          "flex h-7 w-12 items-center rounded-full p-1 transition-colors duration-200",
          checked ? "bg-primary justify-end" : "bg-surface-subtle justify-start",
        )}
        role="switch"
      >
        <span className="bg-background-light block size-5 rounded-full" />
      </div>
    </div>
  );
}
