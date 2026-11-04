## General Principles

### Core Values
- **Tailwind**: Version 4 with CSS-first configuration
- **Mobile-First**: Design for mobile, enhance progressively for desktop
- **Component-Based**: Reusable, modular styles with BEM naming
- **Performance-Aware**: Optimize for render performance; avoid deep nesting and layout-triggering animations
- **Maintainable**: Clear naming, consistent patterns, no inline styles
- **Accessible**: WCAG 2.1 AA compliance — support keyboard, screen readers, and color contrast

### Methodology
- **Primary**: Modified BEM (Block-Element-Modifier) with hyphen-separated format
- **Architecture**: 7-1 inspired directory structure under `src/styles/tailwind/`
- **Layers**: Utility Class (atomic), Component Class, Design Tokens (theme)
- **Tokens**: Design tokens defined in `@theme` as the single source of truth
- **Only**: Only layout and spacing classes can be used in HTML

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
- Progressive enhancement for older browsers
- PostCSS/Autoprefixer for vendor prefixes

---

## File Organization (7-1 Inspired)

### Directory Structure

```
src/styles/tailwind/
├── tokens/              # @theme definitions (colors, spacing, typography)
│   ├── _colors.css
│   ├── _spacing.css
│   ├── _typography.css
│   └── _breakpoints.css
├── base/                # Reset, typography, base element styles
│   ├── _reset.css
│   ├── _typography.css
│   └── _base.css
├── components/          # BEM component classes using @apply
│   ├── _button.css
│   ├── _card.css
│   ├── _form.css
│   ├── _modal.css
│   └── _table.css
├── layout/              # Header, footer, grid, sidebar
│   ├── _header.css
│   ├── _footer.css
│   ├── _navigation.css
│   ├── _sidebar.css
│   └── _grid.css
├── pages/               # Page-specific styles
│   ├── _home.css
│   └── _about.css
├── themes/              # Theme overrides (dark mode, etc.)
│   ├── _default.css
│   └── _dark.css
├── vendors/             # 3rd party CSS overrides
│   └── _datepicker.css
└── main.css             # Entry point importing all partials
```

### main.css Structure

```css
/* 1. Import Tailwind CSS v4 (CSS-first entry point) */
@import "tailwindcss";

/* 2. Design Tokens */
@import "./tokens/_colors.css";
@import "./tokens/_spacing.css";
@import "./tokens/_typography.css";
@import "./tokens/_breakpoints.css";

/* 3. Base Styles */
@import "./base/_reset.css";
@import "./base/_typography.css";
@import "./base/_base.css";

/* 4. Layout */
@import "./layout/_header.css";
@import "./layout/_footer.css";
@import "./layout/_navigation.css";
@import "./layout/_sidebar.css";
@import "./layout/_grid.css";

/* 5. Components */
@import "./components/_button.css";
@import "./components/_card.css";
@import "./components/_form.css";
@import "./components/_modal.css";
@import "./components/_table.css";

/* 6. Page-specific */
@import "./pages/_home.css";
@import "./pages/_about.css";

/* 7. Themes */
@import "./themes/_default.css";
@import "./themes/_dark.css";

/* 8. Vendor Overrides */
@import "./vendors/_datepicker.css";
```

```css
/* ✅ GOOD: CSS-first configuration (Tailwind v4) */
@import "tailwindcss";

@theme {
  --color-primary: #007bff;
}

/* ❌ BAD: Legacy JavaScript configuration (Tailwind v3) */
/* tailwind.config.js — Do not use. Tailwind v4 uses CSS-first config. */
```

---

## Design Tokens (@theme)

### Tier 1: Primitive Tokens (The Palette)

Raw values describing "what it looks like". Defined in `tokens/_colors.css`.

```css
/* tokens/_colors.css */
@theme {
  /* Blue Scale */
  --color-blue-50: #eff6ff;
  --color-blue-100: #cce5ff;
  --color-blue-500: #007bff;
  --color-blue-600: #0069d9;
  --color-blue-700: #0056b3;

  /* Gray Scale */
  --color-gray-50: #f8f9fa;
  --color-gray-100: #f1f3f5;
  --color-gray-200: #dee2e6;
  --color-gray-500: #6c757d;
  --color-gray-900: #212529;

  /* System Colors */
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  --color-white: #ffffff;
  --color-black: #000000;
}
```

### Tier 2: Semantic Tokens (The Usage)

Aliases describing "what it does". Defined in the same file or a separate semantic token file.

