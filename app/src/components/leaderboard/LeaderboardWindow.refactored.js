/**
 * Leaderboard Window (Refactored)
 * Main leaderboard container using modular components
 */

import { leaderboardStore, appStore } from '../../state/store.js'
import { createUserLeaderboard } from './UserLeaderboard.js'
import { createToolsLeaderboard, filterToolsByCategory, sortTools } from './ToolsLeaderboard.js'
import { createToolSubmitModal } from './ToolSubmitModal.js'
import { getTimeBasedLeaderboard } from '../../services/prompts.js'
import { getApprovedAITools, voteOnTool, submitAITool } from '../../services/ai-tools.js'
import { LEADERBOARD_VIEWS } from '../../config/constants.js'

// Module state
let unsubscribe = null
let currentModal = null

/**
 * Render leaderboard window
 * @param {string} containerId - Container element ID
 */
export async function renderLeaderboardWindow(containerId = 'leaderboard-window-content') {
  const container = document.getElementById(containerId)
  if (!container) {
    console.error('[LeaderboardWindow] Container not found:', containerId)
    return
  }

  // Initialize state
  initializeLeaderboardState()

  // Subscribe to state changes
  setupStateSubscription()

  // Render UI
  renderLeaderboardUI(container)

  // Load data
  await loadLeaderboardData()
}

/**
 * Initialize leaderboard state
 */
function initializeLeaderboardState() {
  const state = leaderboardStore.getState()

  if (state.users.length === 0 && state.tools.length === 0) {
    leaderboardStore.setState({
      currentView: LEADERBOARD_VIEWS.USERS,
      currentFilter: 'all',
      toolsFilter: 'all',
      isLoading: false,
      userVotes: new Map()
    }, 'initialize')
  }
}

/**
 * Setup state subscription
 */
function setupStateSubscription() {
  if (unsubscribe) unsubscribe()

  unsubscribe = leaderboardStore.subscribe(
    ['users', 'tools', 'currentView', 'currentFilter', 'toolsFilter', 'isLoading'],
    handleStateChange
  )
}

/**
 * Render leaderboard UI
 * @param {HTMLElement} container - Container element
 */
function renderLeaderboardUI(container) {
  const state = leaderboardStore.getState()

  container.innerHTML = `
    <div class="leaderboard-container">
      <!-- View Tabs -->
      <div class="leaderboard-tabs">
        <button
          class="leaderboard-tab ${state.currentView === LEADERBOARD_VIEWS.USERS ? 'active' : ''}"
          data-view="${LEADERBOARD_VIEWS.USERS}"
        >
          <span class="material-icons">leaderboard</span>
          <span>Top Contributors</span>
        </button>
        <button
          class="leaderboard-tab ${state.currentView === LEADERBOARD_VIEWS.TOOLS ? 'active' : ''}"
          data-view="${LEADERBOARD_VIEWS.TOOLS}"
        >
          <span class="material-icons">build</span>
          <span>AI Tools</span>
        </button>
      </div>

      <!-- Content Area -->
      <div id="leaderboard-content" class="leaderboard-content">
        ${renderLoadingState()}
      </div>
    </div>
  `

  // Attach tab listeners
  attachTabListeners(container)

  // Render initial content
  renderContent(container)
}

/**
 * Render content area
 * @param {HTMLElement} container - Main container
 */
function renderContent(container) {
  const state = leaderboardStore.getState()
  const contentContainer = container.querySelector('#leaderboard-content')

  if (!contentContainer) return

  // Show loading state
  if (state.isLoading) {
    contentContainer.innerHTML = renderLoadingState()
    return
  }

  // Render based on current view
  if (state.currentView === LEADERBOARD_VIEWS.USERS) {
    renderUsersView(contentContainer, state)
  } else {
    renderToolsView(contentContainer, state)
  }
}

/**
 * Render users view
 * @param {HTMLElement} container - Content container
 * @param {Object} state - Current state
 */
function renderUsersView(container, state) {
  const user = appStore.getState('user')

  const usersLeaderboard = createUserLeaderboard(state.users, {
    currentFilter: state.currentFilter,
    onFilterChange: handleUserFilterChange,
    showRankBadges: true,
    highlightCurrentUser: true,
    currentUserId: user?.id
  })

  container.replaceChildren(usersLeaderboard)
}

/**
 * Render tools view
 * @param {HTMLElement} container - Content container
 * @param {Object} state - Current state
 */
function renderToolsView(container, state) {
  // Filter tools by category
  const filteredTools = filterToolsByCategory(state.tools, state.toolsFilter)
  const sortedTools = sortTools(filteredTools, 'votes')

  const toolsLeaderboard = createToolsLeaderboard(sortedTools, {
    currentFilter: state.toolsFilter,
    onFilterChange: handleToolsFilterChange,
    onVote: handleToolVote,
    onSubmitTool: handleToolSubmit,
    userVotes: state.userVotes,
    showCategories: true
  })

  container.replaceChildren(toolsLeaderboard)
}

/**
 * Render loading state
 * @returns {string} Loading HTML
 */
function renderLoadingState() {
  return `
    <div class="leaderboard-loading">
      <div class="loading-spinner"></div>
      <p>Loading leaderboard...</p>
    </div>
  `
}

/**
 * Load leaderboard data
 */
