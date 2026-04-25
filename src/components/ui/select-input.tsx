import type { SelectHTMLAttributes } from "react";

import { ChevronDown } from "lucide-react";

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

type SelectInputProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  errorText?: string;
  helperText?: string;
  label?: string;
  options: SelectOption[];
  visualState?: FieldVisualState;
};

export function SelectInput({
  className,
  disabled,
  errorText,
  helperText,
  label,
  options,
  visualState = "default",
  ...props
}: SelectInputProps) {
  return (
    <FieldGroup errorText={errorText} helperText={helperText} label={label}>
      <div
        className={fieldChromeClassName({
          disabled,
          invalid: Boolean(errorText),
          visualState,
        })}
      >
        <select
          className={cn(
            "text-body w-full appearance-none bg-transparent outline-none",
            className,
          )}
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="text-foreground size-5 shrink-0" strokeWidth={2} />
      </div>
    </FieldGroup>
  );
}
