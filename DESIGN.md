---
name: AtlaXia
description: AI-native ICS/SCADA anomaly detection for water infrastructure. Editorial cream marketing wraps live control-room widgets.
colors:
  cream-bg: "#F7F6F2"
  cream-inset: "#EFEEE8"
  cream-elevated: "#FFFFFF"
  cream-line: "#E4E3DC"
  cream-line2: "#DEDDD6"
  cream-line3: "#D6D5CC"
  cream-ink: "#0F100E"
  cream-ink2: "#1F201D"
  cream-mute: "#5F605A"
  cream-mute2: "#5A5B55"
  cream-mute3: "#8E8F88"
  accent: "#4FA89A"
  accent-ink: "#3D8A7E"
  accent-soft: "#DCEDE8"
  dark-base: "#0d1117"
  dark-surface: "#151b23"
  dark-raised: "#1c2330"
  dark-inset: "#0a0e14"
  dark-line-subtle: "#21262d"
  dark-line: "#30363d"
  dark-line-emph: "#484f58"
  dark-text: "#e6edf3"
  dark-text-secondary: "#8b949e"
  dark-text-muted: "#484f58"
  status-normal: "#3fb950"
  status-advisory: "#58a6ff"
  status-warning: "#d29922"
  status-critical: "#f85149"
  status-emergency: "#da3633"
  error-bg: "#fdecec"
  error-ink: "#8a1f1f"
typography:
  display-hero:
    fontFamily: "'Open Runde', Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.4vw, 72px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  display-cta:
    fontFamily: "'Open Runde', Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, 6vw, 80px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Open Runde', Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 4.5vw, 56px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Open Runde', Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Nunito, 'Open Runde', ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "26px"
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0.18em"
    fontFeature: "'ss01','ss03'"
rounded:
  hairline: "4px"
  base: "6px"
  card: "10px"
  panel: "14px"
  pill: "9999px"
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  container-max: "1280px"
  fold-y: "clamp(56px, 8vw, 96px)"
components:
  button-primary:
    backgroundColor: "{colors.cream-ink}"
    textColor: "{colors.cream-bg}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.cream-ink2}"
    textColor: "{colors.cream-bg}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  menu-trigger-mobile:
    backgroundColor: "transparent"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    typography: "{typography.label}"
  menu-trigger-mobile-open:
    backgroundColor: "{colors.cream-ink}"
    textColor: "{colors.cream-bg}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    typography: "{typography.label}"
  chip-status:
    backgroundColor: "{colors.status-normal}"
    textColor: "{colors.dark-base}"
    rounded: "{rounded.base}"
    padding: "2px 8px"
    typography: "{typography.label}"
  card-product-frame:
    backgroundColor: "{colors.cream-elevated}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.card}"
  input-text:
    backgroundColor: "{colors.cream-elevated}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.base}"
    padding: "10px 12px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.cream-mute}"
    padding: "0 0"
  nav-link-hover:
    backgroundColor: "transparent"
    textColor: "{colors.cream-ink}"
    padding: "0 0"
---

# Design System: AtlaXia

## 1. Overview

**Creative North Star: "The Control Room After Hours"**

AtlaXia lives in two physical spaces and the website is the bridge. The cream surface is the procurement office at four in the afternoon: warm paper, hand-set type, italic anchors in muted teal, sparse mono labels above each section. The dark frames embedded inside that surface are the operations floor at three in the morning: live telemetry, real curves diverging from real thresholds, status pills that mean something. Marketing is the daylight world that explains. The product is the after-hours world that proves. The website holds both, calmly, in one composition.

The voice is attentive and slightly intimate. It is not corporate. It does not perform expertise; it shows working systems. The Spanish copy reads like a careful operator wrote it, not a sales team. Italic teal fragments inside roman headlines do the emotional work that gradients and illustrations do on competing OT sites. The category's reflex is navy and amber; AtlaXia commits to cream and a single muted teal. The category's reflex is stock dashboard screenshots; AtlaXia ships real animated specimens of model behavior.

**Key Characteristics:**

