import { signOut } from '../services/auth.js'
import { isAdmin } from '../services/admin.js'
import {
  initializeDesktopWindows,
  createWindow,
  toggleWindow,
  openWindow,
  closeWindow,
  startClock
} from '../utils/desktop-windows.js'
import { initializeKeyboardShortcuts } from '../utils/keyboard-shortcuts.js'
import { initAnimationSystem } from '../animations/config.js'
import { initDockMagnification } from '../utils/dock-magnification.js'
import { initWallpaper } from '../services/wallpaper.js'
import { initMobileDetection, isMobileDevice } from '../utils/mobile-detection.js'
import { renderMobileNavigation, setActiveNavItem } from './MobileNavigation.js'
import { createLogger } from '../utils/logger.js'

const log = createLogger('MainApp')

// Window render functions
import { renderExploreWindow } from './windows/ExploreWindow.js'
import { renderLeaderboardWindow as renderLeaderboard } from './leaderboard/LeaderboardWindow.refactored.js'
import { renderProfileWindow } from './windows/ProfileWindow.js'
import { renderAdminWindow } from './windows/AdminWindow.js'
import { renderLibraryWindow as renderLibrary } from './library/LibraryWindow.refactored.js'
import { renderSubmitWindow } from './windows/SubmitWindow.js'
import {
  renderGamesWindow,
  renderLearnWindow,
  renderSettingsWindow
} from './windows/PlaceholderWindows.js'
import { renderOpportunitiesWindow, initOpportunitiesWindow } from './windows/OpportunitiesWindow.js'

let userIsAdmin = false
let userData = null

/**
 * Render the main app for approved members
 */
