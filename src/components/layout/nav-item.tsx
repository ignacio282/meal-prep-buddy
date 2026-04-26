import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type NavItemProps = Readonly<{
  active?: boolean;
  icon: ReactNode;
  label: string;
  meta?: string;
}>;

export function NavItem({ active = false, icon, label, meta }: NavItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors duration-200",
        active
          ? "text-primary bg-[hsl(var(--primary)/0.12)]"
          : "text-foreground-muted hover:bg-[hsl(var(--foreground)/0.03)]",
      )}
    >
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <span className="text-body">{label}</span>
      </div>
      {meta ? <span className="text-caption">{meta}</span> : null}
    </div>
  );
}