- Two worlds, never blended: cream marketing surface, dark control-room frames embedded as evidence.
- One accent only: a single muted teal (`oklch(0.62 0.10 165)`), used almost exclusively as italic sub-clauses inside roman display headlines. Never as background, never as button fill.
- Specimens, not illustrations: every chart animates real model behavior (token vs. threshold, forecast band, anomaly bucle). No icon cards, no stock dashboards.
- Hand-set rhythm: numbered taxonomy (`01/ 02/ 03/`), mono eyebrow labels above sections, varied spacing per fold. The page reads as composed, not templated.
- Refuses what the category does: not editorial-magazine-with-a-Cormorant-headline, not navy-and-amber OT, not gradient-on-glass SaaS, not hero-metric grids.

## 2. Colors

A controlled four-role palette: a single muted teal accent, an operational status family, a control-room dark, and an exhaustive cream neutral.

### Primary
- **Muted Teal** (`#4FA89A`, canonical `oklch(0.62 0.10 165)`): the brand's only saturated voice in the cream world. Used as ink for italic sub-clauses inside display headlines and as `--accent-soft` (`#DCEDE8`) for low-opacity gradient halos behind product frames. **Never a button fill, never a background block, never a stroke on a chart.**
- **Deep Teal Ink** (`#3D8A7E`, canonical `oklch(0.42 0.10 165)`): the darker cousin used for the actual `<em>` ink so italic fragments hold contrast at small sizes.
- **Teal Mist** (`#DCEDE8`, canonical `oklch(0.94 0.04 165)`): used only for radial-gradient halos behind product frames at low opacity (≤50%). Selection background.

### Secondary
The OT operational status family. Lives inside dark frames. On the cream surface, permitted only inside a `StatusPill` chip or as a ≤6px category-indicator dot (the Differentiators section uses `status-normal` for *Detección*, `accent-ink` for *Diseño de tokens*, `status-warning` for *Predicción* — a deliberate green→teal→amber progression).
- **Status Normal** (`#3fb950`): green; nominal operation, in-band telemetry.
- **Status Advisory** (`#58a6ff`): blue; operator attention requested, no anomaly.
- **Status Warning** (`#d29922`): amber; threshold approached, drift suspected.
- **Status Critical** (`#f85149`): red; threshold breached or model flag.
- **Status Emergency** (`#da3633`): deeper red; out-of-spec, action-required.

### Tertiary
The control-room dark, used as a wholesale interior surface for embedded product widgets. Never used as a page background; only as the inside of a `ProductFrame`.
- **Dark Base** (`#0d1117`): the operations-floor background.
- **Dark Surface / Raised / Inset** (`#151b23` / `#1c2330` / `#0a0e14`): layering inside dark widgets only.
- **Dark Line / Subtle / Emphasis** (`#30363d` / `#21262d` / `#484f58`): hairline grid, panel dividers.
- **Dark Text** (`#e6edf3` primary, `#8b949e` secondary, `#484f58` muted).

### Neutral
The cream marketing world: every surface, every line, every body-text color. Tinted toward warm — never neutral gray.
- **Cream Background** (`#F7F6F2`): the page surface; the procurement office afternoon paper.
- **Cream Inset / Elevated** (`#EFEEE8` / `#FFFFFF`): sunken zones and elevated cards. `#FFFFFF` is reserved for the inside of `ProductFrame`; do not use it for page backgrounds.
- **Cream Line / Line2 / Line3** (`#E4E3DC` / `#DEDDD6` / `#D6D5CC`): hairline dividers, ring borders, focus marks.
- **Cream Ink / Ink2** (`#0F100E` / `#1F201D`): primary body type and the only legitimate near-black on this site. **Never `#000`.**
- **Cream Mute** (`#5F605A`): legitimate body-size mute (≥14px). The eyebrow color.
- **Cream Mute 2** (`#5A5B55`): darkened from `#6E6F69` to pass AA on cream-bg for body-sized text. Use for captions, axis labels, meta.
- **Cream Mute 3** (`#8E8F88`): **large-text only (≥18px).** Failing contrast at body sizes; use for display-sized supporting text or do not use at all.

### Named Rules

**The Two Worlds Rule.** Cream is marketing argument; dark is product evidence. They never blend. A cream surface never contains a dark band; a dark surface never contains a cream patch. The only transitions between worlds are inside a `ProductFrame` card.

