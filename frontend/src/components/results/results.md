# results/

## Purpose
Dashboard views for displaying analysis results — verdict, incumbents, emerging competitors, market sizing, and synthesis.

## Files
| File | Status | Description |
|---|---|---|
| `Charts.tsx` | implemented | Shared Recharts config (CHART_COLORS, PIE_COLORS, DarkTooltipContent, ChartContainer, NoData) |
| `Dashboard.tsx` | implemented | Main results container with tabs for each view |
| `Verdict.tsx` | implemented | GO/NO-GO banner with CircularProgressbar and factor GlowingCards |
| `IncumbentsView.tsx` | implemented | Market share donut, revenue bar charts, competitor table |
| `EmergingView.tsx` | implemented | Capital flow stats, funding bar chart, investor pills, emerging table |
| `MarketSizingView.tsx` | implemented | TAM stats, area chart, estimates bar chart, regional/drivers/headwinds |
| `SynthesisView.tsx` | implemented | Synthesis reasoning: methodology, company assessment, cross-agent findings, risk/opportunity |

## Dependencies
- Depends on: `ui/glowing-cards`, `@/types`, `@/lib/utils`, `recharts`, `react-circular-progressbar`
- Depended on by: `pages/AnalysisPage`

## Conventions
- All card backgrounds use `var(--bg-card)` CSS variable for theme support
- Chart inner areas use `var(--bg-inset)`
- Text colors use `var(--text-primary)`, `var(--text-muted)`, `var(--text-secondary)`, `var(--text-tertiary)`
- Accent/status colors (greens, ambers, reds, purples) are theme-agnostic and stay hardcoded
- Chart tooltips stay dark in both themes (DarkTooltipContent)

## Notes
- CHART_COLORS.axis and .grid use CSS variables that work in SVG fill/stroke attributes