```css
/* ⚠️ STRATEGY: Semantic tokens reference primitives.
   Components use semantic tokens, never primitives directly. */

@theme {
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-600);
  --color-primary-active: var(--color-blue-700);

  --color-secondary: var(--color-gray-500);
  --color-text: var(--color-gray-900);
  --color-text-light: var(--color-gray-500);
  --color-background: var(--color-white);
  --color-border: var(--color-gray-200);
  --color-surface: var(--color-gray-50);
}
```

```css
/* ✅ GOOD: Use semantic tokens in components */
.card {
  @apply bg-background text-text border border-border;
}

/* ❌ BAD: Use primitive tokens directly in components */
.card {
  @apply bg-gray-50 text-gray-900 border border-gray-200;
}

/* ❌ BAD: Hardcoded hex values */
.card {
  background-color: #f8f9fa;
  color: #212529;
}
```

### Typography Tokens

```css
/* tokens/_typography.css */
@theme {
  /* Font Families */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-heading: 'Poppins', var(--font-family-base);
  --font-family-mono: 'Fira Code', 'Courier New', monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-base: 1.5;
  --line-height-relaxed: 1.75;
}
```

### Spacing & Sizing Tokens

```css
/* tokens/_spacing.css */
@theme {
  /* Spacing Scale */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;

  /* Border Radius */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}

/* tokens/_breakpoints.css */
@theme {
  /* Breakpoints */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}
```

### Z-Index Management

```css
@theme {
  /* Z-Index Layers */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* ✅ GOOD: Use z-index tokens */
.modal {
  z-index: var(--z-modal);
}

/* ✅ GOOD: Component isolation for local stacking */
.card-complex {
  isolation: isolate;
}

/* ❌ BAD: Magic numbers */
.modal {
  z-index: 99999;
}
```

---

## Layer System

### Layer Order

Tailwind v4 defines a clear cascade order. Styles in later layers override earlier ones.

```
@theme     →  Design tokens (CSS custom properties)
@layer base       →  Element resets, global typography
@layer components →  BEM component classes (via @apply)
@layer utilities  →  Tailwind utility classes (auto-generated + custom)
```

### Theme Layer

The `@theme` directive defines design tokens as CSS custom properties. These are the single source of truth.

```css
/* ✅ GOOD: All tokens in @theme */
@theme {
  --color-primary: #007bff;
  --spacing-md: 16px;
  --font-size-base: 1rem;
}
```

### Base Layer

Global element styles and resets. No class selectors — only element selectors.

```css
/* base/_base.css */
@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
    color: var(--color-text);
    background-color: var(--color-background);
  }

  :is(h1, h2, h3, h4, h5, h6) {
    font-family: var(--font-family-heading);
    line-height: var(--line-height-tight);
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
  }
}
```

### Components Layer

BEM component classes built with `@apply`. This is where most styling lives.

```css
/* components/_button.css */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center
      font-medium rounded-md cursor-pointer
      transition-colors duration-200;
  }

  .btn-primary {
    @apply bg-primary text-white;
  }

  .btn-primary:hover {
    @apply bg-primary-hover;
  }

  .btn-secondary {
    @apply bg-secondary text-white;
  }

  .btn-sm {
    @apply text-sm px-sm py-xs;
  }

  .btn-lg {
    @apply text-lg px-xl py-md;
  }
}
```

### Utilities Layer

Custom utility classes for cases where Tailwind does not provide a built-in utility. Use sparingly.

```css
/* ✅ GOOD: Custom utility for a genuine gap */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* ❌ BAD: Duplicating existing Tailwind utilities */
@layer utilities {
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
/* Tailwind already provides: flex items-center justify-center */
```

### Layer Precedence

```css
/* ✅ GOOD: Component in correct layer — utilities can override */
@layer components {
  .card {
    @apply bg-background rounded-lg shadow-md;
  }
}

/* ❌ BAD: Component outside a layer — unpredictable specificity */
.card {
  @apply bg-background rounded-lg shadow-md;
}
```

---

## Component Classes (BEM + @apply)

### Critical Rule: Hyphen-Separated, NOT Traditional BEM

Using a **modified BEM format** with hyphens throughout:

| ❌ Traditional BEM | ✅ Our Format |
|-------------------|---------------|
| `.block__element--modifier` | `.block-element-modifier` |
| `.card__header--primary` | `.card-header-primary` |
| `.user__avatar--large` | `.user-avatar-large` |
| `.nav__item--active` | `.nav-item-active` |

