/**
 * Prompt Card Component
 * Individual prompt card for grid and list views
 */

import { CATEGORY_ICONS, CATEGORY_LABELS, getCategoryIcon, getCategoryLabel } from '../../config/constants.js'

/**
 * Create a prompt card
 * @param {Object} prompt - Prompt data
 * @param {Object} options - Card options
 * @returns {HTMLElement} Prompt card element
 */
export function createPromptCard(prompt, options = {}) {
  const {
    viewMode = 'details',    // details, image
    onLike = null,
    onClick = null,
    showCategory = true,
    showStats = true,
    showFeatured = true
  } = options

  const card = document.createElement('div')
  card.className = `prompt-card prompt-card-${viewMode}`
  card.dataset.promptId = prompt.id

  if (viewMode === 'image') {
    renderImageView(card, prompt, { showStats })
  } else {
    renderDetailsView(card, prompt, { showCategory, showStats, showFeatured })
  }

  // Attach event listeners
  attachCardListeners(card, prompt, { onLike, onClick })

  return card
}

/**
 * Render image view mode
 */
function renderImageView(card, prompt, options) {
  const { showStats } = options

  card.innerHTML = `
    <div class="prompt-card-image-wrapper">
      ${prompt.image_url
        ? `<img src="${prompt.image_url}" alt="${escapeHtml(prompt.title)}" loading="lazy">`
        : `<div class="prompt-card-placeholder">
             <span class="material-icons">image</span>
           </div>`
      }
      <div class="prompt-card-overlay">
        <h4 class="prompt-card-title">${escapeHtml(prompt.title)}</h4>
        ${showStats ? renderStats(prompt) : ''}
      </div>
    </div>
  `
}

/**
 * Render details view mode
 */
function renderDetailsView(card, prompt, options) {
  const { showCategory, showStats, showFeatured } = options

  card.innerHTML = `
    ${showCategory || showFeatured ? `
      <div class="prompt-card-header">
        ${showCategory && prompt.category ? `
          <div class="prompt-category-badge">
            <span class="material-icons">${getCategoryIcon(prompt.category)}</span>
            <span>${getCategoryLabel(prompt.category)}</span>
          </div>
        ` : ''}
        ${showFeatured && prompt.is_featured ? `
          <span class="prompt-featured-badge">
            <span class="material-icons">star</span>
            Featured
          </span>
        ` : ''}
      </div>
    ` : ''}

    <div class="prompt-card-body">
      <h3 class="prompt-card-title">${escapeHtml(prompt.title)}</h3>
      <p class="prompt-card-description">${escapeHtml(truncateText(prompt.description, 120))}</p>
    </div>

    ${showStats ? `
      <div class="prompt-card-footer">
        ${renderStats(prompt)}
        <button class="prompt-like-btn" data-prompt-id="${prompt.id}" aria-label="Like prompt">
          <span class="material-icons">${prompt.user_has_liked ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>
    ` : ''}
  `
}

/**
 * Render stats HTML
 */
function renderStats(prompt) {
  return `
    <div class="prompt-card-stats">
      <span class="prompt-stat">
        <span class="material-icons">favorite</span>
        <span class="stat-count">${prompt.likes_count || 0}</span>
      </span>
      <span class="prompt-stat">
        <span class="material-icons">visibility</span>
        <span class="stat-count">${prompt.views_count || 0}</span>
      </span>
    </div>
  `
}

/**
 * Attach event listeners to card
 */
function attachCardListeners(card, prompt, { onLike, onClick }) {
  // Card click
  card.addEventListener('click', (e) => {
    // Don't trigger card click if like button was clicked
    if (!e.target.closest('.prompt-like-btn')) {
      onClick?.(prompt)
    }
  })

  // Like button click
  if (onLike) {
    const likeBtn = card.querySelector('.prompt-like-btn')
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        onLike(prompt)
      })
    }
  }
}

/**
 * Update card like state
 * @param {HTMLElement} card - Card element
 * @param {boolean} liked - Is liked
 * @param {number} count - New likes count
 */
export function updateCardLikeState(card, liked, count) {
  const likeBtn = card.querySelector('.prompt-like-btn .material-icons')
  const likeCount = card.querySelector('.prompt-stat:first-child .stat-count')

  if (likeBtn) {
    likeBtn.textContent = liked ? 'favorite' : 'favorite_border'
  }

  if (likeCount) {
    likeCount.textContent = count
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function truncateText(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

export default { createPromptCard, updateCardLikeState }
