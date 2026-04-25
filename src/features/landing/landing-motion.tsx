"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { motion, useReducedMotion } from "framer-motion";

const REVEAL_OFFSET_Y = 28;
const REVEAL_DURATION_SECONDS = 0.7;
const REVEAL_VIEWPORT_AMOUNT = 0.5;
const HOVER_DURATION_SECONDS = 0.22;

const revealVariants = {
  up: {
    initial: { opacity: 0, y: REVEAL_OFFSET_Y },
    animate: { opacity: 1, y: 0 },
  },
  down: {
    initial: { opacity: 0, y: -REVEAL_OFFSET_Y },
    animate: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: REVEAL_OFFSET_Y },
    animate: { opacity: 1, x: 0 },
  },
  right: {
    initial: { opacity: 0, x: -REVEAL_OFFSET_Y },
    animate: { opacity: 1, x: 0 },
  },
  pop: {
    initial: { opacity: 0, y: 14, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
} as const;

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: keyof typeof revealVariants;
};

export function LandingReveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: LandingRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedVariant = revealVariants[variant];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={selectedVariant.initial}
      whileInView={selectedVariant.animate}
      transition={{
        duration: REVEAL_DURATION_SECONDS,
        ease: "easeOut",
        delay,
      }}
      viewport={{ once: true, amount: REVEAL_VIEWPORT_AMOUNT }}
    >
      {children}
    </motion.div>
  );
}

type MotionLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
};

export function MotionLink({ children, className, href }: MotionLinkProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href}>
      <motion.span
        className={className}
        transition={{ duration: HOVER_DURATION_SECONDS, ease: "easeOut" }}
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.span>
    </Link>
  );
}
