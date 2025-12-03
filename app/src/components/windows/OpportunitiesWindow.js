/**
 * Opportunities Window - Modern Monochrome Design
 * Browse Stanford AI opportunities with Bento grid layout
 */

import { Icon } from '../ui/Icon.js'
import {
  getOpportunities,
  getFeaturedOpportunities,
  getOpportunityCategories,
  searchOpportunities,
  toggleOpportunitySave,
  trackOpportunityClick
} from '../../services/opportunities.js'
import { debounce, escapeHtml } from '../../utils/helpers/formatters.js'

let currentFilter = 'all'
let currentSearch = ''
let opportunities = []
let savedOpportunityIds = new Set()

// Category icon mapping
const CATEGORY_ICONS = {
  research: 'science',
  internship: 'work',
  fellowship: 'school',
  competition: 'trophy',
  workshop: 'groups',
  all: 'grid_view'
}

/**
 * Render the Opportunities window content
 */
export async function renderOpportunitiesWindow() {
  // Fetch initial data
  opportunities = await getOpportunities({ limit: 50 })
  const categories = getOpportunityCategories()

  return `
    <div class="opportunities-window-content" style="height: 100%; overflow-y: auto; overflow-x: hidden; background: var(--background-dark);">
      <div style="max-width: 1400px; margin: 0 auto; padding: 48px 24px 96px;">

        <!-- Hero Section -->
        <div class="text-center" style="margin-bottom: 48px; animation: fadeIn 0.4s var(--ease-spring);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                      border-radius: 20px; background: var(--white-10); border: 2px solid var(--border-subtle); margin-bottom: 24px;">
            ${Icon({ name: 'explore', className: 'text-white !text-[40px]' })}
          </div>
          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 700; color: var(--text-primary); margin-bottom: 16px; line-height: 1.1; letter-spacing: -0.02em;">
            Opportunities
          </h1>
          <p style="font-size: 18px; color: var(--text-subtle); max-width: 600px; margin: 0 auto;">
            Explore research, internships, fellowships, and competitions at Stanford
          </p>
        </div>

        <!-- Search and Filters -->
        <div style="margin-bottom: 32px;">
          <!-- Search Bar -->
          <div style="position: relative; margin-bottom: 20px; max-width: 600px; margin-left: auto; margin-right: auto;">
            ${Icon({ name: 'search', className: 'search-icon-opp' })}
            <input
              type="text"
              id="opportunities-search"
              placeholder="Search opportunities by title, organization, or tags..."
              value="${currentSearch}"
              style="width: 100%; padding-left: 48px; padding-right: 16px; padding-top: 14px; padding-bottom: 14px;
                     background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px;
                     color: var(--text-primary); font-size: 16px; transition: all 0.4s var(--ease-spring);"
            />
          </div>

          <!-- Category Filters -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px;">
            <button class="category-filter-btn" data-category="all"
                    style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
                           background: ${currentFilter === 'all' ? 'var(--primary)' : 'var(--white-5)'};
                           color: ${currentFilter === 'all' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                           border: ${currentFilter === 'all' ? 'none' : '1px solid var(--border-subtle)'};
                           border-radius: 24px; font-size: 14px; font-weight: ${currentFilter === 'all' ? '600' : '500'};
                           cursor: pointer; transition: all 0.4s var(--ease-spring);">
              ${Icon({ name: 'grid_view', className: '!text-[18px]' })}
              <span>All</span>
            </button>
            ${categories.map(cat => `
              <button class="category-filter-btn" data-category="${cat.value}"
                      style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
                             background: ${currentFilter === cat.value ? 'var(--primary)' : 'var(--white-5)'};
                             color: ${currentFilter === cat.value ? 'var(--background-dark)' : 'var(--text-subtle)'};
                             border: ${currentFilter === cat.value ? 'none' : '1px solid var(--border-subtle)'};
                             border-radius: 24px; font-size: 14px; font-weight: ${currentFilter === cat.value ? '600' : '500'};
                             cursor: pointer; transition: all 0.4s var(--ease-spring);">
                ${Icon({ name: CATEGORY_ICONS[cat.value] || 'folder', className: '!text-[18px]' })}
                <span>${cat.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Opportunities Grid -->
        <div id="opportunities-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-bottom: 32px;">
          ${renderOpportunitiesGrid()}
        </div>

        <!-- Empty State -->
        <div id="empty-state" style="display: ${opportunities.length === 0 ? 'flex' : 'none'}; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                      border-radius: 20px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
            ${Icon({ name: 'search_off', className: 'text-subtle-white !text-[40px]' })}
          </div>
          <p style="font-size: 18px; color: var(--text-subtle); margin-bottom: 8px;">No opportunities found</p>
          <p style="font-size: 14px; color: var(--text-subtle);">Try adjusting your search or filters</p>
        </div>

      </div>
    </div>
  `
}

/**
 * Render opportunities grid
 */
function renderOpportunitiesGrid() {
  if (opportunities.length === 0) return ''

  return opportunities.map((opp, index) => {
    const {
      id,
      title,
      description,
      category,
      organization,
      location,
      url,
      tags = [],
      status = 'active',
      card_size = '1x1',
      icon = 'briefcase',
      deadline,
      saves_count = 0
    } = opp

    const isSaved = savedOpportunityIds.has(id)
    const deadlineText = deadline ? formatDeadline(deadline) : null
    const iconName = CATEGORY_ICONS[category] || 'work'

    return `
      <div class="opportunity-card" data-card-id="${id}"
           style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px;
                  padding: 24px; cursor: pointer; transition: all 0.4s var(--ease-spring);
                  display: flex; flex-direction: column; gap: 16px;">

        <!-- Header -->
        <div style="display: flex; align-items: start; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                      border-radius: 12px; background: var(--white-10); flex-shrink: 0;">
            ${Icon({ name: iconName, className: 'text-white !text-[28px]' })}
          </div>
          ${status === 'featured' ? `
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
                        background: var(--white-10); border: 1px solid var(--border-subtle); border-radius: 20px;
                        font-size: 12px; font-weight: 600; color: var(--text-primary);">
              ${Icon({ name: 'star', className: '!text-[16px]' })}
              <span>Featured</span>
            </div>
          ` : ''}
        </div>

        <!-- Title -->
        <h3 style="font-size: 20px; font-weight: 700; color: var(--text-primary); line-height: 1.3; margin: 0;">
          ${escapeHtml(title)}
        </h3>

        <!-- Organization & Location -->
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: var(--text-subtle);">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${Icon({ name: 'business', className: '!text-[18px]' })}
            <span>${escapeHtml(organization)}</span>
          </div>
          ${location ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icon({ name: 'location_on', className: '!text-[18px]' })}
              <span>${escapeHtml(location)}</span>
            </div>
          ` : ''}
        </div>

        <!-- Description -->
        <p style="font-size: 15px; line-height: 1.6; color: var(--text-subtle); margin: 0; flex: 1;
                  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
          ${escapeHtml(description)}
        </p>

        <!-- Tags -->
        ${tags.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${tags.slice(0, 4).map(tag => `
              <span style="padding: 6px 12px; border-radius: 8px; background: var(--white-10);
                           font-size: 12px; color: var(--text-subtle); border: 1px solid var(--border-subtle);">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;
                    padding-top: 16px; border-top: 1px solid var(--white-5);">
          ${deadlineText ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-subtle);">
              ${Icon({ name: 'schedule', className: '!text-[18px]' })}
              <span>${deadlineText}</span>
            </div>
          ` : '<div></div>'}

          <div style="display: flex; align-items: center; gap: 12px;">
            ${saves_count > 0 ? `
              <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-subtle);">
                ${Icon({ name: 'bookmark', className: '!text-[16px]' })}
                <span>${saves_count}</span>
              </div>
            ` : ''}
            <button class="bookmark-btn" data-opp-id="${id}"
                    style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;
                           background: ${isSaved ? 'var(--white-15)' : 'var(--white-10)'};
                           border: 1px solid var(--border-subtle); border-radius: 10px; cursor: pointer;
                           transition: all 0.2s ease;">
              ${Icon({ name: isSaved ? 'bookmark' : 'bookmark_border', className: 'text-white !text-[20px]' })}
            </button>
          </div>
        </div>
      </div>
    `
  }).join('')
}

