import { toggleWindow, closeWindow, openWindow } from './desktop-windows.js'

/**
 * Keyboard Shortcuts System
 * Provides keyboard navigation for desktop windows
 */

const shortcuts = {
  // Window shortcuts (Ctrl/Cmd + key)
  'e': { window: 'explore', label: 'Explore Prompts' },
  'l': { window: 'library', label: 'My Library' },
  's': { window: 'submit', label: 'Submit Prompt' },
  'b': { window: 'leaderboard', label: 'Leaderboard' },
  'p': { window: 'profile', label: 'Profile' },
  'g': { window: 'games', label: 'Games' },
  'h': { window: 'learn', label: 'Learn (Help)' },
  'o': { window: 'opportunities', label: 'Opportunities' },
  ',': { window: 'settings', label: 'Settings' },
  'a': { window: 'admin', label: 'Admin Panel', requiresAdmin: true }
}

let isInitialized = false
let activeWindows = []
let currentWindowIndex = 0

/**
 * Initialize keyboard shortcuts system
 * @param {boolean} userIsAdmin - Whether user has admin privileges
 */
export function initializeKeyboardShortcuts(userIsAdmin = false) {
  if (isInitialized) return

  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + key shortcuts
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      const shortcut = shortcuts[e.key.toLowerCase()]

      if (shortcut) {
        // Check admin requirement
        if (shortcut.requiresAdmin && !userIsAdmin) {
          return
        }

        e.preventDefault()
        toggleWindow(shortcut.window)
        console.log(`🎹 Keyboard shortcut: ${shortcut.label}`)
        return
      }
    }

    // Escape to close active window
    if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey) {
      const activeWindow = getActiveWindow()
      if (activeWindow) {
        e.preventDefault()
        const windowId = activeWindow.id.replace('window-', '')
        closeWindow(windowId)
        console.log(`🎹 Closed window with Escape`)
      }
    }

    // Alt/Option + Tab to cycle through windows
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault()
      cycleWindows(e.shiftKey ? -1 : 1)
      console.log(`🎹 Cycling through windows`)
    }

    // Ctrl/Cmd + W to close active window
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      const activeWindow = getActiveWindow()
      if (activeWindow) {
        e.preventDefault()
        const windowId = activeWindow.id.replace('window-', '')
        closeWindow(windowId)
        console.log(`🎹 Closed window with Ctrl+W`)
      }
    }

    // Ctrl/Cmd + Shift + ? to show shortcuts help
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
      e.preventDefault()
      showShortcutsHelp(userIsAdmin)
    }
  })

  isInitialized = true
  console.log('⌨️ Keyboard shortcuts initialized')
}

/**
 * Get the currently active (top-most) window
 */
function getActiveWindow() {
  const windows = Array.from(document.querySelectorAll('.desktop-window.active'))
  if (windows.length === 0) return null

  // Find window with highest z-index
  return windows.reduce((highest, current) => {
    const currentZ = parseInt(current.style.zIndex || 0)
    const highestZ = parseInt(highest.style.zIndex || 0)
    return currentZ > highestZ ? current : highest
  })
}

/**
 * Cycle through open windows
 * @param {number} direction - 1 for forward, -1 for backward
 */
function cycleWindows(direction = 1) {
  const windows = Array.from(document.querySelectorAll('.desktop-window.active'))
  if (windows.length === 0) return

  // Sort windows by z-index
  windows.sort((a, b) => {
    const aZ = parseInt(a.style.zIndex || 0)
    const bZ = parseInt(b.style.zIndex || 0)
    return bZ - aZ
  })

  // Get current index
  const activeWindow = getActiveWindow()
  let currentIndex = windows.indexOf(activeWindow)

  // Calculate next index
  currentIndex = (currentIndex + direction + windows.length) % windows.length

  // Focus next window
  const nextWindow = windows[currentIndex]
  if (nextWindow) {
    const windowId = nextWindow.id.replace('window-', '')
    openWindow(windowId) // This will bring it to front
  }
}

