'use client'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { themeLocalStorageKey } from './shared'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )

  const setTheme = useCallback((_themeToSet: Theme | null) => {
    // Always force light theme - ignore any theme changes
    const forcedTheme: Theme = 'light'
    setThemeState(forcedTheme)
    window.localStorage.setItem(themeLocalStorageKey, forcedTheme)
    document.documentElement.setAttribute('data-theme', forcedTheme)
  }, [])

  useEffect(() => {
    // Always use light theme - no dark theme support
    const themeToSet: Theme = 'light'
    document.documentElement.setAttribute('data-theme', themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
