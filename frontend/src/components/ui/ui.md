# ui/

## Purpose
Shared UI primitives — shadcn/ui components and custom reusable components.

## Files
| File | Status | Description |
|---|---|---|
| `badge.tsx` | implemented | shadcn Badge component |
| `button.tsx` | implemented | shadcn Button component |
| `card.tsx` | implemented | shadcn Card component |
| `glowing-cards.tsx` | implemented | Custom GlowingCard with per-card hover glow effect via onMouseEnter/Leave |
| `input.tsx` | implemented | shadcn Input component |
| `table.tsx` | implemented | shadcn Table component |
| `tabs.tsx` | implemented | shadcn Tabs component |
| `SourceTooltip.tsx` | implemented | Hover tooltip showing clickable source attribution links for data values |
| `DottedGlowBackground.tsx` | implemented | Canvas-based animated dot grid background with theme-aware glow effect |

## Dependencies
- Depends on: `@/lib/utils`
- Depended on by: `landing/ValueProps`, `results/Verdict`, `results/EmergingView`, `pages/LandingPage`

## Conventions
- shadcn components use HSL CSS variables from index.css
- GlowingCard uses `var(--bg-card)` for theme-aware background
- Glow colors are accent-based (passed as props) and theme-agnostic
