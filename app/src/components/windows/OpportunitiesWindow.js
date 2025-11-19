/**
 * Opportunities Window Component
 * Main desktop window for browsing Stanford AI opportunities
 */

import { BentoGrid, initBentoGrid } from '../layouts/BentoGrid.js'
import { GlassToolbar, GlassSearchInput, GlassFilterButton } from '../ui/GlassPanel.js'
import {
  getOpportunities,
  getFeaturedOpportunities,
  getOpportunityCategories,
  searchOpportunities,
  toggleOpportunitySave,
  trackOpportunityClick
} from '../../services/opportunities.js'

let currentFilter = 'all'
let currentSearch = ''
let opportunities = []
let savedOpportunityIds = new Set()

/**
 * Render the Opportunities window content
 * @returns {string} HTML string
 */
export async function renderOpportunitiesWindow() {
  // Fetch initial data
  opportunities = await getOpportunities({ limit: 50 })
  const categories = getOpportunityCategories()

  return `
    <div class="opportunities-window" style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      position: relative;
      overflow: hidden;
    ">
      <!-- Animated Dot Grid Background -->
      <canvas id="dot-grid-canvas" style="
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.3;
      "></canvas>

      <!-- Cursor Glow Effect -->
      <div id="cursor-glow" style="
        position: absolute;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
        z-index: 1;
      "></div>

      <!-- Toolbar -->
      ${GlassToolbar({
        children: `
          <!-- Search -->
          ${GlassSearchInput({
            id: 'opportunities-search',
            placeholder: 'Search opportunities...',
            onInput: 'window.handleOpportunitiesSearch(this.value)'
          })}

          <!-- Category Filters -->
          <div style="display: flex; gap: 8px; overflow-x: auto; flex: 1;">
            ${GlassFilterButton({
              label: 'All',
              value: 'all',
              active: currentFilter === 'all',
              onClick: 'window.handleCategoryFilter("all")'
            })}
            ${categories.map(cat => GlassFilterButton({
              label: cat.label,
              value: cat.value,
              active: currentFilter === cat.value,
              onClick: `window.handleCategoryFilter("${cat.value}")`
            })).join('')}
          </div>
        `
      })}

      <!-- Opportunities Grid -->
      <div id="opportunities-grid-container" style="
        flex: 1;
        overflow-y: auto;
        position: relative;
        z-index: 2;
      ">
        ${BentoGrid({
          items: opportunities,
          enableScrollReveal: true,
          staggerDelay: 100
        })}
      </div>

      <!-- Empty State -->
      <div id="empty-state" style="
        position: absolute;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        z-index: 3;
        padding: 40px;
        text-align: center;
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" stroke-width="2">
          <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21L16.65 16.65" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; margin: 0;">
          No opportunities found
        </p>
      </div>
    </div>
  `
}

/**
 * Initialize the Opportunities window
 * Sets up interactions, animations, and event handlers
 */
export async function initOpportunitiesWindow() {
  // Initialize bento grid
  const gridContainer = document.querySelector('.bento-grid')
  if (gridContainer) {
    initBentoGrid(gridContainer)
  }

  // Initialize dot grid background
  initDotGridBackground()

  // Initialize cursor glow effect
  initCursorGlow()

  // Set up global event handlers
  setupGlobalHandlers()

  // Add input focus effects
  const searchInput = document.getElementById('glass-search-opportunities-search')
  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = 'rgba(168, 85, 247, 0.5)'
      searchInput.style.background = 'rgba(255, 255, 255, 0.08)'
    })

    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      searchInput.style.background = 'rgba(255, 255, 255, 0.05)'
    })
  }
}

/**
 * Initialize animated dot grid background
 */
