/**
 * Theme Management System
 * Handles light/dark mode switching with localStorage persistence
 */

const THEME_KEY = 'stanford-prompt-library-theme'
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
}

/**
 * Get the current theme from localStorage or system preference
 * @returns {string} 'light' or 'dark'
 */
export function getCurrentTheme() {
  // Check localStorage first
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme && (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK)) {
    return savedTheme
  }

  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return THEMES.LIGHT
  }

  // Default to dark
  return THEMES.DARK
}

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
export function applyTheme(theme) {
  const validTheme = theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK
  document.documentElement.setAttribute('data-theme', validTheme)
  localStorage.setItem(THEME_KEY, validTheme)

  // Dispatch custom event for components that need to react to theme changes
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: validTheme } }))

  console.log('✅ Theme applied:', validTheme)
}

/**
 * Toggle between light and dark theme
 * @returns {string} The new theme
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
  applyTheme(newTheme)
  return newTheme
}

/**
 * Initialize theme system on app load
 */
export function initTheme() {
  const theme = getCurrentTheme()
  applyTheme(theme)

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT)
      }
    })
  }

  console.log('🎨 Theme system initialized')
}

/**
 * Check if current theme is light
 * @returns {boolean}
 */
export function isLightTheme() {
  return getCurrentTheme() === THEMES.LIGHT
}

/**
 * Check if current theme is dark
 * @returns {boolean}
 */
export function isDarkTheme() {
  return getCurrentTheme() === THEMES.DARK
}
