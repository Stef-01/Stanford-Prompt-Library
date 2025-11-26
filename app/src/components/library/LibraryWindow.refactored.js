/**
 * Library Window (Refactored)
 * Main container for the prompt library
 * Uses modular components and centralized state management
 */

import { libraryStore, appStore } from '../../state/store.js'
import { createFilterBar } from './FilterBar.js'
import { createPromptGrid, createLoadingGrid, updateGrid } from './PromptGrid.js'
import { createPromptModal } from './PromptModal.js'
import { getApprovedPrompts, getMyPrompts, likePrompt } from '../../services/prompts.js'
import { LIBRARY_VIEWS, VIEW_MODES } from '../../config/constants.js'

// ============================================================================
// Module State
// ============================================================================

let unsubscribe = null
let currentModal = null
let filterBarElement = null
let gridContainer = null

// ============================================================================
// Main Render Function
// ============================================================================

/**
 * Render the library window
 * @param {string} windowId - Window element ID
 */
export async function renderLibraryWindow(windowId = 'library-window-content') {
  const container = document.getElementById(windowId)
  if (!container) {
    console.error('[LibraryWindow] Container not found:', windowId)
    return
  }

  // Initialize state if needed
  await initializeLibraryState()

  // Subscribe to state changes
  setupStateSubscription()

  // Render UI
  renderLibraryUI(container)

  // Initial data load
  await loadLibraryData()
}

/**
 * Initialize library state
 */
async function initializeLibraryState() {
  const state = libraryStore.getState()

  // Set default state if not initialized
  if (state.allPrompts.length === 0) {
    libraryStore.setState({
      currentView: LIBRARY_VIEWS.DISCOVER,
      currentCategory: 'all',
      currentSortBy: 'recent',
      searchQuery: '',
      viewMode: VIEW_MODES.GRID_DETAILS,
      isLoading: false
    }, 'initialize')
  }
}

/**
 * Setup state subscription
 */
function setupStateSubscription() {
  // Unsubscribe from previous subscription if exists
  if (unsubscribe) unsubscribe()

  // Subscribe to relevant state changes
  unsubscribe = libraryStore.subscribe(
    ['filteredPrompts', 'viewMode', 'isLoading', 'currentView'],
    handleStateChange
  )
}

/**
 * Render library UI
 */
function renderLibraryUI(container) {
  const state = libraryStore.getState()

  container.innerHTML = `
    <div class="library-container">
      <!-- View Tabs -->
      <div class="library-tabs">
        <button
          class="library-tab ${state.currentView === LIBRARY_VIEWS.DISCOVER ? 'active' : ''}"
          data-view="${LIBRARY_VIEWS.DISCOVER}"
        >
          <span class="material-icons">explore</span>
          <span>Discover</span>
        </button>
        <button
          class="library-tab ${state.currentView === LIBRARY_VIEWS.MY_PROMPTS ? 'active' : ''}"
          data-view="${LIBRARY_VIEWS.MY_PROMPTS}"
        >
          <span class="material-icons">folder</span>
          <span>My Prompts</span>
        </button>
        <button
          class="library-tab ${state.currentView === LIBRARY_VIEWS.LIKED ? 'active' : ''}"
          data-view="${LIBRARY_VIEWS.LIKED}"
        >
          <span class="material-icons">favorite</span>
          <span>Liked</span>
        </button>
      </div>

      <!-- Filter Bar -->
      <div id="filter-bar-container"></div>

      <!-- Content Area -->
      <div id="library-content-container" class="library-content"></div>
    </div>
  `

  // Render filter bar
  renderFilterBar(container)

  // Render initial content
  renderContent(container)

  // Attach tab listeners
  attachTabListeners(container)
}

/**
 * Render filter bar
 */
function renderFilterBar(container) {
  const state = libraryStore.getState()

  filterBarElement = createFilterBar({
    onSearch: handleSearch,
    onCategoryChange: handleCategoryChange,
    onSortChange: handleSortChange,
    onViewModeChange: handleViewModeChange,
    initialCategory: state.currentCategory,
    initialSort: state.currentSortBy,
    initialViewMode: state.viewMode
  })

  const filterBarContainer = container.querySelector('#filter-bar-container')
  if (filterBarContainer) {
    filterBarContainer.replaceChildren(filterBarElement)
  }
}

