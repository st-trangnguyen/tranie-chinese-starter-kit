## General Principles

### Core Values
- **Mobile-First**: Design for mobile, enhance for desktop
- **Component-Based**: Reusable, modular styles
- **Performance-Aware**: Optimize for render performance
- **Maintainable**: Clear naming, consistent patterns
- **Accessible**: Support keyboard, screen readers, color contrast

### Methodology
- **Primary**: BEM (Block Element Modifier) with namespaces
- **Fallback**: OOCSS principles for shared utilities
- **Architecture**: 7-1 Pattern for file organization

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Progressive enhancement for older browsers
- Autoprefixer for vendor prefixes

---

## File Organization (7-1 Pattern)

### Directory Structure

```
scss/
├── abstracts/          # Variables, functions, mixins
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _functions.scss
│   └── _placeholders.scss
├── base/               # Reset, typography, base styles
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _base.scss
├── components/         # Buttons, cards, forms
│   ├── _button.scss
│   ├── _card.scss
│   ├── _form.scss
│   ├── _modal.scss
│   └── _table.scss
├── layout/             # Header, footer, grid
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _navigation.scss
│   ├── _sidebar.scss
│   └── _grid.scss
├── pages/              # Page-specific styles
│   ├── _home.scss
│   ├── _about.scss
│   └── _contact.scss
├── themes/             # Theme variations
│   ├── _default.scss
│   └── _dark.scss
├── vendors/            # 3rd party CSS
│   ├── _normalize.scss
│   └── _datepicker.scss
└── main.scss           # Main file importing all partials
```

### main.scss Structure

```scss
// 1. Configuration and helpers (No output)
@use 'sass:meta';
@use 'abstracts/variables';
@use 'abstracts/functions';
@use 'abstracts/mixins';
@use 'abstracts/placeholders';

// 2. Define Cascade Layers Order
// Ensures utilities always win over components, regardless of load order.
@layer reset, base, components, themes, utilities;

// 3. Vendors & Reset (Layer: reset)
// Usage: meta.load-css allows us to wrap imports in layers dynamically
@layer reset {
  @include meta.load-css('vendors/normalize');
  @include meta.load-css('base/reset');
}

// 4. Base Attributes (Layer: base)
@layer base {
  @include meta.load-css('base/typography');
  @include meta.load-css('base/base');
}

// 5. Layout & Components (Layer: components)
@layer components {
  @include meta.load-css('layout/header');
  @include meta.load-css('layout/grid');
  @include meta.load-css('components/button');
  @include meta.load-css('components/card');
}

// 6. Page-specific styles (Layer: components or separate layer)
@use 'pages/home';
@use 'pages/about';

// 7. Themes (Layer: themes)
@layer themes {
  @include meta.load-css('themes/default');
}
```

---

## SASS Conventions

### Variables

#### Naming Convention
- Use `$` prefix
- Use kebab-case
- Group by category
- Use semantic names over descriptive names

