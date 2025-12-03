/**
 * State Management Examples
 * Demonstrates how to use the Store system effectively
 */

import { Store, appStore, libraryStore } from '../app/src/state/index.js'

/**
 * Example 1: Creating a Custom Store
 */
export function createCustomStore() {
  const myStore = new Store({
    user: null,
    preferences: {
      theme: 'dark',
      notifications: true
    },
    data: []
  })

  console.log('Custom store created:', myStore.getState())
  return myStore
}

/**
 * Example 2: Subscribe to Specific State Keys
 */
export function subscribeToSpecificKeys() {
  // Only triggers when 'user' changes
  const unsubUser = appStore.subscribe(['user'], (state, prevState) => {
    console.log('User changed:', state.user)
    console.log('Previous user:', prevState?.user)
  })

  // Triggers when either 'filters' or 'viewMode' changes
  const unsubFilters = libraryStore.subscribe(['filters', 'viewMode'], (state) => {
    console.log('Filters or view mode changed:', {
      filters: state.filters,
      viewMode: state.viewMode
    })
  })

  return { unsubUser, unsubFilters }
}

/**
 * Example 3: Batch State Updates
 */
export function batchStateUpdates() {
  // Single update with multiple changes (triggers subscribers once)
  libraryStore.setState({
    filters: { category: 'coding', search: 'React' },
    viewMode: 'grid-details',
    sortBy: 'popular'
  }, 'batch-update')
}

/**
 * Example 4: Computed State
 */
export function computedStateExample() {
  const unsubscribe = libraryStore.subscribe(['prompts', 'filters'], (state) => {
    // Compute filtered prompts
    const filtered = state.prompts.filter(prompt => {
      if (state.filters.category && prompt.category !== state.filters.category) {
        return false
      }
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        return (
          prompt.title.toLowerCase().includes(search) ||
          prompt.description.toLowerCase().includes(search)
        )
      }
      return true
    })

    // Update computed state
    libraryStore.setState({ filteredPrompts: filtered }, 'computed')
  })

  return unsubscribe
}

/**
 * Example 5: State History and Time Travel
 */
export function stateHistoryExample() {
  const myStore = new Store({ count: 0 })

  // Make some changes
  myStore.setState({ count: 1 }, 'increment')
  myStore.setState({ count: 2 }, 'increment')
  myStore.setState({ count: 3 }, 'increment')

  console.log('Current state:', myStore.getState()) // { count: 3 }
  console.log('History length:', myStore.history.length) // 4 (including initial)

  // Access previous states
  console.log('Previous states:', myStore.history.map(h => h.state.count))
  // [0, 1, 2, 3]
}

/**
 * Example 6: Middleware for Logging
 */
export function addLoggingMiddleware() {
  const loggingMiddleware = (next) => (updates, source) => {
    console.group(`State Update from ${source}`)
    console.log('Updates:', updates)
    console.log('Before:', next.getState())

    next(updates, source)

    console.log('After:', next.getState())
    console.groupEnd()
  }

  // Add middleware to a new store
  const store = new Store({ value: 0 })
  store.use(loggingMiddleware)

  store.setState({ value: 42 }, 'test')
  // Logs the update details
}

/**
 * Example 7: Persistence Middleware
 */
export function addPersistenceMiddleware(store, storageKey) {
  // Load persisted state
  const persisted = localStorage.getItem(storageKey)
  if (persisted) {
    try {
      const state = JSON.parse(persisted)
      store.setState(state, 'persistence-load')
    } catch (error) {
      console.error('Failed to load persisted state:', error)
    }
  }

  // Persist on changes
  const persistMiddleware = (next) => (updates, source) => {
    next(updates, source)

    // Don't persist if source is loading from persistence
    if (source !== 'persistence-load') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next.getState()))
      } catch (error) {
        console.error('Failed to persist state:', error)
      }
    }
  }

  store.use(persistMiddleware)
}

/**
 * Example 8: Async State Updates
 */
export async function asyncStateUpdateExample() {
  // Set loading state
  libraryStore.setState({ isLoading: true }, 'fetch-start')

  try {
    // Simulate API call
    const response = await fetch('/api/prompts')
    const prompts = await response.json()

    // Update with data
    libraryStore.setState({
      prompts,
      isLoading: false,
      error: null
    }, 'fetch-success')

  } catch (error) {
    // Update with error
    libraryStore.setState({
      isLoading: false,
      error: error.message
    }, 'fetch-error')
  }
}

/**
 * Example 9: Derived State Pattern
 */
export function derivedStatePattern() {
  const store = new Store({
    items: [],
    selectedIds: []
  })

  // Subscribe to compute derived state
  store.subscribe(['items', 'selectedIds'], (state) => {
    const selectedItems = state.items.filter(item =>
      state.selectedIds.includes(item.id)
    )

    // Update derived state
    store.setState({ selectedItems }, 'derived')
  })

  // Usage
  store.setState({
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ],
    selectedIds: [1, 3]
  })

  console.log('Selected items:', store.getState('selectedItems'))
  // [{ id: 1, name: 'Item 1' }, { id: 3, name: 'Item 3' }]
}

// Usage:
// const store = createCustomStore()
// const { unsubUser, unsubFilters } = subscribeToSpecificKeys()
// batchStateUpdates()
// computedStateExample()
// stateHistoryExample()
// addLoggingMiddleware()
// addPersistenceMiddleware(appStore, 'app-state')
// asyncStateUpdateExample()
// derivedStatePattern()
