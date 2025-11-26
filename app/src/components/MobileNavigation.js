/**
 * Mobile Navigation Component
 * Provides a hamburger menu and mobile-optimized navigation experience
 */

import { Icon } from './ui/Icon.js'
import { toggleWindow, openWindow, closeAllWindows } from '../utils/desktop-windows.js'

let isMenuOpen = false
let currentSection = 'explore'

/**
 * Render Mobile Navigation
 */
export function renderMobileNavigation(container, userData, isAdmin = false) {
  console.log('📱 Rendering mobile navigation')

  const navHTML = `
    <!-- Mobile Navigation Overlay -->
    <div id="mobile-nav-overlay" class="mobile-nav-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 9998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    ">
    </div>

    <!-- Mobile Navigation Menu -->
    <div id="mobile-nav-menu" class="mobile-nav-menu" style="
      position: fixed;
      top: 0;
      right: -100%;
      width: 80%;
      max-width: 320px;
      height: 100%;
      background: var(--background-dark);
      border-left: 1px solid var(--border-subtle);
      z-index: 9999;
      overflow-y: auto;
      transition: right 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
    ">
      <!-- Mobile Menu Header -->
      <div style="
        padding: 24px;
        border-bottom: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div>
          <h2 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            Menu
          </h2>
          <p style="font-size: 14px; color: var(--text-subtle);">
            ${userData.display_name}
          </p>
        </div>
        <button id="mobile-nav-close" style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--white-10);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          ${Icon({ name: 'close', className: 'text-white !text-[20px]' })}
        </button>
      </div>

      <!-- Mobile Menu Items -->
      <div style="padding: 16px 0;">
        <!-- Primary Navigation -->
        <div style="padding: 0 12px; margin-bottom: 8px;">
          <p style="
            font-size: 12px;
            font-weight: 600;
            color: var(--text-subtle);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px;
          ">
            Navigation
          </p>
        </div>

        <button class="mobile-nav-item" data-window="explore" data-section="explore" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'explore', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              Explore
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Discover prompts
            </div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="library" data-section="library" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'auto_stories', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              My Library
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Your saved prompts
            </div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="submit" data-section="submit" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'add_circle', className: 'text-primary !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--primary);">
              Submit Prompt
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Share your prompt
            </div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="leaderboard" data-section="leaderboard" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'leaderboard', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              Leaderboard
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Top contributors
            </div>
          </div>
        </button>

        <!-- Divider -->
        <div style="height: 1px; background: var(--border-subtle); margin: 12px 0;"></div>

        <!-- Secondary Navigation -->
        <div style="padding: 0 12px; margin-bottom: 8px; margin-top: 16px;">
          <p style="
            font-size: 12px;
            font-weight: 600;
            color: var(--text-subtle);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px;
          ">
            More
          </p>
        </div>

        <button class="mobile-nav-item" data-window="profile" data-section="profile" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'person', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              Profile
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Your account
            </div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="opportunities" data-section="opportunities" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'work_outline', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              Opportunities
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Jobs & internships
            </div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="games" data-section="games" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'sports_esports', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              Games
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Bear Invaders
            </div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="learn" data-section="learn" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'school', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              Learn
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Tutorials & guides
            </div>
          </div>
        </button>

        ${isAdmin ? `
          <!-- Divider -->
          <div style="height: 1px; background: var(--border-subtle); margin: 12px 0;"></div>

          <button class="mobile-nav-item" data-window="admin" data-section="admin" style="
            width: 100%;
            padding: 16px 24px;
            background: transparent;
            border: none;
            display: flex;
            align-items: center;
            gap: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
          ">
            ${Icon({ name: 'shield_person', className: 'text-primary !text-[24px]' })}
            <div style="flex: 1; text-align: left;">
              <div style="font-size: 15px; font-weight: 600; color: var(--primary);">
                Admin Panel
              </div>
              <div style="font-size: 12px; color: var(--text-subtle);">
                Manage submissions
              </div>
            </div>
          </button>
        ` : ''}

        <!-- Divider -->
        <div style="height: 1px; background: var(--border-subtle); margin: 12px 0;"></div>

        <button class="mobile-nav-item" data-window="settings" data-section="settings" style="
          width: 100%;
          padding: 16px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        ">
          ${Icon({ name: 'settings', className: 'text-white !text-[24px]' })}
          <div style="flex: 1; text-align: left;">
            <div style="font-size: 15px; font-weight: 600; color: var(--text-primary);">
              Settings
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              Preferences
            </div>
          </div>
        </button>
      </div>

      <!-- Mobile Menu Footer -->
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px 24px;
        border-top: 1px solid var(--border-subtle);
        background: var(--background-dark);
      ">
        <button id="mobile-nav-signout" style="
          width: 100%;
          padding: 14px;
          background: var(--white-10);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        ">
          ${Icon({ name: 'logout', className: '!text-[20px]' })}
          <span>Sign Out</span>
        </button>
      </div>
    </div>

    <!-- Mobile Hamburger Button (visible on mobile only) -->
    <button id="mobile-nav-toggle" class="mobile-nav-toggle" style="
      position: fixed;
      top: 16px;
      right: 16px;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--background-dark);
      border: 1px solid var(--border-subtle);
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9997;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    ">
      <span class="hamburger-icon" style="
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 20px;
      ">
        <span style="
          width: 100%;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
          border-radius: 2px;
        "></span>
        <span style="
          width: 100%;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
          border-radius: 2px;
        "></span>
        <span style="
          width: 100%;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
          border-radius: 2px;
        "></span>
      </span>
    </button>
  `

  container.insertAdjacentHTML('beforeend', navHTML)

  // Setup event listeners
  setupMobileNavListeners()

  // Show hamburger button on mobile
  updateMobileNavVisibility()
}

