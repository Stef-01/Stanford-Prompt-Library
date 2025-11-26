/**
 * Application Constants Registry
 * Centralized location for all constants used across the application
 */

// ============================================================================
// Category Configuration
// ============================================================================

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

export const CATEGORY_COLORS = {
  writing: '#3b82f6',
  coding: '#8b5cf6',
  research: '#06b6d4',
  creative: '#ec4899',
  business: '#f59e0b',
  education: '#10b981',
  other: '#6b7280'
}

// ============================================================================
// Status Configuration
// ============================================================================

export const STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected'
}

export const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444'
}

// ============================================================================
// View Modes
// ============================================================================

export const VIEW_MODES = {
  GRID_DETAILS: 'grid-details',
  GRID_IMAGE: 'grid-image',
  CAROUSEL: 'carousel'
}

export const LIBRARY_VIEWS = {
  DISCOVER: 'discover',
  MY_PROMPTS: 'my-prompts',
  LIKED: 'liked'
}

export const LEADERBOARD_VIEWS = {
  USERS: 'users',
  TOOLS: 'tools'
}

// ============================================================================
// Window IDs
// ============================================================================

export const WINDOW_IDS = {
  LIBRARY: 'library-window',
  LEADERBOARD: 'leaderboard-window',
  ADMIN: 'admin-window',
  WALLPAPER: 'wallpaper-window',
  EXPLORE: 'explore-window',
  SUBMIT: 'submit-window',
  OPPORTUNITIES: 'opportunities-window'
}

// ============================================================================
// Sort Options
// ============================================================================

export const SORT_OPTIONS = {
  RECENT: 'recent',
  POPULAR: 'popular',
  TRENDING: 'trending',
  ALPHABETICAL: 'alphabetical'
}

export const SORT_LABELS = {
  recent: 'Most Recent',
  popular: 'Most Popular',
  trending: 'Trending',
  alphabetical: 'A-Z'
}

// ============================================================================
// Filter Options
// ============================================================================

export const ADMIN_FILTERS = {
  ALL: 'all',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const LEADERBOARD_FILTERS = {
  ALL: 'all',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
}

// ============================================================================
// Tool Categories
// ============================================================================

export const TOOL_CATEGORIES = {
  PRODUCTIVITY: 'productivity',
  CREATIVE: 'creative',
  DEVELOPMENT: 'development',
  RESEARCH: 'research',
  COMMUNICATION: 'communication',
  OTHER: 'other'
}

export const TOOL_CATEGORY_LABELS = {
  productivity: 'Productivity',
  creative: 'Creative',
  development: 'Development',
  research: 'Research',
  communication: 'Communication',
  other: 'Other'
}

export const TOOL_CATEGORY_ICONS = {
  productivity: 'work',
  creative: 'brush',
  development: 'terminal',
  research: 'science',
  communication: 'chat',
  other: 'apps'
}

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  PROMPT_TITLE: {
    minLength: 5,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,!?]+$/
  },
  PROMPT_DESCRIPTION: {
    minLength: 20,
    maxLength: 500
  },
  PROMPT_CONTENT: {
    minLength: 50,
    maxLength: 5000
  },
  TOOL_NAME: {
    minLength: 3,
    maxLength: 50
  },
  TOOL_DESCRIPTION: {
    minLength: 20,
    maxLength: 200
  },
  URL: {
    pattern: /^https?:\/\/.+/
  }
}

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,       // 1 minute
  MEDIUM: 5 * 60 * 1000,      // 5 minutes
  LONG: 30 * 60 * 1000,       // 30 minutes
  DAY: 24 * 60 * 60 * 1000    // 24 hours
}

// ============================================================================
// UI Configuration
// ============================================================================

export const CAROUSEL_CONFIG = {
  AUTO_PLAY: true,
  AUTO_PLAY_INTERVAL: 5000,
  TRANSITION_DURATION: 500
}

export const MODAL_CONFIG = {
  CLOSE_ON_OVERLAY: true,
  CLOSE_ON_ESCAPE: true,
  ANIMATION_DURATION: 300
}

export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: 'bottom-right'
}

// ============================================================================
// API Configuration
// ============================================================================

