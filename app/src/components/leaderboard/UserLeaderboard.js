/**
 * User Leaderboard Component
 * Displays ranking of users by their prompt contributions
 */

/**
 * Create user leaderboard
 * @param {Array} users - Array of user data
 * @param {Object} options - Display options
 * @returns {HTMLElement} User leaderboard element
 */
export function createUserLeaderboard(users, options = {}) {
  const {
    currentFilter = 'all',
    onFilterChange = null,
    showRankBadges = true,
    highlightCurrentUser = true,
    currentUserId = null
  } = options

  const container = document.createElement('div')
  container.className = 'user-leaderboard'

  container.innerHTML = `
    <!-- Filter Controls -->
    <div class="leaderboard-filters">
      <button
        class="filter-btn ${currentFilter === 'all' ? 'active' : ''}"
        data-filter="all"
      >
        All Time
      </button>
      <button
        class="filter-btn ${currentFilter === 'month' ? 'active' : ''}"
        data-filter="month"
      >
        This Month
      </button>
      <button
        class="filter-btn ${currentFilter === 'week' ? 'active' : ''}"
        data-filter="week"
      >
        This Week
      </button>
    </div>

    <!-- Leaderboard Table -->
    <div class="leaderboard-table-container">
      ${users.length > 0 ? `
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th class="rank-col">Rank</th>
              <th class="user-col">User</th>
              <th class="prompts-col">Prompts</th>
              <th class="likes-col">Likes</th>
              <th class="score-col">Score</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((user, index) => renderUserRow(user, index, {
              showRankBadges,
              highlightCurrentUser,
              currentUserId
            })).join('')}
          </tbody>
        </table>
      ` : `
        <div class="leaderboard-empty">
          <span class="material-icons">leaderboard</span>
          <p>No users to display</p>
        </div>
      `}
    </div>
  `

  // Attach filter event listeners
  if (onFilterChange) {
    const filterBtns = container.querySelectorAll('.filter-btn')
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        // Trigger callback
        onFilterChange(btn.dataset.filter)
      })
    })
  }

  return container
}

/**
 * Render individual user row
 * @param {Object} user - User data
 * @param {number} index - User index (rank - 1)
 * @param {Object} options - Row options
 * @returns {string} User row HTML
 */
function renderUserRow(user, index, options) {
  const {
    showRankBadges,
    highlightCurrentUser,
    currentUserId
  } = options

  const rank = index + 1
  const isCurrentUser = highlightCurrentUser && currentUserId && user.id === currentUserId
  const score = calculateScore(user)

  // Rank badge/medal
  let rankDisplay
  if (showRankBadges && rank <= 3) {
    const medals = ['🥇', '🥈', '🥉']
    rankDisplay = `<span class="rank-medal">${medals[rank - 1]}</span>`
  } else {
    rankDisplay = `<span class="rank-number">${rank}</span>`
  }

  return `
    <tr class="user-row ${isCurrentUser ? 'current-user' : ''}" data-user-id="${user.id || ''}">
      <td class="rank-col">
        ${rankDisplay}
      </td>
      <td class="user-col">
        <div class="user-info">
          <div class="user-avatar">
            ${user.avatar_url
              ? `<img src="${user.avatar_url}" alt="${escapeHtml(user.display_name)}">`
              : `<span class="avatar-placeholder">${getInitials(user.display_name)}</span>`
            }
          </div>
          <div class="user-details">
            <div class="user-name">${escapeHtml(user.display_name || 'Unknown')}</div>
            ${isCurrentUser ? '<span class="user-badge">You</span>' : ''}
          </div>
        </div>
      </td>
      <td class="prompts-col">
        <span class="stat-value">${user.total_prompts || 0}</span>
      </td>
      <td class="likes-col">
        <span class="stat-value">${user.total_likes_received || 0}</span>
        <span class="material-icons stat-icon">favorite</span>
      </td>
      <td class="score-col">
        <div class="score-badge">${score}</div>
      </td>
    </tr>
  `
}

/**
 * Calculate user score
 * @param {Object} user - User data
 * @returns {number} Calculated score
 */
function calculateScore(user) {
  const promptsWeight = 10
  const likesWeight = 1

  return (user.total_prompts || 0) * promptsWeight +
         (user.total_likes_received || 0) * likesWeight
}

/**
 * Get user initials
 * @param {string} name - User name
 * @returns {string} Initials
 */
function getInitials(name) {
  if (!name) return '?'

  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Escape HTML
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Update leaderboard with new data
 * @param {HTMLElement} container - Leaderboard container
 * @param {Array} users - New user data
 * @param {Object} options - Display options
 */
export function updateUserLeaderboard(container, users, options = {}) {
  const newLeaderboard = createUserLeaderboard(users, options)
  container.replaceChildren(...newLeaderboard.children)

  // Re-attach event listeners
  if (options.onFilterChange) {
    const filterBtns = container.querySelectorAll('.filter-btn')
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        options.onFilterChange(btn.dataset.filter)
      })
    })
  }
}

export default { createUserLeaderboard, updateUserLeaderboard }