**Rationale:** Hyphen-separated format provides:
- Better readability and consistency
- Easier to type and remember
- Cleaner integration with Tailwind's utility classes
- Reduced cognitive load for developers

### Block (Component)

The **root element** representing a standalone entity with independent meaning.

**Naming:** Use descriptive, lowercase, hyphen-separated names

**Examples:** `.card`, `.user-profile`, `.search-form`, `.data-table`

**Avoid:**
- PascalCase (`.Card`)
- Underscores (`.user_profile`)
- camelCase (`.searchForm`)
- Missing hyphens (`.userprofile`)

### Element (Child Component)

A **part of a block** that has no standalone meaning and is semantically tied to its block.

**Naming:** `block-element` (block name + hyphen + element name)

**Examples:** `.card-header`, `.card-body`, `.user-profile-avatar`, `.search-form-input`

**Avoid:**
- Double underscore (`.card__header`)
- camelCase (`.cardHeader`)
- Generic names without block prefix (`.header`)
- Deep nesting (`.card-header-item-link` — flatten to `.card-link`)

### Modifier (Variant)

A **flag on a block or element** that changes appearance, behavior, or state.

**Naming:** `block-modifier` or `block-element-modifier`

**Block Modifiers:** `.btn-primary`, `.btn-lg`, `.card-featured`

**Element Modifiers:** `.card-header-primary`, `.user-profile-avatar-large`

**Avoid:**
- Double dash (`.btn--primary`)
- camelCase (`.btnPrimary`)
- Missing block/element prefix (`.primary`)
- State prefixes (`.btn-is-primary`, `.btn-has-icon`)

### State Classes

For **dynamic states** (active, disabled, loading, etc.), use modifier format.

**Examples:** `.btn-active`, `.btn-disabled`, `.btn-loading`, `.nav-item-active`

**Avoid:**
- Generic state classes (`.is-active`)
- Plain state classes (`.btn.active`)
- Attribute selectors (`.btn[disabled]`)

### @apply Composition

Build component classes by composing Tailwind utilities with `@apply`.

```css
/* ✅ GOOD: Clear, focused @apply declarations */
@layer components {
  .card {
    @apply bg-background rounded-lg shadow-md overflow-hidden;
  }

  .card-header {
    @apply border-b border-border px-lg py-md;
  }

  .card-title {
    @apply text-xl font-semibold text-text;
  }

  .card-body {
    @apply px-lg py-md;
  }

  .card-footer {
    @apply border-t border-border px-lg py-md;
  }

  .card-featured {
    @apply border-2 border-primary;
  }

  .card-compact {
    @apply px-md py-sm;
  }
}
```

```css
/* ⚠️ AVOID: Excessive @apply chains (more than ~8 utilities) */
@layer components {
  .hero-section {
    @apply flex flex-col items-center justify-center
      min-h-screen bg-gradient-to-b from-primary to-primary-active
      text-white text-center px-lg py-3xl
      rounded-none shadow-2xl border-b-4 border-primary-hover;
  }
}

/* ✅ BETTER: Split into plain CSS for complex declarations */
@layer components {
  .hero-section {
    @apply flex flex-col items-center justify-center min-h-screen text-white text-center;
    background: linear-gradient(to bottom, var(--color-primary), var(--color-primary-active));
    border-bottom: 4px solid var(--color-primary-hover);
  }
}
```

### Component Structure Example

**Block:** `.card` (root container)

**Elements:**
- `.card-header` (header container)
- `.card-avatar` (avatar image)
- `.card-name` (name text)
- `.card-body` (content area)
- `.card-footer` (action area)

**Modifiers:**
- `.card-featured` (highlighted variant)
- `.card-compact` (smaller spacing)
- `.card-avatar-large` (larger avatar)

---

## HTML Usage Rules

### The Core Constraint

⚠️ **RULE: Only layout and spacing utility classes may appear in HTML markup. All visual styling (colors, typography, borders, shadows, etc.) must live in CSS files via `@apply` or component classes.**

### Allowed Classes in HTML

