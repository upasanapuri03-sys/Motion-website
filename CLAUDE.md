# CLAUDE.md — Motion Website

This file provides context and conventions for AI assistants working on this codebase.

---

## Project Overview

A single-page, animation-focused marketing website for a motion design studio. Built with
**vanilla HTML, CSS, and JavaScript** — no framework, no build step, no package manager.

**Live stack:**
- HTML5 with semantic sections and a `<canvas>` element
- Pure CSS3 with custom properties (design tokens)
- Vanilla JS (ES6+) for all interactivity
- **GSAP 3.12.5** (via CDN) for scroll-triggered animations and timelines
- **GSAP ScrollTrigger** and **SplitText** plugins (also via CDN)
- **Google Fonts** (Bebas Neue, Inter, Space Mono) via CDN

---

## Repository Structure

```
Motion-website/
├── index.html   # All markup — 8 page sections
├── main.js      # All interactivity and animations (~395 lines)
├── style.css    # All styles (~701 lines)
└── CLAUDE.md    # This file
```

There are **no other files** — no config, no build artifacts, no tests, no env files.

---

## Running the Site

No install or build step needed. Serve the directory over HTTP:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in a browser. Opening `index.html` directly as a
`file://` URL may work but can break CDN-loaded scripts in some browsers.

---

## Page Structure (index.html)

Eight top-level sections, each identified by an `id`:

| Section   | ID / Class       | Purpose                              |
|-----------|------------------|--------------------------------------|
| Nav       | `#nav`           | Sticky header with anchor links      |
| Hero      | `#hero`          | Full-screen canvas + headline entry  |
| Marquee   | `.marquee-wrap`  | Horizontally scrolling ticker strip  |
| Work      | `#work`          | Portfolio card grid                  |
| About     | `#about`         | Stats, company blurb                 |
| Services  | `#services`      | Accordion-style service list         |
| Contact   | `#contact`       | CTA headline and social links        |
| Footer    | `footer`         | Copyright line                       |

Custom cursor elements (`#cursor`, `#cursor-follower`) live outside the section flow,
directly inside `<body>`.

---

## CSS Conventions (style.css)

### Design Tokens (CSS Custom Properties)

All visual values are defined on `:root`. **Always use these variables — never hardcode
colours, fonts, or the nav height.**

```css
--bg: #080808          /* Primary background */
--bg2: #0e0e0e         /* Slightly lighter surface */
--fg: #f0f0f0          /* Primary text */
--fg-muted: #888       /* Subdued text */
--accent: #00FFB2      /* Neon green — primary accent */
--accent2: #7B2FBE     /* Purple accent */
--accent3: #FF2D55     /* Pink/red accent */
--mono: 'Space Mono'   /* Monospace — labels, tags */
--sans: 'Inter'        /* Body text */
--display: 'Bebas Neue'/* Headlines */
--nav-h: 72px          /* Nav height — use for offset calculations */
```

### Naming Conventions

- BEM-inspired but flat: `.block-element` (e.g. `.work-card`, `.hero-headline`)
- State classes added by JS: `.scrolled` on `<nav>`, `.fade-up` / `.reveal-title` for
  intersection-triggered entries
- Per-card colour theming via inline CSS custom property:
  ```html
  <div class="card-bg" style="--clr:#7B2FBE"></div>
  ```
  Used in CSS as `background: linear-gradient(135deg, var(--clr) 0%, #080808 120%)`.

### Responsive Breakpoints

```css
@media (max-width: 900px) { /* Tablet */ }
@media (max-width: 640px) { /* Mobile — also hides custom cursor */ }
```

### No preprocessors, no utility classes, no CSS modules.

---

## JavaScript Conventions (main.js)

### Section Headers

Major logical blocks are delimited with banner comments:

```js
/* ============================================================
   SECTION NAME
   ============================================================ */
```

