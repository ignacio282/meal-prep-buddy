import type { ComponentType, ReactNode } from "react";

import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type StatusTone = "info" | "success" | "warning" | "highlight";

type StatusBadgeProps = Readonly<{
  children: ReactNode;
  tone?: StatusTone;
}>;

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

const toneStyles: Record<
  StatusTone,
  { className: string; icon: IconComponent }
> = {
  info: {
    className: "bg-[hsl(var(--info)/0.12)] text-info",
    icon: Info,
  },
  success: {
    className: "bg-[hsl(var(--success)/0.12)] text-success",
    icon: CheckCircle2,
  },
  warning: {
    className: "bg-[hsl(var(--warning)/0.12)] text-warning",
    icon: AlertTriangle,
  },
  highlight: {
    className: "bg-[hsl(var(--primary)/0.12)] text-primary",
    icon: Sparkles,
  },
};

export function StatusBadge({
  children,
  tone = "info",
}: StatusBadgeProps) {
  const { className, icon: Icon } = toneStyles[tone];

  return (
    <span
      className={cn(
        "text-caption inline-flex items-center gap-2 rounded-full px-3 py-2",
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.2} />
      <span>{children}</span>
    </span>
  );
}
