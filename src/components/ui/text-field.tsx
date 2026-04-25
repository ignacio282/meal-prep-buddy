import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import {
  FieldGroup,
  fieldChromeClassName,
  type FieldVisualState,
} from "./field-group";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  errorText?: string;
  helperText?: string;
  label?: string;
  visualState?: FieldVisualState;
};

export function TextField({
  className,
  disabled,
  errorText,
  helperText,
  label,
  visualState = "default",
  ...props
}: TextFieldProps) {
  return (
    <FieldGroup errorText={errorText} helperText={helperText} label={label}>
      <div
        className={fieldChromeClassName({
          disabled,
          invalid: Boolean(errorText),
          visualState,
        })}
      >
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
