import type { InputHTMLAttributes } from "react";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import {
  FieldGroup,
  fieldChromeClassName,
  type FieldVisualState,
} from "./field-group";

type SearchFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  helperText?: string;
  label?: string;
  visualState?: FieldVisualState;
};

export function SearchField({
  className,
  disabled,
  helperText,
  label,
  visualState = "default",
  ...props
}: SearchFieldProps) {
  return (
    <FieldGroup helperText={helperText} label={label}>
      <div className={fieldChromeClassName({ disabled, visualState })}>
        <Search className="text-foreground mr-2 size-5 shrink-0" strokeWidth={2} />
        <input
          className={cn(
            "text-body placeholder:text-foreground-muted w-full bg-transparent outline-none",
            className,
          )}
          disabled={disabled}
          {...props}
        />
      </div>
    </FieldGroup>
  );
}
