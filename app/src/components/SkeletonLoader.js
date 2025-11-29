/**
 * Skeleton Loader Components
 * Beautiful loading states for various content types
 */

import './skeleton-loader.css'

/**
 * Tool Card Skeleton for AI Tools Leaderboard
 * @param {number} index - Index for stagger animation
 * @returns {string} HTML for skeleton
 */
export function ToolCardSkeleton(index = 0) {
  const delay = index * 0.1
  return `
    <div class="tool-card skeleton-tool-card" style="animation-delay: ${delay}s;">
      <div class="skeleton-voting">
        <div class="skeleton-voting-icon"></div>
        <div class="skeleton-voting-count"></div>
        <div class="skeleton-voting-icon"></div>
      </div>
      <div class="skeleton-tool-content">
        <div class="skeleton-tool-title"></div>
        <div class="skeleton-tool-desc-1"></div>
        <div class="skeleton-tool-desc-2"></div>
        <div class="skeleton-tool-badges">
          <div class="skeleton-tool-badge-1"></div>
          <div class="skeleton-tool-badge-2"></div>
        </div>
      </div>
    </div>
  `
}

/**
 * Leaderboard Row Skeleton
 * @param {number} index - Row index for stagger
 * @returns {string} HTML for skeleton row
 */
export function LeaderboardRowSkeleton(index = 0) {
  const delay = index * 0.1
  return `
    <tr class="skeleton-leaderboard-row" style="animation-delay: ${delay}s;">
      <td class="skeleton-leaderboard-cell">
        <div class="skeleton-rank"></div>
      </td>
      <td class="skeleton-leaderboard-cell">
        <div class="skeleton-user-cell">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-user-name"></div>
        </div>
      </td>
      <td class="skeleton-leaderboard-cell">
        <div class="skeleton-stat"></div>
      </td>
      <td class="skeleton-leaderboard-cell">
        <div class="skeleton-stat skeleton-stat-wide"></div>
      </td>
    </tr>
  `
}

/**
 * Prompt Card Skeleton for Explore/Library
 * @param {number} index - Card index for stagger
 * @returns {string} HTML for skeleton card
 */
export function PromptCardSkeleton(index = 0) {
  const delay = index * 0.1
  return `
    <div class="skeleton-prompt-card" style="animation-delay: ${delay}s;">
      <div class="skeleton-prompt-header">
        <div class="skeleton-prompt-title"></div>
        <div class="skeleton-prompt-category"></div>
      </div>
      <div class="skeleton-prompt-desc-1"></div>
      <div class="skeleton-prompt-desc-2"></div>
      <div class="skeleton-prompt-tags">
        <div class="skeleton-prompt-tag-1"></div>
        <div class="skeleton-prompt-tag-2"></div>
        <div class="skeleton-prompt-tag-3"></div>
      </div>
    </div>
  `
}

/**
 * Profile Stats Skeleton
 * @returns {string} HTML for skeleton stats
 */
export function ProfileStatsSkeleton() {
  return `
    <div class="skeleton-stats-grid">
      ${[0, 1, 2, 3].map(i => {
        const delay = i * 0.1
        return `
          <div class="skeleton-stat-card" style="animation-delay: ${delay}s;">
            <div class="skeleton-stat-value"></div>
            <div class="skeleton-stat-label"></div>
          </div>
        `
      }).join('')}
    </div>
  `
}

/**
 * Content Block Skeleton (generic)
 * @param {number} lines - Number of text lines
 * @param {number} index - Block index for stagger
 * @returns {string} HTML for skeleton block
 */
export function ContentBlockSkeleton(lines = 3, index = 0) {
  const lineWidths = ['100', '95', '90', '85', '100', '92']
  const delay = index * 0.1

  return `
    <div class="skeleton-content-block" style="animation-delay: ${delay}s;">
      ${Array.from({ length: lines }, (_, i) => {
        const width = lineWidths[i % lineWidths.length]
        return `<div class="skeleton-content-line skeleton-line-${width}"></div>`
      }).join('')}
    </div>
  `
}

/**
 * Grid Skeleton for card layouts
 * @param {number} count - Number of cards
 * @param {Function} cardSkeletonFn - Function that returns skeleton HTML
 * @returns {string} HTML for skeleton grid
 */
export function GridSkeleton(count = 6, cardSkeletonFn = PromptCardSkeleton) {
  return Array.from({ length: count }, (_, i) => cardSkeletonFn(i)).join('')
}

/**
 * Table Skeleton for leaderboards
 * @param {number} rows - Number of rows
 * @returns {string} HTML for skeleton table rows
 */
export function TableSkeleton(rows = 10) {
  return Array.from({ length: rows }, (_, i) => LeaderboardRowSkeleton(i)).join('')
}

/**
 * Show loading state in container
 * @param {HTMLElement} container - Container element
 * @param {string} skeletonHTML - Skeleton HTML to show
 */
export function showLoadingState(container, skeletonHTML) {
  if (!container) return

  container.innerHTML = `
    <div class="loading-container">
      ${skeletonHTML}
    </div>
  `
}

/**
 * Hide loading state and show content
 * @param {HTMLElement} container - Container element
 * @param {string} contentHTML - Content HTML to show
 */
export function hideLoadingState(container, contentHTML) {
  if (!container) return

  // Fade out loading
  const loadingContainer = container.querySelector('.loading-container')
  if (loadingContainer) {
    loadingContainer.classList.add('fade-out')
    setTimeout(() => {
      container.innerHTML = contentHTML
      // Fade in content
      const contentContainer = container.querySelector('*')
      if (contentContainer) {
        contentContainer.style.opacity = '0'
        contentContainer.style.animation = 'fadeIn 0.3s ease-out forwards'
      }
    }, 200)
  } else {
    container.innerHTML = contentHTML
  }
}

/**
 * Spinner Skeleton (for inline loading)
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {string} color - Color (CSS color value)
 * @returns {string} HTML for spinner
 */
export function SpinnerSkeleton(size = 'md', color = 'var(--accent-blue)') {
  const customStyle = color !== 'var(--accent-blue)' ? ` style="border-top-color: ${color};"` : ''
  return `<div class="skeleton-spinner skeleton-spinner-${size}"${customStyle}></div>`
}

/**
 * Empty State Skeleton (for no results)
 * @param {string} icon - Icon emoji
 * @param {string} title - Title text
 * @param {string} description - Description text
 * @returns {string} HTML for empty state
 */
export function EmptyStateSkeleton(icon = '📭', title = 'No items found', description = '') {
  return `
    <div class="skeleton-empty-state">
      <div class="skeleton-empty-icon">${icon}</div>
      <h3 class="skeleton-empty-title">${title}</h3>
      ${description ? `<p class="skeleton-empty-description">${description}</p>` : ''}
    </div>
  `
}
