## General Principles

### Core Values
- **Semantic First**: Use HTML5 semantic elements over generic divs
- **Accessible by Default**: All content must be keyboard accessible and screen-reader friendly
- **Performance Aware**: Optimize for Core Web Vitals (LCP, FID, CLS)
- **Valid Markup**: All HTML must validate against W3C standards
- **Progressive Enhancement**: Content accessible without JavaScript

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)
- Graceful degradation for older browsers

---

## Document Structure

### HTML5 Boilerplate

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Page description (150-160 characters)">
  
  <title>Page Title - Site Name</title>
  
  <!-- Preconnect to required origins -->
  <link rel="preconnect" href="https://api.example.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/styles.css">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" href="/favicon.png">
</head>
<body>
  <!-- Main content -->
  <header>
    <!-- Header content -->
  </header>
  
  <main id="main-content">
    <!-- Primary content -->
  </main>
  
  <footer>
    <!-- Footer content -->
  </footer>
  
  <!-- Scripts at end of body -->
  <script src="/js/main.js" defer></script>
</body>
</html>
```

### Required Meta Tags

```html
<!-- Character encoding (must be first in <head>) -->
<meta charset="UTF-8">

<!-- Responsive viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Description for SEO -->
<meta name="description" content="Concise page description">

<!-- Canonical URL -->
<link rel="canonical" href="https://example.com/page">
```

---

## Semantic HTML

### Use Semantic Elements

✅ **GOOD: Semantic HTML5**
```html
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content...</p>
  </article>
  
  <aside>
    <h2>Related Content</h2>
  </aside>
</main>

<footer>
  <p>&copy; 2026 Company Name</p>
</footer>
```

❌ **BAD: Generic divs**
```html
<div class="header">
  <div class="nav">
    <a href="/">Home</a>
  </div>
</div>

<div class="main">
  <div class="article">
    <div class="title">Article Title</div>
  </div>
</div>
```

### Semantic Element Usage

| Element | Purpose | When to Use |
|---------|---------|-------------|
| `<header>` | Introductory content | Top of page, sections, articles |
| `<nav>` | Navigation links | Main navigation, breadcrumbs, pagination |
| `<main>` | Primary content | Once per page, contains main content |
| `<article>` | Self-contained content | Blog posts, news articles, forum posts |
| `<section>` | Thematic grouping | Chapters, tabbed content, grouped content |
| `<aside>` | Tangential content | Sidebars, callouts, related links |
| `<footer>` | Footer information | Bottom of page, sections, articles |
| `<figure>` + `<figcaption>` | Illustrations with captions | Images, diagrams, code listings |

### Heading Hierarchy

✅ **GOOD: Proper hierarchy**
```html
<h1>Main Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>
    <h3>Another Subsection</h3>
  <h2>Another Section</h2>
```

❌ **BAD: Skipped levels**
```html
<h1>Main Title</h1>
  <h3>Skipped h2</h3> <!-- Don't skip heading levels -->
  <h5>Skipped h4</h5>
```

**Rules:**
- One `<h1>` per page
- Don't skip heading levels
- Use headings for structure, not styling
- Use CSS for visual sizing

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

✅ **MUST Requirements:**
- All interactive elements accessible via keyboard
- Logical tab order (top to bottom, left to right)
- Visible focus indicators
- Skip to main content link

```html
<!-- Skip link for keyboard users -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<main id="main-content" tabindex="-1">
  <!-- Content -->
