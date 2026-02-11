# NextCommerce — Project Documentation

This document describes the codebase’s implementations, algorithms, and design decisions. New features and changes should be documented in **new sections below**, keeping the same structure (purpose, architecture, files, algorithm, extension notes).

---

## Table of contents

1. [Multi-Store Theme System & Dark/Light Mode Switcher](#1-multi-store-theme-system--darklight-mode-switcher)
2. [Future implementations](#future-implementations)

---

## 1. Multi-Store Theme System & Dark/Light Mode Switcher

### 1.1 Purpose

- **Single build, multi-store:** One deployment can serve multiple storefronts; the active store is chosen via `STORE` and theme is loaded from a JSON file. No code change is required to add or switch stores.
- **JSON-driven theming:** All semantic colors (primary, secondary, background, text, etc.) live in `config/themes/{storeId}.theme.json`. Light and dark palettes are defined per store for brand consistency and dark-mode comfort.
- **User-controlled dark mode:** A mode switcher lets users choose light, dark, or system preference. The choice is persisted in `localStorage` and applied without a visible flash (FOUC) on load.
- **Tailwind integration:** Semantic tokens are exposed as Tailwind theme variables and custom breakpoints so components use utilities like `bg-primary`, `text-text-heading`, and responsive prefixes `sm:`, `md:`, `lg:`, `xl:`.

### 1.2 Architecture and data flow

```
┌─────────────────┐     ┌──────────────────────────────┐     ┌─────────────────────┐
│ STORE (env)     │────▶│ lib/theme.ts getTheme()       │────▶│ config/themes/      │
│ (e.g. store1)   │     │ reads JSON from filesystem   │     │ {store}.theme.json  │
└─────────────────┘     └──────────────────────────────┘     └─────────────────────┘
         │                              │
         │                              ▼
         │               ┌──────────────────────────────┐
         │               │ getThemeStyleContent(theme)    │
         │               │ → ":root{...} .dark{...}" CSS  │
         │               └──────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ app/layout.tsx (server)                                                           │
│   • Injects <style> with :root and .dark CSS variables                            │
│   • Injects inline <script> to set .dark on <html> before first paint (FOUC)     │
│   • Renders <ThemeSwitcher /> in header                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ app/globals.css                                                                   │
│   • @theme: --color-* = var(--theme-*) so Tailwind utilities (bg-primary, etc.)   │
│     resolve from injected variables                                                │
│   • @custom-variant dark: class-based .dark for Tailwind dark: utilities          │
│   • --breakpoint-sm/md/lg/xl: custom responsive breakpoints                       │
└─────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ components/ThemeSwitcher.tsx (client)                                            │
│   • Cycle: light → dark → system. Persists to localStorage, applies .dark class │
│   • Listens to prefers-color-scheme when mode === "system"                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Files added or modified

| Path | Role |
|------|------|
| `config/themes/store1.theme.json` | Light/dark palette for store1 (warm yellow-orange, peach/teal accents). |
| `config/themes/store2.theme.json` | Alternate palette for store2 (indigo/violet) to demonstrate multi-store. |
| `lib/theme.ts` | **New.** Server-only theme loader and CSS generator: `getTheme()`, `getThemeStyleContent()`, token → CSS variable mapping. |
| `app/layout.tsx` | Calls theme loader, injects theme `<style>` and FOUC-prevention `<script>`, renders header with `ThemeSwitcher`. |
| `app/globals.css` | Tailwind theme variables (`--color-*` → `var(--theme-*)`), `@custom-variant dark`, custom breakpoints. |
| `components/ThemeSwitcher.tsx` | **New.** Client component: cycle light/dark/system, persist to `localStorage`, apply `.dark` on `<html>`. |
| `.env` | Added `STORE=store1`. |
| `store2.env.example` | **New.** Example env for store2 (`STORE=store2`). |
| `README.md` | Documented multi-store theme and `STORE` usage. |
| `app/page.tsx` | Uses semantic classes and custom breakpoints for demo. |
| `app/products/page.tsx` | Uses semantic classes for verification. |

### 1.4 Algorithm and logic

#### Theme loading (`lib/theme.ts`)

1. **Store resolution:** `store = process.env.STORE ?? "store1"`. Theme path: `config/themes/${store}.theme.json`.
2. **Fallback:** If that file does not exist, try `store1.theme.json`; if that also fails, throw.
3. **Parse:** Read file as UTF-8 and `JSON.parse` into `{ light: Record<string, string>, dark: Record<string, string> }`.
4. **CSS generation:** For each palette (`light`, `dark`), map known token keys (e.g. `primary`, `backgroundCard`) to CSS variable names (e.g. `--theme-primary`, `--theme-background-card`). Unknown keys get a generated name: `--theme-${camelCaseToKebab(key)}`. Output: `:root{ --theme-primary: #...; ... }.dark{ --theme-primary: #...; ... }`.

Token-to-CSS-var mapping is explicit in `TOKEN_TO_CSS_VAR` so the schema is stable and extensible.

#### Layout injection (`app/layout.tsx`)

1. **Server:** Call `getTheme()` and `getThemeStyleContent(theme)`.
2. **Inject style:** Render `<style dangerouslySetInnerHTML={{ __html: themeCss }} />` in `<head>`. This sets light values on `:root` and dark values on `.dark`, so when `<html>` has class `dark`, all `var(--theme-*)` resolve to the dark palette.
3. **FOUC script:** Inline script runs before body paint: read `localStorage.getItem('theme')` and `prefers-color-scheme`. If stored theme is `"dark"` or (stored is not `"light"` and system is dark), add `dark` to `document.documentElement.classList`; otherwise remove it. So the first paint already matches user or system preference.

#### Mode switcher (`components/ThemeSwitcher.tsx`)

1. **Mounted state:** Use `mounted` to avoid reading `localStorage`/`window` during SSR; after mount, set `mode` from `getStoredTheme()`.
2. **Apply and persist:** When `mode` or `mounted` changes, call `applyTheme(mode)` (add/remove `dark` on `document.documentElement`) and `localStorage.setItem(THEME_KEY, mode)`.
3. **System preference:** `isDark = (mode === 'dark') || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)`. When `mode === 'system'`, subscribe to `change` on that media query and re-apply so OS changes are reflected.
4. **Cycle:** Button cycles `light → dark → system → light`.
5. **Placeholder UI:** Before mount, render a neutral button to avoid layout shift; no theme-dependent class until client has applied the correct class.

#### Tailwind integration (`app/globals.css`)

1. **Semantic colors:** `@theme { --color-primary: var(--theme-primary); ... }`. Tailwind generates utilities (`bg-primary`, `text-primary`, `border-outline`, etc.) that use these variables. Because the variables are set on `:root` and `.dark` by the injected style, the same utility automatically reflects light or dark without needing `dark:` on every class.
2. **Dark variant:** `@custom-variant dark (&:where(.dark, .dark *));` so `dark:bg-*` etc. apply when an ancestor has class `dark`.
3. **Breakpoints:** Override `--breakpoint-sm/md/lg/xl` so that `sm:` = 481px, `md:` = 769px, `lg:` = 1280px, `xl:` = 1536px (mobile / tablet / laptop / desktop).

### 1.5 Theme JSON schema

Each store theme file must have this shape:

```json
{
  "light": {
    "primary": "#hex",
    "secondary": "#hex",
    "background": "#hex",
    "backgroundCard": "#hex",
    "textHeading": "#hex",
    "textBody": "#hex",
    "textInverse": "#hex",
    "outline": "#hex",
    "ratingFilled": "#hex",
    "ratingOutline": "#hex"
  },
  "dark": {
    /* same keys, values for dark mode */
  }
}
```

- **primary / secondary:** Brand and secondary actions (buttons, links).
- **background:** Page background. **backgroundCard:** Cards, surfaces.
- **textHeading / textBody / textInverse:** Headings, body/muted text, text on primary (e.g. buttons).
- **outline:** Borders and focus rings.
- **ratingFilled / ratingOutline:** Star rating colors.

Additional keys are supported: they are converted to `--theme-<kebab-key>` and can be added to `@theme` and `TOKEN_TO_CSS_VAR` when needed.

### 1.6 Extending

- **New store:** Add `config/themes/{storeId}.theme.json` with `light` and `dark` palettes. Set `STORE={storeId}` in env (or use a different env file).
- **New semantic token:** Add the key to the theme JSON, add a mapping in `lib/theme.ts` `TOKEN_TO_CSS_VAR`, and in `app/globals.css` add `--color-<name>: var(--theme-<name>);` inside `@theme`.

---

## Future implementations

_Add new sections below for each major feature or change. Use the same structure:_

- **Purpose** — Why it exists and what problem it solves.
- **Architecture / data flow** — Diagram or short description and key files.
- **Files added or modified** — Paths and roles.
- **Algorithm and logic** — Main steps and invariants.
- **Extension / configuration** — How to adapt or extend.

---

### Template for new section

```markdown
## N. <Feature name>

### N.1 Purpose
...

### N.2 Architecture and data flow
...

### N.3 Files added or modified
| Path | Role |
|------|------|
| ... | ... |

### N.4 Algorithm and logic
...

### N.5 Extension / configuration
...
```
