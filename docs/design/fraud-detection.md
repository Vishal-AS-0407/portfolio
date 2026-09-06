# fraud-detection — *Sealed*

`/work/fraud-detection` · Decentralized fraud detection · federated learning + CKKS · NPCI / Techfest 2024

---

## Narrative / story

Two banks need one model and cannot show each other a single row. Everything
about this project is a negotiation between *needing to see* and *not being
allowed to*. So the page withholds. Nothing on it is legible until it has been
unsealed, the two institutions occupy two halves that never open at once, and
the one figure rendered in plain text from the first frame is the number of raw
records shared: zero.

## Visual metaphor

**A sealed document / a cipher desk.** Cold institutional white, black
condensed type, hard 1px rules, and content that arrives as ciphertext and
resolves character by character. Two chambers, a divider, and a gate in the
middle where the only thing allowed through is encrypted.

## Palette

Deliberately the *opposite* register from the landing page: a cold, bright,
bureaucratic white.

| Role | Hex |
|---|---|
| ground (cold paper) | `#E8EAED` |
| panel / sealed surface | `#DADDE2` |
| deep panel (the gate) | `#0B0D10` |
| ink | `#0B0D10` |
| dim | `#5A626C` |
| rule | `#B4BAC2` |
| cipher cyan (channel A) | `#0075C4` |
| cipher violet (channel B) | `#5B3DF5` |
| unsealed (the one warm mark) | `#0B0D10` on `#E8EAED`, no colour at all |

Two channel colours, never mixed on the same side of the divider. No gradients
anywhere on this page — every surface is a flat fill with a hard edge.

## Typography

- **Display — IBM Plex Sans Condensed 600**, `/fonts/p/plexcond-600.woff2`.
  Condensed, institutional, set at 34–92px in **sentence case** with
  `letter-spacing: 0` and `line-height 1.06`. Condensed is the opposite move
  from the landing page's wide negatively-tracked grotesque: the letters are
  narrow and the tracking is neutral.
- **Sub-display / body — IBM Plex Sans Condensed 300**, 17px / 1.62, 56ch.
- **Ciphertext, ledgers, tabular figures — IBM Plex Mono 400/500**,
  `/fonts/p/plexmono-400.woff2`, `/fonts/p/plexmono-500.woff2`, at 13–15px,
  **lowercase, `letter-spacing: 0`, `font-variant-numeric: tabular-nums`**. Used
  in *volume* — whole blocks and tables of it — never as a tracked uppercase
  micro-label.

Every element that can be scrambled has a `data-seal` attribute; the scramble
alphabet is `#$%&*+/<>?@[]^{|}~` plus base-64 characters, at a fixed
character width so nothing reflows while decrypting. **No layout shift.**

## Layout system

- **A hard 50/50 split** running the full length of the page, with a 1px
  `#B4BAC2` divider at exactly 50%. Left = **institution a**, right =
  **institution b**. The two halves carry *different* content (different scaler
  statistics, different SMOTE seeds, different row counts), and the half you are
  not attending to stays sealed.
- Sealed panels are numbered `seal 01 … seal 08` and open in order as scroll
  reaches them. A panel that has not opened shows only its ciphertext.
- 12-column grid inside each half, 4px baseline, everything snapped.
- **The gate** is the only full-width element: a black band that breaks the
  divider at ~55% scroll.

**Seal order:** `01 the constraint` → `02 what each side holds` (split) →
`03 imbalance, locally` → `04 the local models` → **`05 the gate — CKKS
aggregation` (pinned, full width)** → `06 the vote` → `07 three milliseconds` →
`08 the support desk / masking` → `zero` → colophon.

## Motion language

**Locking.** Short, cold, precise. Everything moves on a 4px grid and stops
dead — no easing tail. Durations 220–380ms, `cubic-bezier(.85,0,.15,1)`
(fast-slow-fast, like a tumbler falling). Character scramble resolves at a
fixed 24fps in left-to-right waves. Panels open by `clip-path` along straight
edges; nothing scales, nothing blurs, nothing fades up.

- Primary: `cubic-bezier(.85,0,.15,1)`, 220–380ms
- Seal open: `clip-path: inset(0 0 100% 0) → inset(0)`, 300ms, staggered 60ms
- Scramble: 24fps, ~14 frames per character, wave offset 18ms/char
- Reduced motion: characters resolve instantly, panels are open from the start.

