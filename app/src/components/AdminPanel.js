/**
 * Admin Panel - Modern Monochrome Design
 * Review and manage prompt submissions
 */

import { Icon } from './ui/Icon.js'
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

// Category icon mapping
const CATEGORY_ICONS = {
  writing: 'edit_note',
  coding: 'code',
  research: 'science',
  creative: 'palette',
  other: 'folder'
}

// Status icon mapping
const STATUS_ICONS = {
  pending: 'schedule',
  approved: 'check_circle',
  rejected: 'cancel'
}

/**
 * Render Admin Panel
 */
export async function renderAdminPanel(container, userData) {
  console.log('Rendering admin panel for:', userData.display_name)

  // Load initial data
  await loadAdminData()

  container.innerHTML = `
    <div class="admin-panel-content" style="height: 100%; overflow-y: auto; overflow-x: hidden; background: var(--background-dark);">
      <div style="max-width: 1400px; margin: 0 auto; padding: 48px 24px 96px;">

        <!-- Hero Section -->
        <div class="text-center" style="margin-bottom: 48px; animation: fadeIn 0.4s var(--ease-spring);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                      border-radius: 20px; background: var(--white-10); border: 2px solid var(--border-subtle); margin-bottom: 24px;">
            ${Icon({ name: 'admin_panel_settings', className: 'text-white !text-[40px]' })}
          </div>
          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 700; color: var(--text-primary); margin-bottom: 16px; line-height: 1.1; letter-spacing: -0.02em;">
            Admin Dashboard
          </h1>
          <p style="font-size: 18px; color: var(--text-subtle);">
            Review and manage prompt submissions
          </p>
        </div>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 48px;">
          <div class="stat-card" style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s var(--ease-spring);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                 border-radius: 12px; background: var(--white-10); margin-bottom: 16px;">
              ${Icon({ name: 'schedule', className: 'text-white !text-[28px]' })}
            </div>
            <p style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${stats.pendingCount || 0}
            </p>
            <p style="font-size: 14px; color: var(--text-subtle);">Pending Review</p>
          </div>

          <div class="stat-card" style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s var(--ease-spring);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                 border-radius: 12px; background: var(--white-10); margin-bottom: 16px;">
              ${Icon({ name: 'check_circle', className: 'text-white !text-[28px]' })}
            </div>
            <p style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${stats.approvedCount || 0}
            </p>
            <p style="font-size: 14px; color: var(--text-subtle);">Approved</p>
          </div>

          <div class="stat-card" style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s var(--ease-spring);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                 border-radius: 12px; background: var(--white-10); margin-bottom: 16px;">
              ${Icon({ name: 'cancel', className: 'text-white !text-[28px]' })}
            </div>
            <p style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${stats.rejectedCount || 0}
            </p>
            <p style="font-size: 14px; color: var(--text-subtle);">Rejected</p>
          </div>

          <div class="stat-card" style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s var(--ease-spring);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                 border-radius: 12px; background: var(--white-10); margin-bottom: 16px;">
              ${Icon({ name: 'group', className: 'text-white !text-[28px]' })}
            </div>
            <p style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${stats.totalUsers || 0}
            </p>
            <p style="font-size: 14px; color: var(--text-subtle);">Total Users</p>
          </div>
        </div>

        <!-- Filters -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 32px;">
          <button class="filter-btn" data-filter="pending"
                  style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
                         background: ${currentFilter === 'pending' ? 'var(--primary)' : 'var(--white-5)'};
                         color: ${currentFilter === 'pending' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                         border: ${currentFilter === 'pending' ? 'none' : '1px solid var(--border-subtle)'};
                         border-radius: 24px; font-size: 14px; font-weight: ${currentFilter === 'pending' ? '600' : '500'};
                         cursor: pointer; transition: all 0.4s var(--ease-spring);">
            ${Icon({ name: 'schedule', className: '!text-[18px]' })}
            <span>Pending (${stats.pendingCount || 0})</span>
          </button>

          <button class="filter-btn" data-filter="approved"
                  style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
                         background: ${currentFilter === 'approved' ? 'var(--primary)' : 'var(--white-5)'};
                         color: ${currentFilter === 'approved' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                         border: ${currentFilter === 'approved' ? 'none' : '1px solid var(--border-subtle)'};
                         border-radius: 24px; font-size: 14px; font-weight: ${currentFilter === 'approved' ? '600' : '500'};
                         cursor: pointer; transition: all 0.4s var(--ease-spring);">
            ${Icon({ name: 'check_circle', className: '!text-[18px]' })}
            <span>Approved</span>
          </button>

          <button class="filter-btn" data-filter="rejected"
                  style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
                         background: ${currentFilter === 'rejected' ? 'var(--primary)' : 'var(--white-5)'};
                         color: ${currentFilter === 'rejected' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                         border: ${currentFilter === 'rejected' ? 'none' : '1px solid var(--border-subtle)'};
                         border-radius: 24px; font-size: 14px; font-weight: ${currentFilter === 'rejected' ? '600' : '500'};
                         cursor: pointer; transition: all 0.4s var(--ease-spring);">
            ${Icon({ name: 'cancel', className: '!text-[18px]' })}
            <span>Rejected</span>
          </button>

          <button class="filter-btn" data-filter="all"
                  style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px;
                         background: ${currentFilter === 'all' ? 'var(--primary)' : 'var(--white-5)'};
                         color: ${currentFilter === 'all' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                         border: ${currentFilter === 'all' ? 'none' : '1px solid var(--border-subtle)'};
                         border-radius: 24px; font-size: 14px; font-weight: ${currentFilter === 'all' ? '600' : '500'};
                         cursor: pointer; transition: all 0.4s var(--ease-spring);">
            ${Icon({ name: 'list', className: '!text-[18px]' })}
            <span>All Prompts</span>
          </button>
        </div>

        <!-- Prompts List -->
        <div id="admin-prompts-list">
          ${renderPromptsList()}
        </div>

      </div>
    </div>
  `

  // Attach event listeners
  setupAdminEventListeners(container)
  injectStyles()
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
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                    border-radius: 20px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
          ${Icon({ name: 'inbox', className: 'text-subtle-white !text-[40px]' })}
        </div>
        <p style="font-size: 18px; color: var(--text-subtle); margin-bottom: 8px;">No ${currentFilter} prompts</p>
        <p style="font-size: 14px; color: var(--text-subtle);">Check back later for new submissions</p>
      </div>
    `
  }

  return `
    <div style="display: grid; gap: 20px;">
      ${prompts.map(prompt => renderPromptCard(prompt)).join('')}
    </div>
  `
}

/**
 * Render single prompt card
 */
function renderPromptCard(prompt) {
  const statusIcon = STATUS_ICONS[prompt.status] || 'help'
  const categoryIcon = CATEGORY_ICONS[prompt.category] || 'folder'

  return `
    <div class="admin-prompt-card" data-prompt-id="${prompt.id}"
         style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px;
                padding: 28px; transition: all 0.3s var(--ease-spring);">

      <!-- Header -->
      <div style="display: flex; align-items: start; justify-content: space-between; gap: 16px; margin-bottom: 20px;">
        <div style="flex: 1;">
          <h3 style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; line-height: 1.3;">
            ${escapeHtml(prompt.title)}
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <!-- Status Badge -->
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
                        background: var(--white-10); border: 1px solid var(--border-subtle); border-radius: 20px;
                        font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">
              ${Icon({ name: statusIcon, className: '!text-[16px]' })}
              <span>${prompt.status}</span>
            </div>
            <!-- Category Badge -->
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
                        background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 20px;
                        font-size: 12px; font-weight: 500; color: var(--text-subtle); text-transform: capitalize;">
              ${Icon({ name: categoryIcon, className: '!text-[16px]' })}
              <span>${prompt.category}</span>
            </div>
            ${prompt.is_initial_prompt ? `
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
                          background: var(--white-10); border: 1px solid var(--border-subtle); border-radius: 20px;
                          font-size: 12px; font-weight: 600; color: var(--text-primary);">
                ${Icon({ name: 'auto_stories', className: '!text-[16px]' })}
                <span>Initial Prompt</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Author Info -->
        <div style="display: flex; align-items: center; gap: 12px;">
          ${prompt.users.avatar_url ? `
            <img src="${prompt.users.avatar_url}" alt="${prompt.users.display_name}"
                 style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--border-subtle);">
          ` : `
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--white-10);
                        border: 2px solid var(--border-subtle); display: flex; align-items: center; justify-content: center;
                        font-weight: 600; color: var(--text-primary);">
              ${getInitials(prompt.users.display_name)}
            </div>
          `}
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
              ${escapeHtml(prompt.users.display_name)}
            </div>
            <div style="font-size: 12px; color: var(--text-subtle);">
              ${escapeHtml(prompt.users.email)}
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      ${prompt.description ? `
        <div style="margin-bottom: 16px;">
          <p style="font-size: 15px; line-height: 1.6; color: var(--text-subtle);">
            ${escapeHtml(prompt.description)}
          </p>
        </div>
      ` : ''}

      <!-- Tags -->
      ${prompt.tags && prompt.tags.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          ${prompt.tags.map(tag => `
            <span style="padding: 6px 12px; border-radius: 8px; background: var(--white-10);
                         font-size: 12px; color: var(--text-subtle); border: 1px solid var(--border-subtle);">
              ${escapeHtml(tag)}
            </span>
          `).join('')}
        </div>
      ` : ''}

      <!-- Prompt Content -->
      <div style="background: var(--white-10); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          ${Icon({ name: 'code_blocks', className: 'text-subtle-white !text-[20px]' })}
          <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Prompt Content</span>
        </div>
        <pre style="white-space: pre-wrap; font-family: 'Inter', monospace; font-size: 14px; line-height: 1.8;
                    color: var(--text-primary); margin: 0; max-height: 400px; overflow-y: auto;">${escapeHtml(prompt.content)}</pre>
      </div>

      <!-- Metadata -->
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; font-size: 13px; color: var(--text-subtle);">
        <div style="display: flex; align-items: center; gap: 6px;">
          ${Icon({ name: 'calendar_today', className: '!text-[16px]' })}
          <span>${formatDate(prompt.created_at)}</span>
        </div>
        ${prompt.likes_count ? `
          <div style="display: flex; align-items: center; gap: 6px;">
            ${Icon({ name: 'favorite', className: '!text-[16px]' })}
            <span>${prompt.likes_count} likes</span>
          </div>
        ` : ''}
      </div>

      ${prompt.status === 'rejected' && prompt.rejection_reason ? `
        <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            ${Icon({ name: 'info', className: 'text-subtle-white !text-[18px]' })}
            <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Rejection Reason</span>
          </div>
          <p style="font-size: 14px; color: var(--text-subtle); margin: 0;">
            ${escapeHtml(prompt.rejection_reason)}
          </p>
        </div>
      ` : ''}

      <!-- Actions -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        ${prompt.status === 'pending' || prompt.status === 'rejected' ? `
          <button class="btn-approve" data-prompt-id="${prompt.id}"
                  style="display: flex; align-items: center; gap: 8px; padding: 12px 24px;
                         background: var(--primary); color: var(--background-dark); border: none;
                         border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
                         transition: all 0.3s var(--ease-spring);">
            ${Icon({ name: 'check_circle', className: '!text-[20px]' })}
            <span>Approve</span>
          </button>
        ` : ''}
        ${prompt.status === 'pending' || prompt.status === 'approved' ? `
          <button class="btn-reject" data-prompt-id="${prompt.id}"
                  style="display: flex; align-items: center; gap: 8px; padding: 12px 24px;
                         background: var(--white-10); color: var(--text-primary);
                         border: 1px solid var(--border-subtle); border-radius: 12px;
                         font-size: 14px; font-weight: 600; cursor: pointer;
                         transition: all 0.3s var(--ease-spring);">
            ${Icon({ name: 'cancel', className: '!text-[20px]' })}
            <span>${prompt.status === 'approved' ? 'Unapprove' : 'Reject'}</span>
          </button>
        ` : ''}
      </div>
    </div>
  `
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

      // Update button styles
      filterBtns.forEach(b => {
        const isActive = b.dataset.filter === currentFilter
        b.style.background = isActive ? 'var(--primary)' : 'var(--white-5)'
        b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        b.style.fontWeight = isActive ? '600' : '500'
        b.style.border = isActive ? 'none' : '1px solid var(--border-subtle)'
      })

      // Show loading
      const listContainer = container.querySelector('#admin-prompts-list')
      listContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px;
                      border-radius: 50%; background: var(--white-10); margin-bottom: 16px;">
            ${Icon({ name: 'sync', className: 'text-white !text-[32px]' })}
          </div>
          <p style="font-size: 16px; color: var(--text-subtle);">Loading prompts...</p>
        </div>
      `

      // Reload data and re-render
      await loadAdminData()
      listContainer.innerHTML = renderPromptsList()

      // Re-attach action listeners
      setupActionListeners(container)
    })

    // Hover effects
    btn.addEventListener('mouseenter', (e) => {
      if (e.target.dataset.filter !== currentFilter) {
        e.target.style.background = 'var(--white-10)'
        e.target.style.borderColor = 'var(--white-20)'
      }
    })

    btn.addEventListener('mouseleave', (e) => {
      if (e.target.dataset.filter !== currentFilter) {
        e.target.style.background = 'var(--white-5)'
        e.target.style.borderColor = 'var(--border-subtle)'
      }
    })
  })

  // Stat card hover effects
  const statCards = container.querySelectorAll('.stat-card')
  statCards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    })

    card.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
      e.currentTarget.style.transform = 'translateY(0)'
    })
  })

  // Initial action listeners
  setupActionListeners(container)
}

