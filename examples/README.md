# Integration Examples

This directory contains practical examples demonstrating how to use the refactored modular components and utilities.

## Available Examples

### 1. Library Integration (`library-integration.js`)
Learn how to integrate the library components:
- Basic library setup
- Subscribe to state changes
- Programmatic filter updates
- Like/unlike prompts
- Get current state

```javascript
import { renderLibrary } from '../app/src/components/library/index.js'

await renderLibrary('library-container', userData)
```

### 2. Admin Panel (`admin-integration.js`)
Work with the admin panel:
- Setup admin panel
- Monitor pending prompts
- Batch operations
- Filter by status
- Get statistics
- Custom approval workflows

```javascript
import { renderAdminPanel } from '../app/src/components/admin/index.js'

await renderAdminPanel('admin-container', userData)
```

### 3. State Management (`state-management.js`)
Master the Store system:
- Create custom stores
- Subscribe to specific keys
- Batch updates
- Computed state
- State history and time travel
- Middleware (logging, persistence)
- Async updates
- Derived state pattern

```javascript
import { libraryStore } from '../app/src/state/index.js'

libraryStore.subscribe(['prompts'], (state) => {
  console.log('Prompts updated:', state.prompts.length)
})
```

### 4. Utility Helpers (`utility-helpers.js`)
Use utility functions:
- Toast notifications (success, error, warning, info, loading)
- Date formatting (relative time, formatted dates)
- Number formatting (compact numbers, percentages)
- Text formatting (escape HTML, truncate, initials)
- Form validation (schemas, real-time, async)

```javascript
import { showSuccess, formatDate, validateForm } from '../app/src/utils/helpers/index.js'

showSuccess('Operation completed!')
const formatted = formatDate(new Date(), { includeTime: true })
const result = validateForm(formData, schema)
```

## Quick Start

1. **Import what you need:**
```javascript
// Clean imports using index files
import { renderLibrary, createPromptCard } from '../app/src/components/library/index.js'
import { showSuccess, formatDate } from '../app/src/utils/helpers/index.js'
import { libraryStore } from '../app/src/state/index.js'
```

2. **Initialize components:**
```javascript
// Render a component
await renderLibrary('container-id', userData)

// Or create individual components
const card = createPromptCard(promptData, {
  onLike: handleLike,
  onView: handleView
})
```

3. **Work with state:**
```javascript
// Subscribe to changes
libraryStore.subscribe(['prompts'], (state) => {
  console.log('Updated:', state.prompts)
})

// Update state
libraryStore.setState({ viewMode: 'grid-details' })
```

4. **Show feedback:**
```javascript
// Toast notifications
showSuccess('Saved!')
showError('Failed to save')

const loading = showLoading('Processing...')
// ... do work ...
loading.dismiss()
```

## Common Patterns

### Pattern 1: Load Data with Feedback
```javascript
import { showLoading, showSuccess, showError } from '../app/src/utils/helpers/index.js'
import { libraryStore } from '../app/src/state/index.js'

async function loadPrompts() {
  const loading = showLoading('Loading prompts...')

  try {
    const response = await fetch('/api/prompts')
    const prompts = await response.json()

    libraryStore.setState({ prompts, isLoading: false })
    loading.dismiss()
    showSuccess('Prompts loaded!')
  } catch (error) {
    loading.dismiss()
    showError('Failed to load prompts')
  }
}
```

### Pattern 2: Form Validation
```javascript
import { validateForm, showError } from '../app/src/utils/helpers/index.js'

const schema = {
  title: { required: true, minLength: 5, maxLength: 100 },
  description: { required: true, minLength: 20 }
}

function handleSubmit(formData) {
  const result = validateForm(formData, schema)

  if (!result.valid) {
    Object.values(result.errors).forEach(error => showError(error))
    return
  }

  // Submit valid data
}
```

### Pattern 3: Optimistic Updates
```javascript
import { libraryStore } from '../app/src/state/index.js'
import { showSuccess, showError } from '../app/src/utils/helpers/index.js'

async function likePrompt(promptId) {
  const state = libraryStore.getState()
  const originalPrompts = [...state.prompts]

  // Optimistic update
  const updated = state.prompts.map(p =>
    p.id === promptId ? { ...p, likes: p.likes + 1 } : p
  )
  libraryStore.setState({ prompts: updated })
  showSuccess('Liked!')

  try {
    await fetch(`/api/prompts/${promptId}/like`, { method: 'POST' })
  } catch (error) {
    // Rollback on error
    libraryStore.setState({ prompts: originalPrompts })
    showError('Failed to like prompt')
  }
}
```

### Pattern 4: Subscribe to Multiple Keys
```javascript
import { libraryStore } from '../app/src/state/index.js'

// Triggers when either filters OR viewMode changes
libraryStore.subscribe(['filters', 'viewMode'], (state, prevState) => {
  console.log('Filters:', state.filters)
  console.log('View mode:', state.viewMode)

  // Re-render UI or update computed state
  updateUI(state)
})
```

## Best Practices

1. **Always unsubscribe when component unmounts:**
```javascript
const unsubscribe = libraryStore.subscribe(['prompts'], callback)
// Later...
unsubscribe()
```

2. **Use specific state keys in subscriptions:**
```javascript
// Good: Only triggers on prompts changes
libraryStore.subscribe(['prompts'], callback)

// Bad: Triggers on any state change
libraryStore.subscribe([], callback)
```

3. **Batch related state updates:**
```javascript
// Good: Single update
libraryStore.setState({
  prompts: newPrompts,
  filteredPrompts: filtered,
  isLoading: false
})

// Bad: Multiple updates (triggers subscribers 3 times)
libraryStore.setState({ prompts: newPrompts })
libraryStore.setState({ filteredPrompts: filtered })
libraryStore.setState({ isLoading: false })
```

4. **Use toast notifications for user feedback:**
```javascript
// Always inform users of actions
showSuccess('Prompt saved!')
showError('Failed to save')

// Use loading toasts for async operations
const loading = showLoading('Saving...')
await saveData()
loading.dismiss()
```

5. **Validate early and often:**
```javascript
// Validate on input change (real-time)
input.addEventListener('input', (e) => {
  const result = validateForm({ [field]: e.target.value }, schema)
  // Show errors
})

// Validate on submit (final check)
form.addEventListener('submit', (e) => {
  const result = validateForm(formData, schema)
  if (!result.valid) return
  // Submit
})
```

## Running Examples

To run these examples:

1. Include the example file in your HTML:
```html
<script type="module" src="../examples/library-integration.js"></script>
```

2. Call the example functions:
```javascript
import { basicLibraryExample } from './examples/library-integration.js'

basicLibraryExample()
```

3. Or use in the browser console:
```javascript
// Examples are imported as modules
window.examples = await import('./examples/library-integration.js')
examples.basicLibraryExample()
```

## Next Steps

- Review the [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) for comprehensive integration documentation
- Check [REFACTORING_PLAN.md](../REFACTORING_PLAN.md) for architectural overview
- See component-specific documentation in each module

## Support

If you have questions or need help:
1. Check the integration guide
2. Review these examples
3. Look at the component source code (heavily documented)
4. Ask in the team chat
