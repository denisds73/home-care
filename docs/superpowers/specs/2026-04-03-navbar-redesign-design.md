# Navbar Redesign — "Split Identity"

> **Goal**: Replace the current Urban Company-style navbar with a bold, expressive, brand-distinct navigation system across desktop and mobile.  
> **Aesthetic**: Bold & expressive — strong brand colors, distinctive shapes, micro-animations. The navbar is a statement piece.  
> **Files affected**: `src/components/layout/Navbar.tsx`, `src/components/layout/MobileNav.tsx`, `src/index.css` (new utility classes only)

---

## 1. Desktop Top Bar

Single compact row inside `max-w-7xl` centered container.

```
[Logo]  --------  [======= Search (rounded-full, centered) =======]  --------  [Cart] [Avatar]
```

### Logo
- House icon + "Home" (dark) + "Care" (brand purple)
- Same as current but slightly bolder weight
- `shrink-0`, links to `/`

### Search
- `rounded-full` pill shape, `bg-muted` background
- Search icon on left inside the input
- Small purple gradient button on the right side *inside* the input (search icon only)
- Width: `max-w-lg`, `flex-1` to fill available space
- Same search logic as current (category + service matching)

### Cart Button
- `w-10 h-10`, `rounded-full`, `bg-muted` hover state
- Cart icon centered
- Badge: existing `badgeBounce` animation on count change
- Only visible when `cartCount > 0`

### User Avatar
- `w-9 h-9` purple circle with user's first initial (white text)
- If not logged in: generic user icon
- Click opens `AccountSheet` (existing component)
- Always visible (replaces Customer/Admin buttons)

### Gradient Bottom Border
- 2px bottom border using `linear-gradient(to right, var(--color-primary), var(--color-primary-light))`
- Always visible — this is the brand signature element
- Replaces the current plain `border-b border-gray-100`

### Scroll Shadow
- Same behavior as current: subtle shadow at rest, stronger shadow after 20px scroll

### Removed Elements
- "Bangalore, Koramangala" location picker — removed
- "Customer" button — removed
- "Admin" button — removed (admin access moves to AccountSheet only)

---

## 2. Category Sub-Row (Desktop + Tablet)

Horizontally scrollable row of pill-shaped chips beneath the top bar.

### Container
- Same `max-w-7xl` centered container
- `border-b border-default` bottom separator
- Hidden on mobile (`hidden sm:flex`)
- Horizontal scroll with hidden scrollbar on tablet, fits without scroll on desktop (7 items)

### Chip Design
- Shape: `rounded-full` pill, `px-4 py-2`
- Content: small rounded category image (`w-5 h-5 rounded-md`) + label text
- Gap between chips: `gap-2`

### "All" Chip
- House icon instead of category image
- Same pill style as category chips
- Links to `/`

### Active State
- Background: purple gradient (`primary` to `primary-light`)
- Text: white
- Transform: `scale-105`
- Shadow: `shadow-[0_2px_8px_rgba(109,40,217,.25)]`
- Transition: `transition-all duration-200`

### Inactive State
- Background: `bg-muted`
- Text: `text-secondary`
- Hover: `bg-primary-soft` + `text-brand`, `transition-all duration-150`

### Active Detection
- "All" is active when `location.pathname === '/'`
- Category chip is active when URL matches `/services/{categoryId}`

---

## 3. Mobile Top Bar

Simplified single row, visible only on `sm:` breakpoint and below.

```
[Logo]  --------  [Search icon]  [Cart icon]
```

### Logo
- Same as desktop but slightly smaller (`text-base`)

### Search Icon Button
- `w-10 h-10`, `rounded-full`, `bg-muted`
- Magnifying glass icon
- Tap expands a full-width search overlay row

### Search Overlay
- Slides down beneath the navbar with `slideDown` animation (~200ms ease-out)
- Contains the same `rounded-full` pill search input from desktop
- "X" close button on the right
- `bg-black/20` backdrop overlay behind content
- Close on Escape key or X button tap
- Slide up animation on close

### Cart Icon
- Same circle style as desktop with badge
- Only visible when `cartCount > 0`

### No Avatar on Mobile
- Account access is in the mobile bottom tab bar

### Category Chips
- Hidden on mobile — categories accessed via homepage grid or Services bottom tab

### Gradient Bottom Border
- Same as desktop — carries over to mobile

