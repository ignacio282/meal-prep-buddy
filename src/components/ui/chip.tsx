import type { ReactNode } from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ChipProps = Readonly<{
  children: ReactNode;
  removable?: boolean;
  selected?: boolean;
}>;

export function Chip({
  children,
  removable = false,
  selected = false,
}: ChipProps) {
  return (
    <span
      className={cn(
        "text-caption inline-flex min-h-9 items-center gap-2 rounded-full px-3 py-2 transition-colors duration-200",
        selected
          ? "text-primary bg-[hsl(var(--primary)/0.12)]"
          : "text-foreground-muted bg-[hsl(var(--info)/0.12)]",
      )}
    >
      <span>{children}</span>
      {removable ? <X className="size-3.5" strokeWidth={2.2} /> : null}
    </span>
  );
}
