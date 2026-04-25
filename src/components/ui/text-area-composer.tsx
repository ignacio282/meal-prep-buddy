import type { TextareaHTMLAttributes } from "react";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import {
  FieldGroup,
  fieldChromeClassName,
  type FieldVisualState,
} from "./field-group";

type TextAreaComposerProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  errorText?: string;
  helperText?: string;
  label?: string;
  visualState?: FieldVisualState;
};

export function TextAreaComposer({
  className,
  disabled,
  errorText,
  helperText,
  label,
  visualState = "default",
  ...props
}: TextAreaComposerProps) {
  return (
    <FieldGroup errorText={errorText} helperText={helperText} label={label}>
      <div
        className={cn(
          fieldChromeClassName({
            disabled,
            invalid: Boolean(errorText),
            visualState,
          }),
          "min-h-36 items-start gap-2 py-3",
        )}
      >
        <Sparkles className="text-primary mt-1 size-5 shrink-0" strokeWidth={2} />
        <textarea
          className={cn(
            "text-body placeholder:text-foreground-muted min-h-28 w-full resize-none bg-transparent outline-none",
            className,
          )}
          disabled={disabled}
          {...props}
        />
      </div>
    </FieldGroup>
  );
}
