/**
 * Tools Leaderboard Component
 * Displays AI tools with voting functionality
 */

import { TOOL_CATEGORY_ICONS, TOOL_CATEGORY_LABELS } from '../../config/constants.js'

/**
 * Create tools leaderboard
 * @param {Array} tools - Array of AI tools
 * @param {Object} options - Display options
 * @returns {HTMLElement} Tools leaderboard element
 */
export function createToolsLeaderboard(tools, options = {}) {
  const {
    currentFilter = 'all',
    onFilterChange = null,
    onVote = null,
    onSubmitTool = null,
    userVotes = new Map(),
    showCategories = true
  } = options

  const container = document.createElement('div')
  container.className = 'tools-leaderboard'

  // Get unique categories from tools
  const categories = showCategories
    ? ['all', ...new Set(tools.map(t => t.category).filter(Boolean))]
    : ['all']

  container.innerHTML = `
    <!-- Header -->
    <div class="tools-header">
      <h3 class="tools-title">Recommended AI Tools</h3>
      <button class="btn btn-primary btn-submit-tool">
        <span class="material-icons">add</span>
        <span>Submit Tool</span>
      </button>
    </div>

    <!-- Category Filters -->
    ${showCategories ? `
      <div class="tools-filters">
        ${categories.map(category => `
          <button
            class="tool-category-btn ${currentFilter === category ? 'active' : ''}"
            data-category="${category}"
          >
            ${category === 'all'
              ? '<span class="material-icons">apps</span>'
              : `<span class="material-icons">${TOOL_CATEGORY_ICONS[category] || 'apps'}</span>`
            }
            <span>${category === 'all' ? 'All' : TOOL_CATEGORY_LABELS[category] || category}</span>
          </button>
        `).join('')}
      </div>
    ` : ''}

    <!-- Tools Grid -->
    <div class="tools-grid">
      ${tools.length > 0
        ? tools.map(tool => renderToolCard(tool, { onVote, userVotes })).join('')
        : `
          <div class="tools-empty">
            <span class="material-icons">devices</span>
            <p>No tools to display</p>
          </div>
        `
      }
    </div>
  `

  // Attach event listeners
  attachToolsListeners(container, {
    onFilterChange,
    onVote,
    onSubmitTool
  })

  return container
}

/**
 * Render individual tool card
 * @param {Object} tool - Tool data
 * @param {Object} options - Card options
 * @returns {string} Tool card HTML
 */
