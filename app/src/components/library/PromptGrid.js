/**
 * Prompt Grid Component
 * Grid display for prompts with different view modes
 */

import { createPromptCard } from './PromptCard.js'

/**
 * Create a prompt grid
 * @param {Array<Object>} prompts - Array of prompt objects
 * @param {Object} options - Grid options
 * @returns {HTMLElement} Grid element
 */
export function createPromptGrid(prompts, options = {}) {
  const {
    viewMode = 'details',
    columns = 3,
    gap = 'normal',
    onPromptClick = null,
    onLike = null,
    emptyMessage = 'No prompts found',
    emptyIcon = 'search_off',
    className = ''
  } = options

  const grid = document.createElement('div')
  grid.className = [
    'prompt-grid',
    `card-grid-columns-${columns}`,
    `card-grid-gap-${gap}`,
    className
  ].filter(Boolean).join(' ')

  // Empty state
  if (!prompts || prompts.length === 0) {
    grid.innerHTML = `
      <div class="card-grid-empty">
        <span class="material-icons">${emptyIcon}</span>
        <p>${emptyMessage}</p>
      </div>
    `
    return grid
  }

  // Render cards
  prompts.forEach(prompt => {
    const card = createPromptCard(prompt, {
      viewMode,
      onClick: onPromptClick,
      onLike
    })
    grid.appendChild(card)
  })

  return grid
}

/**
 * Create loading grid skeleton
 * @param {number} count - Number of skeleton cards
 * @param {Object} options - Grid options
 * @returns {HTMLElement} Loading grid element
 */
export function createLoadingGrid(count = 6, options = {}) {
  const {
    columns = 3,
    gap = 'normal',
    className = ''
  } = options

  const grid = document.createElement('div')
  grid.className = [
    'prompt-grid',
    `card-grid-columns-${columns}`,
    `card-grid-gap-${gap}`,
    className
  ].filter(Boolean).join(' ')

  for (let i = 0; i < count; i++) {
    grid.appendChild(createSkeletonCard())
  }

  return grid
}

/**
 * Create a skeleton card
 * @returns {HTMLElement} Skeleton card element
 */
function createSkeletonCard() {
  const card = document.createElement('div')
  card.className = 'prompt-card card-skeleton'

  card.innerHTML = `
    <div class="prompt-card-header">
      <div class="skeleton skeleton-badge" style="width: 100px; height: 24px;"></div>
    </div>
    <div class="prompt-card-body">
      <div class="skeleton skeleton-title" style="width: 70%; height: 24px; margin-bottom: 1rem;"></div>
      <div class="skeleton skeleton-text" style="width: 100%; height: 16px; margin-bottom: 0.5rem;"></div>
      <div class="skeleton skeleton-text" style="width: 90%; height: 16px; margin-bottom: 0.5rem;"></div>
      <div class="skeleton skeleton-text" style="width: 60%; height: 16px;"></div>
    </div>
    <div class="prompt-card-footer">
      <div class="skeleton skeleton-text" style="width: 80px; height: 20px;"></div>
      <div class="skeleton skeleton-text" style="width: 40px; height: 20px;"></div>
    </div>
  `

  return card
}

/**
 * Update grid with new prompts
 * @param {HTMLElement} grid - Grid element
 * @param {Array<Object>} prompts - New prompts
 * @param {Object} options - Grid options
 */
export function updateGrid(grid, prompts, options = {}) {
  // Clear existing content
  grid.innerHTML = ''

  // Recreate grid content
  const newGrid = createPromptGrid(prompts, options)
  grid.className = newGrid.className
  grid.innerHTML = newGrid.innerHTML

  // Re-attach event listeners
  if (options.onPromptClick || options.onLike) {
    prompts.forEach((prompt, index) => {
      const card = grid.children[index]
      if (card && !card.classList.contains('card-grid-empty')) {
        if (options.onPromptClick) {
          card.addEventListener('click', (e) => {
            if (!e.target.closest('.prompt-like-btn')) {
              options.onPromptClick(prompt)
            }
          })
        }

        if (options.onLike) {
          const likeBtn = card.querySelector('.prompt-like-btn')
          if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
              e.stopPropagation()
              options.onLike(prompt)
            })
          }
        }
      }
    })
  }
}

export default { createPromptGrid, createLoadingGrid, updateGrid }
