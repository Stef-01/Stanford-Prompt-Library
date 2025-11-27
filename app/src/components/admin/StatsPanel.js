/**
 * Stats Panel Component
 * Display admin statistics and metrics
 */

import { formatNumber, formatCompactNumber } from '../../utils/helpers/formatters.js'

/**
 * Create stats panel
 * @param {Object} stats - Statistics data
 * @param {Object} options - Panel options
 * @returns {HTMLElement} Stats panel element
 */
export function createStatsPanel(stats = {}, options = {}) {
  const {
    onFilterChange = null,
    currentFilter = 'pending'
  } = options

  const {
    pending = 0,
    approved = 0,
    rejected = 0,
    total = 0,
    totalUsers = 0,
    totalLikes = 0
  } = stats

  const panel = document.createElement('div')
  panel.className = 'admin-stats-panel'

  panel.innerHTML = `
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div
        class="stat-card stat-pending ${currentFilter === 'pending' ? 'active' : ''}"
        data-filter="pending"
        role="button"
        tabindex="0"
      >
        <div class="stat-icon">
          <span class="material-icons">schedule</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">${formatNumber(pending)}</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </div>

      <div
        class="stat-card stat-approved ${currentFilter === 'approved' ? 'active' : ''}"
        data-filter="approved"
        role="button"
        tabindex="0"
      >
        <div class="stat-icon">
          <span class="material-icons">check_circle</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">${formatNumber(approved)}</div>
          <div class="stat-label">Approved</div>
        </div>
      </div>

      <div
        class="stat-card stat-rejected ${currentFilter === 'rejected' ? 'active' : ''}"
        data-filter="rejected"
        role="button"
        tabindex="0"
      >
        <div class="stat-icon">
          <span class="material-icons">cancel</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">${formatNumber(rejected)}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>

      <div
        class="stat-card stat-all ${currentFilter === 'all' ? 'active' : ''}"
        data-filter="all"
        role="button"
        tabindex="0"
      >
        <div class="stat-icon">
          <span class="material-icons">library_books</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">${formatNumber(total)}</div>
          <div class="stat-label">Total Prompts</div>
        </div>
      </div>
    </div>

    <!-- Additional Metrics -->
    <div class="metrics-row">
      <div class="metric-item">
        <span class="material-icons">people</span>
        <div class="metric-content">
          <div class="metric-value">${formatCompactNumber(totalUsers)}</div>
          <div class="metric-label">Total Users</div>
        </div>
      </div>

      <div class="metric-item">
        <span class="material-icons">favorite</span>
        <div class="metric-content">
          <div class="metric-value">${formatCompactNumber(totalLikes)}</div>
          <div class="metric-label">Total Likes</div>
        </div>
      </div>

      <div class="metric-item">
        <span class="material-icons">trending_up</span>
        <div class="metric-content">
          <div class="metric-value">${calculateApprovalRate(approved, rejected)}%</div>
          <div class="metric-label">Approval Rate</div>
        </div>
      </div>
    </div>
  `

  // Attach event listeners
  if (onFilterChange) {
    const statCards = panel.querySelectorAll('.stat-card')
    statCards.forEach(card => {
      card.addEventListener('click', () => {
        const filter = card.dataset.filter

        // Update active state
        statCards.forEach(c => c.classList.remove('active'))
        card.classList.add('active')

        // Trigger callback
        onFilterChange(filter)
      })

      // Keyboard support
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          card.click()
        }
      })
    })
  }

  return panel
}

/**
 * Calculate approval rate
 * @param {number} approved - Number approved
 * @param {number} rejected - Number rejected
 * @returns {number} Approval rate percentage
 */
function calculateApprovalRate(approved, rejected) {
  const total = approved + rejected
  if (total === 0) return 0
  return Math.round((approved / total) * 100)
}

/**
 * Update stats panel
 * @param {HTMLElement} panel - Stats panel element
 * @param {Object} stats - New statistics
 */
export function updateStatsPanel(panel, stats) {
  const { pending = 0, approved = 0, rejected = 0, total = 0 } = stats

  // Update stat values
  const statValues = panel.querySelectorAll('.stat-value')
  if (statValues[0]) statValues[0].textContent = formatNumber(pending)
  if (statValues[1]) statValues[1].textContent = formatNumber(approved)
  if (statValues[2]) statValues[2].textContent = formatNumber(rejected)
  if (statValues[3]) statValues[3].textContent = formatNumber(total)

  // Update approval rate
  const approvalRate = panel.querySelector('.metric-item:last-child .metric-value')
  if (approvalRate) {
    approvalRate.textContent = `${calculateApprovalRate(approved, rejected)}%`
  }
}

export default { createStatsPanel, updateStatsPanel }