## Signature set pieces

1. **The shutter.** Entry: 12 vertical slats close over the viewport from
   alternating directions (24ms stagger), hold 120ms, then open. Behind them the
   page is entirely ciphertext.
2. **The decrypt sweep.** A horizontal band travels down the first viewport at
   1400px/s; every character it crosses resolves from cipher to plaintext. The
   title `nothing crosses the boundary` lands last.
3. **The divider.** A 1px rule draws down the centre from top to bottom in
   420ms. From that moment the page is two institutions. Hovering/focusing one
   half **re-seals the other** (its text scrambles again, 180ms) — you cannot
   read both at once. On touch devices, the halves alternate on scroll.
4. **Local imbalance.** Two ledger tables, one per side, showing class counts.
   SMOTE runs on each independently: synthetic rows are *typed in* in mono, in
   the channel colour, until both sides balance. The row counts differ, because
   the sites differ.
5. **The gate (pinned, 240vh).** The divider breaks. A black full-width band
   opens. From each side, a matrix of weights slides toward the centre; at the
   gate edge every numeral is replaced by a ciphertext block; a single combined
   vector emerges below in plaintext. The aggregator never sees a plaintext
   weight — and neither do you.
6. **The vote.** Two dials (400 estimators each) rotate to a stop with a 3-notch
   settle; the verdict flips `legitimate` / `fraud` on a hard cut. The MLP
   architecture `64 → 32 → 16 → 1` is printed as a locked column of mono.
7. **Three milliseconds.** A bar empties over exactly 3.000s (3ms at ×1000) with
   a live µs readout in tabular mono. It is the only element on the page that
   moves continuously.
8. **Masking, live.** A real account string `41562280094417` redacts itself to
   `XXXXXXXXXX4417` character by character as it scrolls past a fixed rule —
   scrubbable, so you can un-redact it by scrolling back and it re-redacts.
9. **Zero.** `0` set at `clamp(160px, 40vw, 520px)`, IBM Plex Sans Condensed
   600, in flat ink on the cold ground. It is the only element on the page that
   **never had a sealed state** — it was legible from the first frame.
10. **Seal 09 is different.** The honest note (no CKKS code in the public repo;
    UTF-16 requirements.txt) is rendered with the scramble disabled and no panel
    styling at all — raw mono on the bare ground. The page stops performing to
    say it.

## Scroll choreography

| Progress | Beat |
|---|---|
| 0 – 0.03 | slat shutter, then full-page ciphertext |
| 0.03 – 0.10 | decrypt sweep; title resolves |
| 0.10 – 0.16 | the divider draws; the page becomes two |
| 0.16 – 0.30 | seals 02–03: what each side holds; local SMOTE |
| 0.30 – 0.42 | seal 04: local models, both sides, asymmetric |
| 0.42 – 0.60 | **the gate**, pinned |
| 0.60 – 0.70 | the vote; dials settle |
| 0.70 – 0.78 | three milliseconds |
| 0.78 – 0.86 | masking, live |
| 0.86 – 0.94 | **zero** |
| 0.94 – 1.00 | the unstyled honest note; colophon |

Mobile: the split becomes two stacked half-height chambers with the divider
horizontal; only one is unsealed at a time and scroll hands off between them.
The gate stays, at reduced matrix density.

## Entry + exit transition

**Entry:** vertical slat shutter (12 slats, alternating direction, 24ms
stagger), then a page of ciphertext with a decrypt sweep. Never a colour wipe.
**Exit:** every unsealed character re-scrambles from the bottom up over 380ms,
then the slats close.

## Distinctiveness statement

- **vs the landing page** — cold institutional white vs olive black; condensed
  600 sentence-case vs wide uppercase negatively-tracked; mono in *volume* at
  13–15px lowercase vs 10.5px tracked uppercase micro-labels; 220–380ms locking
  vs 1s eased fades; content that is *withheld* vs content that fades up; a hard
  50/50 architecture the landing page never uses.
- **vs every sibling** — the only page with a character-scramble decryption
  system; the only page split 50/50 by an institution divider; the only page
  where reading one thing hides another; the only cold-white ground; the only
  page with no gradients, no curves and no organic form anywhere.