| Category | Allowed Utilities | Examples |
|----------|-------------------|----------|
| Display | `block`, `inline`, `flex`, `grid`, `hidden`, `inline-flex`, `inline-grid` | `<div class="flex">` |
| Flex Layout | `flex-row`, `flex-col`, `flex-wrap`, `flex-1`, `grow`, `shrink` | `<div class="flex flex-col">` |
| Grid Layout | `grid-cols-*`, `grid-rows-*`, `col-span-*`, `row-span-*` | `<div class="grid grid-cols-3">` |
| Gap | `gap-*`, `gap-x-*`, `gap-y-*` | `<div class="flex gap-md">` |
| Padding | `p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*` | `<div class="p-lg">` |
| Margin | `m-*`, `mx-*`, `my-*`, `mt-*`, `mr-*`, `mb-*`, `ml-*` | `<div class="mt-md">` |
| Width / Height | `w-*`, `h-*`, `min-w-*`, `min-h-*`, `max-w-*`, `max-h-*` | `<div class="w-full h-screen">` |
| Position | `relative`, `absolute`, `fixed`, `sticky`, `static` | `<div class="relative">` |
| Inset | `top-*`, `right-*`, `bottom-*`, `left-*`, `inset-*` | `<div class="absolute inset-0">` |
| Overflow | `overflow-hidden`, `overflow-auto`, `overflow-scroll` | `<div class="overflow-hidden">` |
| Container | `container`, `mx-auto` | `<div class="container mx-auto">` |
| Space Between | `space-x-*`, `space-y-*` | `<div class="space-y-md">` |
| Order | `order-*`, `order-first`, `order-last` | `<div class="order-2">` |
| Alignment | `items-*`, `justify-*`, `content-*`, `self-*`, `place-*` | `<div class="items-center justify-between">` |

### Must Use @apply in CSS

| Category | Class Patterns | Where to Define |
|----------|---------------|-----------------|
| Background Color | `bg-*` | Component CSS via `@apply` |
| Text Color | `text-*` (color) | Component CSS via `@apply` |
| Font Size | `text-*` (size) | Component CSS via `@apply` |
| Font Weight | `font-*` | Component CSS via `@apply` |
| Font Family | `font-*` | Component CSS via `@apply` |
| Line Height | `leading-*` | Component CSS via `@apply` |
| Border | `border-*`, `rounded-*` | Component CSS via `@apply` |
| Shadow | `shadow-*` | Component CSS via `@apply` |
| Opacity | `opacity-*` | Component CSS via `@apply` |
| Transform | `scale-*`, `rotate-*`, `translate-*` | Component CSS via `@apply` |
| Transition | `transition-*`, `duration-*`, `ease-*` | Component CSS via `@apply` |
| Ring | `ring-*` | Component CSS via `@apply` |

### Combining BEM Classes with Layout Utilities

```html
<!-- ✅ GOOD: BEM class handles visual styling, layout utilities handle structure -->
<div class="card flex flex-col gap-md p-lg">
  <div class="card-header flex items-center justify-between">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">
    <p class="card-text">Content goes here.</p>
  </div>
  <div class="card-footer flex justify-end gap-sm">
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </div>
</div>
```

```html
<!-- ❌ BAD: Visual utility classes in HTML (utility soup) -->
<div class="bg-white rounded-lg shadow-md text-gray-900 border border-gray-200
            flex flex-col gap-4 p-6">
  <div class="border-b border-gray-200 pb-4 flex items-center justify-between">
    <h3 class="text-xl font-semibold text-gray-900">Title</h3>
  </div>
  <div class="py-4">
    <p class="text-base text-gray-700 leading-relaxed">Content goes here.</p>
  </div>
  <div class="border-t border-gray-200 pt-4 flex justify-end gap-2">
    <button class="bg-gray-500 text-white px-4 py-2 rounded-md">Cancel</button>
    <button class="bg-blue-500 text-white px-4 py-2 rounded-md">Save</button>
  </div>
</div>
```

### Responsive Layout in HTML

Responsive layout and spacing variants are allowed directly in HTML.

```html
<!-- ✅ GOOD: Responsive layout utilities in markup -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md p-lg">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</div>

<!-- ✅ GOOD: Responsive spacing -->
<section class="px-md md:px-lg lg:px-xl py-lg md:py-xl">
  ...
</section>
```

---

## Responsive Design

### Mobile-First Approach

```css
/* ⚠️ STRATEGY:
   1. Base styles = mobile.
   2. Use min-width breakpoints (md:, lg:, xl:) to enhance for larger screens.
   3. Layout responsiveness goes in HTML markup.
   4. Component visual responsiveness goes in CSS files. */

/* ✅ GOOD: Mobile-first component styling */
@layer components {
  .card-title {
    @apply text-lg font-semibold text-text;
  }

  @media (min-width: theme(--breakpoint-md)) {
    .card-title {
      @apply text-xl;
    }
  }

  @media (min-width: theme(--breakpoint-lg)) {
    .card-title {
      @apply text-2xl;
    }
  }
}

/* ❌ BAD: Desktop-first (max-width) */
@layer components {
  .card-title {
    @apply text-2xl font-semibold text-text;
  }

  @media (max-width: theme(--breakpoint-lg)) {
    .card-title {
      @apply text-xl;
    }
  }

  @media (max-width: theme(--breakpoint-md)) {
    .card-title {
      @apply text-lg;
    }
  }
}
```