/**
 * Show keyboard shortcuts help modal
 * @param {boolean} userIsAdmin - Whether user has admin privileges
 */
function showShortcutsHelp(userIsAdmin = false) {
  // Remove existing modal if present
  const existingModal = document.getElementById('shortcuts-help-modal')
  if (existingModal) {
    existingModal.remove()
    return
  }

  const modal = document.createElement('div')
  modal.id = 'shortcuts-help-modal'
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'

  const shortcutsList = Object.entries(shortcuts)
    .filter(([key, shortcut]) => !shortcut.requiresAdmin || userIsAdmin)
    .map(([key, shortcut]) => `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <td style="padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">
          <kbd style="background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: var(--text-primary);">${modKey}+${key.toUpperCase()}</kbd>
        </td>
        <td style="padding: 8px 12px; color: var(--text-primary); font-size: 13px;">
          ${shortcut.label}
        </td>
      </tr>
    `).join('')

  modal.innerHTML = `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: var(--text-primary); font-size: 20px;">⌨️ Keyboard Shortcuts</h2>
        <button id="close-shortcuts-help" style="background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">
          ×
        </button>
      </div>

      <!-- Shortcuts Table -->
      <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color);">
              <th style="padding: 8px 12px; text-align: left; color: var(--text-secondary); font-size: 11px; text-transform: uppercase; font-weight: 600;">Shortcut</th>
              <th style="padding: 8px 12px; text-align: left; color: var(--text-secondary); font-size: 11px; text-transform: uppercase; font-weight: 600;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${shortcutsList}
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <td style="padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">
                <kbd style="background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: var(--text-primary);">Esc</kbd>
              </td>
              <td style="padding: 8px 12px; color: var(--text-primary); font-size: 13px;">Close active window</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <td style="padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">
                <kbd style="background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: var(--text-primary);">${modKey}+W</kbd>
              </td>
              <td style="padding: 8px 12px; color: var(--text-primary); font-size: 13px;">Close active window</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <td style="padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">
                <kbd style="background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: var(--text-primary);">Alt+Tab</kbd>
              </td>
              <td style="padding: 8px 12px; color: var(--text-primary); font-size: 13px;">Cycle through windows</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: var(--text-secondary); font-size: 13px;">
                <kbd style="background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: var(--text-primary);">${modKey}+Shift+?</kbd>
              </td>
              <td style="padding: 8px 12px; color: var(--text-primary); font-size: 13px;">Show this help</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 15px; border-top: 1px solid var(--border-color);">
        <p style="margin: 0; color: var(--text-secondary); font-size: 12px;">
          Press <kbd style="background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 3px;">Esc</kbd> or click outside to close
        </p>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Close handlers
  const closeBtn = modal.querySelector('#close-shortcuts-help')
  closeBtn.addEventListener('click', () => modal.remove())

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })

  document.addEventListener('keydown', function closeOnEsc(e) {
    if (e.key === 'Escape') {
      modal.remove()
      document.removeEventListener('keydown', closeOnEsc)
    }
  })
}

/**
 * Show keyboard shortcut indicator (optional visual feedback)
 * @param {string} shortcutText - Shortcut to display
 * @param {string} action - Action description
 */
export function showShortcutIndicator(shortcutText, action) {
  const indicator = document.createElement('div')
  indicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    font-size: 16px;
    z-index: 10001;
    pointer-events: none;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.2s;
  `

  indicator.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 24px; margin-bottom: 10px; font-weight: 600;">${shortcutText}</div>
      <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7);">${action}</div>
    </div>
  `

  document.body.appendChild(indicator)

  // Fade in
  setTimeout(() => {
    indicator.style.opacity = '1'
  }, 10)

  // Fade out and remove
  setTimeout(() => {
    indicator.style.opacity = '0'
    setTimeout(() => indicator.remove(), 200)
  }, 1500)
}