/**
 * Set up action button listeners
 */
function setupActionListeners(container) {
  // Prompt card hover effects
  const promptCards = container.querySelectorAll('.admin-prompt-card')
  promptCards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'
    })

    card.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
    })
  })

  // Approve buttons
  const approveBtns = container.querySelectorAll('.btn-approve')
  approveBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const promptId = btn.dataset.promptId
      await handleApprove(promptId, container)
    })

    btn.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.15)'
    })

    btn.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    })
  })

  // Reject buttons
  const rejectBtns = container.querySelectorAll('.btn-reject')
  rejectBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const promptId = btn.dataset.promptId
      await handleReject(promptId, container)
    })

    btn.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-15)'
      e.currentTarget.style.borderColor = 'var(--white-30)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    })

    btn.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-10)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
      e.currentTarget.style.transform = 'translateY(0)'
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
    const originalHTML = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = `
      ${Icon({ name: 'sync', className: '!text-[20px]' })}
      <span>Approving...</span>
    `

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
    // Restore button
    const btn = container.querySelector(`.btn-approve[data-prompt-id="${promptId}"]`)
    if (btn) {
      btn.disabled = false
      btn.innerHTML = `
        ${Icon({ name: 'check_circle', className: '!text-[20px]' })}
        <span>Approve</span>
      `
    }
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
    const originalHTML = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = `
      ${Icon({ name: 'sync', className: '!text-[20px]' })}
      <span>Rejecting...</span>
    `

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
    // Restore button
    const btn = container.querySelector(`.btn-reject[data-prompt-id="${promptId}"]`)
    if (btn) {
      btn.disabled = false
      btn.innerHTML = `
        ${Icon({ name: 'cancel', className: '!text-[20px]' })}
        <span>Reject</span>
      `
    }
  }
}

