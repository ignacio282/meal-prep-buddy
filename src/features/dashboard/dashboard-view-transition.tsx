"use client";

import type { ReactNode } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { DashboardView } from "@/features/dashboard/search-params";

type DashboardViewTransitionProps = Readonly<{
  children: ReactNode;
  view: DashboardView;
}>;

export function DashboardViewTransition({
  children,
  view,
}: DashboardViewTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        key={view}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
