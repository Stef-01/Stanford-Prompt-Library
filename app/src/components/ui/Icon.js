/**
 * Material Symbols Outlined Icon Component
 * Uses Google's Material Symbols for consistent, modern iconography
 */

/**
 * Render a Material Symbols Outlined icon
 * @param {Object} options - Icon options
 * @param {string} options.name - The icon name (e.g., 'search', 'close', 'settings')
 * @param {string} options.className - Additional CSS classes
 * @returns {string} HTML string for the icon
 */
export function Icon({
  name = 'help',
  className = ''
} = {}) {
  return `
    <span class="material-symbols-outlined select-none ${className}" style="font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; font-size: 24px;">
      ${name}
    </span>
  `
}

/**
 * Common icon names mapping for easy reference:
 *
 * Navigation:
 * - explore, auto_stories, add, leaderboard, sports_esports, school, work_outline
 * - person, settings, logout, grid_view
 *
 * Actions:
 * - search, search_off, filter_list, arrow_forward, arrow_back, close, check
 * - edit, delete, download, upload, share, favorite, bookmark
 *
 * Status:
 * - error, warning, info, check_circle, cancel, help
 *
 * Content:
 * - description, article, note, folder, image, video
 */
