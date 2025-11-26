# Integration Guide for Refactored Components

**Version:** 2.0
**Last Updated:** 2025-11-26
**Status:** Complete Phase 2 Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Component Integration](#component-integration)
4. [Migration Guide](#migration-guide)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Overview

This guide helps you integrate the refactored modular components into your application. All refactored components use `.refactored.js` extensions for backward compatibility during the migration period.

### What's New

**Phase 1 Completed:**
- ✅ Constants Registry (`config/constants.js`)
- ✅ Base Service Class (`services/base-service.js`)
- ✅ State Management (`state/store.js`)
- ✅ Shared UI Components (`components/ui/`)
- ✅ Modular Library Components (`components/library/`)

**Phase 2 Completed:**
- ✅ Refactored SignInGate (`components/auth/`)
- ✅ Refactored Leaderboard (`components/leaderboard/`)
- ✅ SVG Icons Library (`assets/icons.js`)

---

## Quick Start

### 1. Import CSS Files

Add the new CSS files to your main HTML or import them in your entry point:

```html
<!-- In your main HTML file -->
<link rel="stylesheet" href="/src/components/ui/ui-components.css">
<link rel="stylesheet" href="/src/components/library/library.css">
<link rel="stylesheet" href="/src/components/auth/auth.css">
<link rel="stylesheet" href="/src/components/leaderboard/leaderboard.css">
```

Or in JavaScript:

```javascript
// In your main.js
import './components/ui/ui-components.css'
import './components/library/library.css'
import './components/auth/auth.css'
import './components/leaderboard/leaderboard.css'
```

### 2. Update Imports

Replace old component imports with refactored versions:

```javascript
// OLD WAY
import { renderLibraryWindow } from './components/windows/LibraryWindow.js'
import { renderSignInGate } from './components/SignInGate.js'
import { renderLeaderboardWindow } from './components/windows/LeaderboardWindow.js'

// NEW WAY
import { renderLibraryWindow } from './components/library/LibraryWindow.refactored.js'
import { renderSignInGate } from './components/auth/SignInGate.refactored.js'
import { renderLeaderboardWindow } from './components/leaderboard/LeaderboardWindow.refactored.js'
```

### 3. Initialize State Management

The state stores are automatically initialized when imported, but you can access them for debugging:

```javascript
import { appStore, libraryStore, leaderboardStore } from './state/store.js'

// Access state (for debugging)
console.log('App State:', appStore.getState())
console.log('Library State:', libraryStore.getState())

// Available globally in dev mode
console.log(window.__STORES__)
```

---

## Component Integration

### Library Window

**File:** `components/library/LibraryWindow.refactored.js`

**Basic Usage:**

```javascript
import { renderLibraryWindow, cleanupLibraryWindow } from './components/library/LibraryWindow.refactored.js'

// Render
await renderLibraryWindow('library-window-content')

// Cleanup (when unmounting)
cleanupLibraryWindow()
```

**Available Sub-Components:**

```javascript
// Individual components can be used separately
import { createPromptCard } from './components/library/PromptCard.js'
import { createPromptGrid } from './components/library/PromptGrid.js'
import { createFilterBar } from './components/library/FilterBar.js'
import { createPromptModal } from './components/library/PromptModal.js'

// Example: Create a standalone prompt card
const card = createPromptCard(promptData, {
  viewMode: 'details',
  onClick: (prompt) => console.log('Clicked:', prompt),
  onLike: async (prompt) => await likePrompt(prompt.id)
})

document.getElementById('container').appendChild(card)
```

**State Management:**

```javascript
import { libraryStore } from './state/store.js'

// Subscribe to state changes
const unsubscribe = libraryStore.subscribe(['filteredPrompts'], (state, prevState) => {
  console.log('Prompts updated:', state.filteredPrompts)
})

// Update state
libraryStore.setState({
  currentCategory: 'coding',
  viewMode: 'grid-image'
}, 'userAction')

// Get current state
const { allPrompts, filteredPrompts } = libraryStore.getState()

// Cleanup
unsubscribe()
```

---

### Sign-In Gate

**File:** `components/auth/SignInGate.refactored.js`

**Basic Usage:**

```javascript
import { renderSignInGate, cleanupSignInGate } from './components/auth/SignInGate.refactored.js'

// Render
renderSignInGate(document.getElementById('app'))

// Cleanup
cleanupSignInGate()
```

**Available Sub-Components:**

```javascript
import { createLandingHero } from './components/auth/LandingHero.js'
import { createFeatureCards, createTestimonials } from './components/auth/FeatureCards.js'
import { createParticleBackground } from './components/auth/ParticleBackground.js'

// Example: Create custom landing page
const hero = createLandingHero({
  title: 'My Custom Title',
  subtitle: 'My custom subtitle',
  onSignIn: handleSignIn,
  onAccessCode: handleAccessCode,
  showBypassButton: true,
  onBypass: handleBypass
})

container.appendChild(hero)

// Add particle background
const particles = createParticleBackground({
  particleCount: 100,
  particleColor: 'rgba(0, 122, 255, 0.5)',
  mouseInteraction: true
})

container.appendChild(particles)
```

**Using Icons:**

```javascript
import { getIcon, createIcon } from './assets/icons.js'

// Get SVG as string
const iconHTML = getIcon('lightning', {
  className: 'my-icon',
  width: '32',
  height: '32',
  color: '#007AFF'
})

// Create icon element
const iconElement = createIcon('star', {
  wrapperClass: 'icon-wrapper',
  width: '24',
  height: '24'
})

container.appendChild(iconElement)
```

---

### Leaderboard Window

**File:** `components/leaderboard/LeaderboardWindow.refactored.js`

**Basic Usage:**

```javascript
import { renderLeaderboardWindow, cleanupLeaderboardWindow } from './components/leaderboard/LeaderboardWindow.refactored.js'

// Render
await renderLeaderboardWindow('leaderboard-window-content')

// Cleanup
cleanupLeaderboardWindow()
```

**Available Sub-Components:**

```javascript
import { createUserLeaderboard } from './components/leaderboard/UserLeaderboard.js'
import { createToolsLeaderboard } from './components/leaderboard/ToolsLeaderboard.js'
import { createToolSubmitModal } from './components/leaderboard/ToolSubmitModal.js'

// Example: Create standalone user leaderboard
const userLeaderboard = createUserLeaderboard(users, {
  currentFilter: 'month',
  onFilterChange: (filter) => console.log('Filter:', filter),
  showRankBadges: true,
  highlightCurrentUser: true,
  currentUserId: currentUser.id
})

container.appendChild(userLeaderboard)

// Example: Create tools leaderboard with voting
const toolsLeaderboard = createToolsLeaderboard(tools, {
  currentFilter: 'all',
  onVote: async (toolId, voteType) => {
    await voteForTool(toolId, voteType)
  },
  onSubmitTool: () => {
    const modal = createToolSubmitModal({
      onSubmit: async (toolData) => {
        await submitAITool(toolData)
      }
    })
    modal.open()
  },
  userVotes: new Map([[tool1.id, 'up'], [tool2.id, 'down']])
})

container.appendChild(toolsLeaderboard)
```

**State Management:**

```javascript
import { leaderboardStore } from './state/store.js'

// Subscribe to changes
const unsubscribe = leaderboardStore.subscribe(['users', 'tools'], (state) => {
  console.log('Leaderboard updated:', state)
})

// Update state
leaderboardStore.setState({
  currentView: 'tools',
  currentFilter: 'week'
}, 'userAction')
```

---

### Shared UI Components

**Modal Component:**

```javascript
import { Modal, confirmModal, alertModal } from './components/ui/Modal.js'

// Create custom modal
const modal = new Modal('my-modal-id', {
  closeOnOverlay: true,
  closeOnEscape: true,
  onOpen: () => console.log('Opened'),
  onClose: () => console.log('Closed')
})

modal.create('<h2>My Content</h2><p>Some text</p>')
modal.open()

// Confirmation modal
const confirmed = await confirmModal('Are you sure?', {
  confirmText: 'Yes, Delete',
  cancelText: 'Cancel',
  icon: 'warning'
})

if (confirmed) {
  // User clicked confirm
}

// Alert modal
await alertModal('Success!', {
  icon: 'check_circle',
  type: 'success',
  okText: 'Got it'
})
```

**Button Component:**

```javascript
import { createButton, createAsyncButton, createIconButton } from './components/ui/Button.js'

// Regular button
const button = createButton('Click Me', {
  variant: 'primary',  // primary, secondary, danger, success, warning, ghost, link
  size: 'medium',      // small, medium, large
  icon: 'add',
  onClick: () => console.log('Clicked'),
  disabled: false
})

// Async button (handles loading state)
const asyncBtn = createAsyncButton('Save', async () => {
  await saveData()
}, {
  variant: 'primary',
  icon: 'save'
})

// Icon-only button
const iconBtn = createIconButton('delete', {
  variant: 'danger',
  onClick: handleDelete,
  ariaLabel: 'Delete item'
})
```

**Card Component:**

```javascript
import { createCard, createPromptCard, createCardGrid } from './components/ui/Card.js'

// Basic card
const card = createCard('Card content here', {
  title: 'Card Title',
  subtitle: 'Card subtitle',
  image: '/image.jpg',
  footer: 'Card footer',
  onClick: () => console.log('Clicked'),
  hoverable: true,
  bordered: true
})

// Card grid
const grid = createCardGrid(items, (item) => {
  return createCard(item.content, {
    title: item.title
  })
}, {
  columns: 3,
  gap: 'normal',
  emptyMessage: 'No items found'
})
```

---

## Services Integration

### Using Base Service

All services now extend `BaseService` for standardized error handling and caching:

```javascript
import { promptsService } from './services/prompts.refactored.js'

// Services automatically cache responses
const prompts = await promptsService.getApprovedPrompts()

// Cache is automatically invalidated on mutations
await promptsService.submitPrompt(promptData)

// Manual cache invalidation
promptsService.invalidateCache()

// Get service metrics
const metrics = promptsService.getMetrics()
console.log('Cache hit rate:', metrics.cache.hitRate)
```

### Error Handling

```javascript
import { handleServiceError, DatabaseError, AuthenticationError } from './services/base-service.js'

try {
  await promptsService.submitPrompt(promptData)
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Redirect to login
  } else if (error instanceof DatabaseError) {
    // Show database error message
  }

  // Get user-friendly message
  const message = handleServiceError(error)
  showErrorToast(message)
}
```

---

## Migration Guide

### Step-by-Step Migration

**Step 1: Add CSS Imports**

```javascript
// main.js
import './components/ui/ui-components.css'
import './components/library/library.css'
import './components/auth/auth.css'
import './components/leaderboard/leaderboard.css'
```

**Step 2: Update Component Imports**

```javascript
// Before
import { renderLibraryWindow } from './components/windows/LibraryWindow.js'

// After
import { renderLibraryWindow } from './components/library/LibraryWindow.refactored.js'
```

**Step 3: Test Functionality**

Test each refactored component thoroughly before removing old code.

**Step 4: Update Service Calls (Optional)**

```javascript
// Old way (still works)
import { getApprovedPrompts } from './services/prompts.js'

// New way (with caching and better error handling)
import { promptsService } from './services/prompts.refactored.js'
const prompts = await promptsService.getApprovedPrompts()
```

**Step 5: Cleanup Old Files**

Once migration is complete and tested, you can remove old component files (but keep backups!).

---

## Best Practices

### 1. State Management

**Do:**
```javascript
// Use state stores for component communication
libraryStore.setState({ searchQuery: 'test' }, 'search')

// Subscribe to specific keys
const unsubscribe = libraryStore.subscribe(['filteredPrompts'], callback)

// Always cleanup subscriptions
componentWillUnmount() {
  unsubscribe()
}
```

**Don't:**
```javascript
// Don't use module-level variables for state
let globalState = {}  // ❌

// Don't forget to cleanup subscriptions
libraryStore.subscribe(['data'], callback)  // Memory leak! ❌
```

### 2. Component Composition

**Do:**
```javascript
// Compose small, focused components
const grid = createPromptGrid(prompts, { viewMode: 'details' })
const filter = createFilterBar({ onSearch: handleSearch })

container.appendChild(filter)
container.appendChild(grid)
```

**Don't:**
```javascript
// Don't create monolithic components
function renderEverything() {
  // 1000 lines of code ❌
}
```

### 3. Error Handling

**Do:**
```javascript
// Use try-catch with proper error handling
try {
  await promptsService.submitPrompt(data)
  showSuccessToast('Submitted!')
} catch (error) {
  const message = handleServiceError(error)
  showErrorToast(message)
}
```

**Don't:**
```javascript
// Don't ignore errors
await promptsService.submitPrompt(data)  // ❌
```

### 4. Cleanup

**Do:**
```javascript
// Always cleanup when component unmounts
export function cleanupComponent() {
  if (unsubscribe) unsubscribe()
  if (modal) modal.close()
  if (particleSystem) particleSystem.destroy()
}
```

**Don't:**
```javascript
// Don't leave listeners attached
// Memory leaks! ❌
```

---

## Troubleshooting

### Common Issues

**Issue:** Components not rendering

**Solution:**
```javascript
// Ensure container exists
const container = document.getElementById('my-container')
if (!container) {
  console.error('Container not found!')
  return
}

// Ensure CSS is loaded
import './components/ui/ui-components.css'
```

**Issue:** State not updating

**Solution:**
```javascript
// Use correct store
import { libraryStore } from './state/store.js'

// Update state with source for debugging
libraryStore.setState({ data: newData }, 'myComponent')

// Check state in console
console.log(libraryStore.getState())
```

**Issue:** Styles not applying

**Solution:**
```javascript
// Import CSS in correct order
import './components/ui/ui-components.css'  // Base styles first
import './components/library/library.css'   // Component styles after
```

**Issue:** Modal not closing

**Solution:**
```javascript
// Use proper modal instance methods
const modal = new Modal('my-modal')
modal.create(content)
modal.open()

// Close modal
modal.close()  // Not modal.element.remove()!
```

---

## Performance Tips

### 1. Use Caching

Services automatically cache responses for 5 minutes:

```javascript
// First call - hits database
const prompts1 = await promptsService.getApprovedPrompts()

// Second call - returns cached data
const prompts2 = await promptsService.getApprovedPrompts()
```

### 2. Debounce Search

```javascript
import { createFilterBar } from './components/library/FilterBar.js'

// Search is automatically debounced (300ms)
const filterBar = createFilterBar({
  onSearch: (query) => {
    // Only called after user stops typing
  }
})
```

### 3. Optimize Re-renders

```javascript
// Subscribe to specific state keys
libraryStore.subscribe(['filteredPrompts'], callback)  // ✅

// Don't subscribe to everything
libraryStore.subscribe(['*'], callback)  // ❌ Re-renders on every change
```

### 4. Lazy Load Components

```javascript
// Only load when needed
async function showLeaderboard() {
  const { renderLeaderboardWindow } = await import('./components/leaderboard/LeaderboardWindow.refactored.js')
  await renderLeaderboardWindow()
}
```

---

## Next Steps

1. **Test Integration**: Test each refactored component in your app
2. **Monitor Performance**: Check cache hit rates and metrics
3. **Gather Feedback**: Get team feedback on new architecture
4. **Complete Migration**: Remove old components when confident
5. **Add Tests**: Add unit tests for components and services

---

## Support

For questions or issues:

1. Check this guide first
2. Review component source code and JSDoc comments
3. Check the `REFACTORING_PLAN.md` for architecture details
4. Open an issue on GitHub

---

**Last Updated:** 2025-11-26
**Version:** 2.0 (Phase 2 Complete)
