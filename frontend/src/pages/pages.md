# pages/

## Purpose
Top-level route pages.

## Files
| File | Status | Description |
|---|---|---|
| `LandingPage.tsx` | implemented | Home page with Hero, ValueProps, agent showcase sections, demo links, analysis form |
| `AnalysisPage.tsx` | implemented | Routes to DAG (live) or Dashboard (demo/complete), handles SSE connection |

## Dependencies
- Depends on: `components/landing/*`, `components/analysis/*`, `components/dag/*`, `components/results/*`, `hooks/useAnalysis`, `data/demos`
- Depended on by: router in `App.tsx`

## Conventions
- All background/text colors use CSS variables for theme support
- LandingPage uses IntersectionObserver for scroll-reveal animations