export async function renderMainApp(container, user) {
  try {
    // Initialize mobile detection and add appropriate mode classes
    const viewport = initMobileDetection()
    log.debug('📱 Viewport detected:', viewport.deviceType)

    log.debug('🎨 Rendering main app for user:', user.display_name)

    // Store user data
    userData = user

    // Check if user is admin
    log.debug('🔍 Checking admin status...')
    userIsAdmin = await isAdmin()
    log.debug('✅ Admin status:', userIsAdmin)

    // Render desktop layout
    container.innerHTML = `
      <div class="desktop">
        <!-- Desktop Notch Navigation - No Solid Bar -->
        <div class="desktop-notches">
          <!-- Center Logo Notch -->
          <div class="desktop-notch-center">
            <span class="material-symbols-outlined" style="font-size: 20px; margin-right: 8px;">grid_view</span>
            <span class="desktop-logo">Stanford Prompt Library</span>
          </div>

          <!-- Right Controls Notch -->
          <div class="desktop-notch-right">
            <span id="desktop-clock" style="color: var(--text-subtle); font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums;"></span>
            <div style="width: 1px; height: 24px; background: var(--border-subtle);"></div>
            <button class="desktop-top-bar-btn" title="Profile" data-window="profile">
              <span class="material-symbols-outlined" style="font-size: 20px;">person</span>
            </button>
            ${userIsAdmin ? `
            <button class="desktop-top-bar-btn admin-btn" title="Admin Panel" data-window="admin" style="color: var(--primary); animation: pulse 2s ease-in-out infinite;">
              <span class="material-symbols-outlined" style="font-size: 20px;">shield_person</span>
            </button>
            ` : ''}
            <button class="desktop-top-bar-btn" title="Settings" data-window="settings">
              <span class="material-symbols-outlined" style="font-size: 20px;">settings</span>
            </button>
            <button class="desktop-top-bar-btn" title="Sign Out" data-action="signout" style="color: var(--text-subtle); transition: color 0.2s ease;">
              <span class="material-symbols-outlined" style="font-size: 20px;">logout</span>
            </button>
          </div>
        </div>

        <!-- Desktop Area (Windows Container) -->
        <div class="desktop-area" id="desktop-area">
          <!-- Windows will be added here -->
        </div>

        <!-- Bottom Dock - Monochrome Design -->
        <nav class="navbar-dock">
          <div class="dock-icon" data-window="explore" title="Explore">
            <span class="material-symbols-outlined">explore</span>
            <span class="dock-label">Explore</span>
          </div>
          <div class="dock-icon" data-window="library" title="Library">
            <span class="material-symbols-outlined">auto_stories</span>
            <span class="dock-label">Library</span>
          </div>
          <div class="dock-icon dock-icon-primary" data-window="submit" title="Submit">
            <span class="material-symbols-outlined">add</span>
            <span class="dock-label">Submit</span>
          </div>
          <div class="dock-icon" data-window="leaderboard" title="Leaderboard">
            <span class="material-symbols-outlined">leaderboard</span>
            <span class="dock-label">Leaderboard</span>
          </div>
          <div class="dock-icon" data-window="profile" title="Profile">
            <span class="material-symbols-outlined">person</span>
            <span class="dock-label">Profile</span>
          </div>
          <div class="dock-icon" data-window="games" title="Games">
            <span class="material-symbols-outlined">sports_esports</span>
            <span class="dock-label">Games</span>
          </div>
          <div class="dock-icon" data-window="learn" title="Learn">
            <span class="material-symbols-outlined">school</span>
            <span class="dock-label">Learn</span>
          </div>
          <div class="dock-icon" data-window="opportunities" title="Opportunities">
            <span class="material-symbols-outlined">work_outline</span>
            <span class="dock-label">Opportunities</span>
          </div>
          ${userIsAdmin ? `
            <div class="dock-icon" data-window="admin" title="Admin">
              <span class="material-symbols-outlined">shield</span>
              <span class="dock-label">Admin</span>
            </div>
          ` : ''}
        </nav>
      </div>
    `

    // Initialize animation system
    initAnimationSystem()

    // Initialize wallpaper system
    initWallpaper()

    // Initialize desktop window system
    initializeDesktopWindows()

    // Start the desktop clock
    startClock()

    // Initialize keyboard shortcuts
    initializeKeyboardShortcuts(userIsAdmin)

    // Create all windows
    await createAllWindows()

    // Attach dock icon event listeners
    setupDockEventListeners()

    // Initialize dock magnification effect
    initDockMagnification()

    // Render mobile navigation
    log.debug('📱 Rendering mobile navigation...')
    renderMobileNavigation(document.body, userData, userIsAdmin)

    // Open Explore window by default
    openWindow('explore')

    // Set initial active nav item for mobile
    setActiveNavItem('explore')

    log.debug('✅ Desktop app rendered successfully!')

  } catch (error) {
    console.error('❌ Error rendering main app:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })

    // Show error to user
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--bg-primary);">
        <div style="max-width: 600px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 3rem; text-align: center;">
          <h1 style="color: var(--accent-red); margin-bottom: 1rem;">❌ Error Loading App</h1>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">
            Failed to load the main application. This might be due to:
          </p>
          <ul style="text-align: left; color: var(--text-secondary); margin-bottom: 2rem;">
            <li>Missing seed data in database (run seed SQL)</li>
            <li>Database connection issues</li>
            <li>Browser console has more details (press F12)</li>
          </ul>
          <pre style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; overflow: auto; text-align: left; color: var(--accent-red); margin-bottom: 2rem; font-size: 0.875rem;">
${error.message}
          </pre>
          <button onclick="window.location.reload()" class="btn-primary" style="padding: 0.75rem 1.5rem; background: var(--accent-blue); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Reload Page
          </button>
        </div>
      </div>
    `
  }
}

/**
 * Create all desktop windows
 */
async function createAllWindows() {
  const desktopArea = document.getElementById('desktop-area')
  if (!desktopArea) return

  // Window definitions
  const windows = [
    { id: 'explore', title: 'Explore', icon: '🔍', width: 900, height: 600, top: 80, left: 150 },
    { id: 'library', title: 'My Library', icon: '📚', width: 800, height: 600, top: 100, left: 200 },
    { id: 'submit', title: 'Submit Prompt', icon: '✨', width: 700, height: 650, top: 120, left: 250 },
    { id: 'leaderboard', title: 'Leaderboard', icon: '🏆', width: 700, height: 550, top: 140, left: 300 },
    { id: 'profile', title: 'Profile', icon: '👤', width: 650, height: 600, top: 160, left: 350 },
    { id: 'games', title: 'Bear Invaders', icon: '🐻', width: 850, height: 680, top: 60, left: 250 },
    { id: 'learn', title: 'Learn', icon: '📖', width: 700, height: 550, top: 200, left: 450 },
    { id: 'opportunities', title: 'Opportunities', icon: '💼', width: 700, height: 550, top: 220, left: 500 },
    { id: 'settings', title: 'Settings', icon: '⚙️', width: 600, height: 550, top: 240, left: 550 }
  ]

  // Add admin window if user is admin
  if (userIsAdmin) {
    windows.push({
      id: 'admin',
      title: 'Admin Panel',
      icon: '🛡️',
      width: 900,
      height: 650,
      top: 60,
      left: 100
    })
  }

  // Create each window
  for (const windowDef of windows) {
    const windowEl = createWindow(windowDef.id, windowDef.title, windowDef.icon, {
      width: windowDef.width,
      height: windowDef.height,
      top: windowDef.top,
      left: windowDef.left
    })

    desktopArea.appendChild(windowEl)

    // Render content into window
    const contentContainer = document.getElementById(`window-content-${windowDef.id}`)
    if (contentContainer) {
      await renderWindowContent(windowDef.id, contentContainer)
    }
  }
}

/**
 * Render content for a specific window
 */
async function renderWindowContent(windowId, contentContainer) {
  try {
    switch (windowId) {
      case 'explore':
        await renderExploreWindow(contentContainer)
        break
      case 'library':
        await renderLibrary(contentContainer, userData)
        break
      case 'submit':
        await renderSubmitWindow(contentContainer, userData, () => {
          // Refresh library window after successful submission
          const libraryContent = document.getElementById('window-content-library')
          if (libraryContent) {
            renderLibrary(libraryContent, userData)
          }
        })
        break
      case 'leaderboard':
        await renderLeaderboard(contentContainer)
        break
      case 'profile':
        await renderProfileWindow(contentContainer, userData)
        break
      case 'admin':
        if (userIsAdmin) {
          await renderAdminWindow(contentContainer, userData)
        }
        break
      case 'games':
        renderGamesWindow(contentContainer)
        break
      case 'learn':
        renderLearnWindow(contentContainer)
        break
      case 'opportunities':
        contentContainer.innerHTML = await renderOpportunitiesWindow()
        await initOpportunitiesWindow()
        break
      case 'settings':
        renderSettingsWindow(contentContainer, userData)
        break
    }
  } catch (error) {
    console.error(`Error rendering ${windowId} window:`, error)
    contentContainer.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
        <h3 style="color: var(--text-primary); margin-bottom: 10px;">Error Loading Content</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">${error.message}</p>
      </div>
    `
  }
}

/**
 * Set up dock icon and top bar event listeners
 */
function setupDockEventListeners() {
  // Dock icons
  const dockIcons = document.querySelectorAll('.dock-icon')
  dockIcons.forEach(icon => {
    icon.addEventListener('click', async () => {
      const windowId = icon.dataset.window
      const action = icon.dataset.action

      // Handle sign out
      if (action === 'signout') {
        const confirmSignout = confirm('Are you sure you want to sign out?')

        if (confirmSignout) {
          await signOut()
        }
        return
      }

      // Handle window toggle
      if (windowId) {
        toggleWindow(windowId)
      }
    })
  })

  // Top bar buttons
  const topBarBtns = document.querySelectorAll('.desktop-top-bar-btn')
  topBarBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const windowId = btn.dataset.window
      const action = btn.dataset.action

      // Handle sign out
      if (action === 'signout') {
        const confirmSignout = confirm('Are you sure you want to sign out?')

        if (confirmSignout) {
          await signOut()
        }
        return
      }

      // Handle window toggle
      if (windowId) {
        toggleWindow(windowId)
      }
    })
  })
}