/**
 * Render content area
 */
function renderContent(container) {
  const state = libraryStore.getState()
  const contentContainer = container.querySelector('#library-content-container')

  if (!contentContainer) return

  // Show loading state
  if (state.isLoading) {
    contentContainer.replaceChildren(createLoadingGrid(6, {
      columns: getColumnsForViewMode(state.viewMode)
    }))
    return
  }

  // Render grid
  gridContainer = createPromptGrid(state.filteredPrompts, {
    viewMode: state.viewMode,
    columns: getColumnsForViewMode(state.viewMode),
    onPromptClick: handlePromptClick,
    onLike: handleLike,
    emptyMessage: getEmptyMessage(state)
  })

  contentContainer.replaceChildren(gridContainer)
}

/**
 * Load library data
 */
async function loadLibraryData() {
  const state = libraryStore.getState()

  libraryStore.setState({ isLoading: true }, 'loadData')

  try {
    const user = appStore.getState('user')

    // Load prompts based on current view
    let prompts = []

    if (state.currentView === LIBRARY_VIEWS.DISCOVER) {
      prompts = await getApprovedPrompts()
      libraryStore.setState({
        allPrompts: prompts,
        filteredPrompts: prompts
      }, 'loadData')
    } else if (state.currentView === LIBRARY_VIEWS.MY_PROMPTS) {
      if (user) {
        prompts = await getMyPrompts()
        libraryStore.setState({
          myPrompts: prompts,
          filteredPrompts: prompts
        }, 'loadData')
      }
    } else if (state.currentView === LIBRARY_VIEWS.LIKED) {
      if (user) {
        prompts = await getApprovedPrompts()
        const likedPrompts = prompts.filter(p => p.user_has_liked)
        libraryStore.setState({
          allPrompts: prompts,
          filteredPrompts: likedPrompts
        }, 'loadData')
      }
    }

    // Apply filters
    applyFilters()
  } catch (error) {
    console.error('[LibraryWindow] Failed to load data:', error)
  } finally {
    libraryStore.setState({ isLoading: false }, 'loadData')
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle state change
 */
function handleStateChange(state, prevState, changedKeys) {
  const contentContainer = document.querySelector('#library-content-container')

  if (!contentContainer) return

  // Re-render content if prompts or view mode changed
  if (changedKeys.includes('filteredPrompts') || changedKeys.includes('viewMode') || changedKeys.includes('isLoading')) {
    renderContent(contentContainer.closest('.library-container'))
  }

  // Reload data if view changed
  if (changedKeys.includes('currentView')) {
    loadLibraryData()
  }
}

/**
 * Handle search
 */
function handleSearch(query) {
  libraryStore.setState({ searchQuery: query }, 'search')
  applyFilters()
}

/**
 * Handle category change
 */
function handleCategoryChange(category) {
  libraryStore.setState({ currentCategory: category }, 'categoryFilter')
  applyFilters()
}

/**
 * Handle sort change
 */
function handleSortChange(sortBy) {
  libraryStore.setState({ currentSortBy: sortBy }, 'sort')
  applySort()
}

/**
 * Handle view mode change
 */
function handleViewModeChange(viewMode) {
  libraryStore.setState({ viewMode }, 'viewMode')
}

/**
 * Handle prompt click
 */
function handlePromptClick(prompt) {
  // Close existing modal if any
  if (currentModal) {
    currentModal.close()
  }

  // Create and show modal
  const user = appStore.getState('user')
  const canEdit = user && prompt.user_id === user.id

  currentModal = createPromptModal(prompt, {
    onLike: handleLike,
    canEdit,
    onClose: () => {
      currentModal = null
    }
  })

  currentModal.open()
}

/**
 * Handle like action
 */
async function handleLike(prompt) {
  const user = appStore.getState('user')

  if (!user) {
    console.warn('[LibraryWindow] User must be authenticated to like')
    return
  }

  const state = libraryStore.getState()

  // Optimistic update
  const updatedPrompts = updatePromptLikeState(
    state.allPrompts,
    prompt.id,
    !prompt.user_has_liked
  )

  libraryStore.setState({
    allPrompts: updatedPrompts,
    filteredPrompts: filterPromptsArray(updatedPrompts, state)
  }, 'optimisticLike')

  try {
    // Make API call
    await likePrompt(prompt.id)
  } catch (error) {
    console.error('[LibraryWindow] Failed to like prompt:', error)

    // Rollback optimistic update
    libraryStore.setState({
      allPrompts: state.allPrompts,
      filteredPrompts: state.filteredPrompts
    }, 'rollbackLike')
  }
}

/**
 * Attach tab listeners
 */
function attachTabListeners(container) {
  const tabs = container.querySelectorAll('.library-tab')

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view

      // Update active state
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')

      // Update state
      libraryStore.setState({ currentView: view }, 'tabChange')
    })
  })
}

