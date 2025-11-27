/**
 * AdminPanel (Refactored)
 * Main admin panel using modular components
 */

import { adminStore, appStore } from '../../state/store.js'
import { createStatsPanel, updateStatsPanel } from './StatsPanel.js'
import { createPromptReviewCard } from './PromptReviewCard.js'
import { createPromptDetailModal } from './PromptDetailModal.js'
import { getPendingPrompts, approvePrompt, rejectPrompt, getPromptStats } from '../../services/admin.js'
import { ADMIN_FILTERS } from '../../config/constants.js'
import { showSuccess, showError } from '../../utils/helpers/toast.js'

// Module state
let unsubscribe = null
let currentModal = null

/**
 * Render admin panel
 * @param {string} containerId - Container element ID
 * @param {Object} userData - Current user data
 */
export async function renderAdminPanel(containerId = 'admin-panel-content', userData = null) {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error('[AdminPanel] Container not found:', containerId)
    return
  }

  // Check admin access
  const user = userData || appStore.getState('user')
  if (!user || !user.is_admin) {
    container.innerHTML = renderAccessDenied()
    return
  }

  // Initialize state
  initializeAdminState()

  // Subscribe to state changes
  setupStateSubscription()

  // Render UI
  renderAdminUI(container)

  // Load data
  await loadAdminData()
}

/**
 * Initialize admin state
 */
function initializeAdminState() {
  const state = adminStore.getState()

  if (!state.prompts || state.prompts.length === 0) {
    adminStore.setState({
      currentFilter: ADMIN_FILTERS.PENDING,
      prompts: [],
      isLoading: false,
      stats: {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      }
    }, 'initialize')
  }
}

/**
 * Setup state subscription
 */
function setupStateSubscription() {
  if (unsubscribe) unsubscribe()

  unsubscribe = adminStore.subscribe(
    ['prompts', 'currentFilter', 'isLoading', 'stats'],
    handleStateChange
  )
}

/**
 * Render admin UI
 */
function renderAdminUI(container) {
  const state = adminStore.getState()

  container.innerHTML = `
    <div class="admin-panel-container">
      <!-- Header -->
      <div class="admin-header">
        <h1 class="admin-title">
          <span class="material-icons">admin_panel_settings</span>
          Admin Panel
        </h1>
        <button class="btn btn-secondary btn-refresh">
          <span class="material-icons">refresh</span>
          <span>Refresh</span>
        </button>
      </div>

      <!-- Stats Panel -->
      <div id="admin-stats-container"></div>

      <!-- Prompts List -->
      <div id="admin-prompts-container" class="admin-prompts-container">
        ${renderLoadingState()}
      </div>
    </div>
  `

  // Render stats panel
  renderStatsPanel(container)

  // Attach header listeners
  const refreshBtn = container.querySelector('.btn-refresh')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadAdminData(true))
  }

  // Render initial prompts
  renderPrompts(container)
}

/**
 * Render stats panel
 */
function renderStatsPanel(container) {
  const state = adminStore.getState()
  const statsContainer = container.querySelector('#admin-stats-container')

  if (!statsContainer) return

  const statsPanel = createStatsPanel(state.stats, {
    currentFilter: state.currentFilter,
    onFilterChange: handleFilterChange
  })

  statsContainer.replaceChildren(statsPanel)
}

/**
 * Render prompts list
 */
function renderPrompts(container) {
  const state = adminStore.getState()
  const promptsContainer = container.querySelector('#admin-prompts-container')

  if (!promptsContainer) return

  // Show loading state
  if (state.isLoading) {
    promptsContainer.innerHTML = renderLoadingState()
    return
  }

  // Filter prompts
  const filteredPrompts = filterPrompts(state.prompts, state.currentFilter)

  // Render prompts
  if (filteredPrompts.length === 0) {
    promptsContainer.innerHTML = renderEmptyState(state.currentFilter)
    return
  }

  promptsContainer.innerHTML = ''
  filteredPrompts.forEach(prompt => {
    const card = createPromptReviewCard(prompt, {
      onApprove: handleApprove,
      onReject: handleReject,
      onViewDetails: handleViewDetails,
      showActions: true
    })
    promptsContainer.appendChild(card)
  })
}

/**
 * Render loading state
 */
function renderLoadingState() {
  return `
    <div class="admin-loading">
      <div class="loading-spinner"></div>
      <p>Loading prompts...</p>
    </div>
  `
}

