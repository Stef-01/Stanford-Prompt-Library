import { signOut } from '../services/auth.js'
import {
  getApprovedPrompts,
  getCategories,
  likePrompt,
  hasLiked,
  copyPromptToClipboard,
  exportPromptAsMarkdown,
  getLeaderboard
} from '../services/prompts.js'
import { isAdmin } from '../services/admin.js'
import { renderAdminPanel } from './AdminPanel.js'
import { startClock } from '../utils/desktop-windows.js'
import { deactivateBypass, isBypassActive } from '../utils/access-code.js'

let currentView = 'explore' // explore, leaderboard, profile, admin
let currentCategory = null
let currentSearchQuery = ''
let prompts = []
let categories = []
let leaderboardData = []
let userIsAdmin = false

/**
 * Render the main app for approved members
 */
export async function renderMainApp(container, userData) {
  try {
    // Add desktop mode class to body
    document.body.classList.add('desktop-mode')

    console.log('🎨 Rendering main app for user:', userData.display_name)

    // Check if user is admin
    console.log('🔍 Checking admin status...')
    userIsAdmin = await isAdmin()
    console.log('✅ Admin status:', userIsAdmin)

    // Load initial data
    console.log('📊 Loading categories...')
    categories = await getCategories()
    console.log('✅ Categories loaded:', categories?.length || 0)

    console.log('📝 Loading prompts...')
    prompts = await getApprovedPrompts()
    console.log('✅ Prompts loaded:', prompts?.length || 0)

    console.log('🏆 Loading leaderboard...')
    leaderboardData = await getLeaderboard()
    console.log('✅ Leaderboard loaded:', leaderboardData?.length || 0)

    const isInBypassMode = isBypassActive()

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

      <!-- Desktop Area -->
      <div class="desktop-area">
        <div class="main-app">
          <!-- Navigation -->
          <nav class="app-nav">
            <button class="nav-btn active" data-view="explore">🔍 Explore</button>
            <button class="nav-btn" data-view="leaderboard">🏆 Leaderboard</button>
            <button class="nav-btn" data-view="profile">👤 Profile</button>
            ${userIsAdmin ? '<button class="nav-btn" data-view="admin">🛡️ Admin</button>' : ''}
          </nav>

          <!-- Main Content -->
          <main class="app-main">
            <div id="app-content"></div>
          </main>
        </div>
      </div>

      <!-- Bottom Dock -->
      <nav class="navbar-dock">
        <div class="dock-icon" data-action="explore" title="Explore Prompts">
          <svg fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span class="dock-label">Explore</span>
        </div>
        <div class="dock-icon" data-action="leaderboard" title="Leaderboard">
          <svg fill="none" stroke="#eab308" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
          <span class="dock-label">Leaderboard</span>
        </div>
        <div class="dock-icon" data-action="profile" title="Your Profile">
          <svg fill="none" stroke="#22c55e" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="dock-label">Profile</span>
        </div>
        ${userIsAdmin ? `
          <div class="dock-icon" data-action="admin" title="Admin Panel">
            <svg fill="none" stroke="#a855f7" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span class="dock-label">Admin</span>
          </div>
        ` : ''}
        <div class="dock-icon" data-action="signout" title="Sign Out">
          <svg fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="dock-label">Sign Out</span>
        </div>
      </nav>
    </div>
  `

  // Start the desktop clock
  startClock()

  // Attach event listeners for navigation
  const navBtns = container.querySelectorAll('.nav-btn')
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view
      navBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      renderContent(container, userData)
    })
  })

  // Dock icon event listeners
  const dockIcons = container.querySelectorAll('.dock-icon[data-action]')
  dockIcons.forEach(icon => {
    icon.addEventListener('click', async () => {
      const action = icon.dataset.action

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
      } else if (['explore', 'leaderboard', 'profile', 'admin'].includes(action)) {
        currentView = action
        navBtns.forEach(b => b.classList.remove('active'))
        const correspondingBtn = Array.from(navBtns).find(b => b.dataset.view === action)
        if (correspondingBtn) {
          correspondingBtn.classList.add('active')
        }
        renderContent(container, userData)
      }
    })
  })

    // Initial render
    console.log('✅ Main app rendered successfully, rendering initial content...')
    renderContent(container, userData)
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
 * Render the current view content
 */
function renderContent(container, userData) {
  const contentArea = container.querySelector('#app-content')

  switch (currentView) {
    case 'explore':
      renderExploreView(contentArea)
      break
    case 'leaderboard':
      renderLeaderboardView(contentArea)
      break
    case 'profile':
      renderProfileView(contentArea)
      break
    case 'admin':
      if (userIsAdmin) {
        renderAdminPanel(contentArea, userData)
      } else {
        contentArea.innerHTML = '<div class="error-state"><h2>Access Denied</h2><p>Admin privileges required</p></div>'
      }
      break
  }
}

/**
 * Render the explore/browse view
 */
function renderExploreView(contentArea) {
  contentArea.innerHTML = `
    <div class="explore-view">
      <!-- Search and Filters -->
      <div class="explore-controls">
        <input
          type="text"
          id="search-input"
          class="search-input"
          placeholder="Search prompts..."
          value="${currentSearchQuery}"
        />

        <div class="category-filters">
          <button class="category-btn ${!currentCategory ? 'active' : ''}" data-category="">
            All
          </button>
          ${categories.map(cat => `
            <button
              class="category-btn ${currentCategory === cat.name ? 'active' : ''}"
              data-category="${cat.name}"
            >
              ${cat.icon} ${cat.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Prompts Grid -->
      <div class="prompts-grid" id="prompts-grid">
        ${renderPromptCards()}
      </div>
    </div>
  `

  // Attach event listeners
  const searchInput = contentArea.querySelector('#search-input')
  searchInput.addEventListener('input', debounce(async (e) => {
    currentSearchQuery = e.target.value
    await filterAndRenderPrompts(contentArea)
  }, 300))

  const categoryBtns = contentArea.querySelectorAll('.category-btn')
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentCategory = btn.dataset.category || null
      categoryBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      await filterAndRenderPrompts(contentArea)
    })
  })
}

