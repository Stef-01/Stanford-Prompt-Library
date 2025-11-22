/**
 * Desktop Window Management System
 * Provides draggable, resizable windows with desktop-like UI
 */

import { prefersReducedMotion } from '../animations/config.js'
import { getEasing } from '../animations/helpers.js'

let activeWindows = new Set()
let windowZIndex = 100
let isDragging = false
let currentWindow = null
let dragOffset = { x: 0, y: 0 }

/**
 * Initialize desktop window system
 */
export function initializeDesktopWindows() {
  // Make windows draggable with mouse
  document.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // Make windows draggable with touch (mobile)
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)

  console.log('Desktop window system initialized (mouse + touch)')
}

/**
 * Create a new desktop window
 * @param {string} id - Unique window identifier
 * @param {string} title - Window title
 * @param {string} icon - Window icon emoji
 * @param {Object} options - Window options (width, height, top, left, content)
 * @returns {HTMLElement} - The window element
 */
export function createWindow(id, title, icon, options = {}) {
  const {
    width = 700,
    height = 500,
    top = 100,
    left = 200,
    content = ''
  } = options

  const windowEl = document.createElement('div')
  windowEl.className = 'desktop-window'
  windowEl.id = `window-${id}`
  windowEl.style.width = `${width}px`
  windowEl.style.height = `${height}px`
  windowEl.style.top = `${top}px`
  windowEl.style.left = `${left}px`

  windowEl.innerHTML = `
    <div class="window-header" data-window-id="${id}">
      <div class="window-controls">
        <div class="window-control close" data-action="close" data-window-id="${id}"></div>
        <div class="window-control minimize" data-action="minimize" data-window-id="${id}"></div>
        <div class="window-control maximize" data-action="maximize" data-window-id="${id}"></div>
      </div>
      <span class="window-title">${icon} ${title}</span>
      <div style="width: 60px;"></div>
    </div>
    <div class="window-content" id="window-content-${id}">
      ${content}
    </div>
  `

  return windowEl
}

/**
 * Toggle window visibility
 * @param {string} windowId - Window identifier
 */
export function toggleWindow(windowId) {
  const windowEl = document.getElementById(`window-${windowId}`)
  if (!windowEl) return

  if (windowEl.classList.contains('active')) {
    closeWindow(windowId)
  } else {
    openWindow(windowId)
  }
}

/**
 * Open a window
 * @param {string} windowId - Window identifier
 */
export function openWindow(windowId) {
  const windowEl = document.getElementById(`window-${windowId}`)
  if (!windowEl) return

  // Get dock icon position for animation origin
  const dockIcon = document.querySelector(`.dock-icon[data-window="${windowId}"]`)

  windowEl.classList.add('active')
  activeWindows.add(windowId)
  bringToFront(windowEl)

  // Animate window open from dock icon position
  if (!prefersReducedMotion() && dockIcon) {
    const dockRect = dockIcon.getBoundingClientRect()
    const windowRect = windowEl.getBoundingClientRect()

    // Calculate transform origin (center of dock icon)
    const originX = dockRect.left + dockRect.width / 2 - windowRect.left
    const originY = dockRect.top + dockRect.height / 2 - windowRect.top

    windowEl.style.transformOrigin = `${originX}px ${originY}px`
    windowEl.style.willChange = 'transform, opacity'

    // Spring animation from dock icon
    windowEl.animate([
      {
        transform: 'scale(0)',
        opacity: 0
      },
      {
        transform: 'scale(1)',
        opacity: 1
      }
    ], {
      duration: 400,
      easing: getEasing('spring'),
      fill: 'forwards'
    }).onfinish = () => {
      windowEl.style.willChange = 'auto'
      windowEl.style.transformOrigin = ''
    }
  }
}

/**
 * Close a window
 * @param {string} windowId - Window identifier
 */
export function closeWindow(windowId) {
  const windowEl = document.getElementById(`window-${windowId}`)
  if (!windowEl) return

  // Get dock icon position for animation target
  const dockIcon = document.querySelector(`.dock-icon[data-window="${windowId}"]`)

  // Add closing animation class
  windowEl.classList.add('closing')

  // Animate window close to dock icon position
  if (!prefersReducedMotion() && dockIcon) {
    const dockRect = dockIcon.getBoundingClientRect()
    const windowRect = windowEl.getBoundingClientRect()

    // Calculate transform origin (center of dock icon)
    const originX = dockRect.left + dockRect.width / 2 - windowRect.left
    const originY = dockRect.top + dockRect.height / 2 - windowRect.top

    windowEl.style.transformOrigin = `${originX}px ${originY}px`
    windowEl.style.willChange = 'transform, opacity'

    // Scale down to dock icon
    windowEl.animate([
      {
        transform: 'scale(1)',
        opacity: 1
      },
      {
        transform: 'scale(0)',
        opacity: 0
      }
    ], {
      duration: 300,
      easing: getEasing('easeIn'),
      fill: 'forwards'
    }).onfinish = () => {
      windowEl.classList.remove('active', 'closing')
      activeWindows.delete(windowId)
      windowEl.style.willChange = 'auto'
      windowEl.style.transformOrigin = ''
    }
  } else {
    // Fallback for reduced motion
    setTimeout(() => {
      windowEl.classList.remove('active', 'closing')
      activeWindows.delete(windowId)
    }, 150)
  }
}