### Breakpoint Tokens

```css
/* Defined in tokens/_breakpoints.css */
@theme {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}
```

### Container Queries

**Component-based responsive design** — preferred over media queries for component internals.

```css
/* ✅ GOOD: Container queries for component-level responsiveness */
@layer components {
  .card-container {
    container-type: inline-size;
    container-name: card;
  }

  .card {
    @apply bg-background rounded-lg shadow-md;
  }

  @container card (min-width: 400px) {
    .card {
      @apply flex flex-row;
    }

    .card-image {
      width: 200px;
    }
  }

  @container card (min-width: 600px) {
    .card-title {
      @apply text-2xl;
    }
  }
}
```

### Responsive Typography

```css
/* ✅ GOOD: Fluid typography using clamp() in tokens */
@theme {
  --font-size-fluid-sm: clamp(0.875rem, 1.5vw, 1rem);
  --font-size-fluid-base: clamp(1rem, 2vw, 1.25rem);
  --font-size-fluid-lg: clamp(1.25rem, 3vw, 2rem);
  --font-size-fluid-xl: clamp(1.75rem, 5vw, 3rem);
}

@layer components {
  .hero-title {
    font-size: var(--font-size-fluid-xl);
    @apply font-bold text-text leading-tight;
  }
}
```

---

## Performance Guidelines

### CSS Bundle Size

Tailwind v4 automatically purges unused utility classes. Component classes defined with `@apply` inside `@layer components` are also purged correctly when unused.

```css
/* ✅ GOOD: @apply in @layer components — purged when unused */
@layer components {
  .card {
    @apply bg-background rounded-lg shadow-md;
  }
}

/* ⚠️ CAUTION: Styles outside @layer may not be purged */
.card {
  @apply bg-background rounded-lg shadow-md;
}
```

### CSS Containment

```css
/* Use contain property for performance isolation */
@layer components {
  .card {
    @apply bg-background rounded-lg shadow-md;
    contain: layout style paint;
  }

  .article-list {
    contain: layout;
  }
}
```

### Animation Performance

```css
/* ✅ GOOD: Only animate transform and opacity */
@layer components {
  .modal {
    @apply transition-all duration-300 ease-in-out;
  }

  .slide-in {
    @apply transition-transform duration-300 ease-in-out;
    transform: translateX(-100%);
  }

  .slide-in-active {
    transform: translateX(0);
  }

  .animated-element {
    will-change: transform;
  }

  .animated-element-done {
    will-change: auto;
  }
}

/* ❌ BAD: Animating layout properties */
@layer components {
  .bad-animation {
    transition: width 0.3s, height 0.3s, left 0.3s;
  }
}
```

### Selector Performance

```css
/* ✅ GOOD: Flat BEM selectors (efficient) */
.btn { }
.card-title { }
.nav-item-active { }

/* ❌ BAD: Deeply nested selectors */
.card .card-header .card-title span { }

/* ❌ BAD: Over-qualified selectors */
div.card { }
ul li a { }
#id .class { }
```

### @apply Overhead

```css
/* ⚠️ RULE: If @apply exceeds ~8 utilities, consider plain CSS. */

/* ❌ BAD: Excessive @apply */
@layer components {
  .hero {
    @apply flex flex-col items-center justify-center min-h-screen
      bg-gradient-to-b from-blue-500 to-blue-700
      text-white text-center text-4xl font-bold leading-tight
      px-lg py-3xl rounded-none shadow-2xl;
  }
}

/* ✅ BETTER: Mix @apply with plain CSS */
@layer components {
  .hero {
    @apply flex flex-col items-center justify-center min-h-screen text-white text-center;
    background: linear-gradient(to bottom, var(--color-primary), var(--color-primary-active));
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
  }
}
```

---

## Accessibility

### Focus Indicators

