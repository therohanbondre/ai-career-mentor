import type { Config } from "tailwindcss"

/*
 * Tailwind v4 — tailwind.config.ts
 *
 * In Tailwind v4, design tokens (colors, radius, fonts, keyframes, animations)
 * are defined CSS-first inside globals.css using @theme blocks.
 *
 * This file is only used for:
 *   - content paths  (class scanning)
 *   - darkMode strategy
 *
 * Plugins: tailwindcss-animate is registered via @plugin in globals.css.
 * Do NOT import plugins here — Tailwind v4 ignores the plugins array.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
}

export default config