/**
 * Initialize the Opportunities window
 */
export async function initOpportunitiesWindow() {
  // Wait for DOM to be ready with a more robust check
  let attempts = 0
  const maxAttempts = 10

  const waitForElement = async () => {
    const contentContainer = document.querySelector('.opportunities-window-content')
    if (contentContainer) {
      setupEventListeners(contentContainer)
      injectStyles()
      return true
    }

    attempts++
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50))
      return waitForElement()
    }

    console.warn('OpportunitiesWindow: Could not find content container after', maxAttempts, 'attempts')
    injectStyles() // Inject styles anyway
    return false
  }

  await waitForElement()
}

/**
 * Setup event listeners
 */
function setupEventListeners(contentContainer) {
  if (!contentContainer) return

  // Search
  const searchInput = document.getElementById('opportunities-search')
  searchInput?.addEventListener('input', debounce(async (e) => {
    currentSearch = e.target.value.trim()
    await refreshOpportunities()
  }, 300))

  // Search focus effects
  searchInput?.addEventListener('focus', (e) => {
    e.target.style.boxShadow = '0 0 0 2px var(--white-20)'
    e.target.style.borderColor = 'var(--white-30)'
    e.target.style.background = 'var(--white-10)'
    const icon = contentContainer.querySelector('.search-icon-opp')
    if (icon) icon.style.color = 'var(--text-primary)'
  })

  searchInput?.addEventListener('blur', (e) => {
    e.target.style.boxShadow = 'none'
    e.target.style.borderColor = 'var(--border-subtle)'
    e.target.style.background = 'var(--white-5)'
    const icon = contentContainer.querySelector('.search-icon-opp')
    if (icon) icon.style.color = 'var(--text-subtle)'
  })

  // Category filters
  const filterBtns = contentContainer.querySelectorAll('.category-filter-btn')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentFilter = btn.dataset.category
      await refreshOpportunities()

      // Update button styles
      filterBtns.forEach(b => {
        const isActive = b.dataset.category === currentFilter
        b.style.background = isActive ? 'var(--primary)' : 'var(--white-5)'
        b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        b.style.fontWeight = isActive ? '600' : '500'
        b.style.border = isActive ? 'none' : '1px solid var(--border-subtle)'
      })
    })

    // Hover effects
    btn.addEventListener('mouseenter', (e) => {
      if (e.target.dataset.category !== currentFilter) {
        e.target.style.background = 'var(--white-10)'
        e.target.style.borderColor = 'var(--white-20)'
      }
    })

    btn.addEventListener('mouseleave', (e) => {
      if (e.target.dataset.category !== currentFilter) {
        e.target.style.background = 'var(--white-5)'
        e.target.style.borderColor = 'var(--border-subtle)'
      }
    })
  })

  // Opportunity cards
  attachCardListeners()
}

