import Image from "next/image";
import type { ReactNode } from "react";

import {
  ArrowDown,
  ArrowRight,
  Ban,
  Bean,
  Beef,
  CalendarCheck2,
  ChefHat,
  EggFried,
  HeartPulse,
  NotebookText,
  Repeat2,
} from "lucide-react";

import styles from "./landing.module.css";
import { LandingReveal, MotionLink } from "./landing-motion";

const problemItems = [
  {
    icon: Repeat2,
    label: "Feels repetitive",
  },
  {
    icon: Ban,
    label: "Hard to apply",
  },
  {
    icon: HeartPulse,
    label: "Takes too much effort",
  },
] as const;

const benefitCards = [
  {
    icon: NotebookText,
    title: "Organization",
    body: "When you meal prep, your week feels less random. You already know what you are going to eat, what groceries you need, and when you need time to cook.",
  },
  {
    icon: CalendarCheck2,
    title: "Consistency",
    body: "Meal prep makes healthy eating easier to repeat. You do not have to make the perfect choice every day because you already planned ahead.",
  },
  {
    icon: HeartPulse,
    title: "Better eating",
    body: "It helps you eat food you actually enjoy while depending less on snacks, takeout, or ultra-processed meals when life gets busy.",
  },
] as const;

const workflowItems = [
  {
    eyebrow: "Eat what you enjoy",
    title: "Built for busy people who want to do better",
    body: "",
    active: true,
  },
  {
    eyebrow: "Save real recipes you like",
    title: "Save real recipes you like",
    body: "Add recipes from links or pasted text and keep them in one organized place.",
    active: false,
  },
  {
    eyebrow: "",
    title: "Adjust them to your needs",
    body: "",
    active: false,
  },
  {
    eyebrow: "",
    title: "Pick meals faster every week",
    body: "",
    active: false,
  },
] as const;

