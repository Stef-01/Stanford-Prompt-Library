import { toggleWindow, closeWindow, openWindow } from './desktop-windows.js'
import { Icon } from '../components/ui/Icon.js'

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
      <tr style="border-bottom: 1px solid var(--border-subtle);">
        <td style="padding: 12px 16px; color: var(--text-subtle); font-size: 14px;">
          <kbd style="background: var(--white-10); padding: 6px 12px; border-radius: 6px; font-family: 'Courier New', monospace;
                      color: var(--text-primary); border: 1px solid var(--border-subtle); font-weight: 500; font-size: 13px;">${modKey}+${key.toUpperCase()}</kbd>
        </td>
        <td style="padding: 12px 16px; color: var(--text-primary); font-size: 14px;">
          ${shortcut.label}
        </td>
      </tr>
    `).join('')

  modal.innerHTML = `
    <div style="background: var(--white-5); backdrop-filter: blur(20px); border: 1px solid var(--border-subtle);
                border-radius: 20px; padding: 40px; max-width: 600px; width: 90%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--white-10);
                      display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle);">
            ${Icon({ name: 'keyboard', className: 'text-white !text-[24px]' })}
          </div>
          <h2 style="margin: 0; color: var(--text-primary); font-size: 24px; font-weight: 700;">Keyboard Shortcuts</h2>
        </div>
        <button id="close-shortcuts-help" style="background: var(--white-5); border: 1px solid var(--border-subtle);
                                                  color: var(--text-primary); cursor: pointer; padding: 8px;
                                                  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
                                                  border-radius: 8px; transition: all 0.2s var(--ease-spring);">
          ${Icon({ name: 'close', className: '!text-[20px]' })}
        </button>
      </div>

      <!-- Shortcuts Table -->
      <div style="max-height: 400px; overflow-y: auto; margin-bottom: 24px; padding-right: 4px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-subtle); background: var(--white-5);">
              <th style="padding: 12px 16px; text-align: left; color: var(--text-subtle); font-size: 12px;
                         text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Shortcut</th>
              <th style="padding: 12px 16px; text-align: left; color: var(--text-subtle); font-size: 12px;
                         text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${shortcutsList}
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 12px 16px; color: var(--text-subtle); font-size: 14px;">
                <kbd style="background: var(--white-10); padding: 6px 12px; border-radius: 6px; font-family: 'Courier New', monospace;
                            color: var(--text-primary); border: 1px solid var(--border-subtle); font-weight: 500; font-size: 13px;">Esc</kbd>
              </td>
              <td style="padding: 12px 16px; color: var(--text-primary); font-size: 14px;">Close active window</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 12px 16px; color: var(--text-subtle); font-size: 14px;">
                <kbd style="background: var(--white-10); padding: 6px 12px; border-radius: 6px; font-family: 'Courier New', monospace;
                            color: var(--text-primary); border: 1px solid var(--border-subtle); font-weight: 500; font-size: 13px;">${modKey}+W</kbd>
              </td>
              <td style="padding: 12px 16px; color: var(--text-primary); font-size: 14px;">Close active window</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 12px 16px; color: var(--text-subtle); font-size: 14px;">
                <kbd style="background: var(--white-10); padding: 6px 12px; border-radius: 6px; font-family: 'Courier New', monospace;
                            color: var(--text-primary); border: 1px solid var(--border-subtle); font-weight: 500; font-size: 13px;">Alt+Tab</kbd>
              </td>
              <td style="padding: 12px 16px; color: var(--text-primary); font-size: 14px;">Cycle through windows</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: var(--text-subtle); font-size: 14px;">
                <kbd style="background: var(--white-10); padding: 6px 12px; border-radius: 6px; font-family: 'Courier New', monospace;
                            color: var(--text-primary); border: 1px solid var(--border-subtle); font-weight: 500; font-size: 13px;">${modKey}+Shift+?</kbd>
              </td>
              <td style="padding: 12px 16px; color: var(--text-primary); font-size: 14px;">Show this help</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid var(--border-subtle);">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          ${Icon({ name: 'info', className: '!text-[16px] text-[var(--text-subtle)]' })}
          <p style="margin: 0; color: var(--text-subtle); font-size: 13px;">
            Press <kbd style="background: var(--white-10); padding: 3px 8px; border-radius: 4px; font-family: 'Courier New', monospace;
                              border: 1px solid var(--border-subtle); font-size: 12px;">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  // Close handlers
  const closeBtn = modal.querySelector('#close-shortcuts-help')
  closeBtn.addEventListener('click', () => modal.remove())

  // Hover effects for close button
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = 'var(--white-10)'
    closeBtn.style.borderColor = 'var(--white-20)'
  })
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = 'var(--white-5)'
    closeBtn.style.borderColor = 'var(--border-subtle)'
  })

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