/**
 * Attach card event listeners
 */
function attachCardListeners() {
  const cards = document.querySelectorAll('.opportunity-card')
  cards.forEach(card => {
    // Card click
    card.addEventListener('click', async (e) => {
      // Don't trigger if clicking bookmark button
      if (e.target.closest('.bookmark-btn')) return

      const cardId = card.dataset.cardId
      const opp = opportunities.find(o => o.id === cardId)
      if (!opp) return

      // Track click
      await trackOpportunityClick(cardId)

      // Open URL
      if (opp.url) {
        window.open(opp.url, '_blank', 'noopener,noreferrer')
      }
    })

    // Hover effects
    card.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
    })

    card.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    })
  })

  // Bookmark buttons
  const bookmarkBtns = document.querySelectorAll('.bookmark-btn')
  bookmarkBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const oppId = btn.dataset.oppId
      await handleBookmarkClick(oppId, btn)
    })

    btn.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-20)'
      e.currentTarget.style.transform = 'scale(1.05)'
    })

    btn.addEventListener('mouseleave', (e) => {
      const oppId = e.currentTarget.dataset.oppId
      const isSaved = savedOpportunityIds.has(oppId)
      e.currentTarget.style.background = isSaved ? 'var(--white-15)' : 'var(--white-10)'
      e.currentTarget.style.transform = 'scale(1)'
    })
  })
}

/**
 * Handle bookmark click
 */
async function handleBookmarkClick(oppId, btnEl) {
  try {
    const result = await toggleOpportunitySave(oppId)

    if (result.saved) {
      savedOpportunityIds.add(oppId)
      btnEl.innerHTML = Icon({ name: 'bookmark', className: 'text-white !text-[20px]' })
      btnEl.style.background = 'var(--white-15)'
      showToast(result.message || 'Saved!', 'success')
    } else {
      savedOpportunityIds.delete(oppId)
      btnEl.innerHTML = Icon({ name: 'bookmark_border', className: 'text-white !text-[20px]' })
      btnEl.style.background = 'var(--white-10)'
      showToast(result.message || 'Removed', 'info')
    }
  } catch (error) {
    console.error('Failed to toggle bookmark:', error)
    showToast('Please sign in to save opportunities', 'error')
  }
}

/**
 * Refresh opportunities based on current filters
 */
async function refreshOpportunities() {
  try {
    let results

    if (currentSearch) {
      // Search mode
      results = await searchOpportunities(currentSearch)
      if (currentFilter !== 'all') {
        results = results.filter(opp => opp.category === currentFilter)
      }
    } else {
      // Filter mode
      results = await getOpportunities({
        category: currentFilter === 'all' ? null : currentFilter,
        limit: 50
      })
    }

    opportunities = results

    // Update grid
    const grid = document.getElementById('opportunities-grid')
    const emptyState = document.getElementById('empty-state')

    if (opportunities.length === 0) {
      grid.style.display = 'none'
      emptyState.style.display = 'flex'
    } else {
      grid.style.display = 'grid'
      emptyState.style.display = 'none'
      grid.innerHTML = renderOpportunitiesGrid()
      attachCardListeners()
    }
  } catch (error) {
    console.error('Failed to refresh opportunities:', error)
    showToast('Failed to load opportunities', 'error')
  }
}

/**
 * Format deadline for display
 */
function formatDeadline(deadline) {
  const date = new Date(deadline)
  const now = new Date()
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Closed'
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays < 7) return `${diffDays} days left`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  const colors = {
    success: 'var(--primary)',
    error: '#EF4444',
    info: 'var(--text-subtle)'
  }

  toast.style.cssText = `
    background: var(--white-10);
    border: 1px solid ${colors[type] || colors.info};
    border-radius: 12px;
    padding: 14px 18px;
    color: var(--text-primary);
    font-size: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    animation: slideIn 0.3s var(--ease-spring);
  `

  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Inject custom styles
 */
function injectStyles() {
  if (document.getElementById('opportunities-window-styles')) return

  const style = document.createElement('style')
  style.id = 'opportunities-window-styles'
  style.textContent = `
    .search-icon-opp {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-subtle);
      transition: color 0.4s ease;
      font-size: 20px !important;
      pointer-events: none;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}
