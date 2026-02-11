# NextCommerce — Project Documentation

This document describes the codebase’s implementations, algorithms, and design decisions. New features and changes should be documented in **new sections below**, keeping the same structure (purpose, architecture, files, algorithm, extension notes).

---

## Table of contents

1. [Multi-Store Theme System & Dark/Light Mode Switcher](#1-multi-store-theme-system--darklight-mode-switcher)
   - [1.3 Code execution flow](#13-code-execution-flow)
2. [Multi-country multi-language internationalization](#2-multi-country-multi-language-internationalization)
   - [2.3 Code execution flow](#23-code-execution-flow)
   - [2.6 Reason behind the approach](#26-reason-behind-the-approach)
3. [Future implementations](#future-implementations)

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
│   • No header here; header + ThemeSwitcher live in app/[locale]/layout.tsx       │
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

### 1.3 Code execution flow

Order of execution when a request is served and when the user interacts with the theme:

1. **Request arrives** — Next.js routes the request to the appropriate layout and page (root or `[locale]`).  
   _No single code block; framework routing._

2. **Root layout runs (server)** — `app/layout.tsx` executes on the server for every request. It calls `getTheme()` (reads `process.env.STORE`, then `config/themes/${store}.theme.json` from disk), then `getThemeStyleContent(theme)` to build the CSS string.  
   **Code:** `app/layout.tsx` (L26–27) and `lib/theme.ts` (L37–61):
   ```ts
   // app/layout.tsx L26-27
   const theme = getTheme();
   const themeCss = getThemeStyleContent(theme);
   ```
   ```ts
   // lib/theme.ts L37-52 getTheme(); L56-60 getThemeStyleContent()
   export function getTheme(): Theme {
     const store = process.env.STORE ?? "store1";
     const themePath = path.join(process.cwd(), "config", "themes", `${store}.theme.json`);
     // ... fs.readFileSync, JSON.parse, return theme
   }
   export function getThemeStyleContent(theme: Theme): string {
     const lightVars = paletteToCssVars(theme.light);
     const darkVars = paletteToCssVars(theme.dark);
     return `:root{${lightVars}}.dark{${darkVars}}`;
   }
   ```

3. **HTML is sent** — The response includes `<html>`, `<head>` with the injected `<style>` (theme variables for `:root` and `.dark`) and the inline FOUC `<script>`, and `<body>` with `children`. At this point no React has run on the client.  
   **Code:** `app/layout.tsx` (L37–47):
   ```tsx
   return (
     <html lang="en" suppressHydrationWarning>
       <head>
         <style dangerouslySetInnerHTML={{ __html: themeCss }} />
         <script dangerouslySetInnerHTML={{ __html: themeScript }} />
       </head>
       <body className={...}>{children}</body>
     </html>
   );
   ```

4. **Browser parses HTML** — The FOUC script in `<head>` runs **before** the body is painted. It reads `localStorage.getItem('theme')` and `matchMedia('(prefers-color-scheme: dark)')`, then adds or removes the `dark` class on `document.documentElement`. So the first paint already shows light or dark correctly.  
   **Code:** `app/layout.tsx` (L29–35) — inline script injected in `<head>`:
   ```ts
   const themeScript = `
   (function() {
     var theme = localStorage.getItem('theme');
     var isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
     if (isDark) document.documentElement.classList.add('dark');
     else document.documentElement.classList.remove('dark');
   })();
   `;
   ```

5. **React hydrates** — If the route is under `[locale]`, the locale layout has already rendered the header with `ThemeSwitcher`. The ThemeSwitcher component mounts on the client.  
   **Code:** `app/[locale]/layout.tsx` (L26–29) renders the header that includes ThemeSwitcher:
   ```tsx
   <header ...>
     <LocaleSelector />
     <ThemeSwitcher />
   </header>
   ```

6. **ThemeSwitcher (client)** — On mount it reads `localStorage` to set `mode` state and calls `applyTheme(mode)` so the DOM class matches. If the user clicks the button, it cycles `mode`, updates `localStorage`, and applies the class again. No server round-trip for theme change.  
   **Code:** `components/ThemeSwitcher.tsx` (L20–28 applyTheme; L34–43 mount + persist; L53–55 cycle):
   ```tsx
   function applyTheme(mode: ThemeMode) {
     const root = document.documentElement;
     const isDark = mode === "dark" || (mode === "system" && getSystemDark());
     if (isDark) root.classList.add("dark"); else root.classList.remove("dark");
   }
   useEffect(() => { setMounted(true); setMode(getStoredTheme()); }, []);
   useEffect(() => { if (!mounted) return; applyTheme(mode); localStorage.setItem(THEME_KEY, mode); }, [mode, mounted]);
   const cycle = () => setMode((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
   ```

7. **Tailwind utilities** — Classes like `bg-primary` or `text-text-heading` resolve at render time: Tailwind’s generated CSS uses `var(--theme-primary)` etc., and those variables get their values from the injected `<style>` (`:root` for light, `.dark` for dark). So when the `dark` class is toggled, all semantic colors update without re-running layout or theme loader.  
   **Code:** `app/globals.css` (L4, L6–17):
   ```css
   @custom-variant dark (&:where(.dark, .dark *));
   @theme {
     --color-primary: var(--theme-primary);
     --color-background: var(--theme-background);
     /* ... other --color-* = var(--theme-*) */
   }
   ```

**Why this order:** Theme is resolved once per request on the server so the initial HTML already contains the right CSS variables for the current store. The FOUC script runs synchronously in the head so the `dark` class is set before first paint. Client components only read/write `localStorage` and the DOM class; they do not need to fetch theme from the server again.

### 1.4 Files added or modified

| Path | Role |
|------|------|
| `config/themes/store1.theme.json` | Light/dark palette for store1 (warm yellow-orange, peach/teal accents). |
| `config/themes/store2.theme.json` | Alternate palette for store2 (indigo/violet) to demonstrate multi-store. |
| `lib/theme.ts` | **New.** Server-only theme loader and CSS generator: `getTheme()`, `getThemeStyleContent()`, token → CSS variable mapping. |
| `app/layout.tsx` | Calls theme loader, injects theme `<style>` and FOUC-prevention `<script>`; no header (header is in `app/[locale]/layout.tsx`). |
| `app/globals.css` | Tailwind theme variables (`--color-*` → `var(--theme-*)`), `@custom-variant dark`, custom breakpoints. |
| `components/ThemeSwitcher.tsx` | **New.** Client component: cycle light/dark/system, persist to `localStorage`, apply `.dark` on `<html>`. |
| `.env` | Added `STORE=store1`. |
| `store2.env.example` | **New.** Example env for store2 (`STORE=store2`). |
| `README.md` | Documented multi-store theme and `STORE` usage. |
| `app/page.tsx` | Root route: renders locale-selection modal only (see §2). |

### 1.5 Algorithm and logic

#### Theme loading (`lib/theme.ts`)

1. **Store resolution:** `store = process.env.STORE ?? "store1"`. Theme path: `config/themes/${store}.theme.json`.
2. **Fallback:** If that file does not exist, try `store1.theme.json`; if that also fails, throw.
3. **Parse:** Read file as UTF-8 and `JSON.parse` into `{ light: Record<string, string>, dark: Record<string, string> }`.
4. **CSS generation:** For each palette (`light`, `dark`), map known token keys (e.g. `primary`, `backgroundCard`) to CSS variable names (e.g. `--theme-primary`, `--theme-background-card`). Unknown keys get a generated name: `--theme-${camelCaseToKebab(key)}`. Output: `:root{ --theme-primary: #...; ... }.dark{ --theme-primary: #...; ... }`.

Token-to-CSS-var mapping is explicit in `TOKEN_TO_CSS_VAR` so the schema is stable and extensible.

**Code reference:** `lib/theme.ts`

```ts
// Store resolution + file read + fallback (L37–52)
export function getTheme(): Theme {
  const store = process.env.STORE ?? "store1";
  const themePath = path.join(process.cwd(), "config", "themes", `${store}.theme.json`);
  if (!fs.existsSync(themePath)) {
    const fallback = path.join(process.cwd(), "config", "themes", "store1.theme.json");
    if (fs.existsSync(fallback)) {
      const raw = fs.readFileSync(fallback, "utf-8");
      return JSON.parse(raw) as Theme;
    }
    throw new Error(`Theme not found for store "${store}" at ${themePath}`);
  }
  const raw = fs.readFileSync(themePath, "utf-8");
  return JSON.parse(raw) as Theme;
}

// CSS generation: :root (light) and .dark (dark) (L57–61)
export function getThemeStyleContent(theme: Theme): string {
  const lightVars = paletteToCssVars(theme.light);
  const darkVars = paletteToCssVars(theme.dark);
  return `:root{${lightVars}}.dark{${darkVars}}`;
}
```

#### Layout injection (`app/layout.tsx`)

1. **Server:** Call `getTheme()` and `getThemeStyleContent(theme)`.
2. **Inject style:** Render `<style dangerouslySetInnerHTML={{ __html: themeCss }} />` in `<head>`. This sets light values on `:root` and dark values on `.dark`, so when `<html>` has class `dark`, all `var(--theme-*)` resolve to the dark palette.
3. **FOUC script:** Inline script runs before body paint: read `localStorage.getItem('theme')` and `prefers-color-scheme`. If stored theme is `"dark"` or (stored is not `"light"` and system is dark), add `dark` to `document.documentElement.classList`; otherwise remove it. So the first paint already matches user or system preference.

**Code reference:** `app/layout.tsx`

```tsx
// Theme load + CSS string (L26–27)
const theme = getTheme();
const themeCss = getThemeStyleContent(theme);

// FOUC script: set .dark before first paint (L29–36)
const themeScript = `
(function() {
  var theme = localStorage.getItem('theme');
  var isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
})();
`;

// Injection in <head> (L40–42)
<head>
  <style dangerouslySetInnerHTML={{ __html: themeCss }} />
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
</head>
```

#### Mode switcher (`components/ThemeSwitcher.tsx`)

1. **Mounted state:** Use `mounted` to avoid reading `localStorage`/`window` during SSR; after mount, set `mode` from `getStoredTheme()`.
2. **Apply and persist:** When `mode` or `mounted` changes, call `applyTheme(mode)` (add/remove `dark` on `document.documentElement`) and `localStorage.setItem(THEME_KEY, mode)`.
3. **System preference:** `isDark = (mode === 'dark') || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)`. When `mode === 'system'`, subscribe to `change` on that media query and re-apply so OS changes are reflected.
4. **Cycle:** Button cycles `light → dark → system → light`.
5. **Placeholder UI:** Before mount, render a neutral button to avoid layout shift; no theme-dependent class until client has applied the correct class.

**Code reference:** `components/ThemeSwitcher.tsx`

```tsx
// Apply .dark on <html> from mode (L20–29)
function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const isDark = mode === "dark" || (mode === "system" && getSystemDark());
  if (isDark) root.classList.add("dark");
  else root.classList.remove("dark");
}

// On mount: read localStorage; on mode change: apply + persist (L35–44)
useEffect(() => { setMounted(true); setMode(getStoredTheme()); }, []);
useEffect(() => {
  if (!mounted) return;
  applyTheme(mode);
  localStorage.setItem(THEME_KEY, mode);
}, [mode, mounted]);

// Cycle: light → dark → system → light (L54–56)
const cycle = () => {
  setMode((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
};
```

#### Tailwind integration (`app/globals.css`)

1. **Semantic colors:** `@theme { --color-primary: var(--theme-primary); ... }`. Tailwind generates utilities (`bg-primary`, `text-primary`, `border-outline`, etc.) that use these variables. Because the variables are set on `:root` and `.dark` by the injected style, the same utility automatically reflects light or dark without needing `dark:` on every class.
2. **Dark variant:** `@custom-variant dark (&:where(.dark, .dark *));` so `dark:bg-*` etc. apply when an ancestor has class `dark`.
3. **Breakpoints:** Override `--breakpoint-sm/md/lg/xl` so that `sm:` = 481px, `md:` = 769px, `lg:` = 1280px, `xl:` = 1536px (mobile / tablet / laptop / desktop).

**Code reference:** `app/globals.css`

```css
/* Class-based dark variant for dark: utilities (L4) */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Semantic colors resolve from injected --theme-* (L8–17) */
  --color-primary: var(--theme-primary);
  --color-background: var(--theme-background);
  /* ... */
  /* Breakpoints (L20–23) */
  --breakpoint-sm: 30.0625rem;  /* 481px */
  --breakpoint-md: 48.0625rem;  /* 769px */
  --breakpoint-lg: 80rem;       /* 1280px */
  --breakpoint-xl: 96rem;       /* 1536px */
}
```

### 1.6 Theme JSON schema

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

### 1.7 Extending

- **New store:** Add `config/themes/{storeId}.theme.json` with `light` and `dark` palettes. Set `STORE={storeId}` in env (or use a different env file).
- **New semantic token:** Add the key to the theme JSON, add a mapping in `lib/theme.ts` `TOKEN_TO_CSS_VAR`, and in `app/globals.css` add `--color-<name>: var(--theme-<name>);` inside `@theme`.

---

## 2. Multi-country multi-language internationalization

### 2.1 Purpose

- **Locale-prefixed routes:** All app content lives under `/[locale]/...` (e.g. `/en-BE`, `/hi-IN/products`). Supported locales: `en-BE`, `en-IN`, `nl-BE`, `hi-IN` (language-country).
- **Root-route modal:** When the user lands on `/`, a modal asks for country and language; on submit, the choice is persisted in cookie `NEXT_LOCALE` and the user is redirected to `/{locale}`. If the cookie is already set, Proxy redirects `/` to the saved locale so returning users skip the modal.
- **Custom locale selector:** A dropdown in the header (when inside a locale) lets users switch language/country without going back to `/`; navigation stays on the same path with the new locale (e.g. `/en-BE/products` → `/hi-IN/products`), and the cookie is updated.
- **Translations:** A dictionary per locale is loaded on the server; the current `locale` comes from the `[locale]` segment. Server pages call `getDictionary(locale)`; client components use `useI18n()` / `useDictionary()` from context provided in `app/[locale]/layout.tsx`.
- **Next.js 16:** Uses [Proxy](https://nextjs.org/docs/app/getting-started/proxy) (not middleware) for locale redirects and follows [Internationalization](https://nextjs.org/docs/app/guides/internationalization) patterns.

### 2.2 Architecture and data flow

- **Proxy** (`proxy.ts`): Runs before the request is completed. If `pathname === '/'` and cookie `NEXT_LOCALE` is a supported locale, redirect to `/${cookie}`. If the first path segment is a supported locale, allow the request. Otherwise redirect to `/`.
- **Root page** (`app/page.tsx`): Renders only `LocaleSelectModal`. No header. Modal submit calls server action `setLocaleAndRedirect(locale)`, which sets cookie `NEXT_LOCALE` and `redirect(\`/${locale}\`)`.
- **Locale segment** (`app/[locale]/`): Layout validates `params.locale` with `hasLocale()`, calls `notFound()` if invalid, loads `getDictionary(locale)`, provides `I18nProvider`, renders `SetLang` (client, sets `document.documentElement.lang`), header (LocaleSelector + ThemeSwitcher), and children. Pages under `[locale]` use `params.locale` and `getDictionary(locale)` (server) or `useDictionary()` (client).
- **Dictionaries:** One JSON file per locale in `dictionaries/{locale}.json` (e.g. `en-BE.json`). Same key structure; `getDictionary(locale)` dynamically imports the correct file (server-only).

### 2.3 Code execution flow

Order of execution for different entry points and user actions:

**A. User visits `/` (no cookie or invalid cookie)**

1. Request hits Next.js; **Proxy** runs. `pathname === '/'`, cookie missing or not in `SUPPORTED_LOCALES` → return `NextResponse.next()` (no redirect).  
   **Code:** `proxy.ts` (L6–13):
   ```ts
   if (pathname === "/") {
     const savedLocale = request.cookies.get(COOKIE_LOCALE)?.value;
     if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as ...)) {
       return NextResponse.redirect(new URL(`/${savedLocale}`, request.url));
     }
     return NextResponse.next();
   }
   ```

2. **Root layout** runs (server): theme injection only; no locale.  
   **Code:** `app/layout.tsx` (L26–27, L39–41) — `getTheme()`, `getThemeStyleContent(theme)`, `<style>` / `<script>` in `<head>`.

3. **Root page** (`app/page.tsx`) renders (server): it outputs only `<LocaleSelectModal />`.  
   **Code:** `app/page.tsx`:
   ```tsx
   export default function RootPage() {
     return <LocaleSelectModal />;
   }
   ```

4. **Client:** LocaleSelectModal mounts; user sees the modal. No header, no app content.  
   **Code:** `components/LocaleSelectModal.tsx` (L23–61) — modal UI and `<form onSubmit={handleSubmit}>`.

5. User selects a locale and clicks Continue → form submits to **server action** `setLocaleAndRedirect(locale)`.  
   **Code:** `components/LocaleSelectModal.tsx` (L17–21):
   ```tsx
   async function handleSubmit(e: React.FormEvent) {
     e.preventDefault();
     setPending(true);
     await setLocaleAndRedirect(locale);
   }
   ```

6. **Server action** (server): `hasLocale(locale)` → set cookie `NEXT_LOCALE` via `cookies().set()` → `redirect(\`/${locale}\`)`. Response is a redirect to e.g. `/en-BE`.  
   **Code:** `app/actions/locale.ts` (L7–14):
   ```ts
   export async function setLocaleAndRedirect(locale: string) {
     if (!hasLocale(locale)) redirect("/");
     const cookieStore = await cookies();
     cookieStore.set(COOKIE_LOCALE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
     redirect(`/${locale}`);
   }
   ```

7. Browser follows redirect; next request is to `/en-BE` (cookie now sent).  
   _Browser behavior; no code block._

**B. User visits `/` with valid `NEXT_LOCALE` cookie**

1. **Proxy** runs: `pathname === '/'`, cookie is e.g. `en-BE` → return `NextResponse.redirect(new URL('/en-BE', request.url))`.  
   **Code:** `proxy.ts` (L8–11) — same block as A.1; when `savedLocale` is valid, redirect runs.

2. Browser follows redirect to `/en-BE`; root layout and locale modal are never rendered for this request.  
   _Browser behavior._

**C. User visits `/en-BE` or `/en-BE/products`**

1. **Proxy** runs: first segment `en-BE` is in `SUPPORTED_LOCALES` → `NextResponse.next()`.  
   **Code:** `proxy.ts` (L15–20):
   ```ts
   const firstSegment = pathname.split("/")[1];
   const isSupportedLocale = SUPPORTED_LOCALES.includes(firstSegment as ...);
   if (isSupportedLocale) return NextResponse.next();
   ```

2. **Root layout** runs (server): theme injection; `children` is the result of the `[locale]` segment.  
   **Code:** `app/layout.tsx` — same as theme section; `{children}` (L46) receives the output of `app/[locale]/layout.tsx`.

3. **Locale layout** (`app/[locale]/layout.tsx`) runs (server): `params` is awaited → `locale = 'en-BE'`. `hasLocale(locale)` → true. `getDictionary('en-BE')` runs (dynamic import of `dictionaries/en-BE.json`). Layout renders `I18nProvider(locale, dict)`, `SetLang`, header (LocaleSelector + ThemeSwitcher), and `children`.  
   **Code:** `app/[locale]/layout.tsx` (L16–31):
   ```tsx
   const { locale } = await params;
   if (!hasLocale(locale)) notFound();
   const dict = await getDictionary(locale as Locale);
   return (
     <I18nProvider locale={locale as Locale} dict={dict}>
       <SetLang locale={locale as Locale} />
       <header>...<LocaleSelector /><ThemeSwitcher /></header>
       {children}
     </I18nProvider>
   );
   ```

4. **Page** (e.g. `app/[locale]/page.tsx`) runs (server): receives same `params`; may call `getDictionary(locale)` again for its own use; renders HTML with translated labels.  
   **Code:** `app/[locale]/page.tsx` — `const { locale } = await params;` then `getDictionary(locale as Locale)` and use `dict.common.home`, `dict.products.addToCart`, etc. in JSX.

5. **Client:** SetLang runs `useEffect` → `document.documentElement.lang = 'en-BE'`. LocaleSelector and ThemeSwitcher mount; they read context (locale, dict) and localStorage/theme.  
   **Code:** `components/SetLang.tsx` (L6–12) — `useEffect(() => { document.documentElement.lang = locale; ... }, [locale]);`; `contexts/I18nContext.tsx` provides `useLocale()` / `useDictionary()` used by LocaleSelector.

6. User sees the localized page with correct `lang` and header.  
   _Result of above steps._

**D. User changes locale in the header (e.g. from `en-BE` to `hi-IN` on `/en-BE/products`)**

1. **LocaleSelector** `onChange` fires (client): new locale = `hi-IN`. Path is rebuilt: segments = `['en-BE','products']` → replace first → `['hi-IN','products']` → `newPath = '/hi-IN/products'`. Cookie is set via `document.cookie = 'NEXT_LOCALE=hi-IN;...'`. `router.push('/hi-IN/products')`.  
   **Code:** `components/LocaleSelector.tsx` (L13–20):
   ```tsx
   function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
     const newLocale = e.target.value as Locale;
     const segments = pathname.split("/").filter(Boolean);
     segments[0] = newLocale;
     const newPath = "/" + segments.join("/");
     document.cookie = `${COOKIE_LOCALE}=${newLocale};path=/;max-age=...`;
     router.push(newPath);
   }
   ```

2. Next.js client-side navigation to `/hi-IN/products`.  
   _Framework behavior after `router.push`._

3. **Locale layout** runs again (server) with `params.locale = 'hi-IN'`: new dict loaded, new context value, SetLang sets `lang="hi-IN"`, page re-renders with Hindi (or en-IN, etc.) labels.  
   **Code:** Same as C.3 — `app/[locale]/layout.tsx` runs with new `params`; `getDictionary('hi-IN')` loads `dictionaries/hi-IN.json`.

**Why this order:** Proxy runs before any layout so redirects (e.g. `/` with cookie) avoid rendering the root page. Locale and dictionary are resolved in the layout so every page under `[locale]` has a single place that validates locale and loads the dictionary. Server action for the modal sets the cookie and redirects in one response so the next request already carries the chosen locale. LocaleSelector updates the path and cookie on the client so switching locale is a single navigation and the cookie stays in sync for the next direct visit.

### 2.4 Files added or modified

| Path | Role |
|------|------|
| `proxy.ts` | **New.** Allow `/` and `/{locale}/*`; redirect invalid first segment to `/`. If `/` and cookie `NEXT_LOCALE` is set, redirect to `/{locale}`. |
| `lib/i18n-constants.ts` | **New.** `SUPPORTED_LOCALES`, `Locale`, `LOCALE_LABELS`, `COOKIE_LOCALE`, `hasLocale()`. No server-only; used by Proxy and app. |
| `lib/i18n.ts` | **New.** Server-only: `getDictionary(locale)`, `Dictionary` type; re-exports from `i18n-constants`. |
| `app/actions/locale.ts` | **New.** Server action `setLocaleAndRedirect(locale)`: set cookie, `redirect(\`/${locale}\`)`. |
| `app/page.tsx` | Replaced with locale-selection modal only (`LocaleSelectModal`). |
| `app/[locale]/layout.tsx` | **New.** Validate locale, load dict, `I18nProvider`, `SetLang`, header (LocaleSelector + ThemeSwitcher), children. |
| `app/[locale]/page.tsx` | **New.** Home content; uses `getDictionary(locale)` and dict labels. |
| `app/[locale]/products/page.tsx` | **New.** Products list page; uses dict. |
| `app/[locale]/products/[id]/page.tsx` | **New.** Product detail; uses dict. |
| `dictionaries/en-BE.json`, `en-IN.json`, `nl-BE.json`, `hi-IN.json` | **New.** Same key structure; translated strings per locale. |
| `components/LocaleSelectModal.tsx` | **New.** Client: locale dropdown, submit → server action (cookie + redirect). |
| `components/LocaleSelector.tsx` | **New.** Client: dropdown to switch locale; updates path and cookie via `router.push`. |
| `components/SetLang.tsx` | **New.** Client: `useEffect` to set `document.documentElement.lang = locale`. |
| `contexts/I18nContext.tsx` | **New.** `I18nProvider`, `useI18n()`, `useDictionary()`, `useLocale()`. |
| `app/products/page.tsx` | **Removed.** Content moved to `app/[locale]/products/page.tsx`. |

### 2.5 Algorithm and logic

#### Proxy (`proxy.ts`)

1. Read `pathname` from `request.nextUrl`.
2. If `pathname === '/'`: get cookie `NEXT_LOCALE`; if it is a supported locale, return `NextResponse.redirect(new URL(\`/${cookie}\`, request.url))`; else return `NextResponse.next()`.
3. Else: first segment = `pathname.split('/')[1]`. If it is in `SUPPORTED_LOCALES`, return `NextResponse.next()`; else return `NextResponse.redirect(new URL('/', request.url))`.
4. Matcher excludes `_next`, `api`, static file extensions so Proxy runs only on app routes.

**Code reference:** `proxy.ts`

```ts
// Path and cookie check for / (L5–14)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") {
    const savedLocale = request.cookies.get(COOKIE_LOCALE)?.value;
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as ...)) {
      return NextResponse.redirect(new URL(`/${savedLocale}`, request.url));
    }
    return NextResponse.next();
  }
  // First segment must be supported locale (L16–23)
  const firstSegment = pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(firstSegment as ...)) return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}
```

#### Locale modal and server action

1. **LocaleSelectModal:** User picks locale from `<select>` (options from `LOCALE_LABELS`), submits form. Form handler calls `setLocaleAndRedirect(locale)`.
2. **setLocaleAndRedirect:** Validate with `hasLocale(locale)`; if invalid, `redirect('/')`. Set cookie `NEXT_LOCALE` with `cookies().set(..., { path: '/', maxAge: 1 year })`. Call `redirect(\`/${locale}\`)`.

**Code reference:** `app/actions/locale.ts` (server action); `components/LocaleSelectModal.tsx` (form submit).

```ts
// app/actions/locale.ts – set cookie and redirect (L7–14)
export async function setLocaleAndRedirect(locale: string) {
  if (!hasLocale(locale)) redirect("/");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_LOCALE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect(`/${locale}`);
}
```

```tsx
// components/LocaleSelectModal.tsx – form submit calls server action (L17–21)
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setPending(true);
  await setLocaleAndRedirect(locale);
}
```

#### Dictionary loading

1. **getDictionary(locale):** Server-only. Map of locale → dynamic `import(\`@/dictionaries/${locale}.json\`)`. Return `(await loader()).default`. Ensures only the requested locale is loaded.
2. **Layout:** `await params`, then `hasLocale(locale)` → else `notFound()`. `dict = await getDictionary(locale)`. Pass `{ locale, dict }` to `I18nProvider`.
3. **Pages:** Server components `await params`, then `getDictionary(locale)` and use `dict` in JSX. Client components use `useDictionary()` or `useLocale()` from context.

**Code reference:** `lib/i18n.ts` (getDictionary); `app/[locale]/layout.tsx` (validate + load + I18nProvider).

```ts
// lib/i18n.ts – dynamic import per locale (L36–41)
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale];
  if (!loader) throw new Error(`No dictionary for locale: ${locale}`);
  const mod = await loader();
  return mod.default;
}
```

```tsx
// app/[locale]/layout.tsx – validate locale, load dict, provide context (L16–31)
const { locale } = await params;
if (!hasLocale(locale)) notFound();
const dict = await getDictionary(locale as Locale);
return (
  <I18nProvider locale={locale as Locale} dict={dict}>
    <SetLang locale={locale as Locale} />
    <header>...<LocaleSelector /><ThemeSwitcher /></header>
    {children}
  </I18nProvider>
);
```

#### LocaleSelector

1. Reads `currentLocale` from `useLocale()` (context). Renders `<select>` with `SUPPORTED_LOCALES` and `LOCALE_LABELS`.

**Context code reference:** `contexts/I18nContext.tsx` — `I18nProvider` holds `{ locale, dict }`; `useLocale()` / `useDictionary()` / `useI18n()` read it (L14–40).
2. On change: build new path by replacing first segment of `pathname` with the new locale; set cookie `NEXT_LOCALE`; `router.push(newPath)`.

**Code reference:** `components/LocaleSelector.tsx`

```tsx
// useLocale() from context; on change: replace segment, set cookie, navigate (L12–24)
const currentLocale = useLocale();
function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
  const newLocale = e.target.value as Locale;
  const segments = pathname.split("/").filter(Boolean);
  segments[0] = newLocale;
  const newPath = "/" + segments.join("/");
  document.cookie = `${COOKIE_LOCALE}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
  router.push(newPath);
}
```

#### SetLang

1. Client component receiving `locale` prop. `useEffect(() => { document.documentElement.lang = locale; return () => { document.documentElement.lang = '' }; }, [locale])`.

**Code reference:** `components/SetLang.tsx`

```tsx
// Set <html lang={locale}> on mount; clear on unmount (L6–12)
export function SetLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    return () => { document.documentElement.lang = ""; };
  }, [locale]);
  return null;
}
```

### 2.6 Reason behind the approach

- **Proxy instead of middleware:** Next.js 16 renames middleware to Proxy and recommends it for routing/redirects only. Using Proxy keeps locale logic in one place, runs before any layout, and avoids pulling server-only modules (we use `lib/i18n-constants.ts` in Proxy, not `lib/i18n.ts`, so no `server-only` in the Proxy bundle).  
  **Code:** `proxy.ts` (L1–24) — single `proxy(request)`; imports from `@/lib/i18n-constants` (L3), not `@/lib/i18n`.

- **Cookie for locale preference:** Storing the chosen locale in a cookie (`NEXT_LOCALE`) lets Proxy redirect `/` to the saved locale so returning users skip the modal. It also keeps the preference across tabs and sessions without requiring login or a database.  
  **Code:** Cookie read in `proxy.ts` (L9) — `request.cookies.get(COOKIE_LOCALE)?.value`; cookie set in `app/actions/locale.ts` (L11–12) — `cookieStore.set(COOKIE_LOCALE, locale, { path: "/", maxAge: ... })`; and in `components/LocaleSelector.tsx` (L18) — `document.cookie = \`${COOKIE_LOCALE}=${newLocale};...\``.

- **Root route = modal only:** Keeping `/` as a dedicated locale-selection screen (no app header, no app content) makes the choice explicit and avoids showing partial or wrong-locale content. Once a locale is chosen, all traffic goes to `/{locale}/...`.  
  **Code:** `app/page.tsx` — returns only `<LocaleSelectModal />`; root `app/layout.tsx` has no header (header lives in `app/[locale]/layout.tsx` L26–29).

- **Single `[locale]` segment:** Using one dynamic segment (e.g. `en-BE`, `hi-IN`) instead of separate `[lang]` and `[country]` keeps URLs short and matches common locale codes (language-country). Validation is one check (`hasLocale`) and dictionaries map 1:1 to locale.  
  **Code:** `lib/i18n-constants.ts` — `SUPPORTED_LOCALES = ["en-BE", "en-IN", "nl-BE", "hi-IN"]`, `hasLocale(locale)`; route folder `app/[locale]/`; `proxy.ts` (L16) — `pathname.split("/")[1]` as single segment.

- **Dictionary in layout + context:** Loading `getDictionary(locale)` in the locale layout and passing `{ locale, dict }` via React context gives server pages the option to call `getDictionary` again (for simplicity and type safety) and gives client components (e.g. LocaleSelector) access to locale without prop drilling. Context is provided only under `[locale]`, so it is never used on the root page.  
  **Code:** `app/[locale]/layout.tsx` (L22–25) — `const dict = await getDictionary(locale as Locale);` then `<I18nProvider locale={...} dict={dict}>`; `contexts/I18nContext.tsx` — `I18nProvider` value `{ locale, dict }`, `useI18n()` / `useDictionary()` / `useLocale()`.

- **Server action for modal submit:** Submitting the locale from the modal via a server action (`setLocaleAndRedirect`) allows setting an HTTP-only-capable cookie from the server and performing a redirect in one round-trip. The browser then issues a new request to `/{locale}` with the cookie already set.  
  **Code:** `app/actions/locale.ts` (L7–14) — `"use server";` then `setLocaleAndRedirect(locale)` that calls `cookies().set()` and `redirect(\`/${locale}\`)`; `components/LocaleSelectModal.tsx` (L19) — `await setLocaleAndRedirect(locale)` in form submit.

- **SetLang as a client component:** The root layout owns `<html>` but does not receive `params.locale`. Setting `document.documentElement.lang` in a small client component inside the locale layout avoids pushing locale into the root layout and keeps `lang` in sync on client navigation and after hydration.  
  **Code:** `components/SetLang.tsx` — `"use client";` and `useEffect(() => { document.documentElement.lang = locale; return () => { document.documentElement.lang = ""; }; }, [locale]);`; used in `app/[locale]/layout.tsx` (L25) as `<SetLang locale={locale as Locale} />`.

- **Separate `i18n-constants` and `i18n`:** Constants and `hasLocale` live in `i18n-constants.ts` (no `server-only`) so Proxy can import them. `getDictionary` and the `Dictionary` type live in `lib/i18n.ts` (server-only) so they are never bundled for Proxy or client.  
  **Code:** `lib/i18n-constants.ts` — no `"use server"` or `server-only`; exports `SUPPORTED_LOCALES`, `hasLocale`, `COOKIE_LOCALE`, etc. `lib/i18n.ts` — first line `import "server-only";`; exports `getDictionary`, `Dictionary`; re-exports from `i18n-constants`. `proxy.ts` (L3) — `import { SUPPORTED_LOCALES, COOKIE_LOCALE } from "@/lib/i18n-constants";`.

### 2.7 Extension / configuration

- **New locale:** Add the value to `SUPPORTED_LOCALES` and `LOCALE_LABELS` in `lib/i18n-constants.ts`. Add `dictionaries/{locale}.json` with the same key structure as existing dictionaries. Add a loader entry in `lib/i18n.ts` `dictionaries` map.
- **New translation key:** Add the key to the `Dictionary` type in `lib/i18n.ts` and to every `dictionaries/*.json` file. Use the key in pages via `dict.*` or in client components via `useDictionary().*`.
- **Cookie name:** `NEXT_LOCALE` is defined in `lib/i18n-constants.ts` as `COOKIE_LOCALE`; change there if needed.

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