// ============================================================================
// Filtering and Sorting
// ============================================================================

/**
 * Apply filters to prompts
 */
function applyFilters() {
  const state = libraryStore.getState()
  const sourcePrompts = getSourcePrompts(state)
  const filtered = filterPromptsArray(sourcePrompts, state)

  libraryStore.setState({ filteredPrompts: filtered }, 'applyFilters')
}

/**
 * Apply sorting to prompts
 */
function applySort() {
  const state = libraryStore.getState()
  const sorted = sortPromptsArray([...state.filteredPrompts], state.currentSortBy)

  libraryStore.setState({ filteredPrompts: sorted }, 'applySort')
}

/**
 * Get source prompts based on current view
 */
function getSourcePrompts(state) {
  if (state.currentView === LIBRARY_VIEWS.MY_PROMPTS) {
    return state.myPrompts
  } else if (state.currentView === LIBRARY_VIEWS.LIKED) {
    return state.allPrompts.filter(p => p.user_has_liked)
  }
  return state.allPrompts
}

/**
 * Filter prompts array
 */
function filterPromptsArray(prompts, state) {
  let filtered = [...prompts]

  // Category filter
  if (state.currentCategory && state.currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === state.currentCategory)
  }

  // Search filter
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.prompt_text.toLowerCase().includes(query)
    )
  }

  // Sort
  return sortPromptsArray(filtered, state.currentSortBy)
}

/**
 * Sort prompts array
 */
function sortPromptsArray(prompts, sortBy) {
  const sorted = [...prompts]

  switch (sortBy) {
    case 'popular':
      sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
      break
    case 'trending':
      // Sort by a combination of recent likes and views
      sorted.sort((a, b) => {
        const scoreA = (a.likes_count || 0) * 2 + (a.views_count || 0)
        const scoreB = (b.likes_count || 0) * 2 + (b.views_count || 0)
        return scoreB - scoreA
      })
      break
    case 'alphabetical':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'recent':
    default:
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
  }

  return sorted
}

/**
 * Update prompt like state in array
 */
function updatePromptLikeState(prompts, promptId, liked) {
  return prompts.map(p => {
    if (p.id === promptId) {
      return {
        ...p,
        user_has_liked: liked,
        likes_count: (p.likes_count || 0) + (liked ? 1 : -1)
      }
    }
    return p
  })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get number of columns for view mode
 */
function getColumnsForViewMode(viewMode) {
  if (viewMode === VIEW_MODES.GRID_IMAGE) return 4
  if (viewMode === VIEW_MODES.GRID_DETAILS) return 3
  return 3
}

/**
 * Get empty message based on state
 */
function getEmptyMessage(state) {
  if (state.searchQuery) {
    return `No prompts found for "${state.searchQuery}"`
  }

  if (state.currentView === LIBRARY_VIEWS.MY_PROMPTS) {
    return 'You haven\'t created any prompts yet'
  }

  if (state.currentView === LIBRARY_VIEWS.LIKED) {
    return 'You haven\'t liked any prompts yet'
  }

  return 'No prompts available'
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Cleanup library window
 */
export function cleanupLibraryWindow() {
  // Unsubscribe from state
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }

  // Close modal
  if (currentModal) {
    currentModal.close()
    currentModal = null
  }

  // Clear references
  filterBarElement = null
  gridContainer = null
}

// ============================================================================
// Exports
// ============================================================================

export default {
  renderLibraryWindow,
  cleanupLibraryWindow
}
