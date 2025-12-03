# Stanford Prompt Library - Refactoring Plan

## Executive Summary

**Problem:** The codebase has grown organically, resulting in:
- Massive component files (1,000+ lines)
- Scattered state management across 20+ files
- Tight coupling between UI and services
- Repeated code patterns
- Difficult to make small changes without breaking functionality

**Goal:** Create a modular, maintainable architecture that allows safe, isolated changes.

**Strategy:** Phased refactoring with backwards compatibility, starting with highest-impact areas.

---

## Current State Analysis

### Critical Issues

| Issue | Impact | Files Affected |
|-------|--------|----------------|
| Monolithic components | High | LibraryWindow (1,515 lines), SignInGate (1,175 lines), Leaderboard (1,029 lines) |
| Scattered state | High | 20+ files with module-level state |
| No caching layer | Medium | All service calls refetch data |
| Repeated patterns | Medium | Modal code duplicated 4+ times |
| Inline styles | Low | 140+ inline style attributes |

### Architecture Metrics

```
Total Components: 40+ files
Largest File: LibraryWindow.js (1,515 lines)
Module-level State Variables: 50+ across codebase
Direct Service Imports: 40+ files
Repeated Code Patterns: 10+ identified
```

---

## Phase 1: Foundation & Infrastructure (Week 1-2)

**Goal:** Create reusable foundations without breaking existing code.

### 1.1 Create Constants Registry

**Priority: CRITICAL**
**Effort: 2 hours**
**Risk: Low**

Create centralized constants to eliminate duplication.

```javascript
// src/config/constants.js
export const CATEGORY_ICONS = {
  writing: 'edit_note',
  coding: 'code',
  research: 'science',
  creative: 'palette',
  business: 'business_center',
  education: 'school',
  other: 'folder'
}

export const CATEGORY_LABELS = {
  writing: 'Writing',
  coding: 'Coding',
  research: 'Research',
  creative: 'Creative',
  business: 'Business',
  education: 'Education',
  other: 'Other'
}

export const STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected'
}

export const VIEW_MODES = {
  GRID_DETAILS: 'grid-details',
  GRID_IMAGE: 'grid-image',
  CAROUSEL: 'carousel'
}

export const WINDOW_IDS = {
  LIBRARY: 'library-window',
  LEADERBOARD: 'leaderboard-window',
  ADMIN: 'admin-window',
  WALLPAPER: 'wallpaper-window',
  EXPLORE: 'explore-window',
  SUBMIT: 'submit-window'
}
```

**Action Items:**
- [ ] Create `src/config/constants.js`
- [ ] Migrate all hardcoded values
- [ ] Update imports across codebase
- [ ] Test thoroughly

### 1.2 Create Base Service Class

**Priority: CRITICAL**
**Effort: 4 hours**
**Risk: Medium**

Standardize error handling and add basic caching.

```javascript
// src/services/base-service.js
import { supabase } from '../config/supabase.js'

export class BaseService {
  constructor(tableName) {
    this.tableName = tableName
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Execute Supabase query with standardized error handling
   */
  async executeQuery(queryFn, options = {}) {
    try {
      const { data, error } = await queryFn()

      if (error) {
        console.error(`[${this.tableName}] Database error:`, error)
        throw new DatabaseError(error.message, error.code)
      }

      return data
    } catch (error) {
      if (error instanceof DatabaseError) throw error

      console.error(`[${this.tableName}] Unexpected error:`, error)
      throw new ServiceError('An unexpected error occurred', error)
    }
  }

  /**
   * Get data with caching
   */
  async getCached(key, fetchFn, ttl = this.cacheTimeout) {
    const cached = this.cache.get(key)

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    const data = await fetchFn()
    this.cache.set(key, { data, timestamp: Date.now() })

    return data
  }

  /**
   * Invalidate cache for specific key or all
   */
  invalidateCache(key = null) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(filters, callback) {
    const subscription = supabase
      .channel(`${this.tableName}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: this.tableName,
        filter: filters
      }, callback)
      .subscribe()

    return () => subscription.unsubscribe()
  }
}

// Custom error classes
export class DatabaseError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
  }
}