Current sections in order:
1. **HERO CANVAS** — Particle / Trail System
2. **CUSTOM CURSOR**
3. **NAV SCROLL STYLE**
4. **HERO ENTRANCE ANIMATION**
5. **MARQUEE**
6. **WORK SECTION — SCROLL ANIMATIONS**
7. **ABOUT SECTION**
8. **SERVICES SECTION**
9. **SCROLL-TRIGGERED FADE-UPS**

### GSAP Usage Patterns

**Timeline (entrance animations):**
```js
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
heroTl.to(target, { ... }).from(target, { ... });
```

**ScrollTrigger:**
```js
gsap.from(elements, {
  scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    toggleActions: 'play none none none',
  },
  y: 40, opacity: 0, stagger: 0.08
});
```

**Count-up numbers:**
```js
gsap.to({ val: 0 }, {
  val: targetNumber,
  duration: 2,
  onUpdate() { el.textContent = Math.round(this.targets()[0].val) + '+'; }
});
```

### Manual Letter Splitting

The hero headline is split letter-by-letter via a custom `splitIntoLetters(el)` function
rather than GSAP SplitText, wrapping each character in `<span class="char">`. Do not
replace this with SplitText unless you also update the corresponding GSAP animation
that targets `.char` spans.

### 3D Card Tilt

Cards with `data-tilt` attribute get mouse-tracking tilt applied via GSAP:
```js
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rx = (e.clientY - cy) / (rect.height / 2) * 6;
    const ry = -(e.clientX - cx) / (rect.width / 2) * 6;
    gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 800 });
  });
  card.addEventListener('mouseleave', () =>
    gsap.to(card, { rotateX: 0, rotateY: 0 }));
});
```

### Canvas System

Located at the top of `main.js`. Uses a `Particle` class for mouse-trail effects.
Key globals: `W`, `H` (canvas dimensions), `particles` (active trail), `mouse` (position).
The main `draw()` loop runs via `requestAnimationFrame`. Do not block the main thread in
code that runs inside `draw()`.

### Custom Cursor

`#cursor` follows the mouse directly via GSAP `set`. `#cursor-follower` uses an eased
`requestAnimationFrame` loop with lerp-style variables (`fX`, `fY`). Hidden entirely on
`max-width: 640px` via CSS.

---

## Adding Content

### New Work Card

Copy an existing `.work-card` block in `index.html` and update:
- `style="--clr:#HEXCOLOR"` on `.card-bg` — pick from the accent palette
- The `.card-cat` label and `.card-title` heading
- Any tags inside `.card-tags`

No JS changes needed; ScrollTrigger animations target all `.work-card` elements via
`gsap.utils.toArray`.

### New Service Item

Add a `<div class="service-item">` inside `.services-list` with children `.service-num`,
`.service-name`, and `.service-desc`. The scroll-fade animation picks it up automatically.

### New Font or CDN Library

Add `<link>` or `<script>` tags inside the `<head>` / end of `<body>` in `index.html`.
Keep GSAP scripts last so the DOM is ready.

---

## Key Constraints

- **No build step.** Do not add npm, webpack, vite, or any bundler without explicit
  approval. The site intentionally has zero local dependencies.
- **No frameworks.** Do not introduce React, Vue, Svelte, etc.
- **CDN only for external libraries.** All third-party code is loaded from CDN in
  `index.html`. Keep version pins explicit (`gsap@3.12.5`).
- **Global CSS only.** Do not introduce CSS modules, Tailwind, or styled-components.
- **Preserve the CSS custom properties system.** Never hardcode colour values outside
  `:root`.
- **Mobile responsiveness is required.** Test all changes at 900px and 640px
  breakpoints. At 640px the canvas and custom cursor can be simplified/hidden.

---

## Git Conventions

- Single commit per logical change with a descriptive subject line
- Commit message body lists the key changes as bullet points (see existing commit)
- Branch names follow `claude/<short-description>-<id>` pattern
- Remote: `upasanapuri03-sys/motion-website` on GitHub
