/**
 * Tool Submit Modal Component
 * Modal for submitting new AI tools to the leaderboard
 */

import { Modal } from '../ui/Modal.js'
import { TOOL_CATEGORIES, TOOL_CATEGORY_LABELS, validateTool } from '../../config/constants.js'

/**
 * Create and show tool submit modal
 * @param {Object} options - Modal options
 * @returns {Modal} Modal instance
 */
export function createToolSubmitModal(options = {}) {
  const {
    onSubmit = null,
    onClose = null
  } = options

  const modal = new Modal('tool-submit-modal', {
    className: 'tool-submit-modal',
    onClose
  })

  const content = renderToolSubmitForm()

  modal.create(content)

  // Attach form listeners
  attachFormListeners(modal, onSubmit)

  return modal
}

/**
 * Render tool submit form
 * @returns {string} Form HTML
 */
function renderToolSubmitForm() {
  const categories = Object.entries(TOOL_CATEGORY_LABELS)

  return `
    <div class="tool-submit-form">
      <h2 class="modal-title">Submit AI Tool</h2>
      <p class="modal-subtitle">Share an AI tool with the Stanford community</p>

      <form id="tool-submit-form">
        <!-- Tool Name -->
        <div class="form-group">
          <label for="tool-name" class="form-label">
            Tool Name *
          </label>
          <input
            type="text"
            id="tool-name"
            name="name"
            class="form-input"
            placeholder="e.g., ChatGPT, Claude, Midjourney"
            required
            maxlength="50"
          >
          <span class="form-hint">The official name of the AI tool</span>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="tool-description" class="form-label">
            Description *
          </label>
          <textarea
            id="tool-description"
            name="description"
            class="form-textarea"
            placeholder="Briefly describe what this tool does and who it's for..."
            required
            maxlength="200"
            rows="3"
          ></textarea>
          <span class="form-hint">
            <span class="char-count">0</span>/200 characters
          </span>
        </div>

        <!-- Website URL -->
        <div class="form-group">
          <label for="tool-url" class="form-label">
            Website URL *
          </label>
          <input
            type="url"
            id="tool-url"
            name="url"
            class="form-input"
            placeholder="https://example.com"
            required
          >
          <span class="form-hint">Official website or documentation URL</span>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label for="tool-category" class="form-label">
            Category *
          </label>
          <select
            id="tool-category"
            name="category"
            class="form-select"
            required
          >
            <option value="">Select a category</option>
            ${categories.map(([key, label]) => `
              <option value="${key}">${label}</option>
            `).join('')}
          </select>
          <span class="form-hint">What type of AI tool is this?</span>
        </div>

        <!-- Price Type -->
        <div class="form-group">
          <label for="tool-price" class="form-label">
            Price Type *
          </label>
          <select
            id="tool-price"
            name="price_type"
            class="form-select"
            required
          >
            <option value="">Select price type</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
          </select>
          <span class="form-hint">Is this tool free, freemium, or paid?</span>
        </div>

        <!-- Image URL (Optional) -->
        <div class="form-group">
          <label for="tool-image" class="form-label">
            Logo/Image URL (Optional)
          </label>
          <input
            type="url"
            id="tool-image"
            name="image_url"
            class="form-input"
            placeholder="https://example.com/logo.png"
          >
          <span class="form-hint">URL to the tool's logo or icon</span>
        </div>

        <!-- Error Messages -->
        <div class="form-errors" style="display: none;">
          <div class="error-message"></div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary btn-submit">
            <span class="material-icons">send</span>
            <span>Submit Tool</span>
          </button>
        </div>
      </form>
    </div>
  `
}

/**
 * Attach form event listeners
 * @param {Modal} modal - Modal instance
 * @param {Function} onSubmit - Submit callback
 */
function attachFormListeners(modal, onSubmit) {
  if (!modal.element) return

  const form = modal.element.querySelector('#tool-submit-form')
  const cancelBtn = modal.element.querySelector('.btn-cancel')
  const descriptionTextarea = modal.element.querySelector('#tool-description')
  const charCount = modal.element.querySelector('.char-count')

  // Character count
  if (descriptionTextarea && charCount) {
    descriptionTextarea.addEventListener('input', (e) => {
      charCount.textContent = e.target.value.length
    })
  }

  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.close())
  }

  // Form submission
  if (form && onSubmit) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(form)
      const toolData = Object.fromEntries(formData.entries())

      // Validate
      const validation = validateTool(toolData)
      if (!validation.valid) {
        showFormErrors(modal, validation.errors)
        return
      }

      // Show loading state
      setFormLoading(modal, true)
      hideFormErrors(modal)

      try {
        await onSubmit(toolData)
        modal.close()
      } catch (error) {
        console.error('Tool submission failed:', error)
        showFormErrors(modal, [error.message || 'Failed to submit tool. Please try again.'])
        setFormLoading(modal, false)
      }
    })
  }
}

/**
 * Show form errors
 * @param {Modal} modal - Modal instance
 * @param {Array<string>} errors - Error messages
 */
function showFormErrors(modal, errors) {
  const errorContainer = modal.element.querySelector('.form-errors')
  const errorMessage = modal.element.querySelector('.error-message')

  if (errorContainer && errorMessage) {
    errorMessage.innerHTML = errors.map(err => `
      <div class="error-item">
        <span class="material-icons">error_outline</span>
        <span>${err}</span>
      </div>
    `).join('')

    errorContainer.style.display = 'block'
  }
}

/**
 * Hide form errors
 * @param {Modal} modal - Modal instance
 */
function hideFormErrors(modal) {
  const errorContainer = modal.element.querySelector('.form-errors')
  if (errorContainer) {
    errorContainer.style.display = 'none'
  }
}

/**
 * Set form loading state
 * @param {Modal} modal - Modal instance
 * @param {boolean} loading - Loading state
 */
function setFormLoading(modal, loading) {
  const submitBtn = modal.element.querySelector('.btn-submit')
  const form = modal.element.querySelector('#tool-submit-form')

  if (submitBtn) {
    submitBtn.disabled = loading

    if (loading) {
      submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        <span>Submitting...</span>
      `
    } else {
      submitBtn.innerHTML = `
        <span class="material-icons">send</span>
        <span>Submit Tool</span>
      `
    }
  }

  if (form) {
    const inputs = form.querySelectorAll('input, textarea, select')
    inputs.forEach(input => input.disabled = loading)
  }
}

export default { createToolSubmitModal }
