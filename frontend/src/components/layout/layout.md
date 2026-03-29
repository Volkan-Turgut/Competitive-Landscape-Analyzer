# layout/

Shared layout components.

## Files
| File | Status | Description |
|------|--------|-------------|
| Navbar.tsx | implemented | Sticky translucent top bar with backdrop blur, uses `--navbar-bg` CSS variable |
| ThemeToggle.tsx | implemented | Animated light/dark toggle button, toggles `dark` class on `<html>`, persists to localStorage |
| Container.tsx | implemented | max-w-5xl centered wrapper |

## Conventions
- All colors use CSS variables for light/dark theme support
- Navbar uses `--navbar-bg` (pre-computed translucent rgba) since Tailwind can't decompose CSS vars for opacity