</main>
```

```css
/* Visible focus indicator */
:focus {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

/* Skip link styling */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Best Practices

**Use ARIA only when semantic HTML is insufficient**

✅ **GOOD: Semantic HTML (no ARIA needed)**
```html
<button>Click Me</button>
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

✅ **GOOD: ARIA when necessary**
```html
<!-- Custom dropdown -->
<button 
  aria-expanded="false" 
  aria-controls="dropdown-menu"
  aria-haspopup="true"
>
  Menu
</button>
<ul id="dropdown-menu" role="menu" hidden>
  <li role="menuitem"><a href="/profile">Profile</a></li>
</ul>

<!-- Loading state -->
<button aria-busy="true">Loading...</button>

<!-- Live region for dynamic content -->
<div role="status" aria-live="polite" aria-atomic="true">
  Items added to cart
</div>
```

### Images & Alternative Text

✅ **GOOD: Descriptive alt text**
```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 40% in Q4 2025">

<!-- Decorative image -->
<img src="decorative-border.png" alt="" role="presentation">

<!-- Image as link -->
<a href="/home">
  <img src="logo.png" alt="Company Name Home">
</a>

<!-- Complex infographic -->
<figure>
  <img src="infographic.png" alt="Climate change statistics">
  <figcaption>
    Detailed description: Global temperatures have risen...
  </figcaption>
</figure>
```

❌ **BAD: Missing or poor alt text**
```html
<img src="chart.png"> <!-- Missing alt -->
<img src="photo.png" alt="image"> <!-- Non-descriptive -->
<img src="decorative.png" alt="Decorative border"> <!-- Decorative but has alt -->
```

### Form Accessibility

✅ **GOOD: Accessible forms**
```html
<form>
  <!-- Explicit label association -->
  <label for="email">Email Address</label>
  <input 
    type="email" 
    id="email" 
    name="email"
    required
    aria-describedby="email-help"
  >
  <span id="email-help" class="help-text">
    We'll never share your email
  </span>
  
  <!-- Error message -->
  <input 
    type="text" 
    id="username"
    aria-invalid="true"
    aria-describedby="username-error"
  >
  <span id="username-error" role="alert">
    Username must be at least 3 characters
  </span>
  
  <!-- Fieldset for grouped inputs -->
  <fieldset>
    <legend>Shipping Address</legend>
    <label for="street">Street</label>
    <input type="text" id="street" name="street">
  </fieldset>
  
  <button type="submit">Submit</button>
</form>
```

### Color Contrast

**WCAG AA Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+/14pt+ bold): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

```html
<!-- Use tools like WebAIM Contrast Checker -->
<style>
  /* ✅ GOOD: 7.7:1 ratio */
  .text { color: #333; background: #fff; }
  
  /* ❌ BAD: 2.1:1 ratio (too low) */
  .text-bad { color: #999; background: #fff; }
</style>
```

---

## Attribute Standards

### Attribute Order

Maintain consistent attribute order for readability:

1. `class`
2. `id`, `name`
3. `data-*`
4. `src`, `for`, `type`, `href`, `value`
5. `title`, `alt`
6. `role`, `aria-*`
7. `tabindex`
8. `style` (avoid inline styles)

**Example:**
```html
<input
  class="form-control"
  id="email"
  name="email"
  data-validation="email"
  type="email"
  placeholder="Enter email"
  aria-describedby="email-help"
  required
>
```

### Boolean Attributes

```html
<!-- ✅ GOOD: HTML5 boolean syntax -->
<input type="checkbox" checked>
<button disabled>Submit</button>
<video autoplay muted></video>

<!-- ❌ BAD: False values still enable attribute -->
<input type="checkbox" checked="false"> <!-- Still checked! -->
```

### Data Attributes

Use `data-*` for custom data storage:

```html
<!-- ✅ GOOD: Kebab-case naming -->
<article
  data-post-id="123"
  data-author-name="John Doe"
  data-published-date="2026-02-12"
>
  Article content
</article>

<!-- JavaScript access -->
<script>
  const article = document.querySelector('article');
  const postId = article.dataset.postId; // "123" (camelCase in JS)
</script>
```

---

## Performance Optimization

### Image Loading

```html
<!-- Lazy load below-fold images -->
<img 
  src="image.jpg" 
  alt="Description"
  loading="lazy"
  width="800"
  height="600"
>

<!-- Priority hint for LCP image -->
<img 
  src="hero.jpg" 
  alt="Hero image"
  fetchpriority="high"
  width="1200"
  height="600"
>

<!-- Async decoding for non-critical images -->
<img 
  src="decorative.jpg" 
  alt=""
  decoding="async"
>

<!-- Responsive images -->
<picture>
  <source 
    srcset="image-large.webp" 
    media="(min-width: 1024px)"
    type="image/webp"
  >
  <source 
    srcset="image-medium.webp" 
    media="(min-width: 768px)"
    type="image/webp"
  >
  <img 
    src="image-small.jpg" 
    alt="Description"
    width="600"
    height="400"
  >
</picture>

<!-- Multiple resolutions -->
<img
  src="image-800w.jpg"
  srcset="
    image-400w.jpg 400w,
    image-800w.jpg 800w,
    image-1200w.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Description"
>
```

### Resource Hints

```html
<head>
  <!-- Preconnect to critical origins -->
  <link rel="preconnect" href="https://api.example.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  
  <!-- DNS prefetch for multiple subdomains -->
  <link rel="dns-prefetch" href="https://cdn1.example.com">
  <link rel="dns-prefetch" href="https://cdn2.example.com">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/css/critical.css" as="style">
  
  <!-- Prefetch for next-page resources -->
  <link rel="prefetch" href="/next-page.html">
</head>
```

### Script Loading

```html
<!-- ✅ GOOD: Defer for non-critical scripts -->
<script src="/js/main.js" defer></script>

<!-- ✅ GOOD: Async for independent scripts -->
<script src="/js/analytics.js" async></script>

<!-- ✅ GOOD: Module scripts (deferred by default) -->
<script type="module" src="/js/app.js"></script>

<!-- ❌ BAD: Blocking scripts in <head> -->
<head>
  <script src="/js/large-library.js"></script>
</head>
```

---

## Security Best Practices

### Content Security Policy (CSP)

Implement a strict CSP to prevent XSS attacks (Cross-Site Scripting).

```html
<head>
  <!-- ✅ GOOD: Strict CSP via meta tag -->
  <meta 
    http-equiv="Content-Security-Policy" 
    content="default-src 'self'; script-src 'self' https://trusted.cdn.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';"
  >
</head>
```

### Link Safety

Prevent `window.opener` abuse (reverse tabnabbing) when opening new tabs.

```html
<!-- ✅ GOOD: Secure cross-origin links -->
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
  External Link
</a>

<!-- ❌ BAD: Vulnerable to reverse tabnabbing -->
<a href="https://external-site.com" target="_blank">
  External Link
</a>
```

### Iframe Sandboxing

Restrict capabilities of embedded content to follow the principle of least privilege.

```html
<!-- ✅ GOOD: Restricted iframe capabilities -->
<iframe 
  src="https://third-party.com/embed" 
  sandbox="allow-scripts allow-same-origin"
  title="Third party content"
></iframe>
```

---

## SEO & Metadata

### Essential Meta Tags

```html
<head>
  <!-- Primary Meta Tags -->
  <title>Page Title - Site Name (60 chars max)</title>
  <meta name="title" content="Page Title">
  <meta name="description" content="Page description 150-160 characters">
  <meta name="keywords" content="keyword1, keyword2, keyword3">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://example.com/page">
  
  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description for social sharing">
  <meta property="og:image" content="https://example.com/image.jpg">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://example.com/page">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Description for Twitter">
  <meta name="twitter:image" content="https://example.com/image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
</head>
```

### Structured Data

```html
<!-- Article structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Headline",
  "image": "https://example.com/image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Organization Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-02-12",
  "dateModified": "2026-02-12"
}
</script>

<!-- Breadcrumb structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://example.com"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "Category",
    "item": "https://example.com/category"
  },{
    "@type": "ListItem",
    "position": 3,
    "name": "Current Page"
  }]
}
</script>
```

---

## Web Components

### Custom Element Naming

```html
<!-- ✅ GOOD: Kebab-case with hyphen required -->
<my-component></my-component>
<user-profile></user-profile>
<custom-button></custom-button>