```css
/* ✅ GOOD: Visible focus indicator using @apply */
@layer components {
  .btn {
    @apply focus-visible:outline-2 focus-visible:outline-offset-2
      focus-visible:outline-primary;
  }

  .form-input {
    @apply focus-visible:ring-2 focus-visible:ring-primary
      focus-visible:border-primary;
  }
}

/* ✅ GOOD: Remove focus for mouse users, keep for keyboard */
@layer base {
  :focus:not(:focus-visible) {
    outline: none;
  }
}
```

### Color Contrast

```css
/* ✅ GOOD: WCAG AA compliant (4.5:1 for normal text) */
@theme {
  --color-text: #212529;
  --color-background: #ffffff;
  /* Contrast ratio: 16.1:1 ✓ */
}

/* ❌ BAD: Low contrast (2.1:1) */
@theme {
  --color-text-bad: #999999;
  /* Against white background: 2.8:1 ✗ */
}

/* Use tools: WebAIM Contrast Checker, Chrome DevTools */
```

### Visually Hidden

```css
/* ✅ GOOD: Use Tailwind's sr-only for screen reader content */
@layer components {
  .btn-icon {
    @apply inline-flex items-center justify-center;
  }
}
```

```html
<!-- Usage in HTML -->
<button class="btn-icon">
  <svg><!-- icon --></svg>
  <span class="sr-only">Close menu</span>
</button>
```

### Reduced Motion

```css
/* ✅ GOOD: Respect user preference via @apply */
@layer components {
  .modal {
    @apply transition-all duration-300 ease-in-out
      motion-reduce:transition-none;
  }

  .spinner {
    @apply animate-spin motion-reduce:animate-none;
  }
}

/* ✅ GOOD: Global reduced motion override */
@layer base {
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

### Dark Mode Accessibility

```css
/* ✅ GOOD: Ensure contrast compliance in both themes */
@theme {
  --color-text: #212529;
  --color-background: #ffffff;
  /* Light mode: 16.1:1 ✓ */
}

/* themes/_dark.css */
@layer themes {
  [data-theme="dark"] {
    --color-text: #f8f9fa;
    --color-background: #212529;
    /* Dark mode: 15.4:1 ✓ */
  }
}
```

---

## Code Formatting & Tooling

### General Rules

- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Max 120 characters
- **Quotes**: Single quotes for font names and strings
- **Semicolons**: Always end declarations with semicolon
- **File Names**: Prefix partials with `_` underscore (e.g., `_button.css`)

### @apply Property Order

Follow the same property group ordering when composing `@apply` declarations:

```css
@layer components {
  .element {
    /* 1. Positioning & Display */
    @apply relative flex items-center;

    /* 2. Box Model (Size, Padding, Margin) */
    @apply w-full p-md m-0;

    /* 3. Typography */
    @apply text-base font-medium leading-base text-text;

    /* 4. Visual (Background, Border, Shadow) */
    @apply bg-background border border-border rounded-md shadow-sm;

    /* 5. Animation */
    @apply transition-colors duration-200 ease-in-out;

    /* 6. Misc */
    @apply cursor-pointer select-none;
  }
}
```

### Class Order in HTML

When combining BEM classes with layout utilities, follow this order:

```html
<!-- Order: BEM class → Display/Layout → Alignment → Gap → Size → Spacing -->
<div class="card flex flex-col items-start gap-md w-full p-lg mt-xl">
  ...
</div>

<!-- ❌ BAD: Random order -->
<div class="p-lg card mt-xl flex gap-md w-full flex-col items-start">
  ...
</div>
```

### Comments

```css
/* Section comment */
/* ============================================================================ */

/**
 * Component: Button
 * Description: Reusable button component with variants
 */
@layer components {
  .btn {
    /* Single line comment */
    @apply inline-flex items-center justify-center font-medium rounded-md;
  }
}

/* TODO: Add dark theme variant */
/* FIXME: Focus style not visible on dark backgrounds */
/* NOTE: This requires JavaScript initialization */
```

### Required Tools

**Tailwind CSS v4**
- CSS-first configuration (no `tailwind.config.js`)
- `@import "tailwindcss"` as entry point

**PostCSS Plugins**
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default'
    })
  ]
}
```

**Linting**
```json
// .stylelintrc.json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-tailwindcss"
  ],
  "rules": {
    "indentation": 2,
    "max-nesting-depth": 3,
    "selector-max-id": 0,
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$"
  }
}
```

**Prettier**
```json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["clsx", "cn"]
}
```

---

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Blog — v4](https://tailwindcss.com/blog)
- [BEM Methodology](https://getbem.com/)
- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev CSS](https://web.dev/learn/css/)