/**
 * Bring window to front
 * @param {HTMLElement} windowEl - Window element
 */
export function bringToFront(windowEl) {
  windowZIndex++
  windowEl.style.zIndex = windowZIndex
}

/**
 * Handle mouse down for dragging
 */
function handleMouseDown(e) {
  const header = e.target.closest('.window-header')
  if (!header) return

  // Don't drag if clicking on controls
  if (e.target.classList.contains('window-control')) {
    handleWindowControl(e.target)
    return
  }

  const windowEl = e.target.closest('.desktop-window')
  if (!windowEl) return

  isDragging = true
  currentWindow = windowEl
  bringToFront(windowEl)

  // Disable transitions during dragging for smooth movement
  currentWindow.classList.add('dragging')

  const rect = windowEl.getBoundingClientRect()
  dragOffset.x = e.clientX - rect.left
  dragOffset.y = e.clientY - rect.top

  document.body.style.userSelect = 'none'

  // Enhanced drag start animation
  if (!prefersReducedMotion()) {
    currentWindow.style.willChange = 'transform, box-shadow'
    currentWindow.animate([
      {
        transform: 'scale(1)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
      },
      {
        transform: 'scale(1.02)',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)'
      }
    ], {
      duration: 200,
      easing: getEasing('easeOut'),
      fill: 'forwards'
    })
  }
}

/**
 * Handle mouse move for dragging
 */
function handleMouseMove(e) {
  if (!isDragging || !currentWindow) return

  const x = e.clientX - dragOffset.x
  const y = e.clientY - dragOffset.y

  // Keep window within viewport
  const maxX = window.innerWidth - currentWindow.offsetWidth
  const maxY = window.innerHeight - currentWindow.offsetHeight

  currentWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px'
  currentWindow.style.top = Math.max(32, Math.min(y, maxY)) + 'px'
}

/**
 * Handle mouse up for dragging
 */
