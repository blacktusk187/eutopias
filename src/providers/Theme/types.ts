export type Theme = 'dark' | 'light'

export type ThemeContextType = {
  setTheme: (theme: Theme | null) => void
  theme: Theme | undefined
}

export const themeIsValid = (theme: string | null): theme is Theme => {
  return theme === 'light' || theme === 'dark'
}