function initDotGridBackground() {
  const canvas = document.getElementById('dot-grid-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const container = canvas.parentElement

  // Set canvas size
  function resizeCanvas() {
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // Dot grid configuration
  const dotSize = 2
  const spacing = 30
  const dots = []

  // Create dots
  for (let x = 0; x < canvas.width; x += spacing) {
    for (let y = 0; y < canvas.height; y += spacing) {
      dots.push({
        x,
        y,
        baseY: y,
        offset: Math.random() * Math.PI * 2,
        amplitude: Math.random() * 3 + 1
      })
    }
  }

  // Animate dots
  let frame = 0
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    dots.forEach(dot => {
      const wave = Math.sin(frame * 0.02 + dot.offset) * dot.amplitude
      const y = dot.baseY + wave

      ctx.fillStyle = 'rgba(168, 85, 247, 0.4)'
      ctx.beginPath()
      ctx.arc(dot.x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()
    })

    frame++
    requestAnimationFrame(animate)
  }

  animate()
}

/**
 * Initialize cursor glow effect
 */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow')
  const windowEl = document.querySelector('.opportunities-window')

  if (!glow || !windowEl) return

  windowEl.addEventListener('mousemove', (e) => {
    const rect = windowEl.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    glow.style.left = `${x}px`
    glow.style.top = `${y}px`
    glow.style.opacity = '1'
  })

  windowEl.addEventListener('mouseleave', () => {
    glow.style.opacity = '0'
  })
}

/**
 * Setup global event handlers
 */
function setupGlobalHandlers() {
  // Card click handler
  window.handleCardClick = async (opportunityId, url) => {
    // Track click
    await trackOpportunityClick(opportunityId)

    // Open URL in new tab
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // Bookmark click handler
  window.handleBookmarkClick = async (opportunityId) => {
    try {
      const result = await toggleOpportunitySave(opportunityId)

      // Update UI
      const card = document.querySelector(`[data-card-id="${opportunityId}"]`)
      if (!card) return

      const bookmarkBtn = card.querySelector('.action-bookmark svg')
      if (!bookmarkBtn) return

      if (result.saved) {
        savedOpportunityIds.add(opportunityId)
        bookmarkBtn.setAttribute('fill', 'currentColor')
        showToast(result.message || 'Saved!', 'success')
      } else {
        savedOpportunityIds.delete(opportunityId)
        bookmarkBtn.setAttribute('fill', 'none')
        showToast(result.message || 'Removed', 'info')
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      showToast('Please sign in to save opportunities', 'error')
    }
  }

  // Search handler
  window.handleOpportunitiesSearch = async (query) => {
    currentSearch = query.trim()
    await refreshOpportunities()
  }

  // Category filter handler
  window.handleCategoryFilter = async (category) => {
    currentFilter = category

    // Update button states
    document.querySelectorAll('.glass-filter-button').forEach(btn => {
      const isActive = btn.dataset.filterValue === category
      btn.classList.toggle('active', isActive)
      btn.style.background = isActive ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)'
      btn.style.borderColor = isActive ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.1)'
      btn.style.color = isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)'
      btn.style.fontWeight = isActive ? '600' : '500'
    })

    await refreshOpportunities()
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
    const gridContainer = document.getElementById('opportunities-grid-container')
    const emptyState = document.getElementById('empty-state')

    if (opportunities.length === 0) {
      gridContainer.style.display = 'none'
      emptyState.style.display = 'flex'
    } else {
      gridContainer.style.display = 'block'
      emptyState.style.display = 'none'

      gridContainer.innerHTML = BentoGrid({
        items: opportunities,
        enableScrollReveal: true,
        staggerDelay: 100
      })

      // Re-initialize grid
      const grid = gridContainer.querySelector('.bento-grid')
      if (grid) {
        initBentoGrid(grid)
      }
    }
  } catch (error) {
    console.error('Failed to refresh opportunities:', error)
    showToast('Failed to load opportunities', 'error')
  }
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
  // Find or create toast container
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

  // Create toast
  const toast = document.createElement('div')
  toast.className = 'toast'

  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6'
  }

  toast.style.cssText = `
    background: rgba(24, 24, 27, 0.95);
    border: 1px solid ${colors[type] || colors.info};
    border-radius: 12px;
    padding: 14px 18px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `

  toast.textContent = message
  container.appendChild(toast)

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Add toast animations to document
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style')
  style.id = 'toast-styles'
  style.textContent = `
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
