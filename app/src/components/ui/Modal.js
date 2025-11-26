/**
 * Modal Component
 * Reusable modal/dialog component with animation and accessibility
 */

import { MODAL_CONFIG } from '../../config/constants.js'

export class Modal {
  constructor(id, options = {}) {
    this.id = id
    this.options = {
      closeOnOverlay: options.closeOnOverlay ?? MODAL_CONFIG.CLOSE_ON_OVERLAY,
      closeOnEscape: options.closeOnEscape ?? MODAL_CONFIG.CLOSE_ON_ESCAPE,
      animationDuration: options.animationDuration ?? MODAL_CONFIG.ANIMATION_DURATION,
      className: options.className || '',
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      showClose: options.showClose !== false
    }

    this.element = null
    this.isOpen = false
    this.escapeHandler = null
  }

  /**
   * Create modal element
   * @param {string|HTMLElement} content - Modal content (HTML string or element)
   * @param {Object} config - Configuration overrides
   * @returns {HTMLElement} Modal element
   */
  create(content, config = {}) {
    // Merge config with options
    const finalConfig = { ...this.options, ...config }

    // Create modal container
    const modal = document.createElement('div')
    modal.id = this.id
    modal.className = `modal-overlay ${finalConfig.className}`
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')

    // Create modal content structure
    const modalDialog = document.createElement('div')
    modalDialog.className = 'modal-dialog'

    const modalContent = document.createElement('div')
    modalContent.className = 'modal-content'

    // Add close button if enabled
    if (finalConfig.showClose) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'modal-close'
      closeBtn.setAttribute('aria-label', 'Close modal')
      closeBtn.innerHTML = '<span class="material-icons">close</span>'
      closeBtn.addEventListener('click', () => this.close())
      modalDialog.appendChild(closeBtn)
    }

    // Add content
    const contentContainer = document.createElement('div')
    contentContainer.className = 'modal-body'

    if (typeof content === 'string') {
      contentContainer.innerHTML = content
    } else if (content instanceof HTMLElement) {
      contentContainer.appendChild(content)
    }

    modalContent.appendChild(contentContainer)
    modalDialog.appendChild(modalContent)
    modal.appendChild(modalDialog)

    this.element = modal
    this.attachEventListeners()

    return modal
  }

  /**
   * Open the modal
   */
  open() {
    if (!this.element) {
      console.error('[Modal] Modal not created. Call create() first.')
      return
    }

    if (this.isOpen) return

    // Add to DOM
    document.body.appendChild(this.element)

    // Trigger reflow for animation
    this.element.offsetHeight

    // Add active class for animation
    requestAnimationFrame(() => {
      this.element.classList.add('active')
    })

    this.isOpen = true

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    // Focus management
    this.trapFocus()

    // Call onOpen callback
    this.options.onOpen?.()
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.element || !this.isOpen) return

    // Remove active class
    this.element.classList.remove('active')

    // Wait for animation, then remove from DOM
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.remove()
      }
      this.isOpen = false

      // Restore body scroll
      document.body.style.overflow = ''

      // Remove escape listener
      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler)
        this.escapeHandler = null
      }

      // Call onClose callback
      this.options.onClose?.()
    }, this.options.animationDuration)
  }

  /**
   * Update modal content
   * @param {string|HTMLElement} content - New content
   */
  updateContent(content) {
    if (!this.element) return

    const contentContainer = this.element.querySelector('.modal-body')
    if (!contentContainer) return

    if (typeof content === 'string') {
      contentContainer.innerHTML = content
    } else if (content instanceof HTMLElement) {
      contentContainer.innerHTML = ''
      contentContainer.appendChild(content)
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.element) return

    // Close on overlay click
    if (this.options.closeOnOverlay) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close()
        }
      })
    }

    // Close on escape key
    if (this.options.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape') {
          this.close()
        }
      }
      document.addEventListener('keydown', this.escapeHandler)
    }
  }

  /**
   * Trap focus within modal (accessibility)
   */
  trapFocus() {
    const focusableElements = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstElement.focus()

    // Trap focus
    const handleTab = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    this.element.addEventListener('keydown', handleTab)
  }

  /**
   * Toggle modal visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * Destroy modal and cleanup
   */
  destroy() {
    this.close()
    this.element = null
  }
}

/**
 * Create a simple modal (convenience function)
 * @param {string} id - Modal ID
 * @param {string|HTMLElement} content - Modal content
 * @param {Object} options - Modal options
 * @returns {Modal} Modal instance
 */
export function createModal(id, content, options = {}) {
  const modal = new Modal(id, options)
  modal.create(content)
  return modal
}

/**
 * Create a confirmation modal
 * @param {string} message - Confirmation message
 * @param {Object} options - Modal options
 * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
 */
export function confirmModal(message, options = {}) {
  return new Promise((resolve) => {
    const modalId = 'confirm-modal-' + Date.now()

    const content = `
      <div class="confirm-modal">
        <div class="confirm-message">
          ${options.icon ? `<span class="material-icons confirm-icon">${options.icon}</span>` : ''}
          <p>${message}</p>
        </div>
        <div class="confirm-actions">
          <button class="btn btn-secondary" data-action="cancel">
            ${options.cancelText || 'Cancel'}
          </button>
          <button class="btn btn-primary" data-action="confirm">
            ${options.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    `

    const modal = new Modal(modalId, {
      ...options,
      onClose: () => resolve(false)
    })

    modal.create(content)
    modal.open()

    // Attach button listeners
    const confirmBtn = modal.element.querySelector('[data-action="confirm"]')
    const cancelBtn = modal.element.querySelector('[data-action="cancel"]')

    confirmBtn.addEventListener('click', () => {
      modal.close()
      resolve(true)
    })

    cancelBtn.addEventListener('click', () => {
      modal.close()
      resolve(false)
    })
  })
}

/**
 * Create an alert modal
 * @param {string} message - Alert message
 * @param {Object} options - Modal options
 * @returns {Promise<void>}
 */
export function alertModal(message, options = {}) {
  return new Promise((resolve) => {
    const modalId = 'alert-modal-' + Date.now()

    const content = `
      <div class="alert-modal">
        <div class="alert-message">
          ${options.icon ? `<span class="material-icons alert-icon ${options.type || ''}">${options.icon}</span>` : ''}
          <p>${message}</p>
        </div>
        <div class="alert-actions">
          <button class="btn btn-primary" data-action="ok">
            ${options.okText || 'OK'}
          </button>
        </div>
      </div>
    `

    const modal = new Modal(modalId, {
      ...options,
      onClose: resolve
    })

    modal.create(content)
    modal.open()

    // Attach button listener
    const okBtn = modal.element.querySelector('[data-action="ok"]')
    okBtn.addEventListener('click', () => {
      modal.close()
      resolve()
    })
  })
}

export default Modal
