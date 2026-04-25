import type { ReactNode } from "react";

import { ArrowRight } from "lucide-react";

import { Button } from "./button";
import { SurfaceCard } from "./surface-card";

type EmptyStateProps = Readonly<{
  action?: ReactNode;
  actionLabel?: string;
  description: string;
  icon: ReactNode;
  title: string;
}>;

export function EmptyState({
  action,
  actionLabel,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <SurfaceCard className="flex flex-col items-start gap-4 p-6" tone="raised">
      <div className="bg-[hsl(var(--primary)/0.12)] text-primary rounded-full p-3">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-h3 text-foreground">{title}</h3>
        <p className="text-body text-foreground-muted">{description}</p>
      </div>
      {action ? (
        action
      ) : actionLabel ? (
        <Button icon={<ArrowRight className="size-5" strokeWidth={2.2} />}>
          {actionLabel}
        </Button>
      ) : null}
    </SurfaceCard>
  );
}
