/**
 * Mobile Navigation Component
 * Provides a hamburger menu and mobile-optimized navigation experience
 */

import './mobile-navigation.css'
import { Icon } from './ui/Icon.js'
import { toggleWindow, openWindow } from '../utils/desktop-windows.js'

let isMenuOpen = false
let currentSection = 'explore'

/**
 * Render Mobile Navigation
 */
export function renderMobileNavigation(container, userData, isAdmin = false) {
  console.log('📱 Rendering mobile navigation')

  const navHTML = `
    <!-- Mobile Navigation Overlay -->
    <div id="mobile-nav-overlay" class="mobile-nav-overlay"></div>

    <!-- Mobile Navigation Menu -->
    <div id="mobile-nav-menu" class="mobile-nav-menu">
      <!-- Mobile Menu Header -->
      <div class="mobile-menu-header">
        <div>
          <h2 class="mobile-menu-title">Menu</h2>
          <p class="mobile-menu-subtitle">${userData.display_name}</p>
        </div>
        <button id="mobile-nav-close" class="mobile-nav-close">
          ${Icon({ name: 'close', className: 'text-white !text-[20px]' })}
        </button>
      </div>

      <!-- Mobile Menu Items -->
      <div class="mobile-menu-items">
        <!-- Primary Navigation -->
        <div class="mobile-menu-section-header">
          <p class="mobile-menu-section-title">Navigation</p>
        </div>

        <button class="mobile-nav-item" data-window="explore" data-section="explore">
          ${Icon({ name: 'explore', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">Explore</div>
            <div class="mobile-nav-item-description">Discover prompts</div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="library" data-section="library">
          ${Icon({ name: 'auto_stories', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">My Library</div>
            <div class="mobile-nav-item-description">Your saved prompts</div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="submit" data-section="submit">
          ${Icon({ name: 'add_circle', className: 'text-primary !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title primary-color">Submit Prompt</div>
            <div class="mobile-nav-item-description">Share your prompt</div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="leaderboard" data-section="leaderboard">
          ${Icon({ name: 'leaderboard', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">Leaderboard</div>
            <div class="mobile-nav-item-description">Top contributors</div>
          </div>
        </button>

        <!-- Divider -->
        <div class="mobile-menu-divider"></div>

        <!-- Secondary Navigation -->
        <div class="mobile-menu-section-header with-margin-top">
          <p class="mobile-menu-section-title">More</p>
        </div>

        <button class="mobile-nav-item" data-window="profile" data-section="profile">
          ${Icon({ name: 'person', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">Profile</div>
            <div class="mobile-nav-item-description">Your account</div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="opportunities" data-section="opportunities">
          ${Icon({ name: 'work_outline', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">Opportunities</div>
            <div class="mobile-nav-item-description">Jobs & internships</div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="games" data-section="games">
          ${Icon({ name: 'sports_esports', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">Games</div>
            <div class="mobile-nav-item-description">Bear Invaders</div>
          </div>
        </button>

        <button class="mobile-nav-item" data-window="learn" data-section="learn">
          ${Icon({ name: 'school', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">Learn</div>
            <div class="mobile-nav-item-description">Tutorials & guides</div>
          </div>
        </button>

        ${isAdmin ? `
          <!-- Divider -->
          <div class="mobile-menu-divider"></div>

          <button class="mobile-nav-item" data-window="admin" data-section="admin">
            ${Icon({ name: 'shield_person', className: 'text-primary !text-[24px]' })}
            <div class="mobile-nav-item-content">
              <div class="mobile-nav-item-title primary-color">Admin Panel</div>
              <div class="mobile-nav-item-description">Manage submissions</div>
            </div>
          </button>
        ` : ''}

        <!-- Divider -->
        <div class="mobile-menu-divider"></div>

        <button class="mobile-nav-item" data-window="settings" data-section="settings">
          ${Icon({ name: 'settings', className: 'text-white !text-[24px]' })}
          <div class="mobile-nav-item-content">
            <div class="mobile-nav-item-title">Settings</div>
            <div class="mobile-nav-item-description">Preferences</div>
          </div>
        </button>
      </div>

      <!-- Mobile Menu Footer -->
      <div class="mobile-menu-footer">
        <button id="mobile-nav-signout">
          ${Icon({ name: 'logout', className: '!text-[20px]' })}
          <span>Sign Out</span>
        </button>
      </div>
    </div>

    <!-- Mobile Hamburger Button (visible on mobile only) -->
    <button id="mobile-nav-toggle" class="mobile-nav-toggle">
      <span class="hamburger-icon">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
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
      setActiveNavItem(section)

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
      const lines = toggle.querySelectorAll('.hamburger-line')
      lines[0].style.transform = 'rotate(45deg) translateY(9px)'
      lines[1].style.opacity = '0'
      lines[2].style.transform = 'rotate(-45deg) translateY(-9px)'
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
      const lines = toggle.querySelectorAll('.hamburger-line')
      lines[0].style.transform = 'none'
      lines[1].style.opacity = '1'
      lines[2].style.transform = 'none'
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
      item.classList.add('active')
    } else {
      item.classList.remove('active')
    }
  })
}
