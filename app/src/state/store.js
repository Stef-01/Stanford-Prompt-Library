/**
 * State Management System
 * Lightweight pub/sub state manager for application-wide state
 */

// ============================================================================
// Store Class
// ============================================================================

class Store {
  constructor(name, initialState = {}) {
    this.name = name
    this.state = { ...initialState }
    this.listeners = new Map()
    this.middlewares = []
    this.history = []
    this.maxHistory = 50
  }

  /**
   * Get current state or specific slice
   * @param {string|null} path - Dot-separated path to state property
   * @returns {any} State value
   */
  getState(path = null) {
    if (!path) return { ...this.state }

    return path.split('.').reduce((obj, key) => obj?.[key], this.state)
  }

  /**
   * Set state and notify listeners
   * @param {Object} updates - State updates to apply
   * @param {string} source - Source of the update (for debugging)
   */
  setState(updates, source = 'unknown') {
    if (!updates || typeof updates !== 'object') {
      console.error('[Store] setState requires an object of updates')
      return
    }

    const prevState = { ...this.state }
    const changedKeys = []

    // Apply updates and track changes
    for (const [key, value] of Object.entries(updates)) {
      if (this.state[key] !== value) {
        changedKeys.push(key)
      }
      this.state[key] = value
    }

    // Add to history
    this.addToHistory(prevState, this.state, source, changedKeys)

    // Run middlewares
    this.runMiddlewares(prevState, this.state, source, changedKeys)

    // Notify listeners only if there were actual changes
    if (changedKeys.length > 0) {
      this.notifyListeners(changedKeys, prevState)
    }
  }

  /**
   * Update nested state property
   * @param {string} path - Dot-separated path to property
   * @param {any} value - New value
   * @param {string} source - Source of update
   */
  setProperty(path, value, source = 'unknown') {
    const keys = path.split('.')
    const lastKey = keys.pop()
    const target = keys.reduce((obj, key) => obj[key], this.state)

    if (target && typeof target === 'object') {
      target[lastKey] = value
      this.setState({ ...this.state }, source)
    }
  }

  /**
   * Subscribe to state changes
   * @param {string|Array<string>} keys - State keys to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(keys, callback) {
    if (typeof callback !== 'function') {
      console.error('[Store] Subscribe callback must be a function')
      return () => {}
    }

    const id = Math.random().toString(36).substring(2, 11)

    if (!Array.isArray(keys)) keys = [keys]

    this.listeners.set(id, { keys, callback })

    // Return unsubscribe function
    return () => this.listeners.delete(id)
  }

  /**
   * Notify relevant listeners of state changes
   * @param {Array<string>} changedKeys - Keys that changed
   * @param {Object} prevState - Previous state
   */
  notifyListeners(changedKeys, prevState) {
    this.listeners.forEach(({ keys, callback }) => {
      // Check if any watched keys changed
      const shouldNotify = keys.some(key => {
        // Support wildcard subscriptions
        if (key === '*') return true

        // Support nested path subscriptions
        if (key.includes('.')) {
          const rootKey = key.split('.')[0]
          return changedKeys.includes(rootKey)
        }

        return changedKeys.includes(key)
      })

      if (shouldNotify) {
        try {
          callback(this.state, prevState, changedKeys)
        } catch (error) {
          console.error(`[Store] Error in listener callback:`, error)
        }
      }
    })
  }

  /**
   * Add middleware
   * @param {Function} middleware - Middleware function
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      console.error('[Store] Middleware must be a function')
      return
    }

    this.middlewares.push(middleware)
  }

  /**
   * Run all middlewares
   * @param {Object} prevState - Previous state
   * @param {Object} nextState - Next state
   * @param {string} source - Source of update
   * @param {Array<string>} changedKeys - Keys that changed
   */
  runMiddlewares(prevState, nextState, source, changedKeys) {
    this.middlewares.forEach(middleware => {
      try {
        middleware({
          store: this.name,
          prevState,
          nextState,
          source,
          changedKeys
        })
      } catch (error) {
        console.error(`[Store] Error in middleware:`, error)
      }
    })
  }

  /**
   * Add state change to history
   * @param {Object} prevState - Previous state
   * @param {Object} nextState - Next state
   * @param {string} source - Source of update
   * @param {Array<string>} changedKeys - Keys that changed
   */
  addToHistory(prevState, nextState, source, changedKeys) {
    this.history.push({
      timestamp: Date.now(),
      source,
      changedKeys,
      prevState: { ...prevState },
      nextState: { ...nextState }
    })

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
  }

  /**
   * Get state history
   * @param {number} limit - Number of history entries to return
   * @returns {Array} History entries
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit)
  }

  /**
   * Reset state to initial values
   * @param {Object} initialState - Optional new initial state
   */
  reset(initialState = {}) {
    const prevState = { ...this.state }
    this.state = { ...initialState }
    this.history = []
    this.notifyListeners(Object.keys(this.state), prevState)
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.listeners.clear()
  }

  /**
   * Get store statistics
   * @returns {Object} Store stats
   */
  getStats() {
    return {
      name: this.name,
      stateKeys: Object.keys(this.state).length,
      listeners: this.listeners.size,
      middlewares: this.middlewares.length,
      historySize: this.history.length
    }
  }
}

