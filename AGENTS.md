# AGENTS.md

## Project Overview

This project is a single-user web app for AI-assisted meal prep planning.

It is designed for people who meal prep regularly, care about calories and portions, and want a simpler way to organize, adapt, and reuse recipes they already trust.

## Core Product Idea

The app should help users turn recipes from real sources into structured, reusable recipe entries that fit their own meal prep system.

It should support both a structured dashboard and conversational recipe ingestion, but the product should prioritize structured data and reusable recipe records over chat history.

## Main Product Capabilities

- Add recipes from links or pasted recipe text
- Review and adjust recipes before saving them
- Save recipes in a structured recipe library
- Browse saved recipes later through a clear dashboard
- View recipe details such as ingredients, macros, preparation steps, and tags
- Get a random recipe suggestion from the saved recipe library for weekly planning
- Support user preferences such as calorie targets, portions, or meal prep defaults

## Product Boundaries

### The product should

- emphasize structure over messy chat history
- emphasize reuse over one-time generation
- keep the user in control over automatic decisions
- support practical meal prep workflows over experimentation
- favor clear, trustworthy UI over novelty

### The product should not

- become a generic AI chatbot
- become a creative recipe generator
- become a social food app
- become a calorie-tracking app like MyFitnessPal
- invent random recipes from nothing as a core behavior
- depend on long chat history as the main way to store information
- become a general-purpose fitness platform
- become a grocery delivery product
- become a complex nutrition or medical platform
- introduce features that do not support the core meal prep workflow

## Stack

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- Framer Motion

## UI and Implementation Guidance

- The interface should support both a structured dashboard and conversational recipe ingestion
- Missing components should extend the existing design language naturally
- Product routes should remain distinct from marketing routes: keep `/` for the landing experience and `/app` for the product entry flow
- Surface hierarchy should stay consistent:
  - section-level containers use `background` with a `background-light` stroke
  - nested or top-layer surfaces inside those containers use `background-light` with no stroke
- The global page background should use the shared warm gradient with subtle noise unless a specific Figma screen clearly overrides it
- Do not use visual elevation through shadows for cards or containers
- Apply spacing by relationship rather than arbitrarily:
  - `4px` for elements inside the same micro-group
  - `8px` for related rows in the same content cluster
  - `16px` for clearly separate groups inside one component
  - `24px` for container padding unless the design shows otherwise
- Prefer calm layouts with clear task hierarchy and whitespace over dense stacks of cards
- Prefer lean, reusable components and clear product flows
- Keep the foundation simple, scalable, and easy to extend
- Avoid unnecessary dependencies
- Prefer clear folder organization and reusable patterns
- Do not overengineer architecture
- When implementing from Figma, inspect the exact design context first and reuse existing project styles and tokens
- Important technical decisions should be explained clearly when they materially affect the product direction or future extensibility