function handleMouseUp() {
  if (currentWindow) {
    // Re-enable transitions after dragging
    currentWindow.classList.remove('dragging')

    // Enhanced drag end animation
    if (!prefersReducedMotion()) {
      currentWindow.animate([
        {
          transform: 'scale(1.02)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)'
        },
        {
          transform: 'scale(1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }
      ], {
        duration: 300,
        easing: getEasing('spring'),
        fill: 'forwards'
      }).onfinish = () => {
        if (currentWindow) {
          currentWindow.style.willChange = 'auto'
        }
      }
    }
  }

  isDragging = false
  currentWindow = null
  document.body.style.userSelect = ''
}

/**
 * Store window's original size and position before maximizing
 */
const windowOriginalStates = new Map()

/**
 * Handle window control clicks
 * @param {HTMLElement} control - Control element
 */
function handleWindowControl(control) {
  const action = control.dataset.action
  const windowId = control.dataset.windowId

  switch (action) {
    case 'close':
      closeWindow(windowId)
      break
    case 'minimize':
      resize50Percent(windowId) // Yellow button = 50% screen size
      break
    case 'maximize':
      toggleMaximize(windowId) // Green button = fullscreen
      break
  }
}

/**
 * Resize window to 50% of screen size
 * @param {string} windowId - Window identifier
 */
function resize50Percent(windowId) {
  const windowEl = document.getElementById(`window-${windowId}`)
  if (!windowEl) return

  // Store original state if not already stored
  if (!windowOriginalStates.has(windowId)) {
    windowOriginalStates.set(windowId, {
      width: windowEl.style.width,
      height: windowEl.style.height,
      top: windowEl.style.top,
      left: windowEl.style.left
    })
  }

  // Remove maximized state if present
  windowEl.classList.remove('maximized')

  // Resize to 50% of viewport (dock auto-hides, so use full viewport)
  const width = Math.floor(window.innerWidth * 0.5)
  const height = Math.floor(window.innerHeight * 0.5)
  const top = Math.floor((window.innerHeight - height) / 2)
  const left = Math.floor((window.innerWidth - width) / 2)

  windowEl.style.width = `${width}px`
  windowEl.style.height = `${height}px`
  windowEl.style.top = `${top}px`
  windowEl.style.left = `${left}px`

  // Smooth transition
  if (!prefersReducedMotion()) {
    windowEl.style.transition = 'all 0.4s var(--ease-spring)'
    setTimeout(() => {
      windowEl.style.transition = ''
    }, 400)
  }
}

/**
 * Toggle window maximize state (fullscreen)
 * @param {string} windowId - Window identifier
 */
function toggleMaximize(windowId) {
  const windowEl = document.getElementById(`window-${windowId}`)
  if (!windowEl) return

  if (windowEl.classList.contains('maximized')) {
    // Restore original size
    windowEl.classList.remove('maximized')

    const originalState = windowOriginalStates.get(windowId)
    if (originalState) {
      windowEl.style.top = originalState.top
      windowEl.style.left = originalState.left
      windowEl.style.width = originalState.width
      windowEl.style.height = originalState.height
      windowOriginalStates.delete(windowId)
    }
  } else {
    // Store original state
    if (!windowOriginalStates.has(windowId)) {
      windowOriginalStates.set(windowId, {
        width: windowEl.style.width,
        height: windowEl.style.height,
        top: windowEl.style.top,
        left: windowEl.style.left
      })
    }

    // Maximize to fullscreen - seamless with notch, full height (dock auto-hides)
    windowEl.classList.add('maximized')
    windowEl.style.top = '0'
    windowEl.style.left = '0'
    windowEl.style.width = '100%'
    windowEl.style.height = '100vh' // Full height - dock auto-hides on hover
  }

  // Smooth transition
  if (!prefersReducedMotion()) {
    windowEl.style.transition = 'all 0.4s var(--ease-spring)'
    setTimeout(() => {
      windowEl.style.transition = ''
    }, 400)
  }
}

/**
 * Update clock in top bar
 */
export function updateClock() {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  const clockEl = document.getElementById('desktop-clock')
  if (clockEl) {
    clockEl.textContent = time
  }
}

/**
 * Start clock updates
 */
export function startClock() {
  updateClock()
  setInterval(updateClock, 1000)
}

/**
 * Handle touch start for mobile dragging
 */
function handleTouchStart(e) {
  const header = e.target.closest('.window-header')
  if (!header) return

  // Don't drag if tapping on controls
  if (e.target.classList.contains('window-control')) {
    handleWindowControl(e.target)
    return
  }

  const windowEl = e.target.closest('.desktop-window')
  if (!windowEl) return

  // Prevent default to avoid scrolling while dragging
  e.preventDefault()

  const touch = e.touches[0]
  isDragging = true
  currentWindow = windowEl
  bringToFront(windowEl)

  // Disable transitions during dragging for smooth movement
  currentWindow.classList.add('dragging')

  const rect = windowEl.getBoundingClientRect()
  dragOffset.x = touch.clientX - rect.left
  dragOffset.y = touch.clientY - rect.top

  // Enhanced drag start animation
  if (!prefersReducedMotion()) {
    currentWindow.style.willChange = 'transform, box-shadow'
    currentWindow.animate([
      {
        transform: 'scale(1)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
      },
      {
        transform: 'scale(1.02)',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)'
      }
    ], {
      duration: 200,
      easing: getEasing('easeOut'),
      fill: 'forwards'
    })
  }
}

/**
 * Handle touch move for mobile dragging
 */
function handleTouchMove(e) {
  if (!isDragging || !currentWindow) return

  // Prevent default to avoid scrolling while dragging
  e.preventDefault()

  const touch = e.touches[0]
  const x = touch.clientX - dragOffset.x
  const y = touch.clientY - dragOffset.y

  // Keep window within viewport
  const maxX = window.innerWidth - currentWindow.offsetWidth
  const maxY = window.innerHeight - currentWindow.offsetHeight

  currentWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px'
  currentWindow.style.top = Math.max(32, Math.min(y, maxY)) + 'px'
}

/**
 * Handle touch end for mobile dragging
 */
function handleTouchEnd() {
  if (currentWindow) {
    // Re-enable transitions after dragging
    currentWindow.classList.remove('dragging')

    // Enhanced drag end animation
    if (!prefersReducedMotion()) {
      currentWindow.animate([
        {
          transform: 'scale(1.02)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)'
        },
        {
          transform: 'scale(1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
        }
      ], {
        duration: 300,
        easing: getEasing('spring'),
        fill: 'forwards'
      }).onfinish = () => {
        if (currentWindow) {
          currentWindow.style.willChange = 'auto'
        }
      }
    }
  }

  isDragging = false
  currentWindow = null
}