// ============================================================================
// Store Instances
// ============================================================================

/**
 * App Store - Global application state
 */
export const appStore = new Store('app', {
  user: null,
  profile: null,
  isAuthenticated: false,
  isInitialized: false,
  authListenerActive: false,
  currentWindow: null,
  isMobile: false,
  theme: 'dark'
})

/**
 * Library Store - Prompt library state
 */
export const libraryStore = new Store('library', {
  allPrompts: [],
  myPrompts: [],
  filteredPrompts: [],
  featuredPrompts: [],
  currentView: 'discover',
  currentCategory: 'all',
  currentSortBy: 'recent',
  searchQuery: '',
  viewMode: 'grid-details',
  isLoading: false,
  selectedPrompt: null,
  carouselIndex: 0
})

/**
 * Leaderboard Store - Leaderboard state
 */
export const leaderboardStore = new Store('leaderboard', {
  users: [],
  tools: [],
  currentView: 'users',
  currentFilter: 'all',
  toolsFilter: 'all',
  isLoading: false,
  userVotes: {},  // Plain object for localStorage serialization
  toolCategories: []
})

/**
 * Admin Store - Admin panel state
 */
export const adminStore = new Store('admin', {
  prompts: [],
  currentFilter: 'pending',
  isLoading: false,
  stats: {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  },
  selectedPrompt: null
})

// ============================================================================
// Middlewares
// ============================================================================

/**
 * Logger Middleware - Logs all state changes in development
 */
const loggerMiddleware = ({ store, prevState, nextState, source, changedKeys }) => {
  console.group(`[${store}] State Update from "${source}"`)
  console.log('Changed Keys:', changedKeys)
  console.log('Previous:', prevState)
  console.log('Next:', nextState)
  console.log('Diff:', changedKeys.reduce((acc, key) => {
    acc[key] = {
      from: prevState[key],
      to: nextState[key]
    }
    return acc
  }, {}))
  console.groupEnd()
}

/**
 * Persistence Middleware - Persists specific state to localStorage
 */
const persistenceMiddleware = ({ store, nextState, changedKeys }) => {
  // Only persist specific stores
  const persistedStores = ['app']

  if (persistedStores.includes(store)) {
    // Only persist specific keys
    const persistedKeys = ['theme', 'viewMode', 'currentView']
    const shouldPersist = changedKeys.some(key => persistedKeys.includes(key))

    if (shouldPersist) {
      const persistData = persistedKeys.reduce((acc, key) => {
        if (nextState[key] !== undefined) {
          acc[key] = nextState[key]
        }
        return acc
      }, {})

      try {
        localStorage.setItem(`store_${store}`, JSON.stringify(persistData))
      } catch (error) {
        console.error(`[Store] Failed to persist ${store}:`, error)
      }
    }
  }
}

/**
 * Validation Middleware - Validates state changes
 */
const validationMiddleware = ({ store, nextState, changedKeys }) => {
  // Add custom validation rules here
  if (store === 'library') {
    // Ensure arrays are always arrays
    if (changedKeys.includes('allPrompts') && !Array.isArray(nextState.allPrompts)) {
      console.error('[Store] allPrompts must be an array')
    }

    if (changedKeys.includes('filteredPrompts') && !Array.isArray(nextState.filteredPrompts)) {
      console.error('[Store] filteredPrompts must be an array')
    }
  }
}

// ============================================================================
// Apply Middlewares
// ============================================================================

// Apply logger in development
if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
  appStore.use(loggerMiddleware)
  libraryStore.use(loggerMiddleware)
  leaderboardStore.use(loggerMiddleware)
  adminStore.use(loggerMiddleware)
}

// Apply persistence
appStore.use(persistenceMiddleware)

// Apply validation
libraryStore.use(validationMiddleware)

// ============================================================================
// Restore Persisted State
// ============================================================================

/**
 * Restore persisted state from localStorage
 */
function restorePersistedState() {
  try {
    const persistedApp = localStorage.getItem('store_app')
    if (persistedApp) {
      const data = JSON.parse(persistedApp)
      appStore.setState(data, 'localStorage')
    }
  } catch (error) {
    console.error('[Store] Failed to restore persisted state:', error)
  }
}

// Restore on initialization
restorePersistedState()

// ============================================================================
// Global Store Access (for debugging)
// ============================================================================

if (typeof window !== 'undefined') {
  window.__STORES__ = {
    app: appStore,
    library: libraryStore,
    leaderboard: leaderboardStore,
    admin: adminStore,
    getAll() {
      return {
        app: appStore.getState(),
        library: libraryStore.getState(),
        leaderboard: leaderboardStore.getState(),
        admin: adminStore.getState()
      }
    },
    getStats() {
      return {
        app: appStore.getStats(),
        library: libraryStore.getStats(),
        leaderboard: leaderboardStore.getStats(),
        admin: adminStore.getStats()
      }
    }
  }

  console.log('[Store] Global stores available at window.__STORES__')
}

// ============================================================================
// Exports
// ============================================================================

export { Store }
export default {
  app: appStore,
  library: libraryStore,
  leaderboard: leaderboardStore,
  admin: adminStore
}