/**
 * Filter and re-render prompts based on current filters
 */
async function filterAndRenderPrompts(contentArea) {
  const filters = {
    search: currentSearchQuery,
    category: currentCategory
  }

  prompts = await getApprovedPrompts(filters)

  const grid = contentArea.querySelector('#prompts-grid')
  grid.innerHTML = renderPromptCards()
}

/**
 * Render prompt cards
 */
function renderPromptCards() {
  if (prompts.length === 0) {
    return '<div class="no-results">No prompts found. Try different filters.</div>'
  }

  return prompts.map(prompt => `
    <div class="prompt-card" data-id="${prompt.id}">
      <div class="prompt-card-header">
        <span class="prompt-category">${prompt.category}</span>
        <button class="like-btn" data-id="${prompt.id}">
          ❤️ ${prompt.likes_count}
        </button>
      </div>

      <h3 class="prompt-title">${escapeHtml(prompt.title)}</h3>
      <p class="prompt-description">${escapeHtml(prompt.description || 'No description')}</p>

      ${prompt.tags && prompt.tags.length > 0 ? `
        <div class="prompt-tags">
          ${prompt.tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}

      <div class="prompt-card-footer">
        <div class="prompt-author">
          ${prompt.users.avatar_url ? `
            <img src="${prompt.users.avatar_url}" alt="${prompt.users.display_name}" class="author-avatar" />
          ` : `
            <div class="author-avatar-placeholder">${prompt.users.display_name[0]}</div>
          `}
          <span class="author-name">${escapeHtml(prompt.users.display_name)}</span>
        </div>

        <div class="prompt-actions">
          <button class="action-btn copy-btn" data-id="${prompt.id}" title="Copy to clipboard">
            📋
          </button>
          <button class="action-btn export-btn" data-id="${prompt.id}" title="Export as markdown">
            ⬇️
          </button>
          <button class="action-btn view-btn" data-id="${prompt.id}">
            View
          </button>
        </div>
      </div>
    </div>
  `).join('')
}

/**
 * Render leaderboard view
 */
function renderLeaderboardView(contentArea) {
  contentArea.innerHTML = `
    <div class="leaderboard-view">
      <h2>🏆 Top Contributors</h2>
      <p class="view-subtitle">Top contributors ranked by prompts submitted and likes received</p>

      <div class="leaderboard-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Prompts</th>
              <th>Likes</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboardData.map((user, index) => `
              <tr>
                <td class="rank-cell">
                  ${index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                </td>
                <td class="user-cell">
                  ${user.avatar_url ? `
                    <img src="${user.avatar_url}" alt="${user.display_name}" class="user-avatar" />
                  ` : `
                    <div class="user-avatar-placeholder">${user.display_name[0]}</div>
                  `}
                  <span>${escapeHtml(user.display_name)}</span>
                </td>
                <td>${user.total_prompts}</td>
                <td>${user.total_likes_received}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

/**
 * Render profile view
 */
function renderProfileView(contentArea) {
  contentArea.innerHTML = `
    <div class="profile-view">
      <h2>👤 Your Profile</h2>
      <p class="view-subtitle">Coming soon! View your submitted prompts and statistics.</p>
    </div>
  `
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
