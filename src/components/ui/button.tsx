import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "icon";
type ButtonVisualState = "default" | "hover" | "focus";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  visualState?: ButtonVisualState;
};

const sharedButtonClasses =
  "text-button inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-55";

const visualStateClasses: Record<ButtonVisualState, string> = {
  default: "",
  hover: "translate-y-[-1px]",
  focus: "border-primary shadow-[0_0_0_3px_hsl(var(--ring)/0.18)]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-foreground-white rounded-full px-4 hover:translate-y-[-1px]",
  secondary:
    "text-primary border-primary rounded-full border bg-transparent px-4 hover:bg-[hsl(var(--primary)/0.08)]",
  tertiary:
    "text-foreground rounded-md px-4 hover:bg-[hsl(var(--foreground)/0.04)]",
  icon: "bg-background-light border-background-light text-foreground rounded-full border p-0 hover:translate-y-[-1px] size-10",
};

export function Button({
  children,
  className,
  disabled,
  icon,
  type = "button",
  variant = "primary",
  visualState = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        sharedButtonClasses,
        variantClasses[variant],
        visualStateClasses[visualState],
        disabled &&
          "bg-surface-subtle border-background-light text-foreground-muted shadow-none",
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children ? <span>{children}</span> : null}
      {icon}
    </button>
  );
}