**The One Voice Rule.** The teal accent appears as italic sub-clauses inside roman display headlines (`<em class="italic font-normal" style="color: var(--accent-ink)">para la ambición</em>`) and as a low-opacity gradient halo behind frames. Nowhere else. Not on buttons, not on links, not on borders, not on hover states, not on chart strokes.

**The No-Pure-Black Rule.** `#000` and `#fff` are forbidden. The ink is `#0F100E` (cream-ink) or `#0d1117` (dark-base). White interiors are reserved for the inside of `ProductFrame` only.

## 3. Typography

**Display Font:** Open Runde (with Nunito fallback) — a warm humanist display family. Not on the reflex-reject list; chosen specifically to avoid Inter/Plex/DM/Outfit monoculture. Carries the headlines.

**Body Font:** Nunito (with Open Runde fallback) — friendly humanist sans for paragraph copy.

**Label/Mono Font:** JetBrains Mono — used only for eyebrow labels, metric numerals (`tabular-nums`), and chart inline annotations.

**Character:** Open Runde + JetBrains Mono is the warm-meets-technical pairing the OT category does not reach for. The italic cuts in Open Runde are the brand's single most expressive surface — every hero, every section divider's italic fragment carries the voice.

### Hierarchy

- **Display Hero** (600, `clamp(40px, 5.4vw, 72px)`, line-height 0.98, tracking -0.03em, class `text-display-hero`): the main hero headline. Open Runde semibold roman with an italic fragment in `accent-ink`. Sized for shared-grid heroes that sit beside a `ProductFrame`.
- **Display CTA** (600, `clamp(40px, 6vw, 80px)`, line-height 0.98, tracking -0.035em, class `text-display-cta`): the final-CTA headline. Sized for centered, max-`18ch`-wrapped composition; slightly larger than the hero because it owns the full column.
- **Headline** (600, `clamp(32px, 4.5vw, 56px)`, line-height 1.04, tracking -0.025em, class `.h-section`): section headers. One use per section.
- **Title** (600, 20px / 28px, tracking -0.025em): card and subsection headers.
- **Body** (400, 16px / 26px, tracking normal): paragraph copy. Maximum line length 65–75ch (`max-w-xl` in Tailwind is close).
- **Label** (500, 11px / 16px, tracking 0.18em, uppercase, mono): eyebrows above sections (`.eyebrow`), metric labels under Hero numbers, chart annotations. Reserved; do not use on every section header.

### Named Rules

**The Italic Fragment Rule.** The brand's signature gesture: a single italic teal sub-clause inside an otherwise roman display headline. *"Infraestructura **para la ambición** desmedida."* Reserved for the page's two emotional poles: the Hero and the final CTA. Section headlines between (Detection, Forecasting, Comparison, Survey) hold in roman, using weight contrast (`font-semibold` + `font-normal`) for second-line emphasis. Per the README's change-request E, overuse was the failure mode; two bookends is the brand voice.

**The Sparse Eyebrow Rule.** Mono uppercase tracked eyebrow labels (`.eyebrow`) are voice, not section grammar. Three or four per page is correct. Above every section is template scaffolding and should be removed.

**The Tabular Numerals Rule.** Any number that the reader will compare to another number (`1s` next to `2.148` next to `11m`; `umbral=150` next to `actual=178`) uses `font-variant-numeric: tabular-nums` so digit widths align.

## 4. Elevation

Surfaces are flat at rest. The system has exactly one elevation token, and it is the brand's defining structural object.

### Shadow Vocabulary

- **`shadow-cream`** (`box-shadow: 0 1px 0 rgba(15,16,14,0.04), 0 24px 48px -28px rgba(15,16,14,0.18)`): the only shadow on the cream surface. Used exclusively under `ProductFrame` — the cream card that contains a dark control-room widget. The 1px top edge is the paper-on-paper hint; the 48px lift below is the depth that signals "live system inside, not marketing."
- **`shadow-glow`** (`box-shadow: 0 0 0 1px rgba(88,166,255,0.18), 0 8px 32px -8px rgba(88,166,255,0.18)`): defined in tokens; reserved for the dark side (advisory-state glow on a critical telemetry frame). Do not use it on the cream surface.