---

## 4. Mobile Bottom Tab Bar

Floating, frosted-glass bar replacing the current flush-bottom tab bar.

### Container
- `mx-3`, `bottom-3` (not flush to edges or bottom)
- `rounded-2xl`
- Frosted glass effect using existing `.glass` class
- Respects `env(safe-area-inset-bottom)` with internal padding

### Tabs (5 total)
1. **Home** — house icon
2. **Services** — beaker icon
3. **Cart** — cart icon (elevated, special treatment)
4. **Offers** — tag icon
5. **Account** — user icon (opens AccountSheet)

### Icon Style
- Size: `w-6 h-6`, stroke style
- Labels: `text-[.65rem]` beneath each icon
- Cart tab: no label (the elevated circle is self-explanatory)

### Active Indicator
- Small `w-1.5 h-1.5` brand-colored dot beneath the active icon
- `scale-in` animation when appearing on tab switch
- Active tab text: `text-brand`
- Inactive tab text: `text-muted`

### Cart Tab (Special)
- Elevated purple circle: `w-12 h-12`, `rounded-2xl` (matches bar's shape language)
- Floats above the bar with `-mt` offset
- Brand shadow: `shadow-[0_4px_12px_rgba(109,40,217,.32)]`
- Single `pulse` animation cycle when an item is added to cart
- Badge for count (same as current)

### Navigation Logic
- Same as current `MobileNav` — Home navigates to `/`, Services scrolls to categories, Cart opens drawer, Offers scrolls to offers section, Account opens AccountSheet

---

## 5. Interactions & Animations

### No New Libraries
All animations use existing CSS keyframes and Tailwind transitions.

### New CSS Required
- `slideDown` / `slideUp` keyframe for mobile search overlay
- `.nav-chip-active` utility for the gradient chip background
- `.nav-gradient-border` utility for the 2px gradient bottom border
- `.nav-floating-bar` utility for the mobile bottom bar glass + rounded + margin treatment
- `.nav-dot` utility for the active tab dot indicator
- Single-cycle `pulse` keyframe for cart circle on item add

### Existing CSS Reused
- `.glass` — frosted glass effect (mobile bottom bar)
- `.scale-in` — active dot animation
- `.badgeBounce` / `.badge-bounce` — cart badge animation
- `.slide-up` — AccountSheet (already exists)
- `.fade-in` — general transitions
- `.input-base` — search input base styling
- `.bg-muted`, `.bg-brand`, `.text-brand`, `.text-muted` — design tokens

### Scroll Shadow
- Same `useState` + scroll listener pattern as current

---

## 6. Accessibility

- `role="navigation"` + `aria-label` on both desktop and mobile navs
- Search input: `aria-label="Search services"`
- Cart button: `aria-label="Shopping cart"`
- Avatar button: `aria-label="Account menu"`
- Mobile search overlay: close on `Escape` key
- All interactive elements: minimum 44x44px touch targets
- Focus-visible styles via existing `.btn-base:focus-visible` or `input-base:focus-visible`
- Active category chip: `aria-current="page"`
- Mobile bottom bar: `role="navigation"` + `aria-label="Mobile navigation"`

---

## 7. Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< 640px` (mobile) | Simplified top bar (logo + search icon + cart) + floating bottom tab bar. No category chips. Search expands as overlay. |
| `640px–1023px` (tablet) | Full top bar (logo + search + cart + avatar) + scrollable category chips. No bottom tab bar. |
| `>= 1024px` (desktop) | Full top bar + category chips fit without scroll. No bottom tab bar. |

---

## 8. Removed / Changed from Current

| Current | New |
|---|---|
| Location picker ("Bangalore, Koramangala") | Removed |
| "Customer" button | Removed |
| "Admin" button | Removed — access via AccountSheet only |
| Plain white navbar with `border-gray-100` | Gradient bottom border (brand signature) |
| Category tabs with underline indicator | Rounded pill chips with gradient fill |
| Category images (`w-6 h-6`) | Smaller (`w-5 h-5 rounded-md`) inside pills |
| Flush-bottom mobile tab bar | Floating, rounded, frosted-glass bar |
| Mobile tab active = color only | Color + animated dot indicator |
| No user avatar in navbar | Purple circle avatar with initial |
| Search always visible on mobile | Search icon → expandable overlay |
