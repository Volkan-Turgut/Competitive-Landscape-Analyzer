# landing/

Landing page sections displayed at route `/`.

## Files
| File | Status | Description |
|------|--------|-------------|
| Hero.tsx | implemented | Dark hero with rotating text animation, glow effects, CTAs — **stays dark regardless of theme** |
| ValueProps.tsx | implemented | 3 value prop GlowingCards (market intelligence, competitive mapping, verdict) |
| HowItWorks.tsx | implemented | 3-step flow with connecting arrows |
| FeatureTabs.tsx | implemented | 4-tab feature section with mockup data, uses CSS variables for theme support |

## Conventions
- Hero.tsx is a theme exception — always dark with purple glow (design statement)
- All other components use CSS variables for light/dark theme support