```scss
// ⚠️ STRATEGY: Use SASS maps to generate CSS Custom Properties.
// CSS Variables are the Source of Truth for the browser/DOM.
// SASS Variables are only for loop generation or complex math.

// 1. Tier 1: Primitive Tokens (The Palette)
// Raw values describing "what it looks like"
$palette-blue: (
  '500': #007bff,
  '100': #cce5ff,
);

$palette-gray: (
  '900': #212529,
  '500': #6c757d,
  '200': #dee2e6,
);

$palette-system: (
  'success': #28a745,
  'danger': #dc3545,
  'warning': #ffc107,
  'info': #17a2b8,
  'white': #ffffff,
);

// 2. Tier 2: Semantic Tokens (The Usage)
// Aliases describing "what it does". Points to primitives.
$tokens-colors: (
  'primary': map-get($palette-blue, '500'),
  'secondary': map-get($palette-gray, '500'),
  'success': map-get($palette-system, 'success'),
  'danger': map-get($palette-system, 'danger'),
  'warning': map-get($palette-system, 'warning'),
  'info': map-get($palette-system, 'info'),
  'text': map-get($palette-gray, '900'),
  'text-light': map-get($palette-gray, '500'),
  'background': map-get($palette-system, 'white'),
  'border': map-get($palette-gray, '200')
);

$tokens-spacing: (
  'sm': 8px,
  'md': 16px,
  'lg': 24px
);

// 2. Generate CSS Variables (in _base.scss)
:root {
  @each $name, $value in $tokens-colors {
    --color-#{$name}: #{$value};
  }
  
  @each $name, $value in $tokens-spacing {
    --spacing-#{$name}: #{$value};
  }
}

// 3. Usage rules
// ✅ GOOD: Use CSS Variable in components
.card {
  background-color: var(--color-background);
  padding: var(--spacing-md);
}

// ❌ BAD: Using raw SASS values in properties
.card {
  color: map-get($tokens-colors, 'text'); // Avoid unless necessary for SASS functions
}

// Typography
$font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-family-heading: 'Poppins', $font-family-base;
$font-family-mono: 'Fira Code', 'Courier New', monospace;

$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;
$font-size-xl: 20px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

$line-height-base: 1.5;
$line-height-heading: 1.2;

// Breakpoints
$breakpoint-xs: 0;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

// Z-index Management

// Strategy 1: Global Map for App-Level Layers (Modals, Tooltips)
$z-layers: (
  'base': 0,
  'dropdown': 1000,
  'sticky': 1020,
  'fixed': 1030,
  'modal-backdrop': 1040,
  'modal': 1050,
  'popover': 1060,
  'tooltip': 1070
);

// Function to access z-index layers
@function z($layer) {
  @if not map-has-key($z-layers, $layer) {
    @warn "No z-index found in $z-layers map for `#{$layer}`. Property omitted.";
  }
  @return map-get($z-layers, $layer);
}

// Usage Example:
// .modal {
//   z-index: z('modal');
// }

// Strategy 2: Component Isolation (Preferred)
// Use isolation: isolate to create a new stacking context for self-contained components.
// This prevents internal z-indexes from leaking out or fighting with global layers.
.card-complex {
  isolation: isolate; // Creates new context. z-index: 999 inside here implies 999 *within* this card.
}

// ❌ BAD: Non-semantic names
$blue: #007bff;
$dark-gray: #333;
```

#### Maps for Related Values

```scss
// ✅ GOOD: Use maps for grouped values
$colors: (
  'primary': #007bff,
  'secondary': #6c757d,
  'success': #28a745,
  'danger': #dc3545
);

$breakpoints: (
  'sm': 576px,
  'md': 768px,
  'lg': 992px,
  'xl': 1200px,
  'xxl': 1400px
);

$spacings: (
  'xs': 4px,
  'sm': 8px,
  'md': 16px,
  'lg': 24px,
  'xl': 32px
);

// Access map values
.button-primary {
  background-color: map-get($colors, 'primary');
}

// Or use @each to generate classes
@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
}
```

### Mixins

#### Naming & Usage

```scss
// ⚠️ RULE: Do NOT create mixins for standard CSS properties ensuring vendor prefixes.
// Rely on PostCSS/Autoprefixer.

// ❌ BAD: Vendor prefix mixins (Obsolete)
// @mixin border-radius($radius) { ... }

// ✅ GOOD: Use standard property
.card {
  border-radius: 4px; // Autoprefixer handles the rest
}

// ✅ GOOD: Verb-based naming
@mixin center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Usage
@use 'abstracts/variables' as v;
@use 'abstracts/mixins' as m;

.card {
  // ✅ GOOD: Use standard properties (handled by PostCSS/Autoprefixer)
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  // ✅ GOOD: Use directional mixins from abstracts
  @include m.respond-above(v.$breakpoint-md) {
    padding: v.$spacing-lg;
  }
}
```

#### Common Utility Classes (Preferred over Mixins)

Prefer **Utility Classes** over mixins for layout, spacing, and common visual patterns to reduce CSS bundle size.

```scss
// Clearfix
.u-clearfix::after {
  content: "";
  display: table;
  clear: both;
}

// Visually hidden (accessible)
.u-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Text Truncation
.u-truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Aspect Ratio (Modern CSS)
.u-aspect-video {
  aspect-ratio: 16 / 9;
}

.u-aspect-square {
  aspect-ratio: 1;
}

