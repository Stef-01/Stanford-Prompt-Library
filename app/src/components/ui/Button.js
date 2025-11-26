/**
 * Button Component
 * Reusable button component with various variants and states
 */

/**
 * Create a button element
 * @param {string} text - Button text
 * @param {Object} options - Button options
 * @returns {HTMLButtonElement} Button element
 */
export function createButton(text, options = {}) {
  const {
    variant = 'primary',      // primary, secondary, danger, ghost, link
    size = 'medium',          // small, medium, large
    icon = null,              // Material icon name
    iconPosition = 'left',    // left, right
    onClick = null,
    disabled = false,
    loading = false,
    type = 'button',
    className = '',
    fullWidth = false,
    ariaLabel = null
  } = options

  const button = document.createElement('button')
  button.type = type
  button.className = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    className
  ].filter(Boolean).join(' ')

  button.disabled = disabled || loading

  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel)
  }

  // Set content based on loading state
  if (loading) {
    button.innerHTML = `
      <span class="btn-spinner"></span>
      <span class="btn-text">Loading...</span>
    `
    button.classList.add('btn-loading')
  } else {
    const iconHtml = icon ? `<span class="material-icons btn-icon">${icon}</span>` : ''
    const textHtml = `<span class="btn-text">${text}</span>`

    button.innerHTML = iconPosition === 'right'
      ? textHtml + iconHtml
      : iconHtml + textHtml
  }

  // Attach click handler
  if (onClick) {
    button.addEventListener('click', onClick)
  }

  // Store original content for loading state transitions
  button.dataset.originalText = text
  if (icon) button.dataset.originalIcon = icon
  if (iconPosition) button.dataset.iconPosition = iconPosition

  return button
}

/**
 * Set button loading state
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} loading - Loading state
 */
export function setButtonLoading(button, loading) {
  if (!button) return

  if (loading) {
    // Store original content
    if (!button.dataset.originalContent) {
      button.dataset.originalContent = button.innerHTML
    }

    button.innerHTML = `
      <span class="btn-spinner"></span>
      <span class="btn-text">Loading...</span>
    `
    button.disabled = true
    button.classList.add('btn-loading')
  } else {
    // Restore original content
    if (button.dataset.originalContent) {
      button.innerHTML = button.dataset.originalContent
    }

    button.disabled = false
    button.classList.remove('btn-loading')
  }
}

/**
 * Set button disabled state
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} disabled - Disabled state
 */
export function setButtonDisabled(button, disabled) {
  if (!button) return
  button.disabled = disabled
}

/**
 * Create a button group
 * @param {Array<Object>} buttons - Array of button configurations
 * @param {Object} options - Button group options
 * @returns {HTMLElement} Button group container
 */
export function createButtonGroup(buttons, options = {}) {
  const {
    orientation = 'horizontal',  // horizontal, vertical
    className = ''
  } = options

  const group = document.createElement('div')
  group.className = `btn-group btn-group-${orientation} ${className}`

  buttons.forEach(btnConfig => {
    const button = createButton(btnConfig.text, btnConfig)
    group.appendChild(button)
  })

  return group
}

/**
 * Create an icon button (button with only icon, no text)
 * @param {string} icon - Material icon name
 * @param {Object} options - Button options
 * @returns {HTMLButtonElement} Icon button element
 */
export function createIconButton(icon, options = {}) {
  const button = createButton('', {
    ...options,
    icon,
    className: `btn-icon-only ${options.className || ''}`
  })

  // Remove empty text span
  const textSpan = button.querySelector('.btn-text')
  if (textSpan && !textSpan.textContent.trim()) {
    textSpan.remove()
  }

  return button
}

/**
 * Create a loading button (button that shows loading state on click)
 * @param {string} text - Button text
 * @param {Function} asyncAction - Async function to execute
 * @param {Object} options - Button options
 * @returns {HTMLButtonElement} Button element
 */
export function createAsyncButton(text, asyncAction, options = {}) {
  const button = createButton(text, {
    ...options,
    onClick: async (e) => {
      setButtonLoading(button, true)

      try {
        await asyncAction(e)
      } catch (error) {
        console.error('Async button action failed:', error)
        options.onError?.(error)
      } finally {
        setButtonLoading(button, false)
      }
    }
  })

  return button
}

/**
 * Create a toggle button
 * @param {string} text - Button text
 * @param {boolean} initialState - Initial toggle state
 * @param {Object} options - Button options
 * @returns {HTMLButtonElement} Toggle button element
 */
export function createToggleButton(text, initialState = false, options = {}) {
  const {
    onToggle = null,
    activeIcon = 'check_circle',
    inactiveIcon = 'radio_button_unchecked',
    ...buttonOptions
  } = options

  let isActive = initialState

  const button = createButton(text, {
    ...buttonOptions,
    icon: isActive ? activeIcon : inactiveIcon,
    variant: isActive ? 'primary' : 'secondary',
    onClick: (e) => {
      isActive = !isActive

      // Update appearance
      const iconSpan = button.querySelector('.btn-icon')
      if (iconSpan) {
        iconSpan.textContent = isActive ? activeIcon : inactiveIcon
      }

      button.classList.toggle('btn-primary', isActive)
      button.classList.toggle('btn-secondary', !isActive)
      button.setAttribute('aria-pressed', isActive)

      // Call toggle callback
      if (onToggle) {
        onToggle(isActive, e)
      }

      // Call original onClick if provided
      buttonOptions.onClick?.(e)
    }
  })

  button.setAttribute('aria-pressed', isActive)
  button.dataset.toggleState = isActive

  return button
}

/**
 * Button variants helper
 */
export const ButtonVariants = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  SUCCESS: 'success',
  WARNING: 'warning',
  GHOST: 'ghost',
  LINK: 'link'
}

/**
 * Button sizes helper
 */
export const ButtonSizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
}

export default {
  createButton,
  setButtonLoading,
  setButtonDisabled,
  createButtonGroup,
  createIconButton,
  createAsyncButton,
  createToggleButton,
  ButtonVariants,
  ButtonSizes
}