function Section({
  id,
  className,
  children,
}: Readonly<{
  id?: string;
  className?: string;
  children: ReactNode;
}>) {
  return (
    <section
      id={id}
      className={`px-6 py-12 sm:px-10 sm:py-14 xl:min-h-[82vh] xl:px-16 xl:py-16 ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

function SurfaceCard({
  className,
  children,
  tone = "base",
}: Readonly<{
  className?: string;
  children: ReactNode;
  tone?: "base" | "raised";
}>) {
  return (
    <div
      className={`${tone === "base" ? "bg-background border-background-light border" : "bg-background-light border-transparent"} rounded-xl ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function PrimaryCta({
  href,
  children,
}: Readonly<{
  href: string;
  children: ReactNode;
}>) {
  return (
    <MotionLink
      href={href}
      className="text-button text-foreground-white bg-primary inline-flex w-fit items-center gap-2 rounded-full px-4 py-3"
    >
      <span>{children}</span>
      <ArrowRight className="size-5" strokeWidth={2.2} />
    </MotionLink>
  );
}

export function LandingPage() {
  return (
    <main className={styles.page}>
      <Section className="relative flex items-center">
        <div className="mx-auto flex w-full max-w-[58rem] flex-col justify-center">
          <LandingReveal className="space-y-8" variant="pop">
            <div className="space-y-8">
              <h1 className={`${styles.heroDisplay} text-center`}>
                Meal prepping is simple
              </h1>
              <p
                className={`${styles.bodyLarge} text-foreground mx-auto max-w-[58rem]`}
              >
                People think meal prep is boring, repetitive, or too much work.
                In reality, it is one of the clearest signs of intention:{" "}
                <span className="text-primary">
                  taking care of your health, your time, and what you eat.
                </span>{" "}
                This tool makes that process simpler, more flexible, and easier
                to keep up with.
              </p>
            </div>

            <PrimaryCta href="/app">Open product preview</PrimaryCta>
          </LandingReveal>
        </div>

        <LandingReveal
          className="absolute top-1/2 right-8 hidden -translate-y-1/2 xl:flex"
          delay={0.2}
          variant="left"
        >
          <div className="flex items-center gap-4">
            <span
              className={`${styles.scrollLabel} text-h2 text-foreground inline-flex items-center`}
            >
              Scroll
            </span>
            <span className="bg-background-light block h-[7.75rem] w-px" />
          </div>
        </LandingReveal>
      </Section>

      <Section className="flex items-center">
        <LandingReveal className="mx-auto w-full max-w-[58rem]" variant="up">
          <SurfaceCard className="p-6 sm:p-8 xl:p-10">
            <div className="space-y-10">
              <div className="space-y-8">
                <h2 className="text-h1 text-primary">
                  Why don&apos;t more people do it?
                </h2>
                <p className="text-body text-foreground max-w-[53rem]">
                  <span className="font-bold">
                    Most people do not avoid meal prep because they do not care.
                  </span>{" "}
                  They avoid it because it feels like one more system to manage.
                  Finding recipes, checking calories, adjusting portions,
                  building a shopping list, and doing it again every week adds
                  friction fast.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-h3 text-foreground">
                  Why it feels difficult
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {problemItems.map(({ icon: Icon, label }, index) => (
                    <LandingReveal
                      key={label}
                      delay={0.08 * index}
                      variant="pop"
                    >
                      <SurfaceCard
                        className="flex min-h-28 flex-col items-center justify-center gap-4 p-6 text-center"
                        tone="raised"
                      >
                        <Icon
                          className={`${styles.warmText} size-6`}
                          strokeWidth={2}
                        />
                        <p className={`${styles.warmText} text-title`}>
                          {label}
                        </p>
                      </SurfaceCard>
                    </LandingReveal>
                  ))}
                </div>
              </div>
            </div>
          </SurfaceCard>
        </LandingReveal>
      </Section>

      <Section className="flex items-center">
        <div className="mx-auto flex w-full max-w-[58rem] flex-col gap-8">
          <div className="grid gap-6 xl:grid-cols-[28.25rem_28.25rem]">
            <LandingReveal variant="right">
              <SurfaceCard className="flex min-h-[35rem] flex-col justify-between p-8 xl:min-h-[41.625rem] xl:p-10">
                <h2 className="text-h1 text-primary max-w-[23rem]">
                  What good meal prep actually looks like?
                </h2>
                <p className="text-body text-foreground max-w-[23rem]">
                  Good meal prep is not punishment. It helps you stay on track
                  with your goals, save time during the week, and avoid relying
                  on whatever is easiest when you are tired or busy.
                </p>
              </SurfaceCard>
            </LandingReveal>

            <div className="grid gap-6">
              {benefitCards.map(({ icon: Icon, title, body }, index) => (
                <LandingReveal key={title} delay={0.1 * index} variant="left">
                  <SurfaceCard className="flex min-h-52 flex-col gap-5 p-6">
                    <Icon className="text-primary size-6" strokeWidth={2} />
                    <div className="space-y-4">
                      <h3 className="text-h3 text-primary">{title}</h3>
                      <p className="text-body text-foreground">{body}</p>
                    </div>
                  </SurfaceCard>
                </LandingReveal>
              ))}
            </div>
          </div>

          <LandingReveal
            className="flex justify-center"
            delay={0.2}
            variant="down"
          >
            <a
              href="#brand"
              className="text-button text-primary inline-flex items-center gap-3"
            >
              <span>We can help you make a good meal prep</span>
              <ArrowDown className="size-5" strokeWidth={2} />
            </a>
          </LandingReveal>
        </div>
      </Section>

      <Section id="brand" className="flex items-center">
        <LandingReveal
          className="mx-auto flex w-full max-w-[58rem] flex-col items-center gap-6 text-center"
          variant="pop"
        >
          <div className="flex items-center justify-center gap-4">
            <ChefHat
              className="text-foreground size-16 shrink-0 sm:size-20"
              strokeWidth={2.4}
            />
            <h2 className={`${styles.brandDisplay} text-foreground`}>
              :) Meal Prep Buddy
            </h2>
          </div>
          <p className="text-body text-foreground">
            A simpler way to plan meals that actually fit your routine
          </p>
        </LandingReveal>
      </Section>

      <Section id="how-it-works" className="flex items-center">
        <div className="mx-auto flex w-full max-w-[58rem] flex-col gap-8">
          <LandingReveal variant="right">
            <h2 className="text-h2 text-foreground">How it works?</h2>
          </LandingReveal>

          <div className="grid gap-4 xl:grid-cols-[37.75rem_19.25rem] xl:items-start">
            <LandingReveal variant="right">
              <div className="border-background-light overflow-hidden rounded-xl border">
                <Image
                  src="/landing/how-it-works-meal-prep.png"
                  alt="Three meal prep containers with grains, vegetables, and toppings."
                  width={604}
                  height={619}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </LandingReveal>

            <div className="grid gap-4">
              {workflowItems.map((item, index) => (
                <LandingReveal
                  key={item.title}
                  delay={0.1 * index}
                  variant={item.active ? "left" : "pop"}
                >
                  {item.active ? (
                    <SurfaceCard className="min-h-[21rem] p-4">
                      <div className="space-y-4">
                        <p className="text-caption text-primary">
                          {item.eyebrow}
                        </p>
                        <h3 className="text-h1 text-foreground text-[2rem] leading-[1.1]">
                          {item.title}
                        </h3>
                      </div>
                    </SurfaceCard>
                  ) : item.body ? (
                    <SurfaceCard className="relative min-h-[8.375rem] overflow-hidden p-4">
                      <div
                        className={`${styles.sidebarThumb} absolute inset-y-0 left-0 w-[6.5rem]`}
                      />
                      <div className="relative space-y-2">
                        <h3 className="text-h3 text-primary">{item.title}</h3>
                        <p className="text-body text-foreground max-w-[17.25rem]">
                          {item.body}
                        </p>
                      </div>
                    </SurfaceCard>
                  ) : (
                    <SurfaceCard className="p-4">
                      <h3 className={`${styles.warmText} text-h3`}>
                        {item.title}
                      </h3>
                    </SurfaceCard>
                  )}
                </LandingReveal>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="flex items-center">
        <LandingReveal
          className="mx-auto flex w-full max-w-[58rem] flex-col items-center gap-8 text-center"
          variant="up"
        >
          <div className="text-primary flex items-center gap-8">
            <Beef className="size-8" strokeWidth={2} />
            <Bean className="size-8" strokeWidth={2} />
            <EggFried className="size-8" strokeWidth={2} />
          </div>

          <h2 className={`${styles.closingDisplay} text-center`}>
            Let&apos;s plan something good
          </h2>

          <PrimaryCta href="/app">Get started</PrimaryCta>
        </LandingReveal>
      </Section>
    </main>
  );
}
