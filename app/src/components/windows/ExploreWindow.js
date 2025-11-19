import {
  getApprovedPrompts,
  getCategories,
  copyPromptToClipboard,
  exportPromptAsMarkdown
} from '../../services/prompts.js'

let currentCategory = null
let currentSearchQuery = ''
let prompts = []
let categories = []

/**
 * Render Explore Window Content
 * @param {HTMLElement} contentContainer - Window content container
 */
export async function renderExploreWindow(contentContainer) {
  // Load data
  categories = await getCategories()
  prompts = await getApprovedPrompts()

  contentContainer.innerHTML = `
    <h2 style="font-size: 24px; margin-bottom: 20px;">Discover Amazing Prompts</h2>

    <!-- Search Bar -->
    <input
      type="text"
      id="explore-search"
      class="search-bar"
      placeholder="Search prompts, categories, or techniques..."
      value="${currentSearchQuery}"
    />

    <!-- Category Filters -->
    <div class="category-filters" style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <button class="category-btn ${!currentCategory ? 'active' : ''}" data-category="">
        All
      </button>
      ${categories.map(cat => `
        <button
          class="category-btn ${currentCategory === cat.name ? 'active' : ''}"
          data-category="${cat.name}"
        >
          ${cat.icon} ${cat.name}
        </button>
      `).join('')}
    </div>

    <!-- Prompts Grid -->
    <div class="content-grid" id="explore-prompts-grid" style="margin-top: 20px;">
      ${renderPromptCards()}
    </div>
  `

  // Attach event listeners
  attachEventListeners(contentContainer)
}

/**
 * Render prompt cards
 */
function renderPromptCards() {
  if (prompts.length === 0) {
    return `
      <div class="content-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <h3 style="color: var(--text-secondary); margin-bottom: 1rem;">No prompts found</h3>
        <p style="color: var(--text-secondary);">Try different filters or check back later!</p>
      </div>
    `
  }

  return prompts.map(prompt => `
    <div class="content-card prompt-detail-card">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
        <span style="font-size: 11px; background: ${getCategoryColor(prompt.category)}; padding: 4px 8px; border-radius: 4px; color: white;">
          ${prompt.category}
        </span>
        <span style="font-size: 11px; color: var(--text-secondary);">
          ❤️ ${prompt.likes_count || 0}
        </span>
      </div>

      <h3 style="color: var(--accent-blue); margin-bottom: 10px; font-size: 16px;">
        ${escapeHtml(prompt.title)}
      </h3>

      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px; line-height: 1.5;">
        ${escapeHtml(prompt.description || 'No description')}
      </p>

      ${prompt.tags && prompt.tags.length > 0 ? `
        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 15px;">
          ${prompt.tags.slice(0, 3).map(tag => `
            <span style="font-size: 11px; background: rgba(59, 130, 246, 0.2); padding: 3px 6px; border-radius: 3px;">
              ${escapeHtml(tag)}
            </span>
          `).join('')}
          ${prompt.tags.length > 3 ? `<span style="font-size: 11px; color: var(--text-secondary);">+${prompt.tags.length - 3} more</span>` : ''}
        </div>
      ` : ''}

      <div style="display: flex; gap: 8px; margin-top: auto;">
        <button class="btn-primary" style="flex: 1; padding: 8px 12px; font-size: 12px;" onclick="window.viewPrompt('${prompt.id}')">
          View
        </button>
        <button class="btn-primary" style="background: rgba(255, 255, 255, 0.1); padding: 8px 12px; font-size: 12px;" onclick="window.copyPrompt('${prompt.id}')">
          📋
        </button>
        <button class="btn-primary" style="background: rgba(255, 255, 255, 0.1); padding: 8px 12px; font-size: 12px;" onclick="window.exportPrompt('${prompt.id}')">
          ⬇️
        </button>
      </div>
    </div>
  `).join('')
}

/**
 * Attach event listeners
 */
function attachEventListeners(container) {
  // Search input
  const searchInput = container.querySelector('#explore-search')
  searchInput?.addEventListener('input', debounce(async (e) => {
    currentSearchQuery = e.target.value
    await filterAndRenderPrompts(container)
  }, 300))

  // Category buttons
  const categoryBtns = container.querySelectorAll('.category-btn')
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentCategory = btn.dataset.category || null
      categoryBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      await filterAndRenderPrompts(container)
    })
  })

  // Global functions for buttons (using window object to avoid event listener cleanup issues)
  window.viewPrompt = (promptId) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      alert(`Viewing: ${prompt.title}\n\n${prompt.content}`)
    }
  }

  window.copyPrompt = async (promptId) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      const success = await copyPromptToClipboard(prompt)
      if (success) {
        showNotification('Copied to clipboard!')
      }
    }
  }

  window.exportPrompt = async (promptId) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      await exportPromptAsMarkdown(prompt)
      showNotification('Exported as markdown!')
    }
  }
}

/**
 * Filter and re-render prompts
 */
async function filterAndRenderPrompts(container) {
  const filters = {
    search: currentSearchQuery,
    category: currentCategory
  }

  prompts = await getApprovedPrompts(filters)

  const grid = container.querySelector('#explore-prompts-grid')
  if (grid) {
    grid.innerHTML = renderPromptCards()
  }
}

/**
 * Get category color
 */
function getCategoryColor(category) {
  const colors = {
    'Research & Academia': '#3b82f6',
    'Data Science & ML': '#10b981',
    'Business Strategy': '#ec4899',
    'Finance & Investment': '#f59e0b',
    'Consulting': '#8b5cf6',
    'Software Engineering': '#06b6d4',
    'Product & Design': '#f97316',
    'Legal & Policy': '#64748b',
    'Medical & Healthcare': '#ef4444',
    'Content & Marketing': '#a855f7',
    'Education & Teaching': '#14b8a6',
    'Startups & Ventures': '#f43f5e',
    'Career Development': '#0ea5e9',
    'Academic Writing': '#84cc16'
  }
  return colors[category] || '#3b82f6'
}

/**
 * Show notification
 */
function showNotification(message) {
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 50px;
    right: 20px;
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 12px 20px;
    color: var(--text-primary);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 99999;
    animation: slideIn 0.3s ease-out;
  `
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => notification.remove(), 300)
  }, 2000)
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
