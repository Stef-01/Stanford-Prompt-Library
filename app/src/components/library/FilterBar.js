/**
 * Filter Bar Component
 * Search, filter, and view controls for the library
 */

import { getAllCategories, SORT_LABELS, VIEW_MODES } from '../../config/constants.js'

/**
 * Create filter bar
 * @param {Object} options - Filter bar options
 * @returns {HTMLElement} Filter bar element
 */
export function createFilterBar(options = {}) {
  const {
    onSearch = null,
    onCategoryChange = null,
    onSortChange = null,
    onViewModeChange = null,
    initialCategory = 'all',
    initialSort = 'recent',
    initialViewMode = 'grid-details',
    showViewToggle = true,
    className = ''
  } = options

  const filterBar = document.createElement('div')
  filterBar.className = `library-filter-bar ${className}`

  filterBar.innerHTML = `
    <div class="filter-bar-search">
      <span class="material-icons">search</span>
      <input
        type="text"
        class="filter-search-input"
        placeholder="Search prompts..."
        aria-label="Search prompts"
      >
    </div>

    <div class="filter-bar-controls">
      <select class="filter-category-select" aria-label="Filter by category">
        <option value="all">All Categories</option>
        ${getAllCategories().map(cat => `
          <option value="${cat.key}" ${initialCategory === cat.key ? 'selected' : ''}>
            ${cat.label}
          </option>
        `).join('')}
      </select>

      <select class="filter-sort-select" aria-label="Sort by">
        ${Object.entries(SORT_LABELS).map(([key, label]) => `
          <option value="${key}" ${initialSort === key ? 'selected' : ''}>
            ${label}
          </option>
        `).join('')}
      </select>

      ${showViewToggle ? `
        <div class="filter-view-toggle" role="group" aria-label="View mode">
          <button
            class="view-toggle-btn ${initialViewMode === VIEW_MODES.GRID_DETAILS ? 'active' : ''}"
            data-view="${VIEW_MODES.GRID_DETAILS}"
            aria-label="Grid details view"
            title="Grid details view"
          >
            <span class="material-icons">view_module</span>
          </button>
          <button
            class="view-toggle-btn ${initialViewMode === VIEW_MODES.GRID_IMAGE ? 'active' : ''}"
            data-view="${VIEW_MODES.GRID_IMAGE}"
            aria-label="Grid image view"
            title="Grid image view"
          >
            <span class="material-icons">grid_view</span>
          </button>
          <button
            class="view-toggle-btn ${initialViewMode === VIEW_MODES.CAROUSEL ? 'active' : ''}"
            data-view="${VIEW_MODES.CAROUSEL}"
            aria-label="Carousel view"
            title="Carousel view"
          >
            <span class="material-icons">view_carousel</span>
          </button>
        </div>
      ` : ''}
    </div>
  `

  // Attach event listeners
  attachFilterBarListeners(filterBar, {
    onSearch,
    onCategoryChange,
    onSortChange,
    onViewModeChange
  })

  return filterBar
}

/**
 * Attach event listeners to filter bar
 */
function attachFilterBarListeners(filterBar, callbacks) {
  const { onSearch, onCategoryChange, onSortChange, onViewModeChange } = callbacks

  // Search input
  if (onSearch) {
    const searchInput = filterBar.querySelector('.filter-search-input')
    let searchTimeout

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        onSearch(e.target.value)
      }, 300) // Debounce search
    })
  }

  // Category select
  if (onCategoryChange) {
    const categorySelect = filterBar.querySelector('.filter-category-select')
    categorySelect.addEventListener('change', (e) => {
      onCategoryChange(e.target.value)
    })
  }

  // Sort select
  if (onSortChange) {
    const sortSelect = filterBar.querySelector('.filter-sort-select')
    sortSelect.addEventListener('change', (e) => {
      onSortChange(e.target.value)
    })
  }

  // View mode toggle
  if (onViewModeChange) {
    const viewButtons = filterBar.querySelectorAll('.view-toggle-btn')
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        viewButtons.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        // Trigger callback
        onViewModeChange(btn.dataset.view)
      })
    })
  }
}

/**
 * Update filter bar state
 * @param {HTMLElement} filterBar - Filter bar element
 * @param {Object} state - New state
 */
export function updateFilterBar(filterBar, state) {
  if (state.category) {
    const categorySelect = filterBar.querySelector('.filter-category-select')
    if (categorySelect) categorySelect.value = state.category
  }

  if (state.sort) {
    const sortSelect = filterBar.querySelector('.filter-sort-select')
    if (sortSelect) sortSelect.value = state.sort
  }

  if (state.searchQuery !== undefined) {
    const searchInput = filterBar.querySelector('.filter-search-input')
    if (searchInput) searchInput.value = state.searchQuery
  }

  if (state.viewMode) {
    const viewButtons = filterBar.querySelectorAll('.view-toggle-btn')
    viewButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === state.viewMode)
    })
  }
}

/**
 * Get current filter bar state
 * @param {HTMLElement} filterBar - Filter bar element
 * @returns {Object} Current state
 */
export function getFilterBarState(filterBar) {
  return {
    searchQuery: filterBar.querySelector('.filter-search-input')?.value || '',
    category: filterBar.querySelector('.filter-category-select')?.value || 'all',
    sort: filterBar.querySelector('.filter-sort-select')?.value || 'recent',
    viewMode: filterBar.querySelector('.view-toggle-btn.active')?.dataset.view || VIEW_MODES.GRID_DETAILS
  }
}

export default { createFilterBar, updateFilterBar, getFilterBarState }
