import fs from "fs";
import path from "path";

export type ThemePalette = Record<string, string>;

export type Theme = {
  light: ThemePalette;
  dark: ThemePalette;
};

const TOKEN_TO_CSS_VAR: Record<string, string> = {
  primary: "--theme-primary",
  secondary: "--theme-secondary",
  background: "--theme-background",
  backgroundCard: "--theme-background-card",
  textHeading: "--theme-text-heading",
  textBody: "--theme-text-body",
  textInverse: "--theme-text-inverse",
  outline: "--theme-outline",
  ratingFilled: "--theme-rating-filled",
  ratingOutline: "--theme-rating-outline",
};

function paletteToCssVars(palette: ThemePalette): string {
  return Object.entries(palette)
    .map(([key, value]) => {
      const varName = TOKEN_TO_CSS_VAR[key] ?? `--theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      return `${varName}:${value}`;
    })
    .join(";");
}

/**
 * Load theme for the current store from config/themes/{STORE}.theme.json.
 * STORE comes from process.env.STORE (default: store1).
 */
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

/**
 * Generate a CSS string that sets theme variables on :root (light) and .dark (dark).
 */
export function getThemeStyleContent(theme: Theme): string {
  const lightVars = paletteToCssVars(theme.light);
  const darkVars = paletteToCssVars(theme.dark);
  return `:root{${lightVars}}.dark{${darkVars}}`;
}
