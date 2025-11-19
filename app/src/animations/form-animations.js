/**
 * Form Animation Utilities
 * Enhanced form field interactions and feedback
 */

import { prefersReducedMotion } from './config.js'
import { getEasing } from './helpers.js'

/**
 * Initialize form field animations for all inputs in a container
 * @param {HTMLElement} container - Container element with form fields
 */
export function initFormAnimations(container) {
  if (!container) return

  const inputs = container.querySelectorAll('input, textarea, select')

  inputs.forEach(input => {
    // Skip file inputs
    if (input.type === 'file') return

    // Enhanced focus animation
    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)

    // Add wrapper for label animation if label exists
    const label = container.querySelector(`label[for="${input.id}"]`)
    if (label && !label.classList.contains('animated-label')) {
      enhanceLabelAnimation(input, label)
    }
  })

  // Initialize button animations
  const buttons = container.querySelectorAll('button, .btn-primary, .btn-secondary')
  buttons.forEach(btn => {
    initButtonAnimation(btn)
  })

  console.log('✨ Form animations initialized')
}

/**
 * Handle input focus with animation
 * @param {FocusEvent} e - Focus event
 */
function handleFocus(e) {
  const input = e.target

  if (prefersReducedMotion()) {
    input.style.borderColor = 'var(--accent-blue)'
    return
  }

  input.animate([
    {
      borderColor: 'var(--border-color)',
      boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
      transform: 'scale(1)'
    },
    {
      borderColor: 'var(--accent-blue)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
      transform: 'scale(1.01)'
    }
  ], {
    duration: 300,
    easing: getEasing('spring'),
    fill: 'forwards'
  })
}

/**
 * Handle input blur
 * @param {FocusEvent} e - Blur event
 */
function handleBlur(e) {
  const input = e.target

  if (prefersReducedMotion()) {
    input.style.borderColor = ''
    return
  }

  input.animate([
    {
      borderColor: 'var(--accent-blue)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
      transform: 'scale(1.01)'
    },
    {
      borderColor: 'var(--border-color)',
      boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
      transform: 'scale(1)'
    }
  ], {
    duration: 200,
    easing: getEasing('easeOut'),
    fill: 'forwards'
  })
}

/**
 * Show error on input field with shake animation
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message
 */
export function showInputError(input, message = '') {
  if (!input) return

  input.classList.add('error')

  if (!prefersReducedMotion()) {
    input.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' }
    ], {
      duration: 400,
      easing: 'ease-in-out'
    })
  }

  // Optionally show error message
  if (message) {
    let errorEl = input.parentElement?.querySelector('.error-message')
    if (!errorEl) {
      errorEl = document.createElement('div')
      errorEl.className = 'error-message'
      errorEl.style.cssText = `
        color: var(--accent-red);
        font-size: 12px;
        margin-top: 4px;
        opacity: 0;
      `
      input.parentElement?.appendChild(errorEl)
    }
    errorEl.textContent = message

    if (!prefersReducedMotion()) {
      errorEl.animate([
        { opacity: 0, transform: 'translateY(-5px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 200,
        easing: getEasing('easeOut'),
        fill: 'forwards'
      })
    } else {
      errorEl.style.opacity = '1'
    }
  }
}

/**
 * Show success on input field with pulse animation
 * @param {HTMLElement} input - Input element
 */
export function showInputSuccess(input) {
  if (!input) return

  input.classList.remove('error')
  input.classList.add('success')

  // Remove error message if exists
  const errorEl = input.parentElement?.querySelector('.error-message')
  if (errorEl) {
    errorEl.remove()
  }

  if (!prefersReducedMotion()) {
    input.animate([
      {
        boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)',
        borderColor: 'var(--accent-green)'
      },
      {
        boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)',
        borderColor: 'var(--accent-green)'
      }
    ], {
      duration: 600,
      easing: 'ease-out'
    })
  }

  // Auto-remove success class after animation
  setTimeout(() => {
    input.classList.remove('success')
  }, 600)
}

/**
 * Clear input validation state
 * @param {HTMLElement} input - Input element
 */
export function clearInputState(input) {
  if (!input) return

  input.classList.remove('error', 'success')

  const errorEl = input.parentElement?.querySelector('.error-message')
  if (errorEl) {
    errorEl.remove()
  }
}

/**
 * Enhance label with float animation
 * @param {HTMLElement} input - Input element
 * @param {HTMLElement} label - Label element
 */
function enhanceLabelAnimation(input, label) {
  label.classList.add('animated-label')

  // Check if input has value on init
  const updateLabelPosition = () => {
    if (input.value || document.activeElement === input) {
      label.style.transform = 'translateY(-20px) scale(0.85)'
      label.style.color = 'var(--accent-blue)'
    } else {
      label.style.transform = 'translateY(0) scale(1)'
      label.style.color = 'var(--text-secondary)'
    }
  }

  input.addEventListener('focus', updateLabelPosition)
  input.addEventListener('blur', updateLabelPosition)
  input.addEventListener('input', updateLabelPosition)

  updateLabelPosition()
}

/**
 * Initialize button animation with ripple effect
 * @param {HTMLElement} button - Button element
 */
function initButtonAnimation(button) {
  // Add ripple effect on click
  button.addEventListener('click', (e) => {
    if (prefersReducedMotion()) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement('span')
    ripple.className = 'button-ripple'
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
    `

    button.style.position = 'relative'
    button.style.overflow = 'hidden'
    button.appendChild(ripple)

    ripple.animate([
      { width: '0px', height: '0px', opacity: 1 },
      { width: '300px', height: '300px', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => {
      ripple.remove()
    }
  })
}

/**
 * Set button loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} loading - Loading state
 */
export function setButtonLoading(button, loading = true) {
  if (!button) return

  if (loading) {
    button.classList.add('loading')
    button.disabled = true

    const originalText = button.textContent
    button.dataset.originalText = originalText

    // Add spinner
    const spinner = document.createElement('span')
    spinner.className = 'button-spinner'
    spinner.style.cssText = `
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-left: 8px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    `
    button.appendChild(spinner)
  } else {
    button.classList.remove('loading')
    button.disabled = false

    const spinner = button.querySelector('.button-spinner')
    if (spinner) {
      spinner.remove()
    }
  }
}

/**
 * Validate form with animations
 * @param {HTMLFormElement} form - Form element
 * @returns {boolean} - Whether form is valid
 */
export function validateFormWithAnimations(form) {
  if (!form) return false

  let isValid = true
  const inputs = form.querySelectorAll('input[required], textarea[required], select[required]')

  inputs.forEach(input => {
    if (input.type === 'file') return

    if (!input.value.trim()) {
      showInputError(input, 'This field is required')
      isValid = false
    } else {
      showInputSuccess(input)
    }
  })

  return isValid
}
