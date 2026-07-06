"use client"

/* 
 * Architectural Decision: Theme Provider
 * - Client component for theme management
 * - Uses next-themes for dark mode support
 * - Persists theme preference in localStorage
 * - Prevents theme flash on page load
 */
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
