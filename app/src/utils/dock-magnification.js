/**
 * Dock Icon Magnification System
 * macOS-style dock magnification effect
 */

import { prefersReducedMotion } from '../animations/config.js'

let dockIcons = []
let isInitialized = false

/**
 * Initialize dock magnification effect
 */
export function initDockMagnification() {
  if (isInitialized || prefersReducedMotion()) return

  const dock = document.querySelector('.navbar-dock')
  if (!dock) return

  dockIcons = Array.from(dock.querySelectorAll('.dock-icon'))

  // Add mousemove listener to dock
  dock.addEventListener('mousemove', handleDockMouseMove)
  dock.addEventListener('mouseleave', handleDockMouseLeave)

  isInitialized = true
  console.log('✨ Dock magnification initialized')
}

/**
 * Handle mouse move over dock
 * @param {MouseEvent} e - Mouse event
 */
function handleDockMouseMove(e) {
  if (prefersReducedMotion()) return

  const dockRect = e.currentTarget.getBoundingClientRect()
  const mouseX = e.clientX

  dockIcons.forEach((icon) => {
    const iconRect = icon.getBoundingClientRect()
    const iconCenterX = iconRect.left + iconRect.width / 2

    // Calculate distance from mouse to icon center
    const distance = Math.abs(mouseX - iconCenterX)

    // Maximum influence distance (in pixels)
    const maxDistance = 150

    // Calculate scale based on distance
    let scale = 1
    let translateY = 0

    if (distance < maxDistance) {
      // Closer icons get bigger (max 1.5x, min 1x)
      const influence = 1 - distance / maxDistance
      scale = 1 + influence * 0.5 // Max scale: 1.5x

      // Also move up slightly
      translateY = -influence * 20 // Max -20px
    }

    // Apply transform with smooth transition
    icon.style.transform = `translateY(${translateY}px) scale(${scale})`
    icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  })
}

/**
 * Handle mouse leave from dock
 */
function handleDockMouseLeave() {
  if (prefersReducedMotion()) return

  // Reset all icons
  dockIcons.forEach((icon) => {
    icon.style.transform = 'translateY(0) scale(1)'
  })
}

/**
 * Cleanup dock magnification
 */
export function cleanupDockMagnification() {
  if (!isInitialized) return

  const dock = document.querySelector('.navbar-dock')
  if (dock) {
    dock.removeEventListener('mousemove', handleDockMouseMove)
    dock.removeEventListener('mouseleave', handleDockMouseLeave)
  }

  isInitialized = false
}
