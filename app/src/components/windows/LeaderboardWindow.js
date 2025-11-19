import { getTimeBasedLeaderboard } from '../../services/prompts.js'

let leaderboardData = []
let currentFilter = 'all'
let containerRef = null

/**
 * Render Leaderboard Window Content
 * @param {HTMLElement} contentContainer - Window content container
 */
export async function renderLeaderboardWindow(contentContainer) {
  containerRef = contentContainer
  leaderboardData = await getTimeBasedLeaderboard(currentFilter)

  contentContainer.innerHTML = `
    <h2 style="font-size: 24px; margin-bottom: 20px;">🏆 Top Contributors</h2>
    <p style="color: var(--text-secondary); margin-bottom: 20px;">
      Top contributors ranked by prompts submitted and likes received
    </p>

    <!-- Filter Buttons -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <button class="btn-primary ${currentFilter === 'all' ? '' : 'inactive'}" data-filter="all">
        All Time
      </button>
      <button class="btn-primary inactive" data-filter="month">
        This Month
      </button>
      <button class="btn-primary inactive" data-filter="week">
        This Week
      </button>
    </div>

    <!-- Leaderboard Table -->
    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 20px; overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <th style="text-align: left; padding: 10px; font-size: 14px;">Rank</th>
            <th style="text-align: left; padding: 10px; font-size: 14px;">User</th>
            <th style="text-align: left; padding: 10px; font-size: 14px;">Prompts</th>
            <th style="text-align: left; padding: 10px; font-size: 14px;">Likes</th>
          </tr>
        </thead>
        <tbody>
          ${renderLeaderboardRows()}
        </tbody>
      </table>
    </div>
  `

  attachEventListeners(contentContainer)
}

/**
 * Render leaderboard rows
 */
function renderLeaderboardRows() {
  if (leaderboardData.length === 0) {
    return `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          No leaderboard data yet. Be the first to contribute!
        </td>
      </tr>
    `
  }

  return leaderboardData.map((user, index) => {
    const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
    const rankDisplay = rankEmoji ? `${rankEmoji} ${index + 1}` : index + 1

    return `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
        <td style="padding: 10px; font-weight: ${index < 3 ? '600' : '400'};">
          ${rankDisplay}
        </td>
        <td style="padding: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${user.avatar_url ? `
              <img src="${user.avatar_url}" alt="${user.display_name}" style="width: 32px; height: 32px; border-radius: 50%;" />
            ` : `
              <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px;">
                ${user.display_name[0]}
              </div>
            `}
            <span>${escapeHtml(user.display_name)}</span>
          </div>
        </td>
        <td style="padding: 10px;">${user.total_prompts || 0}</td>
        <td style="padding: 10px; color: ${index < 3 ? 'var(--accent-yellow)' : 'inherit'};">
          ${user.total_likes_received || 0}
        </td>
      </tr>
    `
  }).join('')
}

/**
 * Attach event listeners
 */
function attachEventListeners(container) {
  const filterBtns = container.querySelectorAll('[data-filter]')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentFilter = btn.dataset.filter

      // Update button states
      filterBtns.forEach(b => {
        if (b.dataset.filter === currentFilter) {
          b.classList.remove('inactive')
        } else {
          b.classList.add('inactive')
        }
      })

      // Show loading state
      const tableContainer = container.querySelector('tbody')
      if (tableContainer) {
        tableContainer.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
              Loading leaderboard data...
            </td>
          </tr>
        `
      }

      // Reload data with new filter
      leaderboardData = await getTimeBasedLeaderboard(currentFilter)

      // Re-render table rows
      if (tableContainer) {
        tableContainer.innerHTML = renderLeaderboardRows()
      }

      console.log(`🏆 Leaderboard filter changed to: ${currentFilter}`)
    })
  })
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
