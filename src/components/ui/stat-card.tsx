import type { ReactNode } from "react";

import { SurfaceCard } from "./surface-card";

type StatCardProps = Readonly<{
  detail: string;
  icon?: ReactNode;
  label: string;
  value: string;
}>;

export function StatCard({ detail, icon, label, value }: StatCardProps) {
  return (
    <SurfaceCard className="space-y-2 p-5" tone="raised">
      <div className="flex items-center justify-between gap-2">
        <p className="text-caption text-foreground-muted">{label}</p>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      <div className="space-y-1">
        <p className="text-h2 text-foreground">{value}</p>
        <p className="text-caption text-foreground-muted">{detail}</p>
      </div>
    </SurfaceCard>
  );
}
