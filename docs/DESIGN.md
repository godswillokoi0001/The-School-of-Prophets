# The School of Prophets — design brief

**Concept.** A school with a seal: the site reads like a printed programme from a
long-established institution, not a product landing page.

**Mood.** Gravitas, warmth, craft, quiet authority. Sunlit paper and black ink;
gold used the way a printer uses foil — rarely, and on purpose.

## Principles

1. **Type carries the design.** Photography and ornament are subordinate. A page
   should still make sense with every image removed.
2. **One voice per section.** A dark band, a split spread, a centered statement,
   a table, a numbered list. No two consecutive sections share a composition.
3. **Hairlines, not cards.** Rules, margins and whitespace do the work boxes and
   shadows usually do. Corner radius is 0 everywhere.
4. **Show the real thing.** Real times, real names, real links, real portrait.
   Where a fact is unconfirmed it is marked, never invented.
5. **Subtraction.** If an element does not help a visitor decide something, cut it.

## Type system

| Role | Face | Size | Notes |
| --- | --- | --- | --- |
| Display | Fraunces (variable, 400–600) | `clamp(2.6rem, 6vw, 5.5rem)` | line-height 0.95, tracking −0.025em |
| Section head | Fraunces | `clamp(1.9rem, 3.4vw, 3rem)` | line-height 1.02 |
| Sub-head | Fraunces | 1.25–1.6rem | line-height 1.15 |
| Body | Manrope | 17px mobile / 18px desktop | line-height 1.65, measure 64ch |
| Small | Manrope | 0.8125rem | line-height 1.5 |
| Label | Manrope 600 | 0.6875rem | uppercase, tracking 0.14em |
| Numeral | Fraunces | 4.5rem | tabular, for 01/02/03 and times |

Two families only. Latin subset, `font-display: swap`, self-hosted through
`next/font`, with its metrics-matched fallback (no layout shift). Headings use
`text-wrap: balance`; paragraphs `pretty`. Curly quotes, true en dashes for
ranges, non-breaking spaces in times (`9:00 PM WAT`). Tabular figures for clocks
and countdowns. Drop cap on the About opening; hanging punctuation on pull quotes.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--color-ink` | `#101317` | dark surfaces, primary text |
| `--color-ink-2` | `#171B21` | panels on ink |
| `--color-ink-3` | `#222933` | raised ink surfaces |
| `--color-parchment` | `#F2ECE0` | page surface |
| `--color-paper` | `#FAF6EE` | raised light surface, form fields |
| `--color-parchment-2` | `#E5DCCA` | rules, quiet bands |
| `--color-gold` | `#B0803A` | rules, large numerals, foil on ink |
| `--color-gold-soft` | `#D9BE86` | gold text on ink only |
| `--color-ember` | `#8A4A22` | accessible accent text on parchment |
| `--color-quiet` | `#57524A` | secondary text (AA on parchment) |

Gold is never small text on parchment; `ember` is the accessible accent there.
Every pairing checked: ink/parchment 15.4:1, quiet/parchment 6.4:1,
ember/parchment 5.9:1, parchment/ink 15.4:1, gold-soft/ink 9.1:1.

Paper grain is a single low-opacity SVG noise applied to parchment surfaces
only; never to ink.

## Grid and spacing

12 columns, max width 1200px, gutters 24px (mobile) / 40px (desktop), outer
margin 20px / 40px. Base spacing unit 8px. Section rhythm: 80px mobile,
128px tablet, 160–200px desktop between major sections. Sub-blocks 16/24/32/48.
Intentional breaks: full-bleed dark bands, 7/5 split spreads, images that bleed
to the viewport edge, margin notes in the outer column.

## Motion

One curve: `cubic-bezier(0.22, 1, 0.36, 1)`. Three durations: 160ms
(state change), 280ms (panel/accordion), 560ms (scroll reveal). Reveal is
opacity plus 8px once, on headings and figures only. Links use a 1px underline
that draws from left. Nothing loops, nothing parallaxes, no cursor effects.
`prefers-reduced-motion` removes reveal and transition entirely.

## Imagery

Only photographs supplied by the ministry, graded warm and slightly desaturated,
with fixed ratios: 3:4 portraits, 3:2 landscapes, 16:10 for teaching covers.
Captions in small caps, set outside the image. Where no real photograph exists,
the slot becomes a typographic plate (series name, scripture or seal) rather than
a stock image, an AI scene or a labelled grey box. Needed photographs are logged
in `docs/ASSETS_NEEDED.md`.

## The mark

The ministry's crest is the only logo: supplied artwork in the header, the
footer, the social card and the icons. A ring lockup sets the crest inside a
hairline circle with `THE SCHOOL OF PROPHETS · EST. 2021` on the arc, for the
hero, footer and share card. No second eagle is drawn.

## Voice

Sober, warm, specific. Short declaratives; concrete nouns; verbs that name the
action. No exclamation marks, no hype, no "unlock/elevate/seamless" vocabulary,
no "not just X, but Y", no closing aphorism on every section. Scripture quoted
sparingly, cited by book, chapter and verse. Unconfirmed facts stay marked.

## What this replaces

- Full-bleed photographic hero with two gradient overlays → typographic hero
  with seal, rule and one primary action.
- Three identical image cards for the systems → typographic numerals on a rule.
- Rounded, shadowed series cards with badges and hover zoom → catalogue rows.
- Newsletter banner repeated on home and footer, in promotional tone → one quiet
  line in the colophon.
- Competing gold "Donate" and "Join" buttons → one primary action; giving is a
  text link.
- Lucide icons as section decoration → icons only inside controls and links.