### Named Rules

**The Flat-by-Default Rule.** Every cream surface is flat. Hairline `cream-line` borders convey grouping; tonal shifts between `cream-bg` / `cream-inset` / `cream-elevated` convey nesting. The only legitimate shadow on the marketing surface is `shadow-cream` under a `ProductFrame`. A button is flat; a card is flat; an input is flat with a hairline ring. Shadows-as-decoration is forbidden.

**The Ring-Not-Border Rule.** When a cream surface needs a visible boundary, use `ring-1 ring-cream-line` rather than `border`. Rings do not affect layout box-sizing and read as paper edges, not boxes.

## 5. Components

For each component: lead with the character, then the spec.

### Buttons

Pills, cream-on-ink. Restraint is the voice; the page already has too much going on for a button to shout.

- **Shape:** pill (`rounded-full`, 9999px).
- **Primary:** `bg-cream-ink` (`#0F100E`) with `text-cream-bg`. Padding `px-5 py-2.5` on Hero, `px-3.5 py-1.5` on the desktop nav. Hover → `bg-cream-ink2` (`#1F201D`). The directional chevron icon (1.6 stroke, currentColor) is inset to signal "out to next step".
- **Ghost:** transparent with `ring-1 ring-cream-line`. Hover → ring strengthens to `cream-ink/40`. Same padding as primary.
- **Forbidden:** color-filled primary buttons (no teal, no status colors). The primary button is always near-black.

### Mobile Menu Trigger

Single hairline pill in cream-line2 stroke; `MENÚ` in tracked mono caps with a chevron-down. When open, the pill inverts to filled `cream-ink` and the chevron rotates 180°. The trigger is the inverse of the demo CTA in shape vocabulary: same pill, but negative space at rest. The two are never visible together on mobile (demo CTA hides below `md`).

### Mobile Menu Sheet

Full-bleed sheet from below the 60px sticky header to the viewport bottom. `bg-cream-bg/95` with `backdrop-blur-xl`. Inside: an eyebrow label `SECCIONES`, then the five anchors as numbered display-scale type (`01/ Plataforma`, `02/ Detección`, …). Numbers in tracked mono `cream-mute`, labels in Open Runde semibold at `clamp(30px, 8vw, 44px)`. Demo CTA pinned at the bottom. Motion: `opacity` + `translateY(-8px → 0)`, 300ms `ease-out-quart`. Never a slide-from-right hamburger drawer.

### ProductFrame (Signature)

The brand's defining structural object. A cream-elevated card with `ring-1 ring-cream-line`, `shadow-cream`, and `rounded-card` (10px). Header strip: `bg-cream-inset` with three `#E4E3DC` traffic-light dots (decorative — not buttons) and a mono `cream-mute2` label like `atlaxia.local · pump-3 · en directo`. Body: `bg-bg-base` (`#0d1117`) — the control-room. Everything inside is dark-side typography (`text-dark-text` family). This is the only place where the dark world and cream world touch.

### Status Pill

Lives only inside dark frames. Tonal background at 10–15% opacity of the status color, ring at 30–40% opacity, dot at full saturation, label in mono caps. Five variants: `normal`, `advisory`, `warning`, `critical`, `emergency`. **The token model for the rest of the dark side** — its discipline is what the chart SVGs should adopt (see the audit's P2 chart-tokens finding).

### Charts (Specimens)

Not styled as cards. They are the evidence. Each chart animates real model behavior:
- `TokenVsRules` — token signature vs. static threshold, 80ms tick.
- `ForecastChart` — predicted band ±σ vs. observed signal, 1s tick.
- `AnomalyLiveDemo` — RAF loop with injected drift.

All charts use `role="img"` with descriptive `aria-label` that narrates the chart's meaning ("la banda prevista diverge de la línea real once minutos antes"). All chart text is in JetBrains Mono. Status strokes use the OT status palette via CSS vars (planned; currently inline hex per the audit's P2 finding).

### Inputs

