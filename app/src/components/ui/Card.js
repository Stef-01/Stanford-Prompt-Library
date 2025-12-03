/**
 * Card Component
 * Reusable card component for displaying content in a structured format
 */

/**
 * Create a card element
 * @param {string|HTMLElement} content - Card content
 * @param {Object} options - Card options
 * @returns {HTMLElement} Card element
 */
export function createCard(content, options = {}) {
  const {
    title = null,
    subtitle = null,
    image = null,
    imageAlt = '',
    footer = null,
    header = null,
    className = '',
    onClick = null,
    hoverable = true,
    bordered = true,
    padding = 'normal'  // none, small, normal, large
  } = options

  const card = document.createElement('div')
  card.className = [
    'card',
    hoverable ? 'card-hoverable' : '',
    bordered ? 'card-bordered' : '',
    `card-padding-${padding}`,
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ')

  // Build card structure
  let cardHTML = ''

  // Custom header
  if (header) {
    cardHTML += `<div class="card-header">${typeof header === 'string' ? header : ''}</div>`
  }

  // Image
  if (image) {
    cardHTML += `
      <div class="card-image">
        <img src="${image}" alt="${imageAlt}" loading="lazy">
      </div>
    `
  }

  // Body (title, subtitle, content)
  cardHTML += '<div class="card-body">'

  if (title) {
    cardHTML += `<h3 class="card-title">${title}</h3>`
  }

  if (subtitle) {
    cardHTML += `<p class="card-subtitle">${subtitle}</p>`
  }

  cardHTML += '<div class="card-content">'
  if (typeof content === 'string') {
    cardHTML += content
  }
  cardHTML += '</div>'

  cardHTML += '</div>' // Close card-body

  // Footer
  if (footer) {
    cardHTML += `<div class="card-footer">${typeof footer === 'string' ? footer : ''}</div>`
  }

  card.innerHTML = cardHTML

  // Append non-string elements
  if (typeof header !== 'string' && header instanceof HTMLElement) {
    card.querySelector('.card-header').appendChild(header)
  }

  if (typeof content !== 'string' && content instanceof HTMLElement) {
    card.querySelector('.card-content').appendChild(content)
  }

  if (typeof footer !== 'string' && footer instanceof HTMLElement) {
    card.querySelector('.card-footer').appendChild(footer)
  }

  // Attach click handler
  if (onClick) {
    card.addEventListener('click', onClick)
    card.style.cursor = 'pointer'
  }

  return card
}

/**
 * Create a prompt card (specific for library)
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
          ${showStats ? `
            <div class="prompt-card-stats">
              <span><span class="material-icons">favorite</span> ${prompt.likes_count || 0}</span>
              <span><span class="material-icons">visibility</span> ${prompt.views_count || 0}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `
  } else {
    // Details view
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

      ${showStats || onLike ? `
        <div class="prompt-card-footer">
          ${showStats ? `
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
          ` : ''}
          ${onLike ? `
            <button class="prompt-like-btn" data-prompt-id="${prompt.id}" aria-label="Like prompt">
              <span class="material-icons">${prompt.user_has_liked ? 'favorite' : 'favorite_border'}</span>
            </button>
          ` : ''}
        </div>
      ` : ''}
    `
  }

  // Attach event listeners
  card.addEventListener('click', (e) => {
    // Don't trigger card click if like button was clicked
    if (!e.target.closest('.prompt-like-btn')) {
      onClick?.(prompt)
    }
  })

  if (onLike) {
    const likeBtn = card.querySelector('.prompt-like-btn')
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        onLike(prompt)
      })
    }
  }

  return card
}

/**
 * Create a grid of cards
 * @param {Array<Object>} items - Items to create cards from
 * @param {Function} cardFactory - Function to create card for each item
 * @param {Object} options - Grid options
 * @returns {HTMLElement} Card grid element
 */
export function createCardGrid(items, cardFactory, options = {}) {
  const {
    columns = 3,          // auto, 1, 2, 3, 4
    gap = 'normal',       // small, normal, large
    className = '',
    emptyMessage = 'No items to display'
  } = options

  const grid = document.createElement('div')
  grid.className = [
    'card-grid',
    `card-grid-columns-${columns}`,
    `card-grid-gap-${gap}`,
    className
  ].filter(Boolean).join(' ')

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="card-grid-empty">
        <span class="material-icons">inbox</span>
        <p>${emptyMessage}</p>
      </div>
    `
  } else {
    items.forEach(item => {
      const card = cardFactory(item)
      grid.appendChild(card)
    })
  }

  return grid
}

/**
 * Create a skeleton card (loading placeholder)
 * @param {Object} options - Skeleton options
 * @returns {HTMLElement} Skeleton card element
 */
export function createSkeletonCard(options = {}) {
  const {
    showImage = false,
    showHeader = true,
    lines = 3
  } = options

  const card = document.createElement('div')
  card.className = 'card card-skeleton'

  let skeletonHTML = ''

  if (showImage) {
    skeletonHTML += '<div class="skeleton skeleton-image"></div>'
  }

  skeletonHTML += '<div class="card-body">'

  if (showHeader) {
    skeletonHTML += '<div class="skeleton skeleton-title"></div>'
  }

  for (let i = 0; i < lines; i++) {
    const width = i === lines - 1 ? '60%' : '100%'
    skeletonHTML += `<div class="skeleton skeleton-text" style="width: ${width}"></div>`
  }

  skeletonHTML += '</div>'

  card.innerHTML = skeletonHTML

  return card
}

/**
 * Create loading cards grid
 * @param {number} count - Number of skeleton cards
 * @param {Object} options - Options
 * @returns {HTMLElement} Grid with skeleton cards
 */
export function createLoadingCards(count = 6, options = {}) {
  const grid = document.createElement('div')
  grid.className = `card-grid card-grid-columns-${options.columns || 3}`

  for (let i = 0; i < count; i++) {
    grid.appendChild(createSkeletonCard(options))
  }

  return grid
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

function getCategoryIcon(category) {
  const icons = {
    writing: 'edit_note',
    coding: 'code',
    research: 'science',
    creative: 'palette',
    business: 'business_center',
    education: 'school',
    other: 'folder'
  }
  return icons[category] || icons.other
}

function getCategoryLabel(category) {
  const labels = {
    writing: 'Writing',
    coding: 'Coding',
    research: 'Research',
    creative: 'Creative',
    business: 'Business',
    education: 'Education',
    other: 'Other'
  }
  return labels[category] || labels.other
}

export default {
  createCard,
  createPromptCard,
  createCardGrid,
  createSkeletonCard,
  createLoadingCards
}
