import type { ComponentType, ReactNode } from "react";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type AlertTone = "info" | "success" | "warning";

type AlertBannerProps = Readonly<{
  children: ReactNode;
  title: string;
  tone?: AlertTone;
}>;

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

const alertToneStyles: Record<
  AlertTone,
  { className: string; icon: IconComponent }
> = {
  info: {
    className: "bg-[hsl(var(--info)/0.09)] text-info border-[hsl(var(--info)/0.18)]",
    icon: Info,
  },
  success: {
    className:
      "bg-[hsl(var(--success)/0.09)] text-success border-[hsl(var(--success)/0.18)]",
    icon: CheckCircle2,
  },
  warning: {
    className:
      "bg-[hsl(var(--warning)/0.09)] text-warning border-[hsl(var(--warning)/0.18)]",
    icon: AlertTriangle,
  },
};

export function AlertBanner({
  children,
  title,
  tone = "info",
}: AlertBannerProps) {
  const { className, icon: Icon } = alertToneStyles[tone];

  return (
    <div className={cn("rounded-xl border px-4 py-3", className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={2.2} />
        <div className="space-y-1">
          <p className="text-title">{title}</p>
          <p className="text-caption">{children}</p>
        </div>
      </div>
    </div>
  );
}