/**
 * Render empty state
 */
function renderEmptyState(filter) {
  const messages = {
    pending: 'No prompts pending review',
    approved: 'No approved prompts yet',
    rejected: 'No rejected prompts',
    all: 'No prompts found'
  }

  const icons = {
    pending: 'inbox',
    approved: 'check_circle',
    rejected: 'cancel',
    all: 'search_off'
  }

  return `
    <div class="admin-empty">
      <span class="material-icons">${icons[filter] || 'inbox'}</span>
      <p>${messages[filter] || 'No prompts found'}</p>
    </div>
  `
}

/**
 * Render access denied
 */
function renderAccessDenied() {
  return `
    <div class="admin-access-denied">
      <span class="material-icons">lock</span>
      <h2>Access Denied</h2>
      <p>You don't have permission to access the admin panel.</p>
    </div>
  `
}

/**
 * Load admin data
 */
async function loadAdminData(force = false) {
  adminStore.setState({ isLoading: true }, 'loadData')

  try {
    // Load prompts and stats in parallel
    const [prompts, stats] = await Promise.all([
      getPendingPrompts(),
      getPromptStats()
    ])

    adminStore.setState({
      prompts: prompts || [],
      stats: stats || {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      },
      isLoading: false
    }, 'loadData')
  } catch (error) {
    console.error('[AdminPanel] Failed to load data:', error)
    showError('Failed to load admin data')
    adminStore.setState({ isLoading: false }, 'loadData')
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle state change
 */
function handleStateChange(state, prevState, changedKeys) {
  const container = document.querySelector('.admin-panel-container')
  if (!container) return

  // Update stats if changed
  if (changedKeys.includes('stats')) {
    const statsContainer = container.querySelector('#admin-stats-container')
    if (statsContainer && statsContainer.firstChild) {
      updateStatsPanel(statsContainer.firstChild, state.stats)
    }
  }

  // Re-render prompts if data changed
  if (changedKeys.some(key => ['prompts', 'currentFilter', 'isLoading'].includes(key))) {
    renderPrompts(container)
  }
}

/**
 * Handle filter change
 */
function handleFilterChange(filter) {
  adminStore.setState({ currentFilter: filter }, 'filterChange')
}

/**
 * Handle approve
 */
async function handleApprove(prompt) {
  try {
    await approvePrompt(prompt.id)

    // Update local state
    const state = adminStore.getState()
    const updatedPrompts = state.prompts.map(p =>
      p.id === prompt.id ? { ...p, status: 'approved' } : p
    )

    adminStore.setState({
      prompts: updatedPrompts,
      stats: {
        ...state.stats,
        pending: state.stats.pending - 1,
        approved: state.stats.approved + 1
      }
    }, 'approvePrompt')

    showSuccess('Prompt approved successfully!')
  } catch (error) {
    console.error('[AdminPanel] Approve failed:', error)
    showError('Failed to approve prompt')
    throw error
  }
}

/**
 * Handle reject
 */
async function handleReject(prompt) {
  try {
    await rejectPrompt(prompt.id)

    // Update local state
    const state = adminStore.getState()
    const updatedPrompts = state.prompts.map(p =>
      p.id === prompt.id ? { ...p, status: 'rejected' } : p
    )

    adminStore.setState({
      prompts: updatedPrompts,
      stats: {
        ...state.stats,
        pending: state.stats.pending - 1,
        rejected: state.stats.rejected + 1
      }
    }, 'rejectPrompt')

    showSuccess('Prompt rejected')
  } catch (error) {
    console.error('[AdminPanel] Reject failed:', error)
    showError('Failed to reject prompt')
    throw error
  }
}

/**
 * Handle view details
 */
function handleViewDetails(prompt) {
  // Close existing modal
  if (currentModal) {
    currentModal.close()
  }

  // Create and show modal
  currentModal = createPromptDetailModal(prompt, {
    onApprove: handleApprove,
    onReject: handleReject,
    onClose: () => {
      currentModal = null
    }
  })

  currentModal.open()
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Filter prompts by status
 */
function filterPrompts(prompts, filter) {
  if (filter === 'all') return prompts

  return prompts.filter(prompt => prompt.status === filter)
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Cleanup admin panel
 */
export function cleanupAdminPanel() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }

  if (currentModal) {
    currentModal.close()
    currentModal = null
  }
}

export default { renderAdminPanel, cleanupAdminPanel }