async function loadLeaderboardData() {
  const state = leaderboardStore.getState()

  leaderboardStore.setState({ isLoading: true }, 'loadData')

  try {
    if (state.currentView === LEADERBOARD_VIEWS.USERS) {
      await loadUsersData(state.currentFilter)
    } else {
      await loadToolsData()
    }
  } catch (error) {
    console.error('[LeaderboardWindow] Failed to load data:', error)
  } finally {
    leaderboardStore.setState({ isLoading: false }, 'loadData')
  }
}

/**
 * Load users leaderboard data
 * @param {string} filter - Time filter
 */
async function loadUsersData(filter) {
  const users = await getTimeBasedLeaderboard(filter, 50)

  leaderboardStore.setState({
    users: users || []
  }, 'loadUsers')
}

/**
 * Load AI tools data
 */
async function loadToolsData() {
  const tools = await getApprovedAITools()

  leaderboardStore.setState({
    tools: tools || []
  }, 'loadTools')
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle state change
 */
function handleStateChange(state, prevState, changedKeys) {
  const container = document.querySelector('.leaderboard-container')
  if (!container) return

  // Re-render if relevant data changed
  if (changedKeys.some(key => ['users', 'tools', 'currentView', 'isLoading', 'currentFilter', 'toolsFilter'].includes(key))) {
    renderContent(container)
  }

  // Reload data if view changed
  if (changedKeys.includes('currentView')) {
    loadLeaderboardData()
  }
}

/**
 * Handle tab click
 * @param {HTMLElement} container - Main container
 */
function attachTabListeners(container) {
  const tabs = container.querySelectorAll('.leaderboard-tab')

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view

      // Update active state
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')

      // Update state
      leaderboardStore.setState({ currentView: view }, 'tabChange')
    })
  })
}

/**
 * Handle user filter change
 * @param {string} filter - Time filter
 */
async function handleUserFilterChange(filter) {
  leaderboardStore.setState({
    currentFilter: filter,
    isLoading: true
  }, 'userFilterChange')

  await loadUsersData(filter)

  leaderboardStore.setState({ isLoading: false }, 'userFilterChange')
}

/**
 * Handle tools filter change
 * @param {string} category - Category filter
 */
function handleToolsFilterChange(category) {
  leaderboardStore.setState({
    toolsFilter: category
  }, 'toolsFilterChange')
}

/**
 * Handle tool vote
 * @param {string} toolId - Tool ID
 * @param {string} voteType - 'up' or 'down'
 */
async function handleToolVote(toolId, voteType) {
  const user = appStore.getState('user')

  if (!user) {
    console.warn('[LeaderboardWindow] User must be authenticated to vote')
    return
  }

  const state = leaderboardStore.getState()

  // Optimistic update
  const currentVote = state.userVotes.get(toolId)
  const newVote = currentVote === voteType ? null : voteType

  const updatedVotes = new Map(state.userVotes)
  if (newVote) {
    updatedVotes.set(toolId, newVote)
  } else {
    updatedVotes.delete(toolId)
  }

  const updatedTools = state.tools.map(tool => {
    if (tool.id === toolId) {
      const changes = {}

      // Update vote counts
      if (currentVote === 'up') changes.upvotes = (tool.upvotes || 0) - 1
      if (currentVote === 'down') changes.downvotes = (tool.downvotes || 0) - 1
      if (newVote === 'up') changes.upvotes = (tool.upvotes || 0) + 1
      if (newVote === 'down') changes.downvotes = (tool.downvotes || 0) + 1

      return { ...tool, ...changes }
    }
    return tool
  })

  leaderboardStore.setState({
    userVotes: updatedVotes,
    tools: updatedTools
  }, 'optimisticVote')

  try {
    await voteOnTool(toolId, voteType)
  } catch (error) {
    console.error('[LeaderboardWindow] Vote failed:', error)

    // Rollback on error
    leaderboardStore.setState({
      userVotes: state.userVotes,
      tools: state.tools
    }, 'rollbackVote')
  }
}

/**
 * Handle tool submission
 */
function handleToolSubmit() {
  const user = appStore.getState('user')

  if (!user) {
    console.warn('[LeaderboardWindow] User must be authenticated to submit tools')
    return
  }

  // Close existing modal
  if (currentModal) {
    currentModal.close()
  }

  // Create and show modal
  currentModal = createToolSubmitModal({
    onSubmit: async (toolData) => {
      await submitAITool(toolData)

      // Reload tools
      await loadToolsData()

      // Show success message
      showSuccessToast('Tool submitted successfully!')
    },
    onClose: () => {
      currentModal = null
    }
  })

  currentModal.open()
}

/**
 * Show success toast
 * @param {string} message - Success message
 */
function showSuccessToast(message) {
  const toast = document.createElement('div')
  toast.className = 'success-toast'
  toast.innerHTML = `
    <span class="material-icons">check_circle</span>
    <span>${message}</span>
  `

  document.body.appendChild(toast)

  setTimeout(() => toast.classList.add('show'), 100)

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Cleanup leaderboard window
 */
export function cleanupLeaderboardWindow() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }

  if (currentModal) {
    currentModal.close()
    currentModal = null
  }
}

export default { renderLeaderboardWindow, cleanupLeaderboardWindow }