function renderToolCard(tool, options) {
  const { onVote, userVotes } = options

  const userVote = userVotes.get(tool.id)
  const upvoted = userVote === 'up'
  const downvoted = userVote === 'down'

  return `
    <div class="tool-card" data-tool-id="${tool.id}">
      <!-- Tool Icon/Image -->
      <div class="tool-icon">
        ${tool.image_url
          ? `<img src="${tool.image_url}" alt="${escapeHtml(tool.name)}">`
          : `<span class="material-icons">${TOOL_CATEGORY_ICONS[tool.category] || 'apps'}</span>`
        }
      </div>

      <!-- Tool Info -->
      <div class="tool-info">
        <h4 class="tool-name">${escapeHtml(tool.name)}</h4>
        <p class="tool-description">${escapeHtml(truncate(tool.description, 120))}</p>

        ${tool.url ? `
          <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer" class="tool-link">
            <span class="material-icons">open_in_new</span>
            <span>Visit Website</span>
          </a>
        ` : ''}

        <!-- Tool Meta -->
        <div class="tool-meta">
          ${tool.category ? `
            <span class="tool-category-badge">
              <span class="material-icons">${TOOL_CATEGORY_ICONS[tool.category] || 'apps'}</span>
              <span>${TOOL_CATEGORY_LABELS[tool.category] || tool.category}</span>
            </span>
          ` : ''}

          ${tool.price_type ? `
            <span class="tool-price-badge ${tool.price_type}">
              ${tool.price_type === 'free' ? 'Free' : tool.price_type === 'freemium' ? 'Freemium' : 'Paid'}
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Voting -->
      ${onVote ? `
        <div class="tool-voting">
          <button
            class="vote-btn vote-up ${upvoted ? 'active' : ''}"
            data-tool-id="${tool.id}"
            data-vote="up"
            aria-label="Upvote"
          >
            <span class="material-icons">thumb_up</span>
            <span class="vote-count">${tool.upvotes || 0}</span>
          </button>

          <button
            class="vote-btn vote-down ${downvoted ? 'active' : ''}"
            data-tool-id="${tool.id}"
            data-vote="down"
            aria-label="Downvote"
          >
            <span class="material-icons">thumb_down</span>
            <span class="vote-count">${tool.downvotes || 0}</span>
          </button>
        </div>
      ` : ''}
    </div>
  `
}

/**
 * Attach event listeners
 * @param {HTMLElement} container - Tools container
 * @param {Object} callbacks - Event callbacks
 */
function attachToolsListeners(container, callbacks) {
  const { onFilterChange, onVote, onSubmitTool } = callbacks

  // Submit tool button
  if (onSubmitTool) {
    const submitBtn = container.querySelector('.btn-submit-tool')
    if (submitBtn) {
      submitBtn.addEventListener('click', onSubmitTool)
    }
  }

  // Category filters
  if (onFilterChange) {
    const categoryBtns = container.querySelectorAll('.tool-category-btn')
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        onFilterChange(btn.dataset.category)
      })
    })
  }

  // Vote buttons
  if (onVote) {
    const voteBtns = container.querySelectorAll('.vote-btn')
    voteBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()

        const toolId = btn.dataset.toolId
        const voteType = btn.dataset.vote

        try {
          await onVote(toolId, voteType)

          // Update UI optimistically
          const card = btn.closest('.tool-card')
          const otherBtn = card.querySelector(`.vote-btn.vote-${voteType === 'up' ? 'down' : 'up'}`)

          // Toggle active state
          if (btn.classList.contains('active')) {
            btn.classList.remove('active')
            decrementVoteCount(btn)
          } else {
            btn.classList.add('active')
            incrementVoteCount(btn)

            // Remove other vote if exists
            if (otherBtn.classList.contains('active')) {
              otherBtn.classList.remove('active')
              decrementVoteCount(otherBtn)
            }
          }
        } catch (error) {
          console.error('Vote failed:', error)
        }
      })
    })
  }
}

/**
 * Increment vote count
 * @param {HTMLElement} button - Vote button
 */
function incrementVoteCount(button) {
  const countSpan = button.querySelector('.vote-count')
  if (countSpan) {
    const current = parseInt(countSpan.textContent) || 0
    countSpan.textContent = current + 1
  }
}

/**
 * Decrement vote count
 * @param {HTMLElement} button - Vote button
 */
function decrementVoteCount(button) {
  const countSpan = button.querySelector('.vote-count')
  if (countSpan) {
    const current = parseInt(countSpan.textContent) || 0
    countSpan.textContent = Math.max(0, current - 1)
  }
}

/**
 * Filter tools by category
 * @param {Array} tools - All tools
 * @param {string} category - Category filter
 * @returns {Array} Filtered tools
 */
export function filterToolsByCategory(tools, category) {
  if (category === 'all') return tools
  return tools.filter(tool => tool.category === category)
}

/**
 * Sort tools
 * @param {Array} tools - Tools to sort
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted tools
 */
export function sortTools(tools, sortBy = 'votes') {
  const sorted = [...tools]

  switch (sortBy) {
    case 'votes':
      sorted.sort((a, b) => {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0)
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0)
        return scoreB - scoreA
      })
      break

    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break

    case 'recent':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break

    default:
      break
  }

  return sorted
}

// Helper functions
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

export default { createToolsLeaderboard, filterToolsByCategory, sortTools }
