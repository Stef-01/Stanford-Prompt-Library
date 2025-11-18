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
  // Check if user is admin
  userIsAdmin = await isAdmin()

  // Load initial data
  categories = await getCategories()
  prompts = await getApprovedPrompts()
  leaderboardData = await getLeaderboard()

  container.innerHTML = `
    <div class="main-app">
      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <h1 class="app-logo">📚 Stanford Prompt Library</h1>
        </div>
        <div class="header-right">
          <span class="user-greeting">Hi, ${userData.display_name || 'there'}!</span>
          ${userIsAdmin ? '<span class="admin-badge">Admin</span>' : ''}
          <button id="signout-btn" class="btn-secondary btn-small">Sign Out</button>
        </div>
      </header>

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
  `

  // Attach event listeners
  const signoutBtn = container.querySelector('#signout-btn')
  signoutBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  })

  // Navigation
  const navBtns = container.querySelectorAll('.nav-btn')
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view
      navBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      renderContent(container, userData)
    })
  })

  // Initial render
  renderContent(container, userData)
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
