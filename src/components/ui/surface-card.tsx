import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type SurfaceCardProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  tone?: "base" | "raised";
};

export function SurfaceCard({
  children,
  className,
  tone = "base",
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        tone === "base"
          ? "bg-background border-background-light border"
          : "bg-background-light border-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