// Fluid Typography (Example of when to use Mixin/CSS Variable logic)
// Prefer CSS Clamp() for modern fluid type
:root {
  --font-size-fluid: clamp(1rem, 2.5vw, 1.5rem);
}
```

### Functions

```scss
@use 'sass:math';
@use 'sass:color';

// Strip units
@function strip-unit($number) {
  @if type-of($number) == 'number' and not unitless($number) {
    @return math.div($number, ($number * 0 + 1));
  }
  @return $number;
}

// Convert px to rem
@function rem($pixels, $context: 16px) {
  @return #{math.div(strip-unit($pixels), strip-unit($context))}rem;
}

// Tint (lighten) color
@function tint($base-color, $percentage) {
  @return color.mix(white, $base-color, $percentage);
}

// Shade (darken) color
@function shade($base-color, $percentage) {
  @return color.mix(black, $base-color, $percentage);
}

// Usage
@use 'abstracts/variables' as v;

.heading {
  font-size: rem(24px);  // 1.5rem
  color: shade(v.$color-primary, 20%);
}
```

### Nesting Rules

**Maximum 3 levels deep**

```scss
// ✅ GOOD: Reasonable nesting (2-3 levels)
@use 'abstracts/variables' as v;

.card {
  padding: v.$spacing-md;
  
  &-header {
    border-bottom: 1px solid v.$color-border;
  }
  
  &-title {
    font-size: v.$font-size-xl;
    
    &:hover {
      color: v.$color-primary;
    }
  }
  
  &-featured {
    border: 2px solid v.$color-primary;
  }
}

// ❌ BAD: Too deep nesting (5 levels)
.navigation {
  .menu {
    .item {
      .link {
        .icon {
          color: red;  // Too deep!
        }
      }
    }
  }
}
```

### Partials

```scss
// All partials start with _ underscore
// _button.scss
// _card.scss
// _variables.scss

// Use 'use' to load module with namespace (default is filename)
@use 'variables';
// Usage: variables.$color-primary

// Use 'forward' to make members available when this file is used
@forward 'mixins';

@use 'components/button';
```

### Best Practices

```scss
@use 'sass:math';
@use 'abstracts/variables' as v;

// ✅ GOOD: Use !default for library variables
$color-primary: #007bff !default;

// ✅ GOOD: Use SASS math functions from math module
$column-width: math.div(100%, 12);  // 8.333%

// ✅ GOOD: Placeholder selectors for repeated styles
%button-base {
  display: inline-block;
  padding: v.$spacing-sm v.$spacing-md;
  border: none;
  cursor: pointer;
}

.button-primary {
  @extend %button-base;
  background-color: v.$color-primary;
}

// ⚠️ AVOID: @extend with classes (creates complex selectors)
.button-secondary {
  @extend .button;  // Avoid if possible
}

// ✅ BETTER: Use mixins instead
@mixin button-base {
  display: inline-block;
  padding: v.$spacing-sm v.$spacing-md;
  border: none;
  cursor: pointer;
}

.button-primary {
  @include button-base;
  background-color: v.$color-primary;
}
```

---

## Modern CSS Features

### CSS Custom Properties (Variables)

**Use for dynamic theming**

```scss
:root {
  // Colors
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-text: #212529;
  --color-background: #ffffff;
  
  // Spacing
  --spacing-unit: 8px;
  --spacing-sm: calc(var(--spacing-unit) * 1);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);
  
  // Typography
  --font-size-base: 16px;
  --line-height-base: 1.5;
}

// Dark theme
[data-theme="dark"] {
  --color-primary: #4dabf7;
  --color-text: #f8f9fa;
  --color-background: #212529;
}

// Usage
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  color: var(--color-text);
}

// With fallback
.element {
  color: var(--color-primary, #007bff);
}
```

### CSS Grid

```scss
// ✅ GOOD: Grid for 2D layouts
.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}

// Complex grid
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  gap: var(--spacing-md);
  min-height: 100vh;
}

