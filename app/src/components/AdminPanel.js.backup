import {
  getPendingPrompts,
  getAllPrompts,
  approvePrompt,
  rejectPrompt,
  getAdminStats
} from '../services/admin.js'

let currentFilter = 'pending'
let prompts = []
let stats = {}

/**
 * Render Admin Panel
 */
export async function renderAdminPanel(container, userData) {
  console.log('Rendering admin panel for:', userData.display_name)

  // Load initial data
  await loadAdminData()

  container.innerHTML = `
    <div class="admin-panel">
      <!-- Header -->
      <header class="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Review and manage prompt submissions</p>
      </header>

      <!-- Stats -->
      <div class="admin-stats">
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-value">${stats.pendingCount || 0}</div>
            <div class="stat-label">Pending Review</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">${stats.approvedCount || 0}</div>
            <div class="stat-label">Approved</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-value">${stats.rejectedCount || 0}</div>
            <div class="stat-label">Rejected</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalUsers || 0}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="admin-filters">
        <button class="filter-btn ${currentFilter === 'pending' ? 'active' : ''}" data-filter="pending">
          ⏳ Pending (${stats.pendingCount || 0})
        </button>
        <button class="filter-btn ${currentFilter === 'approved' ? 'active' : ''}" data-filter="approved">
          ✅ Approved
        </button>
        <button class="filter-btn ${currentFilter === 'rejected' ? 'active' : ''}" data-filter="rejected">
          ❌ Rejected
        </button>
        <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
          📋 All Prompts
        </button>
      </div>

      <!-- Prompts List -->
      <div id="admin-prompts-list" class="admin-prompts-list">
        ${renderPromptsList()}
      </div>
    </div>
  `

  // Attach event listeners
  setupAdminEventListeners(container)
}

/**
 * Load admin data
 */
async function loadAdminData() {
  try {
    // Load stats
    stats = await getAdminStats()

    // Load prompts based on current filter
    if (currentFilter === 'pending') {
      prompts = await getPendingPrompts()
    } else if (currentFilter === 'all') {
      prompts = await getAllPrompts()
    } else {
      prompts = await getAllPrompts({ status: currentFilter })
    }
  } catch (error) {
    console.error('Error loading admin data:', error)
  }
}

/**
 * Render prompts list
 */