export const API_LIMITS = {
  MAX_PROMPTS_PER_USER: 50,
  MAX_LIKES_PER_DAY: 100,
  MAX_VOTES_PER_DAY: 50,
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
}

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_REQUIRED: 'You must be signed in to perform this action.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
}

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  PROMPT_SUBMITTED: 'Prompt submitted successfully! It will be reviewed soon.',
  PROMPT_LIKED: 'Prompt liked successfully!',
  PROMPT_UNLIKED: 'Prompt unliked successfully!',
  TOOL_SUBMITTED: 'Tool submitted successfully!',
  VOTE_RECORDED: 'Your vote has been recorded!',
  PROFILE_UPDATED: 'Profile updated successfully!'
}

// ============================================================================
// User Roles
// ============================================================================

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
}

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned'
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get category icon by category name
 * @param {string} category - Category name
 * @returns {string} Material icon name
 */
export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.other
}

/**
 * Get category label by category name
 * @param {string} category - Category name
 * @returns {string} Human-readable label
 */
export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.other
}

/**
 * Get category color by category name
 * @param {string} category - Category name
 * @returns {string} Color hex code
 */
export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other
}

/**
 * Get all categories as array
 * @returns {Array<{key: string, label: string, icon: string, color: string}>}
 */
export function getAllCategories() {
  return Object.keys(CATEGORY_LABELS).map(key => ({
    key,
    label: CATEGORY_LABELS[key],
    icon: CATEGORY_ICONS[key],
    color: CATEGORY_COLORS[key]
  }))
}

/**
 * Validate prompt data
 * @param {Object} prompt - Prompt data to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validatePrompt(prompt) {
  const errors = []

  // Title validation
  if (!prompt.title || prompt.title.length < VALIDATION_RULES.PROMPT_TITLE.minLength) {
    errors.push(`Title must be at least ${VALIDATION_RULES.PROMPT_TITLE.minLength} characters`)
  }
  if (prompt.title && prompt.title.length > VALIDATION_RULES.PROMPT_TITLE.maxLength) {
    errors.push(`Title must be less than ${VALIDATION_RULES.PROMPT_TITLE.maxLength} characters`)
  }

  // Description validation
  if (!prompt.description || prompt.description.length < VALIDATION_RULES.PROMPT_DESCRIPTION.minLength) {
    errors.push(`Description must be at least ${VALIDATION_RULES.PROMPT_DESCRIPTION.minLength} characters`)
  }
  if (prompt.description && prompt.description.length > VALIDATION_RULES.PROMPT_DESCRIPTION.maxLength) {
    errors.push(`Description must be less than ${VALIDATION_RULES.PROMPT_DESCRIPTION.maxLength} characters`)
  }

  // Content validation
  if (!prompt.prompt_text || prompt.prompt_text.length < VALIDATION_RULES.PROMPT_CONTENT.minLength) {
    errors.push(`Prompt content must be at least ${VALIDATION_RULES.PROMPT_CONTENT.minLength} characters`)
  }
  if (prompt.prompt_text && prompt.prompt_text.length > VALIDATION_RULES.PROMPT_CONTENT.maxLength) {
    errors.push(`Prompt content must be less than ${VALIDATION_RULES.PROMPT_CONTENT.maxLength} characters`)
  }

  // Category validation
  if (!prompt.category || !CATEGORY_LABELS[prompt.category]) {
    errors.push('Please select a valid category')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate tool data
 * @param {Object} tool - Tool data to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateTool(tool) {
  const errors = []

  // Name validation
  if (!tool.name || tool.name.length < VALIDATION_RULES.TOOL_NAME.minLength) {
    errors.push(`Tool name must be at least ${VALIDATION_RULES.TOOL_NAME.minLength} characters`)
  }

  // Description validation
  if (!tool.description || tool.description.length < VALIDATION_RULES.TOOL_DESCRIPTION.minLength) {
    errors.push(`Description must be at least ${VALIDATION_RULES.TOOL_DESCRIPTION.minLength} characters`)
  }

  // URL validation
  if (tool.url && !VALIDATION_RULES.URL.pattern.test(tool.url)) {
    errors.push('Please enter a valid URL starting with http:// or https://')
  }

  // Category validation
  if (!tool.category || !TOOL_CATEGORY_LABELS[tool.category]) {
    errors.push('Please select a valid category')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
