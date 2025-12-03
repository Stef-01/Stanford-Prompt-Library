/**
 * Toast Notification Utility
 * Simple, elegant toast notifications
 */

class ToastManager {
  constructor() {
    this.toasts = []
    this.container = null
    this.init()
  }

  init() {
    // Create toast container
    this.container = document.createElement('div')
    this.container.className = 'toast-container'
    document.body.appendChild(this.container)
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Toast options
   * @returns {Object} Toast instance with dismiss method
   */
  show(message, options = {}) {
    const {
      type = 'info',        // success, error, warning, info
      duration = 3000,      // Auto-dismiss duration (0 = no auto-dismiss)
      position = 'bottom-right',  // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
      icon = null,          // Custom icon
      dismissible = true,   // Show close button
      action = null         // { text: 'Action', onClick: fn }
    } = options

    const toast = this.createToast(message, { type, icon, dismissible, action })

    // Add to container
    this.container.appendChild(toast.element)
    this.toasts.push(toast)

    // Position container
    this.container.className = `toast-container toast-${position}`

    // Trigger animation
    setTimeout(() => toast.element.classList.add('show'), 10)

    // Auto-dismiss
    if (duration > 0) {
      toast.timeout = setTimeout(() => this.dismiss(toast), duration)
    }

    return {
      dismiss: () => this.dismiss(toast)
    }
  }

  /**
   * Create toast element
   */
  createToast(message, options) {
    const { type, icon, dismissible, action } = options

    const element = document.createElement('div')
    element.className = `toast toast-${type}`

    // Icon
    const iconHtml = icon
      ? `<span class="material-icons toast-icon">${icon}</span>`
      : type === 'success' ? `<span class="material-icons toast-icon">check_circle</span>`
      : type === 'error' ? `<span class="material-icons toast-icon">error_outline</span>`
      : type === 'warning' ? `<span class="material-icons toast-icon">warning</span>`
      : `<span class="material-icons toast-icon">info</span>`

    element.innerHTML = `
      ${iconHtml}
      <div class="toast-content">
        <div class="toast-message">${message}</div>
        ${action ? `<button class="toast-action">${action.text}</button>` : ''}
      </div>
      ${dismissible ? '<button class="toast-close"><span class="material-icons">close</span></button>' : ''}
    `

    // Event listeners
    if (dismissible) {
      const closeBtn = element.querySelector('.toast-close')
      closeBtn.addEventListener('click', () => {
        const toast = this.toasts.find(t => t.element === element)
        if (toast) this.dismiss(toast)
      })
    }

    if (action && action.onClick) {
      const actionBtn = element.querySelector('.toast-action')
      actionBtn.addEventListener('click', () => {
        action.onClick()
        const toast = this.toasts.find(t => t.element === element)
        if (toast) this.dismiss(toast)
      })
    }

    return { element, timeout: null }
  }

  /**
   * Dismiss a toast
   */
  dismiss(toast) {
    if (toast.timeout) {
      clearTimeout(toast.timeout)
    }

    toast.element.classList.remove('show')

    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.remove()
      }
      this.toasts = this.toasts.filter(t => t !== toast)
    }, 300)
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.toasts.forEach(toast => this.dismiss(toast))
  }

  /**
   * Destroy toast manager
   */
  destroy() {
    this.dismissAll()
    if (this.container && this.container.parentNode) {
      this.container.remove()
    }
  }
}

// Create singleton instance
const toastManager = new ToastManager()

/**
 * Show a success toast
 * @param {string} message - Success message
 * @param {Object} options - Toast options
 */
export function showSuccess(message, options = {}) {
  return toastManager.show(message, { ...options, type: 'success' })
}

/**
 * Show an error toast
 * @param {string} message - Error message
 * @param {Object} options - Toast options
 */
export function showError(message, options = {}) {
  return toastManager.show(message, { ...options, type: 'error' })
}

/**
 * Show a warning toast
 * @param {string} message - Warning message
 * @param {Object} options - Toast options
 */
export function showWarning(message, options = {}) {
  return toastManager.show(message, { ...options, type: 'warning' })
}

/**
 * Show an info toast
 * @param {string} message - Info message
 * @param {Object} options - Toast options
 */
export function showInfo(message, options = {}) {
  return toastManager.show(message, { ...options, type: 'info' })
}

/**
 * Show a loading toast
 * @param {string} message - Loading message
 * @returns {Object} Toast instance with update and dismiss methods
 */
export function showLoading(message) {
  const toast = toastManager.show(message, {
    type: 'info',
    icon: 'hourglass_empty',
    duration: 0,
    dismissible: false
  })

  return {
    dismiss: toast.dismiss,
    update: (newMessage) => {
      const toastElement = toastManager.toasts.find(t => t.element)?.element
      if (toastElement) {
        const messageEl = toastElement.querySelector('.toast-message')
        if (messageEl) messageEl.textContent = newMessage
      }
    }
  }
}

/**
 * Dismiss all toasts
 */
export function dismissAll() {
  toastManager.dismissAll()
}

export default {
  show: (message, options) => toastManager.show(message, options),
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismissAll
}
