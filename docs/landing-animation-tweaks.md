# Landing Page Animation Tweaks

This file explains the simplest way to adjust the landing page animations without needing to understand all of Framer Motion.

## Where the animation settings live

Most of the landing page animation behavior is controlled in:

- [src/features/landing/landing-motion.tsx](/C:/Users/Ignacio/Desktop/WebDev/Meal-Prep_buddy/src/features/landing/landing-motion.tsx)

That file contains the shared motion wrappers used by the landing page:

- `LandingReveal`
  Used for section and card fade/slide reveals when scrolling.
- `MotionLink`
  Used for button hover and tap feedback.

## The main settings to tweak

At the top of `landing-motion.tsx` you will see these constants:

```tsx
const REVEAL_OFFSET_Y = 28;
const REVEAL_DURATION_SECONDS = 0.7;
const REVEAL_VIEWPORT_AMOUNT = 0.5;
const HOVER_DURATION_SECONDS = 0.22;
```

Here is what each one does:

### `REVEAL_OFFSET_Y`

Controls how far the element starts below its final position before it slides into place.

- Higher number: more slide movement
- Lower number: less slide movement

Examples:

- `16` = subtle slide
- `28` = current setting
- `40` = more noticeable slide

### `REVEAL_DURATION_SECONDS`

Controls how long the reveal animation takes.

- Higher number: slower, more noticeable reveal
- Lower number: faster reveal

Examples:

- `0.45` = quick
- `0.7` = current setting
- `0.9` = slower and more obvious

### `REVEAL_VIEWPORT_AMOUNT`

Controls when the reveal starts while scrolling.

This is the most important one for your request.

- Lower number: animation starts earlier
- Higher number: animation starts later

Examples:

- `0.25` = starts when about 25% of the element is in view
- `0.5` = current setting, starts around the middle of the element
- `0.7` = starts even later

If animations still feel too early, raise this a little.
If they feel too late, lower it a little.

### `HOVER_DURATION_SECONDS`

Controls how fast the button hover animation feels.

- Higher number: softer/slower hover
- Lower number: snappier hover

## How to change the stagger timing

Some groups of cards reveal one after another using small delays.

Those delays are set in:

- [src/features/landing/landing-page.tsx](/C:/Users/Ignacio/Desktop/WebDev/Meal-Prep_buddy/src/features/landing/landing-page.tsx)

Search for:

```tsx
delay={0.08 * index}
```

What this means:

- `0.08` is the gap between each item's animation
- `index` is the item number in the list

Examples:

- `0.04 * index` = tighter/faster stagger
- `0.08 * index` = current stagger
- `0.12 * index` = more separation between items

## Recommended safe tweaks

If you want to experiment without changing the feel too much, try only one of these at a time:

1. Make reveals start a little later:

```tsx
const REVEAL_VIEWPORT_AMOUNT = 0.55;
```

2. Make reveals slower:

```tsx
const REVEAL_DURATION_SECONDS = 0.8;
```

3. Make reveals slide a little more:

```tsx
const REVEAL_OFFSET_Y = 32;
```

## If you want almost no animation

Use something like:

```tsx
const REVEAL_OFFSET_Y = 8;
const REVEAL_DURATION_SECONDS = 0.25;
const REVEAL_VIEWPORT_AMOUNT = 0.2;
```

## If you want more noticeable animation

Use something like:

```tsx
const REVEAL_OFFSET_Y = 36;
const REVEAL_DURATION_SECONDS = 0.85;
const REVEAL_VIEWPORT_AMOUNT = 0.55;
```

## Best way to test changes

After editing the values:

```powershell
corepack pnpm dev
```

Then refresh the page and scroll through it normally.

Focus on these questions:

- Does the animation start too early or too late?
- Does it feel too fast to notice?
- Does it feel smooth or distracting?
- Do grouped cards reveal nicely together?

## Good rule of thumb

- If you care about **when** it starts, change `REVEAL_VIEWPORT_AMOUNT`
- If you care about **how long** it lasts, change `REVEAL_DURATION_SECONDS`
- If you care about **how much it moves**, change `REVEAL_OFFSET_Y`

If you want, I can also move these settings into a single dedicated `landing-animations.ts` config file later, but right now they are intentionally kept in one small file to make tweaks easy.

## How different sections animate differently

The landing page now uses different reveal directions so the scroll feels less repetitive.

Those are controlled in:

- [src/features/landing/landing-page.tsx](/C:/Users/Ignacio/Desktop/WebDev/Meal-Prep_buddy/src/features/landing/landing-page.tsx)

Search for `variant=` on `LandingReveal`.

Available options:

- `variant="up"`
  Fades in while moving upward
- `variant="down"`
  Fades in while moving downward
- `variant="left"`
  Fades in from the right toward the left
- `variant="right"`
  Fades in from the left toward the right
- `variant="pop"`
  Fades in with a small scale-up effect

Examples:

```tsx
<LandingReveal variant="up">...</LandingReveal>
<LandingReveal variant="left">...</LandingReveal>
<LandingReveal variant="pop">...</LandingReveal>
```

If a section feels too similar to the one before it, changing only the `variant` is the easiest way to make it feel different without rewriting the animation system.
