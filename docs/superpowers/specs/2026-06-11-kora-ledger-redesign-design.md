# Kora Ledger — Student Portal Visual Redesign

**Date:** 2026-06-11
**Scope:** `apps/web` student portal — look, feel, motion, keyboard interaction.
**Mandate:** User granted free rein ("surprise me, bold reimagining welcome"). Design
decisions below were made autonomously under that mandate.

## Concept

Service hours are a record of real work in the real world. The new Kora reads like a
beautifully printed **field ledger**: warm paper, confident ink, expressive serif
display type, monospace numerals — crossed with modern product craft: springy motion,
numbers that count up, and a keyboard command layer.

Three directions were considered:

1. **Dark "mission control"** — neon-on-black, terminal energy. Rejected: Kora is a
   daily-use tool for high schoolers; warmth and optimism beat edge.
2. **Pastel upgrade in place** — tune the existing Canva-like palette. Rejected: not
   bold enough for the brief.
3. **Editorial paper-and-ink ledger + command layer** — **chosen.** Distinctive,
   warm, ages well, and the existing token-driven codebase makes it propagate cheaply.

## Foundations

### Typography
- **Fraunces** (variable serif, via `next/font`) — display headlines, hero stats,
  the wordmark (italic). The personality of the redesign.
- **Inter** — body/UI (kept).
- **JetBrains Mono** — eyebrows, dates, hour values, hotkey chips, table metadata.
  Tabular, ledger-like.

### Palette (token layer in `globals.css` — propagates to ~34 components)
- Canvas `#F6F4EE` warm paper + fixed SVG-noise grain overlay (~3% opacity)
- Ink `#1A1915` (warm near-black); Surface `#FFFFFF`
- **Panel `#152420`** — new deep-evergreen ink surface for hero moments
- Primary `#0B8F88` deep teal (brand evolved from `#00c4cc`), deep `#086B66`
- Ember `#FF6B3D` — streaks/energy; Gold `#E8A93D` — Bright Futures gold + pending
- Success `#3D9A50`, Flagged/Danger `#E0492E`
- Soft tints retuned in place: lavender→paper-tint `#ECE9E0`, pink `#F9E3EA`,
  sky `#DDEDF5` (token names unchanged so consumers keep working)

### Motion
- `rise` entrance keyframe + `.stagger` utility (children animate in sequence via
  `--i` custom property)
- `useCountUp` rAF hook — hero stats, ring percentages
- Progress ring draws in via stroke-dashoffset transition; bar chart grows staggered
- Hover lifts: translate + layered shadow on cards
- `prefers-reduced-motion` disables all of it

## Signature elements

1. **Ink hero (requirements carousel)** — slides become deep-panel surfaces with a
   giant Fraunces `42 / 100` counting stat, mono eyebrow, glowing teal progress bar,
   and a huge faint serif numeral watermark. The moment the app stops looking like
   template SaaS.
2. **Command layer** — new `command-palette.tsx`: ⌘K (or `/`) opens a palette with
   filtering, arrow-key nav, and mono hotkey chips; global `g`-then-letter chords
   (g d Dashboard, g e Events, g s Schedule, g l Log Hours, g h Hours, g g Goals,
   g o Organizations, g m Messages) work anywhere outside inputs. Topbar search
   becomes the palette trigger with a `⌘K` chip.
3. **Wordmark** — "Kora" in Fraunces italic with a teal spark; sidebar logo becomes
   an ink tile with a serif K.
4. **Ledger table** — mono dates and hour values, dashed rules, mono status chips.
5. **Display headers** — `PageHeader` becomes Fraunces display + mono uppercase
   kicker; right-rail greeting goes serif with an ember streak chip.

## Implementation slices

1. `globals.css` + `app/layout.tsx` — tokens, fonts, grain, keyframes (the lever)
2. `sidebar.tsx`, `sidebar-nav.tsx` — identity, active states, hotkey hints
3. `topbar.tsx`, new `command-palette.tsx`, wired in `(student)/layout.tsx`
4. `requirements-carousel.tsx`, `progress-ring.tsx` — ink hero + animated ring
5. `right-rail.tsx`, `bar-chart.tsx`, new `lib/use-count-up.ts`
6. `hours-table.tsx`, `page-header.tsx`, `dashboard-next-action.tsx`, `mobile-nav.tsx`

Behavior, data flow, routing, and component APIs are unchanged — this is a visual +
interaction layer redesign. Verification: `lint`, `check-types`, production build of
`apps/web`.
