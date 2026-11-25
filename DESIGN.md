# Design

The gallery is a stack of photo-booth strips hung on a velvet curtain. Each month is one strip; the year is twelve of them. The UI stays achromatic so the photos carry all the color.

## Tokens (tailwind.config.js)

| Token | Value | Use |
|---|---|---|
| `curtain` | `#1a1d5c` | Page ground (with `deep` `#10123d`, `fold` `#252a7c`, `line` `#3a3f96` for hairlines/rings) |
| `haze` | `#aeb2e4` | Secondary text on curtain. Tinted from the curtain hue, never gray |
| `paper` / `paper-dim` | `#f2f2ef` / `#e2e2dd` | Photo-paper borders, primary text on curtain |
| `ink` / `ink-soft` | `#15162c` / `#4a4c66` | Text printed on paper; empty frame fill |
| `lamp` / `lamp-hot` | `#ff4433` / `#ff6a5a` | The booth's red "ready" lamp. Reserved for the single active thing: primary action, current year dot, cover star, destructive confirm, errors |

Ground: `body::before` paints the curtain (top radial glow + 92px vertical folds) as a fixed layer.

## Type

- **Signage**: Big Shoulders Display (variable, self-hosted via @fontsource). Years, month names, page titles. Uppercase, weight 700–900, tight leading (0.82–0.85).
- **UI**: Archivo (variable). Body, buttons, labels.
- **Date stamp**: Martian Mono 400 via the `.stamp` class — 10px, uppercase, 0.08em tracking, tabular numerals. Only for dates and counts printed on paper.

## Components

- **Booth strip** (`BoothStrip.jsx`): paper strip, 4 frames at 4:3 (3 on phones), stamp footer `MM.YYYY · N pics`, month name below in signage. Deterministic tilt per month (±1.4°) that straightens and lifts on hover/focus. Empty months stay in place as translucent ghost strips with the month number in the first frame — the year always reads as twelve.
- **Contact print** (album page): photo in a 6px paper border with a stamp line beneath; CSS columns masonry (2/3/4).
- **Lightbox** (`Lightbox.jsx`): native `<dialog>`, paper-bordered photo on a 95% curtain backdrop. Arrow keys and buttons step through photos. Delete takes two taps (button turns lamp red: "Tap again to delete"). Status line replaces `alert()`.
- **Buttons**: `.btn-lamp` (filled lamp, soft offset glow) for the one primary action per screen; `.btn-ghost` (curtain-line ring) for everything else. Fully rounded.
- **Header**: sticky, `curtain-deep/85` with backdrop blur; wordmark "AJ + CHA" with the `+` in lamp; Add photos always top right.

## Motion

- **The flash** (signature): opening the lightbox, and every step to another photo, fires a full-screen white flash that falls off in 520ms (expo ease-out) as the photo appears.
- **Develop**: images fade in from overexposed/desaturated to normal (700ms), staggered 90ms down a strip.
- Strip hover: straighten + lift, 500ms ease-out.
- Everything collapses to 1ms under `prefers-reduced-motion`.

## Browser surfaces

Selection is lamp on paper; caret is lamp; focus ring is a 2px paper outline at 3px offset; scrollbars are thin `curtain-line`.

## Rules

- No eyebrow labels, no cards-in-cards, no gradient text.
- Lamp red appears at most once per region.
- Never invent captions or memories; the only metadata is the album date.