.sidebar { grid-area: sidebar; }
.header { grid-area: header; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

### Flexbox

```scss
// ✅ GOOD: Flexbox for 1D layouts
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

// Flex utilities
.u-flex {
  display: flex;
}

.u-flex-column {
  flex-direction: column;
}

.u-flex-center {
  justify-content: center;
  align-items: center;
}

.u-flex-between {
  justify-content: space-between;
}

.u-flex-wrap {
  flex-wrap: wrap;
}
```

### Logical Properties

**For internationalization (LTR/RTL support)**

```scss
// ✅ GOOD: Logical properties
.card {
  margin-inline: var(--spacing-md);      // replaces margin-left + margin-right
  padding-block: var(--spacing-lg);      // replaces padding-top + padding-bottom
  border-inline-start: 1px solid;        // replaces border-left (RTL-aware)
}

// ❌ OLD: Physical properties
.card {
  margin-left: var(--spacing-md);
  margin-right: var(--spacing-md);
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-left: 1px solid;
}
```

### Container Queries

**Component-based responsive design**

```scss
// ✅ GOOD: Container queries for components
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
  
  .card-image {
    width: 200px;
  }
}

@container card (min-width: 600px) {
  .card-title {
    font-size: 1.5rem;
  }
}
```

### Modern Selectors

```scss
// :is() - matches any selector in list
:is(h1, h2, h3, h4, h5, h6) {
  line-height: var(--line-height-heading);
}

// :where() - same as :is() but 0 specificity
:where(ul, ol) {
  padding-left: var(--spacing-lg);
}

// :has() - parent selector
.card:has(.card-badge) {
  padding-top: var(--spacing-lg);
}

// :not() - exclusion
button:not(.button-ghost) {
  background-color: var(--color-primary);
}
```

---

## BEM Methodology (Hyphen-Separated Format)

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

### BEM Structure

#### Block (Component)

The **root element** representing a standalone entity with independent meaning.

**Naming:** Use descriptive, lowercase, hyphen-separated names

**Examples:** `.card`, `.user-profile`, `.search-form`, `.data-table`

**Avoid:**
- PascalCase (`.Card`)
- Underscores (`.user_profile`)
- camelCase (`.searchForm`)
- Missing hyphens (`.userprofile`)

#### Element (Child Component)

A **part of a block** that has no standalone meaning and is semantically tied to its block.

**Naming:** `block-element` (block name + hyphen + element name)

**Examples:** `.card-header`, `.card-body`, `.user-profile-avatar`, `.search-form-input`

**Avoid:**
- Double underscore (`.card__header`)
- camelCase (`.cardHeader`)
- Generic names without block prefix (`.header`)
- Deep nesting (`.card-header-item-link` → flatten to `.card-link`)

#### Modifier (Variant)

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

## Responsive Design

### Mobile-First Approach

```scss
// ⚠️ STRATEGY: 
// 1. Use Component Queries (@container) for component internals.
// 2. Use Media Queries (@media) ONLY for global page layout changes (grid, sidebar).

// ✅ GOOD: Component-level responsiveness (Container Queries)
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex; // Switches to horizontal layout when container allows
  }
}

// ✅ GOOD: Mobile-first Global Layout (Media Queries)
.layout {
  display: block;
}

@media (min-width: $breakpoint-lg) {
  .layout {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
}

// ❌ BAD: Desktop-first (max-width)
.component {
  padding: var(--spacing-lg);
  font-size: var(--font-size-lg);
}

@media (max-width: $breakpoint-lg) {
  .component {
    padding: var(--spacing-md);
  }
}
```

### Breakpoint Mixin

```scss
// Mixin definition
@mixin respond-above($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

@mixin respond-below($breakpoint) {
  @media (max-width: $breakpoint - 1px) {
    @content;
  }
}

@mixin respond-between($min, $max) {
  @media (min-width: $min) and (max-width: $max - 1px) {
    @content;
  }
}

// Usage
@use 'abstracts/variables' as v;

.sidebar {
  display: none;
  
  @include respond-above(v.$breakpoint-md) {
    display: block;
    width: 250px;
  }
}
```

### Responsive Typography

```scss
// Fluid typography (Modern CSS)
h1 {
  font-size: clamp(1.75rem, 5vw, 3rem);
}

// Or breakpoint-based (SASS)
@use 'abstracts/variables' as v;

h2 {
  font-size: 20px;
  
  @include respond-above(v.$breakpoint-md) {
    font-size: 24px;
  }
  
  @include respond-above(v.$breakpoint-lg) {
    font-size: 28px;
  }
}
```

---

## Performance Guidelines

### Critical CSS

```scss
// Inline critical above-fold CSS (<14KB)
// Extract manually or use tools like Critical, Critters

// critical.scss - Above fold only
body {
  margin: 0;
  font-family: var(--font-family-base);
}

.l-header {
  height: 60px;
  background: white;
}

.hero {
  height: 400px;
  background: $color-primary;
}
```

### CSS Containment

```scss
// Use contain property for performance
.card {
  contain: layout style paint;
}

.article-list {
  contain: layout;
}
```

### Animation Performance

```scss
// ✅ GOOD: Only animate transform and opacity
.modal {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-in {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  
  &.is-active {
    transform: translateX(0);
  }
}

// Use will-change sparingly
.animated-element {
  will-change: transform;
  
  &.animation-done {
    will-change: auto;
  }
}

// ❌ BAD: Animating layout properties
.bad-animation {
  transition: width 0.3s, height 0.3s, left 0.3s;  // Triggers layout!
}
```

### Selector Performance

```scss
// ✅ GOOD: Efficient selectors
.button { }
.card-title { }

// ⚠️ AVOID: Universal selector
* {
  box-sizing: border-box;  // OK for reset, avoid elsewhere
}

// ❌ BAD: Over-qualified selectors
div.card { }  // Unnecessary tag
ul li a { }   // Too generic
#id .class { }  // ID + class overkill
```

### Unused CSS Removal

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html', './src/**/*.js', './src/**/*.vue'],
      safelist: ['is-active', 'is-open']  // Don't remove dynamic classes
    })
  ]
}
```

---

## Accessibility in CSS

### Focus Indicators

```scss
// ✅ GOOD: Visible focus indicator
:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

