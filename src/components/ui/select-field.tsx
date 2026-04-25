import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import {
  FieldGroup,
  fieldChromeClassName,
  type FieldVisualState,
} from "./field-group";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = Readonly<{
  disabled?: boolean;
  helperText?: string;
  label?: string;
  onState?: "closed" | "open";
  options: SelectOption[];
  selectedValue?: string;
  visualState?: FieldVisualState;
}>;

export function SelectField({
  disabled,
  helperText,
  label,
  onState = "closed",
  options,
  selectedValue,
  visualState = "default",
}: SelectFieldProps) {
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  return (
    <FieldGroup helperText={helperText} label={label}>
      <div className="space-y-1">
        <div
          className={fieldChromeClassName({
            disabled,
            visualState: onState === "open" ? "focus" : visualState,
          })}
        >
          <span className="text-body w-full">{selectedOption?.label}</span>
          <ChevronDown
            className={cn(
              "text-foreground size-5 shrink-0 transition-transform duration-200",
              onState === "open" && "rotate-180",
            )}
            strokeWidth={2}
          />
        </div>

        {onState === "open" ? (
          <div className="bg-background-light border-background-light overflow-hidden rounded-md border">
            {options.map((option) => {
              const selected = option.value === selectedValue;

              return (
                <div
                  key={option.value}
                  className={cn(
                    "text-body text-foreground flex min-h-12 items-center justify-between px-3",
                    selected
                      ? "bg-[hsl(var(--primary)/0.1)]"
                      : "hover:bg-[hsl(var(--foreground)/0.03)]",
                  )}
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <Check className="text-primary size-4" strokeWidth={2.4} />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </FieldGroup>
  );
}