Cream-elevated background with `ring-1 ring-cream-line`. Padding `px-3 py-2.5`. Focus: `outline: 2px solid var(--accent-ink); outline-offset: 2px; border-radius: 4px;` — the global focus style. Labels are `text-cream-ink2` body weight 600; helper text uses `cream-mute2` (post-audit, body-safe).

### Navigation

Desktop: sticky 60px header, `bg-cream-bg/85` with `backdrop-blur`, hairline `border-b border-cream-line`. Five anchor links in `text-cream-mute` body-14 with hover transition to `cream-ink`. Right side: Contacto ghost link + Solicitar demo pill.

Mobile: same header, but anchors hidden. Right side: a single MENÚ hairline-pill trigger that opens the typographic sheet described above. The demo CTA disappears below `md` and re-renders inside the sheet at full touch-target size.

### Footer

Logo + brand name + four hairline chips (Privacidad, Términos, etc. — currently minimal per the audit). Type weight matches the nav; the footer is the nav's quiet echo.

## 6. Do's and Don'ts

### Do:
- **Do** use italic teal fragments inside roman display headlines (the Italic Fragment Rule), but only at the page's two emotional poles: the Hero and the final CTA. Section headlines between hold in roman with weight contrast.
- **Do** embed `ProductFrame` cards as the only legitimate bridge between cream and dark worlds. Real animated specimens inside, hand-set Spanish caption below in mono `cream-mute2`.
- **Do** use `cream-mute` (`#5F605A`) for body-size mute text and `cream-mute2` (`#5A5B55`) for the smallest captions. Both pass AA on `cream-bg`.
- **Do** use `tabular-nums` on every numeric comparison and metric (`1s` / `2.148` / `11m`, `umbral=150` / `actual=178`).
- **Do** keep mobile menu typography at display scale (`clamp(30px, 8vw, 44px)`) with numbered taxonomy (`01/ 02/`). The menu is a table of contents, not a hamburger drawer.
- **Do** use Open Runde for display, JetBrains Mono for labels and chart annotations. The pairing is the brand.
- **Do** ship real animations of model behavior. Token vs. threshold, predicted band vs. observed signal, anomaly bucle. Animations are evidence.

### Don't:
- **Don't** use the OT category reflex palette: navy + amber, gunmetal + safety-orange, terminal-green-on-black. AtlaXia is cream + teal + control-room.
- **Don't** use `#000` or `#fff`. Cream-ink is `#0F100E`; dark-base is `#0d1117`; the only legitimate white is the inside of a `ProductFrame`.
- **Don't** use the teal accent as a button fill, a chart stroke, a hover color, or a background block. Italic ink and gradient halo only.
- **Don't** repeat the mono tracked eyebrow above every section. Sparingly is voice; on every section is AI scaffolding.
- **Don't** add italic-teal fragments to mid-page section headlines. The mid-page voice is roman + `font-normal` weight contrast on the emphasized line. Italic-teal is reserved for the Hero and the CTA — the page's emotional poles. (See README change-request E.)
- **Don't** ship a hamburger-icon mobile menu. The mobile nav is a numbered typographic sheet at display scale.
- **Don't** use `cream-mute3` (`#8E8F88`) for any text under 18px equivalent. It fails contrast.
- **Don't** introduce `border-left` greater than 1px as a colored stripe on cards, callouts, or alerts.
- **Don't** use `background-clip: text` with a gradient. Solid color, weight contrast for emphasis.
- **Don't** use glassmorphism as decoration. The nav's `backdrop-blur` is purposeful (1px-bordered, behind transparent type); blurred-glass cards as ornament are forbidden.
- **Don't** ship the SaaS hero-metric template: big number, small label, supporting stats, gradient accent. The Hero already uses metrics; they are calibrated, mono-labelled, and tied to real product axes.
- **Don't** ship identical icon-title-text card grids. The three differentiator cards lead with mini-charts (specimens), not icons.
- **Don't** wrap chart numerics or inline SVG colors as literal hex. Promote to CSS vars (planned; see audit P2).
- **Don't** use em dashes (`—`) or en dashes (`–`) in prose. Use commas, colons, periods, or parentheses. The audit flags three current violations to fix.
- **Don't** name competitors (Dragos, Claroty, Nozomi). Comparative copy is structural, not adversarial. (README: "Lo que no haría".)
