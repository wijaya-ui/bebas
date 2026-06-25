# Design Brief

## Direction

StokWise — single-warehouse inventory management dashboard with an industrial/utilitarian aesthetic. Precision-first, no decoration, built for operators who need speed and clarity.

## Tone

Brutally minimal and precise: high information density, sharp edges, cool teal on neutral surfaces. Every pixel earns its place.

## Differentiation

A stock-management UI that feels like a premium warehouse operations terminal — no rounded SaaS softness, no playful gradients, just confident structure and instant scanability.

## Color Palette

| Token                | OKLCH         | Role                          |
| -------------------- | ------------- | ----------------------------- |
| background           | 0.98 0.005 260| page canvas                   |
| foreground           | 0.14 0.015 260| primary text                  |
| card                 | 1.0 0.0 0     | elevated panels               |
| primary              | 0.42 0.14 240 | CTAs, active nav, links       |
| accent               | 0.6 0.15 170  | highlights, status badges     |
| muted                | 0.94 0.01 260 | secondary backgrounds         |
| destructive          | 0.55 0.22 25  | delete, error, low-stock      |
| warning              | 0.72 0.15 85  | expiry alerts                 |
| success              | 0.6 0.16 150  | positive stock status         |
| border               | 0.9 0.008 260 | dividers, input borders       |
| ring                 | 0.42 0.14 240 | focus rings                   |

## Typography

- Display: Space Grotesk — headings, page titles, metric values
- Body: DM Sans — tables, forms, labels, UI text
- Mono: JetBrains Mono — SKU codes, quantities, dates
- Scale: hero `text-5xl font-bold tracking-tight`, h2 `text-2xl font-semibold tracking-tight`, label `text-xs font-semibold uppercase tracking-wider`, body `text-sm`

## Elevation & Depth

Flat hierarchy with hairline borders (`border`) separating zones. Cards use `shadow-subtle` (1px drop) only when elevated above the canvas. No heavy shadows or glassmorphism.

## Structural Zones

| Zone    | Background    | Border        | Notes                                |
| ------- | ------------- | ------------- | ------------------------------------ |
| Header  | bg-card       | border-b      | fixed topbar with hamburger on mobile|
| Sidebar | bg-sidebar    | border-r      | collapsible on mobile, pinned on lg |
| Content | bg-background | —             | alternating row tints in tables      |
| Footer  | bg-muted/40   | border-t      | minimal, low visual weight           |

## Spacing & Rhythm

Dense utility spacing: `gap-3` in tables, `p-4` in cards, `py-6` between sections. Tight vertical rhythm; extra whitespace only around primary actions.

## Component Patterns

- Buttons: `rounded-sm` (4px), primary filled `bg-primary text-primary-foreground`, secondary outlined `border border-input`
- Cards: `rounded-sm`, `bg-card`, `border`, `shadow-subtle` when hovered
- Badges: `rounded-sm`, `px-2 py-0.5`, `text-xs font-mono uppercase` — red for low stock, amber for expiry, green for safe
- Tables: `border-collapse`, row hover `bg-muted/50`, header `bg-muted`

## Motion

- Entrance: `animate-fadeIn` on dashboard cards, staggered 50ms
- Hover: `transition-smooth` on rows and buttons, 150ms
- Decorative: none — no ambient motion in a productivity tool

## Constraints

- No PDF/Excel export UI
- No barcode/QR scanning UI
- No invoice or direct-sales flow UI
- Responsive from 320px to 1440px

## Signature Detail

Metric cards at the top of the dashboard use a monospace numeral display (JetBrains Mono) at `text-4xl` with a hairline bottom border, making inventory counts feel like live terminal readouts.