function renderPromptsList() {
  if (prompts.length === 0) {
    return `
      <div class="empty-state">
        <p>No ${currentFilter} prompts</p>
      </div>
    `
  }

  return prompts.map(prompt => `
    <div class="admin-prompt-card" data-prompt-id="${prompt.id}">
      <!-- Header -->
      <div class="admin-prompt-header">
        <div class="prompt-meta">
          <h3>${escapeHtml(prompt.title)}</h3>
          <span class="status-badge status-${prompt.status}">${prompt.status}</span>
          ${prompt.is_initial_prompt ? '<span class="badge-initial">Initial Prompt</span>' : ''}
        </div>
        <div class="prompt-author">
          ${prompt.users.avatar_url ? `
            <img src="${prompt.users.avatar_url}" alt="${prompt.users.display_name}" class="author-avatar" />
          ` : ''}
          <div>
            <div class="author-name">${escapeHtml(prompt.users.display_name)}</div>
            <div class="author-email">${escapeHtml(prompt.users.email)}</div>
          </div>
        </div>
      </div>

      <!-- Category and Tags -->
      <div class="prompt-tags-row">
        <span class="category-badge">${prompt.category}</span>
        ${prompt.tags && prompt.tags.length > 0 ? `
          <div class="tags">
            ${prompt.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Description -->
      ${prompt.description ? `
        <div class="prompt-description">
          ${escapeHtml(prompt.description)}
        </div>
      ` : ''}

      <!-- Content Preview -->
      <div class="prompt-content-box">
        <div class="content-label">Prompt Content:</div>
        <pre class="prompt-content">${escapeHtml(prompt.content)}</pre>
      </div>

      <!-- Metadata -->
      <div class="prompt-metadata">
        <span>📅 ${formatDate(prompt.created_at)}</span>
        ${prompt.likes_count ? `<span>❤️ ${prompt.likes_count} likes</span>` : ''}
      </div>

      <!-- Actions -->
      <div class="admin-actions">
        ${prompt.status === 'pending' ? `
          <button class="btn-approve" data-prompt-id="${prompt.id}">
            ✅ Approve
          </button>
          <button class="btn-reject" data-prompt-id="${prompt.id}">
            ❌ Reject
          </button>
        ` : ''}
        ${prompt.status === 'approved' ? `
          <button class="btn-reject" data-prompt-id="${prompt.id}">
            ❌ Unapprove
          </button>
        ` : ''}
        ${prompt.status === 'rejected' ? `
          <button class="btn-approve" data-prompt-id="${prompt.id}">
            ✅ Approve
          </button>
          <div class="rejection-reason">
            <strong>Rejection reason:</strong> ${escapeHtml(prompt.rejection_reason || 'No reason provided')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('')
}

/**
 * Set up event listeners
 */
function setupAdminEventListeners(container) {
  // Filter buttons
  const filterBtns = container.querySelectorAll('.filter-btn')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      currentFilter = btn.dataset.filter
      filterBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      // Show loading
      const listContainer = container.querySelector('#admin-prompts-list')
      listContainer.innerHTML = '<div class="loading">Loading prompts...</div>'

      // Reload data and re-render
      await loadAdminData()
      listContainer.innerHTML = renderPromptsList()

      // Re-attach action listeners
      setupActionListeners(container)
    })
  })

  // Initial action listeners
  setupActionListeners(container)
}

/**
 * Set up action button listeners
 */
function setupActionListeners(container) {
  // Approve buttons
  const approveBtns = container.querySelectorAll('.btn-approve')
  approveBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const promptId = btn.dataset.promptId
      await handleApprove(promptId, container)
    })
  })

  // Reject buttons
  const rejectBtns = container.querySelectorAll('.btn-reject')
  rejectBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const promptId = btn.dataset.promptId
      await handleReject(promptId, container)
    })
  })
}

/**
 * Handle approve action
 */
async function handleApprove(promptId, container) {
  const confirmed = confirm('Approve this prompt? The user will gain access to the library.')
  if (!confirmed) return

  try {
    // Show loading
    const btn = container.querySelector(`.btn-approve[data-prompt-id="${promptId}"]`)
    const originalText = btn.textContent
    btn.disabled = true
    btn.textContent = 'Approving...'

    // Approve the prompt
    await approvePrompt(promptId, true)

    // Show success notification
    showNotification('Prompt approved! User has been granted access.', 'success')

    // Reload data
    await loadAdminData()

    // Re-render the list
    const listContainer = container.querySelector('#admin-prompts-list')
    listContainer.innerHTML = renderPromptsList()

    // Update stats
    updateStats(container)

    // Re-attach listeners
    setupActionListeners(container)

  } catch (error) {
    console.error('Approve error:', error)
    showNotification('Failed to approve prompt: ' + error.message, 'error')
  }
}

/**
 * Handle reject action
 */
async function handleReject(promptId, container) {
  const reason = prompt('Rejection reason (optional):')
  if (reason === null) return // User cancelled

  try {
    // Show loading
    const btn = container.querySelector(`.btn-reject[data-prompt-id="${promptId}"]`)
    const originalText = btn.textContent
    btn.disabled = true
    btn.textContent = 'Rejecting...'

    // Reject the prompt
    await rejectPrompt(promptId, reason)

    // Show success notification
    showNotification('Prompt rejected', 'success')

    // Reload data
    await loadAdminData()

    // Re-render the list
    const listContainer = container.querySelector('#admin-prompts-list')
    listContainer.innerHTML = renderPromptsList()

    // Update stats
    updateStats(container)

    // Re-attach listeners
    setupActionListeners(container)

  } catch (error) {
    console.error('Reject error:', error)
    showNotification('Failed to reject prompt: ' + error.message, 'error')
  }
}

/**
 * Update stats display
 */
function updateStats(container) {
  const statCards = container.querySelectorAll('.stat-value')
  if (statCards[0]) statCards[0].textContent = stats.pendingCount || 0
  if (statCards[1]) statCards[1].textContent = stats.approvedCount || 0
  if (statCards[2]) statCards[2].textContent = stats.rejectedCount || 0
  if (statCards[3]) statCards[3].textContent = stats.totalUsers || 0

  // Update filter buttons
  const pendingBtn = container.querySelector('.filter-btn[data-filter="pending"]')
  if (pendingBtn) {
    pendingBtn.innerHTML = `⏳ Pending (${stats.pendingCount || 0})`
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div')
  notification.className = `admin-notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add('show')
  }, 100)

  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Format date
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
