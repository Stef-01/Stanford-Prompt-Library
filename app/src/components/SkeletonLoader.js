/**
 * Skeleton Loader Components
 * Beautiful loading states for various content types
 */

/**
 * Tool Card Skeleton for AI Tools Leaderboard
 * @param {number} index - Index for stagger animation
 * @returns {string} HTML for skeleton
 */
export function ToolCardSkeleton(index = 0) {
  return `
    <div class="tool-card skeleton-card" style="animation: skeleton-pulse 1.5s ease-in-out ${index * 0.1}s infinite;">
      <div class="skeleton-voting" style="width: 60px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
        <div class="skeleton-circle" style="width: 32px; height: 32px;"></div>
        <div class="skeleton-line" style="width: 40px; height: 20px;"></div>
        <div class="skeleton-circle" style="width: 32px; height: 32px;"></div>
      </div>
      <div style="flex: 1; padding: 12px;">
        <div class="skeleton-line" style="width: 60%; height: 24px; margin-bottom: 12px;"></div>
        <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: 8px;"></div>
        <div class="skeleton-line" style="width: 80%; height: 16px; margin-bottom: 12px;"></div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <div class="skeleton-badge" style="width: 80px; height: 24px;"></div>
          <div class="skeleton-badge" style="width: 60px; height: 24px;"></div>
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
  return `
    <tr style="animation: skeleton-pulse 1.5s ease-in-out ${index * 0.1}s infinite;">
      <td style="padding: 16px;">
        <div class="skeleton-line" style="width: 30px; height: 24px; margin: 0 auto;"></div>
      </td>
      <td style="padding: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="skeleton-circle" style="width: 40px; height: 40px;"></div>
          <div class="skeleton-line" style="width: 150px; height: 20px;"></div>
        </div>
      </td>
      <td style="padding: 16px;">
        <div class="skeleton-line" style="width: 50px; height: 20px; margin: 0 auto;"></div>
      </td>
      <td style="padding: 16px;">
        <div class="skeleton-line" style="width: 60px; height: 20px; margin: 0 auto;"></div>
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
  return `
    <div class="prompt-card skeleton-card" style="animation: skeleton-pulse 1.5s ease-in-out ${index * 0.1}s infinite; padding: 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div class="skeleton-line" style="width: 70%; height: 24px;"></div>
        <div class="skeleton-badge" style="width: 80px; height: 24px;"></div>
      </div>
      <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: 8px;"></div>
      <div class="skeleton-line" style="width: 90%; height: 16px; margin-bottom: 16px;"></div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <div class="skeleton-badge" style="width: 70px; height: 22px;"></div>
        <div class="skeleton-badge" style="width: 60px; height: 22px;"></div>
        <div class="skeleton-badge" style="width: 80px; height: 22px;"></div>
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
    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
      ${[0, 1, 2, 3].map(i => `
        <div class="stat-card skeleton-card" style="animation: skeleton-pulse 1.5s ease-in-out ${i * 0.1}s infinite; padding: 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; text-align: center;">
          <div class="skeleton-line" style="width: 60px; height: 36px; margin: 0 auto 12px;"></div>
          <div class="skeleton-line" style="width: 100px; height: 16px; margin: 0 auto;"></div>
        </div>
      `).join('')}
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
  const lineWidths = ['100%', '95%', '90%', '85%', '100%', '92%']

  return `
    <div class="content-block skeleton-card" style="animation: skeleton-pulse 1.5s ease-in-out ${index * 0.1}s infinite; padding: 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 16px;">
      ${Array.from({ length: lines }, (_, i) => `
        <div class="skeleton-line" style="width: ${lineWidths[i % lineWidths.length]}; height: 16px; margin-bottom: ${i === lines - 1 ? '0' : '12px'};"></div>
      `).join('')}
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
    <div class="loading-container" style="opacity: 0; animation: fadeIn 0.3s ease-out forwards;">
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
    loadingContainer.style.animation = 'fadeOut 0.2s ease-out forwards'
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
  const sizes = {
    sm: '16px',
    md: '32px',
    lg: '48px'
  }

  const dimension = sizes[size] || sizes.md

  return `
    <div class="spinner" style="
      width: ${dimension};
      height: ${dimension};
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: ${color};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 20px auto;
    "></div>
  `
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
    <div class="empty-state" style="
      text-align: center;
      padding: 60px 20px;
      opacity: 0;
      animation: fadeIn 0.4s ease-out forwards;
    ">
      <div style="font-size: 64px; margin-bottom: 16px; animation: bounce 0.6s ease-out;">${icon}</div>
      <h3 style="color: var(--text-primary); margin-bottom: 8px; font-size: 20px;">${title}</h3>
      ${description ? `<p style="color: var(--text-secondary); font-size: 14px;">${description}</p>` : ''}
    </div>
  `
}
