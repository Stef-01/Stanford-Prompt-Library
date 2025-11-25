/**
 * Toast Notification Component
 * Non-blocking notifications for success/error messages
 */

import { Icon } from './Icon.js'

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `
    document.body.appendChild(container)
  }

  // Create toast element
  const toast = document.createElement('div')
  
  // Icon and colors based on type
  let iconName = 'info'
  let bgColor = 'var(--white-10)'
  let borderColor = 'var(--border-subtle)'
  
  if (type === 'success') {
    iconName = 'check_circle'
    bgColor = 'rgba(16, 185, 129, 0.1)'
    borderColor = 'rgba(16, 185, 129, 0.3)'
  } else if (type === 'error') {
    iconName = 'error'
    bgColor = 'rgba(239, 68, 68, 0.1)'
    borderColor = 'rgba(239, 68, 68, 0.3)'
  }

  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--background-dark);
    border: 1px solid ${borderColor};
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    min-width: 300px;
    max-width: 400px;
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: auto;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  `

  // Add background tint
  const tint = document.createElement('div')
  tint.style.cssText = `
    position: absolute;
    inset: 0;
    background: ${bgColor};
    border-radius: 12px;
    z-index: -1;
  `
  toast.appendChild(tint)

  // Content
  const content = `
    ${Icon({ name: iconName, className: type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-blue-500' })}
    <p style="margin: 0; font-size: 14px; font-weight: 500; color: var(--text-primary); line-height: 1.5;">${message}</p>
  `
  
  const contentWrapper = document.createElement('div')
  contentWrapper.style.cssText = 'display: flex; align-items: center; gap: 12px; width: 100%;'
  contentWrapper.innerHTML = content
  toast.appendChild(contentWrapper)

  container.appendChild(toast)

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)'
  })

  // Remove after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)'
    setTimeout(() => {
      toast.remove()
      if (container.childNodes.length === 0) {
        container.remove()
      }
    }, 400)
  }, duration)
}