<!-- ❌ BAD: Single word (not allowed) -->
<mycomponent></mycomponent>
```

### Shadow DOM Usage

```html
<template id="user-card-template">
  <style>
    /* Encapsulated styles */
    .card { border: 1px solid #ccc; }
  </style>
  <div class="card">
    <slot name="name"></slot>
    <slot name="email"></slot>
  </div>
</template>

<user-card>
  <span slot="name">John Doe</span>
  <span slot="email">john@example.com</span>
</user-card>
```

---

## Code Formatting

### Indentation & Spacing

- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Max 120 characters
- **Nesting**: Keep to reasonable depth (< 5 levels)

### Element Formatting

```html
<!-- ✅ GOOD: Each attribute on new line for many attributes -->
<input
  type="email"
  class="form-control"
  id="email"
  name="email"
  placeholder="Enter email"
  aria-describedby="email-help"
  required
>

<!-- ✅ GOOD: Single line for few attributes -->
<button class="btn btn-primary" type="submit">Submit</button>

<!-- ✅ GOOD: Self-closing tags -->
<img src="image.jpg" alt="Description">
<br>
<input type="text">
```

### Comments

```html
<!-- Section: Main Navigation -->
<nav>
  <!-- TODO: Add mobile menu -->
</nav>

<!-- End Section: Main Navigation -->

<!-- NOTE: This component requires JavaScript -->
<div class="interactive-widget" data-init="true"></div>
```

---

## Validation & Tools

### Validation Tools
- **W3C Validator**: https://validator.w3.org/
- **WAVE**: https://wave.webaim.org/ (accessibility)
- **Lighthouse**: Chrome DevTools (performance, accessibility, SEO)

### Recommended Extensions
- **HTMLHint**: VS Code linting
- **axe DevTools**: Accessibility testing
- **Web Developer**: Browser extension for various checks

---

## References

- [MDN HTML Documentation](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [HTML5 Specification](https://html.spec.whatwg.org/)
- [Schema.org](https://schema.org/)
- [Web.dev Best Practices](https://web.dev/learn/html/)
