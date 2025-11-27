/**
 * Library Integration Example
 * Demonstrates how to integrate the refactored library components
 */

import { renderLibrary } from '../app/src/components/library/index.js'
import { libraryStore } from '../app/src/state/index.js'
import { showSuccess, showError } from '../app/src/utils/helpers/index.js'

/**
 * Example 1: Basic Library Integration
 */
export async function basicLibraryExample() {
  const userData = {
    id: 'user123',
    email: 'user@example.com',
    name: 'John Doe'
  }

  // Render the library
  await renderLibrary('library-container', userData)

  console.log('Library rendered successfully!')
}

/**
 * Example 2: Subscribe to Library State Changes
 */
export function subscribeToLibraryChanges() {
  // Subscribe to filtered prompts changes
  const unsubscribe = libraryStore.subscribe(['filteredPrompts'], (state, prevState) => {
    console.log('Filtered prompts updated:', state.filteredPrompts.length)

    if (state.filteredPrompts.length === 0) {
      showInfo('No prompts found matching your filters')
    }
  })

  // Subscribe to view mode changes
  libraryStore.subscribe(['viewMode'], (state) => {
    console.log('View mode changed to:', state.viewMode)
  })

  // Return unsubscribe function for cleanup
  return unsubscribe
}

/**
 * Example 3: Programmatically Update Library Filters
 */
export function updateLibraryFilters() {
  // Update category filter
  libraryStore.setState({
    filters: {
      ...libraryStore.getState('filters'),
      category: 'coding'
    }
  }, 'example-script')

  showSuccess('Filter updated to coding category')
}

/**
 * Example 4: Get Current Library State
 */
export function getLibraryState() {
  const state = libraryStore.getState()

  console.log('Current state:', {
    totalPrompts: state.prompts.length,
    filteredPrompts: state.filteredPrompts.length,
    currentFilters: state.filters,
    viewMode: state.viewMode,
    isLoading: state.isLoading
  })

  return state
}

/**
 * Example 5: Handle Prompt Like Action
 */
export async function likePromptExample(promptId) {
  try {
    // Get current prompts
    const state = libraryStore.getState()
    const prompt = state.prompts.find(p => p.id === promptId)

    if (!prompt) {
      showError('Prompt not found')
      return
    }

    // Optimistic update
    const updatedPrompts = state.prompts.map(p =>
      p.id === promptId ? { ...p, likes: p.likes + 1, user_has_liked: true } : p
    )

    libraryStore.setState({ prompts: updatedPrompts }, 'like-action')
    showSuccess('Prompt liked!')

    // Make actual API call here
    // await likePrompt(promptId)

  } catch (error) {
    console.error('Like failed:', error)
    showError('Failed to like prompt')
    // Rollback on error
  }
}

// Usage:
// basicLibraryExample()
// const unsubscribe = subscribeToLibraryChanges()
// updateLibraryFilters()
// getLibraryState()
// likePromptExample('prompt-123')