/**
 * Update stats display
 */
function updateStats(container) {
  const statCards = container.querySelectorAll('.stat-card p')
  const statValues = Array.from(statCards).filter((_, i) => i % 2 === 0)

  if (statValues[0]) statValues[0].textContent = stats.pendingCount || 0
  if (statValues[1]) statValues[1].textContent = stats.approvedCount || 0
  if (statValues[2]) statValues[2].textContent = stats.rejectedCount || 0
  if (statValues[3]) statValues[3].textContent = stats.totalUsers || 0

  // Update pending filter button
  const pendingBtn = container.querySelector('.filter-btn[data-filter="pending"]')
  if (pendingBtn) {
    const span = pendingBtn.querySelector('span')
    if (span) span.textContent = `Pending (${stats.pendingCount || 0})`
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  const colors = {
    success: 'var(--primary)',
    error: '#EF4444'
  }

  toast.style.cssText = `
    background: var(--white-10);
    border: 1px solid ${colors[type] || colors.success};
    border-radius: 12px;
    padding: 14px 18px;
    color: var(--text-primary);
    font-size: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    animation: slideIn 0.3s var(--ease-spring);
  `

  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Inject custom styles
 */
function injectStyles() {
  if (document.getElementById('admin-panel-styles')) return

  const style = document.createElement('style')
  style.id = 'admin-panel-styles'
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}

/**
 * Get initials from name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
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
