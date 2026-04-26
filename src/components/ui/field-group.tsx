import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FieldVisualState = "default" | "hover" | "focus";

type FieldGroupProps = Readonly<{
  children: ReactNode;
  errorText?: string;
  helperText?: string;
  label?: string;
}>;

export function fieldChromeClassName({
  disabled = false,
  invalid = false,
  visualState = "default",
}: {
  disabled?: boolean;
  invalid?: boolean;
  visualState?: FieldVisualState;
}) {
  return cn(
    "bg-background-light border-background-light text-foreground flex min-h-12 items-center rounded-md border px-3 transition-all duration-200",
    !disabled && "hover:bg-surface hover:border-[hsl(var(--primary)/0.35)]",
    visualState === "hover" && "bg-surface border-[hsl(var(--primary)/0.35)]",
    (visualState === "focus" || invalid) &&
      "border-primary shadow-[0_0_0_3px_hsl(var(--ring)/0.18)]",
    invalid &&
      "border-danger shadow-[0_0_0_3px_hsl(var(--danger)/0.14)] focus-within:border-danger",
    disabled && "bg-surface-subtle text-foreground-muted opacity-70",
  );
}

export function FieldGroup({
  children,
  errorText,
  helperText,
  label,
}: FieldGroupProps) {
  return (
    <div className="space-y-1">
      {label ? (
        <label className="text-caption text-foreground">{label}</label>
      ) : null}
      {children}
      {errorText ? (
        <p className="text-caption text-danger">{errorText}</p>
      ) : helperText ? (
        <p className="text-caption text-foreground-muted">{helperText}</p>
      ) : null}
    </div>
  );
}

export type { FieldVisualState };