export class ServiceError extends Error {
  constructor(message, originalError) {
    super(message)
    this.name = 'ServiceError'
    this.originalError = originalError
  }
}
```

**Action Items:**
- [ ] Create `src/services/base-service.js`
- [ ] Migrate `prompts.js` to extend BaseService
- [ ] Migrate `ai-tools.js` to extend BaseService
- [ ] Add error boundaries in UI components
- [ ] Test error scenarios

### 1.3 Create Shared UI Components

**Priority: HIGH**
**Effort: 6 hours**
**Risk: Low**

Build reusable UI components to reduce duplication.

```javascript
// src/components/ui/Modal.js
export class Modal {
  constructor(id, options = {}) {
    this.id = id
    this.options = {
      closeOnOverlay: true,
      closeOnEscape: true,
      ...options
    }
    this.element = null
    this.isOpen = false
  }

  create(content, config = {}) {
    const modal = document.createElement('div')
    modal.id = this.id
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal-container ${config.className || ''}">
        ${config.showClose !== false ? '<button class="modal-close">&times;</button>' : ''}
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `

    this.element = modal
    this.attachEventListeners()

    return modal
  }

  open() {
    if (!this.element) {
      console.error('Modal not created. Call create() first.')
      return
    }

    document.body.appendChild(this.element)
    setTimeout(() => this.element.classList.add('active'), 10)
    this.isOpen = true

    this.options.onOpen?.()
  }

  close() {
    if (!this.element || !this.isOpen) return

    this.element.classList.remove('active')
    setTimeout(() => {
      this.element.remove()
      this.isOpen = false
      this.options.onClose?.()
    }, 300)
  }

  attachEventListeners() {
    if (this.options.closeOnOverlay) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) this.close()
      })
    }

    if (this.options.closeOnEscape) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          this.close()
          document.removeEventListener('keydown', handleEscape)
        }
      }
      document.addEventListener('keydown', handleEscape)
    }

    const closeBtn = this.element.querySelector('.modal-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close())
    }
  }

  updateContent(content) {
    if (!this.element) return

    const contentContainer = this.element.querySelector('.modal-content')
    if (contentContainer) {
      contentContainer.innerHTML = content
    }
  }
}
```

```javascript
// src/components/ui/Button.js
export function createButton(text, options = {}) {
  const {
    variant = 'primary',
    size = 'medium',
    icon = null,
    onClick = null,
    disabled = false,
    loading = false,
    className = ''
  } = options

  const button = document.createElement('button')
  button.className = `btn btn-${variant} btn-${size} ${className}`
  button.disabled = disabled || loading

  if (loading) {
    button.innerHTML = `
      <span class="btn-spinner"></span>
      <span>Loading...</span>
    `
  } else {
    button.innerHTML = `
      ${icon ? `<span class="material-icons">${icon}</span>` : ''}
      <span>${text}</span>
    `
  }

  if (onClick) {
    button.addEventListener('click', onClick)
  }

  return button
}

export function setButtonLoading(button, loading) {
  if (loading) {
    button.dataset.originalContent = button.innerHTML
    button.innerHTML = `
      <span class="btn-spinner"></span>
      <span>Loading...</span>
    `
    button.disabled = true
  } else {
    button.innerHTML = button.dataset.originalContent || button.innerHTML
    button.disabled = false
  }
}
```

```javascript
// src/components/ui/Card.js
export function createCard(content, options = {}) {
  const {
    title = null,
    subtitle = null,
    image = null,
    footer = null,
    className = '',
    onClick = null
  } = options

  const card = document.createElement('div')
  card.className = `card ${className} ${onClick ? 'card-clickable' : ''}`

  card.innerHTML = `
    ${image ? `<div class="card-image"><img src="${image}" alt="${title || ''}"></div>` : ''}
    <div class="card-body">
      ${title ? `<h3 class="card-title">${title}</h3>` : ''}
      ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
      <div class="card-content">${content}</div>
    </div>
    ${footer ? `<div class="card-footer">${footer}</div>` : ''}
  `

  if (onClick) {
    card.addEventListener('click', onClick)
  }

  return card
}
```

**Action Items:**
- [ ] Create `src/components/ui/Modal.js`
- [ ] Create `src/components/ui/Button.js`
- [ ] Create `src/components/ui/Card.js`
- [ ] Create `src/components/ui/Input.js`
- [ ] Add corresponding CSS styles
- [ ] Document usage in README

### 1.4 Create Simple State Manager

**Priority: HIGH**
**Effort: 4 hours**
**Risk: Medium**

Implement lightweight pub/sub state management.

```javascript
// src/state/store.js
class Store {
  constructor(initialState = {}) {
    this.state = { ...initialState }
    this.listeners = new Map()
    this.middlewares = []
  }

  /**
   * Get current state or specific slice
   */
  getState(path = null) {
    if (!path) return { ...this.state }

    return path.split('.').reduce((obj, key) => obj?.[key], this.state)
  }

  /**
   * Set state and notify listeners
   */
  setState(updates, source = 'unknown') {
    const prevState = { ...this.state }

    // Apply updates
    this.state = {
      ...this.state,
      ...updates
    }

    // Run middlewares
    this.middlewares.forEach(middleware => {
      middleware(prevState, this.state, source)
    })

    // Notify listeners
    this.notifyListeners(updates, prevState)
  }

  /**
   * Subscribe to state changes
   */
  subscribe(keys, callback) {
    const id = Math.random().toString(36)

    if (!Array.isArray(keys)) keys = [keys]

    this.listeners.set(id, { keys, callback })

    // Return unsubscribe function
    return () => this.listeners.delete(id)
  }

  /**
   * Notify relevant listeners
   */
  notifyListeners(updates, prevState) {
    const changedKeys = Object.keys(updates)

    this.listeners.forEach(({ keys, callback }) => {
      const shouldNotify = keys.some(key => changedKeys.includes(key))

      if (shouldNotify) {
        callback(this.state, prevState)
      }
    })
  }

  /**
   * Add middleware
   */
  use(middleware) {
    this.middlewares.push(middleware)
  }

  /**
   * Reset state
   */
  reset() {
    this.state = {}
    this.listeners.clear()
  }
}

// Create global store instances
export const appStore = new Store({
  user: null,
  profile: null,
  isAuthenticated: false,
  isInitialized: false
})

export const libraryStore = new Store({
  allPrompts: [],
  myPrompts: [],
  filteredPrompts: [],
  currentView: 'discover',
  currentCategory: 'all',
  currentSortBy: 'recent',
  searchQuery: '',
  viewMode: 'grid-details',
  isLoading: false
})

export const leaderboardStore = new Store({
  users: [],
  tools: [],
  currentView: 'users',
  currentFilter: 'all',
  isLoading: false
})

// Development helper middleware
if (import.meta.env.DEV) {
  const logger = (prev, next, source) => {
    console.log(`[Store Update from ${source}]`, {
      prev,
      next,
      diff: Object.keys(next).filter(key => prev[key] !== next[key])
    })
  }

  appStore.use(logger)
  libraryStore.use(logger)
  leaderboardStore.use(logger)
}
```

**Action Items:**
- [ ] Create `src/state/store.js`
- [ ] Define store instances (app, library, leaderboard)
- [ ] Add localStorage persistence middleware
- [ ] Add dev tools logging
- [ ] Document state management pattern

---

## Phase 2: Component Modularization (Week 3-4)

**Goal:** Break down monolithic components into manageable pieces.

### 2.1 Refactor LibraryWindow (1,515 lines → 6 files)

**Priority: CRITICAL**
**Effort: 12 hours**
**Risk: High**

Break down into logical sub-components.

**New Structure:**
```
components/library/
├── LibraryWindow.js         # Main container (200 lines)
├── PromptCarousel.js        # Carousel view (150 lines)
├── PromptGrid.js            # Grid view (200 lines)
├── PromptCard.js            # Individual card (100 lines)
├── PromptModal.js           # Detail modal (200 lines)
├── FilterBar.js             # Filters & search (150 lines)
└── ViewSwitcher.js          # View mode toggle (50 lines)
```

**Example - PromptCard.js:**
```javascript
// src/components/library/PromptCard.js
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../../config/constants.js'

export function createPromptCard(prompt, options = {}) {
  const {
    viewMode = 'details',
    onLike = null,
    onClick = null
  } = options

  const card = document.createElement('div')
  card.className = `prompt-card prompt-card-${viewMode}`
  card.dataset.promptId = prompt.id

  if (viewMode === 'image') {
    card.innerHTML = renderImageCard(prompt)
  } else {
    card.innerHTML = renderDetailsCard(prompt)
  }

  // Attach event listeners
  attachCardListeners(card, prompt, { onLike, onClick })

  return card
}

function renderDetailsCard(prompt) {
  const categoryIcon = CATEGORY_ICONS[prompt.category] || CATEGORY_ICONS.other
  const categoryLabel = CATEGORY_LABELS[prompt.category] || 'Other'

  return `
    <div class="card-header">
      <div class="category-badge">
        <span class="material-icons">${categoryIcon}</span>
        <span>${categoryLabel}</span>
      </div>
      ${prompt.is_featured ? '<span class="featured-badge">Featured</span>' : ''}
    </div>

    <div class="card-body">
      <h3 class="card-title">${escapeHtml(prompt.title)}</h3>
      <p class="card-description">${escapeHtml(truncate(prompt.description, 120))}</p>
    </div>

    <div class="card-footer">
      <div class="card-stats">
        <span class="stat">
          <span class="material-icons">favorite</span>
          <span class="stat-count">${prompt.likes_count || 0}</span>
        </span>
        <span class="stat">
          <span class="material-icons">visibility</span>
          <span class="stat-count">${prompt.views_count || 0}</span>
        </span>
      </div>
      <button class="btn-like" data-prompt-id="${prompt.id}">
        <span class="material-icons">${prompt.user_has_liked ? 'favorite' : 'favorite_border'}</span>
      </button>
    </div>
  `
}

function renderImageCard(prompt) {
  return `
    <div class="card-image-wrapper">
      ${prompt.image_url
        ? `<img src="${prompt.image_url}" alt="${escapeHtml(prompt.title)}">`
        : `<div class="card-placeholder"><span class="material-icons">image</span></div>`
      }
      <div class="card-overlay">
        <h4>${escapeHtml(prompt.title)}</h4>
      </div>
    </div>
  `
}

function attachCardListeners(card, prompt, { onLike, onClick }) {
  // Card click
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-like')) {
      onClick?.(prompt)
    }
  })

  // Like button
  const likeBtn = card.querySelector('.btn-like')
  if (likeBtn) {
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      onLike?.(prompt)
    })
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function truncate(text, length) {
  return text.length > length ? text.substring(0, length) + '...' : text
}
```

**Example - LibraryWindow.js (refactored):**
```javascript
// src/components/library/LibraryWindow.js
import { libraryStore } from '../../state/store.js'
import { createPromptGrid } from './PromptGrid.js'
import { createPromptCarousel } from './PromptCarousel.js'
import { createFilterBar } from './FilterBar.js'
import { createPromptModal } from './PromptModal.js'
import { getApprovedPrompts, getMyPrompts } from '../../services/prompts.js'

let unsubscribe = null
let currentModal = null

export async function renderLibraryWindow() {
  const content = document.getElementById('library-window-content')
  if (!content) return

  // Initialize state if needed
  if (libraryStore.getState('allPrompts').length === 0) {
    await loadPrompts()
  }

  // Subscribe to state changes
  if (unsubscribe) unsubscribe()
  unsubscribe = libraryStore.subscribe(
    ['filteredPrompts', 'currentView', 'viewMode'],
    handleStateChange
  )

  // Render initial UI
  renderUI(content)
}

async function loadPrompts() {
  libraryStore.setState({ isLoading: true }, 'loadPrompts')

  try {
    const [allPrompts, myPrompts] = await Promise.all([
      getApprovedPrompts(),
      getMyPrompts()
    ])

    libraryStore.setState({
      allPrompts,
      myPrompts,
      filteredPrompts: allPrompts,
      isLoading: false
    }, 'loadPrompts')
  } catch (error) {
    console.error('Failed to load prompts:', error)
    libraryStore.setState({ isLoading: false }, 'loadPrompts')
  }
}

function renderUI(container) {
  const state = libraryStore.getState()

  container.innerHTML = `
    <div class="library-container">
      <div id="filter-bar-container"></div>
      <div id="content-container"></div>
    </div>
  `

  // Render filter bar
  const filterBar = createFilterBar({
    onSearch: handleSearch,
    onCategoryChange: handleCategoryChange,
    onViewChange: handleViewChange
  })
  container.querySelector('#filter-bar-container').appendChild(filterBar)

  // Render content based on view mode
  renderContent(container.querySelector('#content-container'))
}

function renderContent(container) {
  const state = libraryStore.getState()

  if (state.viewMode === 'carousel') {
    const carousel = createPromptCarousel(state.filteredPrompts, {
      onPromptClick: showPromptDetails
    })
    container.replaceChildren(carousel)
  } else {
    const grid = createPromptGrid(state.filteredPrompts, {
      viewMode: state.viewMode,
      onPromptClick: showPromptDetails,
      onLike: handleLike
    })
    container.replaceChildren(grid)
  }
}

function handleStateChange(state, prevState) {
  const contentContainer = document.querySelector('#content-container')
  if (contentContainer) {
    renderContent(contentContainer)
  }
}

function handleSearch(query) {
  libraryStore.setState({ searchQuery: query }, 'search')
  filterPrompts()
}

function handleCategoryChange(category) {
  libraryStore.setState({ currentCategory: category }, 'category')
  filterPrompts()
}

function handleViewChange(viewMode) {
  libraryStore.setState({ viewMode }, 'viewMode')
}

function filterPrompts() {
  const { allPrompts, searchQuery, currentCategory } = libraryStore.getState()

  let filtered = [...allPrompts]

  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory)
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }

  libraryStore.setState({ filteredPrompts: filtered }, 'filter')
}

function showPromptDetails(prompt) {
  if (currentModal) currentModal.close()

  currentModal = createPromptModal(prompt, {
    onClose: () => currentModal = null,
    onLike: handleLike
  })

  currentModal.open()
}

async function handleLike(prompt) {
  // Optimistic update
  const state = libraryStore.getState()
  const updatedPrompts = state.allPrompts.map(p =>
    p.id === prompt.id
      ? { ...p, user_has_liked: !p.user_has_liked, likes_count: p.likes_count + (p.user_has_liked ? -1 : 1) }
      : p
  )

  libraryStore.setState({ allPrompts: updatedPrompts }, 'optimistic-like')

  try {
    await likePrompt(prompt.id)
  } catch (error) {
    // Rollback on error
    libraryStore.setState({ allPrompts: state.allPrompts }, 'rollback-like')
    console.error('Failed to like prompt:', error)
  }
}

export function cleanupLibraryWindow() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }

  if (currentModal) {
    currentModal.close()
    currentModal = null
  }
}
```

**Action Items:**
- [ ] Create component structure
- [ ] Implement PromptCard component
- [ ] Implement PromptGrid component
- [ ] Implement PromptCarousel component
- [ ] Implement FilterBar component
- [ ] Implement PromptModal component
- [ ] Refactor LibraryWindow to orchestrate
- [ ] Integrate with libraryStore
- [ ] Test all interactions
- [ ] Add cleanup on unmount

### 2.2 Refactor SignInGate (1,175 lines → 4 files)

**Priority: HIGH**
**Effort: 6 hours**
**Risk: Medium**

**New Structure:**
```
components/auth/
├── SignInGate.js            # Main container (150 lines)
├── LandingHero.js           # Hero section (200 lines)
├── FeatureCards.js          # Feature showcase (150 lines)
└── ParticleBackground.js    # Canvas animation (100 lines)

assets/
└── icons.js                 # SVG definitions (300 lines)
```

**Action Items:**
- [ ] Extract SVG icons to `assets/icons.js`
- [ ] Create ParticleBackground component
- [ ] Create LandingHero component
- [ ] Create FeatureCards component
- [ ] Refactor SignInGate to compose
- [ ] Test animations and responsiveness

### 2.3 Refactor LeaderboardWindow (1,029 lines → 5 files)

**Priority: HIGH**
**Effort: 8 hours**
**Risk: Medium**

**New Structure:**
```
components/leaderboard/
├── LeaderboardWindow.js     # Main container (150 lines)
├── UserLeaderboard.js       # User rankings (200 lines)
├── ToolsLeaderboard.js      # AI tools view (200 lines)
├── ToolSubmitModal.js       # Submission form (200 lines)
└── VotingSystem.js          # Vote UI logic (100 lines)
```

**Action Items:**
- [ ] Create UserLeaderboard component
- [ ] Create ToolsLeaderboard component
- [ ] Create ToolSubmitModal component
- [ ] Extract voting logic to VotingSystem
- [ ] Integrate with leaderboardStore
- [ ] Test sorting and filtering

---

## Phase 3: Service Layer Enhancement (Week 5)

**Goal:** Add caching, request deduplication, optimistic updates.

### 3.1 Migrate Services to BaseService

**Priority: HIGH**
**Effort: 6 hours**
**Risk: Medium**

```javascript
// src/services/prompts.js (refactored)
import { BaseService } from './base-service.js'
import { getCurrentUser } from './auth.js'

class PromptsService extends BaseService {
  constructor() {
    super('prompts')
  }

  async getApproved() {
    return this.getCached('approved', async () => {
      return this.executeQuery(() =>
        supabase
          .from(this.tableName)
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
      )
    })
  }

  async getMyPrompts() {
    const user = await getCurrentUser()
    if (!user) return []

    return this.getCached(`user:${user.id}`, async () => {
      return this.executeQuery(() =>
        supabase
          .from(this.tableName)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      )
    })
  }

  async submit(promptData) {
    const result = await this.executeQuery(() =>
      supabase.from(this.tableName).insert([promptData])
    )

    // Invalidate cache
    this.invalidateCache()

    return result
  }

  async like(promptId) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Must be authenticated to like')

    const result = await this.executeQuery(() =>
      supabase.from('prompt_likes').insert([
        { prompt_id: promptId, user_id: user.id }
      ])
    )

    // Invalidate prompt cache
    this.invalidateCache()

    return result
  }
}

export const promptsService = new PromptsService()

// Export convenience methods
export const getApprovedPrompts = () => promptsService.getApproved()
export const getMyPrompts = () => promptsService.getMyPrompts()
export const submitPrompt = (data) => promptsService.submit(data)
export const likePrompt = (id) => promptsService.like(id)
```

**Action Items:**
- [ ] Refactor prompts.js to use BaseService
- [ ] Refactor ai-tools.js to use BaseService
- [ ] Refactor admin.js to use BaseService
- [ ] Add cache invalidation on mutations
- [ ] Test caching behavior
- [ ] Add cache size limits

### 3.2 Add Request Deduplication

**Priority: MEDIUM**
**Effort: 3 hours**
**Risk: Low**

```javascript
// Add to BaseService
class BaseService {
  constructor(tableName) {
    // ... existing code
    this.inflightRequests = new Map()
  }

  async dedupedRequest(key, requestFn) {
    // Check if request is already in-flight
    if (this.inflightRequests.has(key)) {
      return this.inflightRequests.get(key)
    }

    // Execute request
    const promise = requestFn()
    this.inflightRequests.set(key, promise)

    try {
      const result = await promise
      this.inflightRequests.delete(key)
      return result
    } catch (error) {
      this.inflightRequests.delete(key)
      throw error
    }
  }
}
```

**Action Items:**
- [ ] Add deduplication to BaseService
- [ ] Update all service methods to use deduplication
- [ ] Test concurrent requests
- [ ] Add metrics/logging

---

## Phase 4: Style Extraction (Week 6)

**Goal:** Remove inline styles, create component-specific CSS.

### 4.1 Extract Inline Styles

**Priority: MEDIUM**
**Effort: 8 hours**
**Risk: Low**

Create component-specific stylesheets.

```css
/* src/components/library/PromptCard.css */
.prompt-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.prompt-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.prompt-card-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prompt-card-image {
  aspect-ratio: 16/9;
  overflow: hidden;
}

/* ... rest of styles */
```

**Action Items:**
- [ ] Audit all inline styles
- [ ] Create component-specific CSS files
- [ ] Replace inline styles with classes
- [ ] Add CSS custom properties for theming
- [ ] Test visual consistency
- [ ] Remove unused styles

---

## Phase 5: Testing & Documentation (Week 7)

**Goal:** Ensure quality and maintainability.

### 5.1 Add Unit Tests

**Priority: MEDIUM**
**Effort: 12 hours**

```javascript
// tests/services/prompts.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { promptsService } from '../../src/services/prompts.js'

describe('PromptsService', () => {
  beforeEach(() => {
    promptsService.invalidateCache()
  })

  it('should fetch approved prompts', async () => {
    const prompts = await promptsService.getApproved()
    expect(Array.isArray(prompts)).toBe(true)
  })

  it('should cache requests', async () => {
    const first = await promptsService.getApproved()
    const second = await promptsService.getApproved()
    // Should return same reference (cached)
    expect(first).toBe(second)
  })

  it('should invalidate cache on submit', async () => {
    await promptsService.getApproved()
    await promptsService.submit({ title: 'Test' })
    // Cache should be invalidated
  })
})
```

**Action Items:**
- [ ] Set up Vitest
- [ ] Write service layer tests
- [ ] Write component tests
- [ ] Write state management tests
- [ ] Add test coverage reporting
- [ ] Add CI/CD integration

### 5.2 Create Documentation

**Priority: MEDIUM**
**Effort: 6 hours**

**Action Items:**
- [ ] Document component API
- [ ] Create architecture diagram
- [ ] Write contribution guidelines
- [ ] Add inline JSDoc comments
- [ ] Create component examples
- [ ] Document state management pattern

---

## Migration Strategy

### Backwards Compatibility

All refactoring should maintain backwards compatibility:

1. **Keep old exports**: Export both old and new interfaces
2. **Gradual migration**: Migrate one component at a time
3. **Feature flags**: Use flags to toggle new implementations
4. **Deprecation warnings**: Add console warnings for old patterns

```javascript
// Example: Gradual migration
export function renderLibraryWindow() {
  const useRefactored = localStorage.getItem('USE_REFACTORED_LIBRARY') === 'true'

  if (useRefactored) {
    return renderLibraryWindowNew()
  } else {
    console.warn('Using legacy LibraryWindow. Set USE_REFACTORED_LIBRARY=true to test new version.')
    return renderLibraryWindowLegacy()
  }
}
```

### Testing Strategy

1. **Parallel implementation**: Keep old code while building new
2. **A/B testing**: Test new components with feature flags
3. **Visual regression**: Screenshot comparison
4. **Integration tests**: Test critical user flows
5. **Manual QA**: Test in production-like environment

---

## Success Metrics

### Code Quality Metrics

- [ ] **Largest file < 500 lines** (currently 1,515)
- [ ] **Average function length < 50 lines** (currently 100+)
- [ ] **Cyclomatic complexity < 10** per function
- [ ] **0 duplicate code blocks** (currently 10+)
- [ ] **Test coverage > 70%** (currently 0%)

### Performance Metrics

- [ ] **Reduce API calls by 50%** (via caching)
- [ ] **Reduce re-renders by 30%** (via state management)
- [ ] **Time to interactive < 2s** (currently ~3s)
- [ ] **Bundle size reduction 20%** (via tree-shaking)

### Developer Experience Metrics

- [ ] **Time to make small change < 5 minutes**
- [ ] **0 breaking changes when adding features**
- [ ] **Component reuse rate > 60%**
- [ ] **New developer onboarding < 2 hours**

---

## Risk Mitigation

### High-Risk Areas

1. **LibraryWindow refactoring**
   - **Risk**: Most complex component, high user interaction
   - **Mitigation**: Feature flag, parallel implementation, extensive testing

2. **State management migration**
   - **Risk**: Global state changes affect entire app
   - **Mitigation**: Gradual migration, keep old state initially

3. **Service layer changes**
   - **Risk**: Breaking API contracts
   - **Mitigation**: Maintain old exports, add adapters

### Rollback Plan

Each phase should be independently rollbackable:

1. Keep old code in `*.legacy.js` files
2. Use feature flags for new implementations
3. Maintain git branches for each phase
4. Have automated rollback scripts ready

---

## Timeline Summary

| Phase | Duration | Risk | Dependencies |
|-------|----------|------|--------------|
| Phase 1: Foundation | 2 weeks | Low | None |
| Phase 2: Components | 2 weeks | High | Phase 1 |
| Phase 3: Services | 1 week | Medium | Phase 1 |
| Phase 4: Styles | 1 week | Low | Phase 2 |
| Phase 5: Testing | 1 week | Low | All phases |

**Total Estimated Time:** 7 weeks (35 working days)

---

## Next Steps

1. **Review this plan** with team
2. **Prioritize phases** based on business needs
3. **Set up development branch** for refactoring
4. **Create feature flags** in code
5. **Start with Phase 1.1** (Constants Registry)

---

## Questions to Resolve

- [ ] Should we consider migrating to React/Vue/Svelte?
- [ ] What's the target browser support?
- [ ] Do we need TypeScript?
- [ ] What's the testing strategy (unit vs integration)?
- [ ] How do we handle production hotfixes during refactoring?
- [ ] Should we set up Storybook for component documentation?

---

**Document Version:** 1.0
**Last Updated:** 2025-11-26
**Author:** Claude Code
**Status:** Proposal - Awaiting Approval
