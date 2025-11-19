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
import { deactivateBypass, isBypassActive } from '../utils/access-code.js'
import { initializeKeyboardShortcuts } from '../utils/keyboard-shortcuts.js'
import { initAnimationSystem } from '../animations/config.js'
import { initDockMagnification } from '../utils/dock-magnification.js'
import { initWallpaper } from '../services/wallpaper.js'

// Window render functions
import { renderExploreWindow } from './windows/ExploreWindow.js'
import { renderLeaderboardWindow } from './windows/LeaderboardWindow.js'
import { renderProfileWindow } from './windows/ProfileWindow.js'
import { renderAdminWindow } from './windows/AdminWindow.js'
import { renderLibraryWindow } from './windows/LibraryWindow.js'
import { renderSubmitWindow } from './windows/SubmitWindow.js'
import {
  renderGamesWindow,
  renderLearnWindow,
  renderSettingsWindow
} from './windows/PlaceholderWindows.js'
import { renderOpportunitiesWindow, initOpportunitiesWindow } from './windows/OpportunitiesWindow.js'
import { renderWallpaperWindow } from './windows/WallpaperWindow.js'

let userIsAdmin = false
let userData = null

/**
 * Render the main app for approved members
 */
export async function renderMainApp(container, user) {
  try {
    // Add desktop mode class to body
    document.body.classList.add('desktop-mode')

    console.log('🎨 Rendering main app for user:', user.display_name)

    // Store user data
    userData = user

    // Check if user is admin
    console.log('🔍 Checking admin status...')
    userIsAdmin = await isAdmin()
    console.log('✅ Admin status:', userIsAdmin)

    const isInBypassMode = isBypassActive()

    // Render desktop layout
    container.innerHTML = `
      <div class="desktop">
        <!-- Desktop Top Bar -->
        <div class="desktop-top-bar">
          <div class="desktop-top-bar-left">
            <span class="desktop-logo">📚 Stanford Prompt Library</span>
            ${isInBypassMode ? '<span style="margin-left: 10px; font-size: 11px; color: #f59e0b;">🔓 Testing Mode</span>' : ''}
          </div>
          <div class="desktop-top-bar-right">
            <span style="color: var(--text-secondary);">${userData.display_name || 'User'}</span>
            <span style="color: var(--text-secondary);">|</span>
            <span id="desktop-clock"></span>
          </div>
        </div>

        <!-- Desktop Area (Windows Container) -->
        <div class="desktop-area" id="desktop-area">
          <!-- Windows will be added here -->
        </div>

        <!-- Bottom Dock -->
        <nav class="navbar-dock">
          <div class="dock-icon" data-window="explore" title="Explore Prompts">
            <svg fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span class="dock-label">Explore</span>
          </div>
          <div class="dock-icon" data-window="library" title="My Library">
            <svg fill="none" stroke="#8b5cf6" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <span class="dock-label">Library</span>
          </div>
          <div class="dock-icon" data-window="submit" title="Submit Prompt">
            <svg fill="none" stroke="#10b981" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="dock-label">Submit</span>
          </div>
          <div class="dock-icon" data-window="leaderboard" title="Leaderboard">
            <svg fill="none" stroke="#eab308" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            <span class="dock-label">Leaderboard</span>
          </div>
          <div class="dock-icon" data-window="profile" title="Your Profile">
            <svg fill="none" stroke="#22c55e" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="dock-label">Profile</span>
          </div>
          <div class="dock-icon" data-window="games" title="Games & Challenges">
            <svg fill="none" stroke="#ec4899" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="dock-label">Games</span>
          </div>
          <div class="dock-icon" data-window="learn" title="Learn">
            <svg fill="none" stroke="#f59e0b" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <span class="dock-label">Learn</span>
          </div>
          <div class="dock-icon" data-window="opportunities" title="Opportunities">
            <svg fill="none" stroke="#06b6d4" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span class="dock-label">Opportunities</span>
          </div>
          ${userIsAdmin ? `
            <div class="dock-icon" data-window="admin" title="Admin Panel">
              <svg fill="none" stroke="#a855f7" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span class="dock-label">Admin</span>
            </div>
          ` : ''}
          <div class="dock-icon" data-window="wallpaper" title="Wallpaper">
            <svg fill="none" stroke="#7c3aed" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="dock-label">Wallpaper</span>
          </div>
          <div class="dock-icon" data-window="settings" title="Settings">
            <svg fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="dock-label">Settings</span>
          </div>
          <div class="dock-icon" data-action="signout" title="Sign Out">
            <svg fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="dock-label">Sign Out</span>
          </div>
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
    setupDockEventListeners(isInBypassMode)

    // Initialize dock magnification effect
    initDockMagnification()

    // Open Explore window by default
    openWindow('explore')

    console.log('✅ Desktop app rendered successfully!')

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
    { id: 'explore', title: 'Explore Prompts', icon: '🔍', width: 900, height: 600, top: 80, left: 150 },
    { id: 'library', title: 'My Library', icon: '📚', width: 800, height: 600, top: 100, left: 200 },
    { id: 'submit', title: 'Submit Prompt', icon: '✨', width: 700, height: 650, top: 120, left: 250 },
    { id: 'leaderboard', title: 'Leaderboard', icon: '🏆', width: 700, height: 550, top: 140, left: 300 },
    { id: 'profile', title: 'Profile', icon: '👤', width: 650, height: 600, top: 160, left: 350 },
    { id: 'games', title: 'Games', icon: '🎮', width: 700, height: 550, top: 180, left: 400 },
    { id: 'learn', title: 'Learn', icon: '📖', width: 700, height: 550, top: 200, left: 450 },
    { id: 'opportunities', title: 'Opportunities', icon: '💼', width: 700, height: 550, top: 220, left: 500 },
    { id: 'wallpaper', title: 'Desktop Wallpaper', icon: '🎨', width: 600, height: 600, top: 120, left: 250 },
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
        await renderLibraryWindow(contentContainer, userData)
        break
      case 'submit':
        await renderSubmitWindow(contentContainer, userData, () => {
          // Refresh library window after successful submission
          const libraryContent = document.getElementById('window-content-library')
          if (libraryContent) {
            renderLibraryWindow(libraryContent, userData)
          }
        })
        break
      case 'leaderboard':
        await renderLeaderboardWindow(contentContainer)
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
      case 'wallpaper':
        renderWallpaperWindow(contentContainer)
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
 * Set up dock icon event listeners
 */
function setupDockEventListeners(isInBypassMode) {
  const dockIcons = document.querySelectorAll('.dock-icon')

  dockIcons.forEach(icon => {
    icon.addEventListener('click', async () => {
      const windowId = icon.dataset.window
      const action = icon.dataset.action

      // Handle sign out
      if (action === 'signout') {
        const confirmSignout = confirm(isInBypassMode
          ? 'Exit testing mode and return to sign-in?'
          : 'Are you sure you want to sign out?')

        if (confirmSignout) {
          if (isInBypassMode) {
            deactivateBypass()
            window.location.reload()
          } else {
            await signOut()
          }
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