// Custom focus styles
.button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

// Remove focus for mouse users, keep for keyboard
.button:focus:not(:focus-visible) {
  outline: none;
}
```

### Color Contrast

```scss
// ✅ GOOD: WCAG AA compliant (4.5:1 for normal text)
.text {
  color: #212529;
  background-color: #ffffff;  // 16.1:1 contrast
}

// ❌ BAD: Low contrast (2.1:1)
.text-bad {
  color: #999999;
  background-color: #ffffff;
}

// Use tools: WebAIM Contrast Checker, Chrome DevTools
```

### Visually Hidden

```scss
// Accessible hiding (for screen readers)
.u-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Hide from everyone
.u-hidden {
  display: none;
}
```

### Reduced Motion

```scss
// Respect user preference
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Code Formatting

### General Rules

- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Max 120 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Always end declarations with semicolon
- **Trailing Commas**: Use in multi-line lists

### Property Order

```scss
.element {
  // 1. Positioning
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: z('dropdown'); // or 100 if local stacking
  
  // 2. Box Model
  display: block;
  width: 100px;
  height: 100px;
  padding: 10px;
  margin: 10px;
  border: 1px solid #ccc;
  
  // 3. Typography
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #333;
  text-align: center;
  
  // 4. Visual
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 1;
  
  // 5. Animation
  transition: all 0.3s ease;
  transform: translateX(0);
  
  // 6. Misc
  cursor: pointer;
  user-select: none;
}
```

### Comments

```scss
// Section comment
// ============================================================================

/**
 * Component: Button
 * Description: Reusable button component with variants
 */
.c-button {
  // Single line comment
  padding: var(--spacing-sm);
  
  /* Multi-line comment preserved in compiled CSS */
  background-color: var(--color-primary);
}

// TODO: Add dark theme variant
// FIXME: Focus style not visible on dark backgrounds
// NOTE: This requires JavaScript initialization
```

---

## Tooling

### Required Tools

**Sass Compiler**
- Dart Sass (recommended)
- Node Sass (deprecated)

**PostCSS Plugins**
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true
      }
    }),
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
  "extends": "stylelint-config-standard-scss",
  "rules": {
    "indentation": 2,
    "max-nesting-depth": 3,
    "selector-max-id": 0,
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$"
  }
}
```

**VS Code Extensions**
- Stylelint
- SCSS IntelliSense
- Color Highlight

---

## References

- [SASS Documentation](https://sass-lang.com/documentation)
- [BEM Methodology](https://getbem.com/)
- [CSS Guidelines by Harry Roberts](https://cssguidelin.es/)
- [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)
- [Web.dev CSS](https://web.dev/learn/css/)