/**
 * Setup mobile navigation event listeners
 */
function setupMobileNavListeners() {
  const toggle = document.getElementById('mobile-nav-toggle')
  const close = document.getElementById('mobile-nav-close')
  const overlay = document.getElementById('mobile-nav-overlay')
  const signout = document.getElementById('mobile-nav-signout')
  const navItems = document.querySelectorAll('.mobile-nav-item')

  // Toggle menu
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggleMobileMenu()
    })
  }

  // Close menu
  if (close) {
    close.addEventListener('click', () => {
      closeMobileMenu()
    })
  }

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeMobileMenu()
    })
  }

  // Handle navigation items
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const windowId = item.dataset.window
      const section = item.dataset.section

      console.log('📱 Mobile nav item clicked:', windowId)

      // Update active state
      navItems.forEach(i => {
        i.style.background = 'transparent'
        i.style.borderLeftColor = 'transparent'
      })
      item.style.background = 'var(--white-5)'
      item.style.borderLeftColor = 'var(--primary)'

      // Update current section
      currentSection = section

      // Open window
      if (windowId) {
        openWindow(windowId)
      }

      // Close menu after selection
      closeMobileMenu()
    })
  })

  // Handle signout
  if (signout) {
    signout.addEventListener('click', async () => {
      const confirmed = confirm('Are you sure you want to sign out?')
      if (confirmed) {
        const { signOut } = await import('../services/auth.js')
        await signOut()
      }
    })
  }

  // Close menu on window resize to desktop
  window.addEventListener('resize', updateMobileNavVisibility)
}

/**
 * Toggle mobile menu open/closed
 */
export function toggleMobileMenu() {
  if (isMenuOpen) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
}

/**
 * Open mobile menu
 */
export function openMobileMenu() {
  console.log('📱 Opening mobile menu')

  const menu = document.getElementById('mobile-nav-menu')
  const overlay = document.getElementById('mobile-nav-overlay')
  const toggle = document.getElementById('mobile-nav-toggle')

  if (menu && overlay) {
    isMenuOpen = true

    // Show overlay
    overlay.style.opacity = '1'
    overlay.style.pointerEvents = 'auto'

    // Slide in menu
    menu.style.right = '0'

    // Update hamburger icon to X
    if (toggle) {
      const icon = toggle.querySelector('.hamburger-icon')
      if (icon) {
        const lines = icon.querySelectorAll('span')
        lines[0].style.transform = 'rotate(45deg) translateY(9px)'
        lines[1].style.opacity = '0'
        lines[2].style.transform = 'rotate(-45deg) translateY(-9px)'
      }
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  }
}

/**
 * Close mobile menu
 */
export function closeMobileMenu() {
  console.log('📱 Closing mobile menu')

  const menu = document.getElementById('mobile-nav-menu')
  const overlay = document.getElementById('mobile-nav-overlay')
  const toggle = document.getElementById('mobile-nav-toggle')

  if (menu && overlay) {
    isMenuOpen = false

    // Hide overlay
    overlay.style.opacity = '0'
    overlay.style.pointerEvents = 'none'

    // Slide out menu
    menu.style.right = '-100%'

    // Reset hamburger icon
    if (toggle) {
      const icon = toggle.querySelector('.hamburger-icon')
      if (icon) {
        const lines = icon.querySelectorAll('span')
        lines[0].style.transform = 'none'
        lines[1].style.opacity = '1'
        lines[2].style.transform = 'none'
      }
    }

    // Restore body scroll
    document.body.style.overflow = ''
  }
}

/**
 * Update mobile navigation visibility based on screen size
 */
function updateMobileNavVisibility() {
  const toggle = document.getElementById('mobile-nav-toggle')

  if (toggle) {
    if (window.innerWidth < 768) {
      // Show hamburger button on mobile
      toggle.style.display = 'flex'
    } else {
      // Hide on desktop and close menu if open
      toggle.style.display = 'none'
      closeMobileMenu()
    }
  }
}

/**
 * Set active navigation item
 */
export function setActiveNavItem(section) {
  currentSection = section
  const navItems = document.querySelectorAll('.mobile-nav-item')

  navItems.forEach(item => {
    if (item.dataset.section === section) {
      item.style.background = 'var(--white-5)'
      item.style.borderLeftColor = 'var(--primary)'
    } else {
      item.style.background = 'transparent'
      item.style.borderLeftColor = 'transparent'
    }
  })
}
