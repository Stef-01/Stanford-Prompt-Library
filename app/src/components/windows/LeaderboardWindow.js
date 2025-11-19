import { getTimeBasedLeaderboard } from '../../services/prompts.js'
import {
  getAIToolsLeaderboard,
  submitAITool,
  voteOnTool,
  getUserVote,
  getToolCategories
} from '../../services/ai-tools.js'

let leaderboardData = []
let currentFilter = 'all' // all, month, week
let currentView = 'users' // users, tools
let aiTools = [] // AI tools recommendations
let toolsFilter = 'all' // all, week
let containerRef = null
let toolCategories = []
let userVotes = new Map() // Cache user's votes: toolId -> 'upvote'|'downvote'

/**
 * Render Leaderboard Window Content
 * @param {HTMLElement} contentContainer - Window content container
 */
export async function renderLeaderboardWindow(contentContainer) {
  containerRef = contentContainer

  // Load data
  leaderboardData = await getTimeBasedLeaderboard(currentFilter)
  aiTools = await getAIToolsLeaderboard(toolsFilter)
  toolCategories = await getToolCategories()

  // Load user's votes for all tools
  await loadUserVotes()

  contentContainer.innerHTML = `
    <div style="padding: 20px;">
      <!-- View Tabs -->
      <div style="display: flex; gap: 15px; margin-bottom: 25px; border-bottom: 2px solid var(--border-color);">
        <button
          class="view-tab ${currentView === 'users' ? 'active' : ''}"
          data-view="users"
          style="padding: 12px 20px; background: none; border: none; border-bottom: 3px solid ${currentView === 'users' ? 'var(--accent-blue)' : 'transparent'}; color: ${currentView === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: -2px;"
        >
          🏆 Top Contributors
        </button>
        <button
          class="view-tab ${currentView === 'tools' ? 'active' : ''}"
          data-view="tools"
          style="padding: 12px 20px; background: none; border: none; border-bottom: 3px solid ${currentView === 'tools' ? 'var(--accent-purple)' : 'transparent'}; color: ${currentView === 'tools' ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: -2px;"
        >
          🛠️ Top AI Tools
        </button>
      </div>

      <!-- Content Area -->
      <div id="leaderboard-content">
        ${renderCurrentView()}
      </div>
    </div>
  `

  attachEventListeners(contentContainer)
}

/**
 * Render current view (users or tools)
 */
function renderCurrentView() {
  if (currentView === 'users') {
    return renderUsersLeaderboard()
  } else {
    return renderToolsLeaderboard()
  }
}

/**
 * Render users leaderboard
 */
function renderUsersLeaderboard() {
  return `
    <h2 style="font-size: 20px; margin-bottom: 15px;">Top Contributors</h2>
    <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px;">
      Top contributors ranked by prompts submitted and likes received
    </p>

    <!-- Filter Buttons -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <button class="btn-primary ${currentFilter === 'all' ? '' : 'inactive'}" data-filter="all">
        All Time
      </button>
      <button class="btn-primary ${currentFilter === 'month' ? 'inactive' : 'inactive'}" data-filter="month">
        This Month
      </button>
      <button class="btn-primary ${currentFilter === 'week' ? 'inactive' : 'inactive'}" data-filter="week">
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
}

/**
 * Render tools leaderboard
 */
function renderToolsLeaderboard() {
  return `
    <h2 style="font-size: 20px; margin-bottom: 15px;">Top AI Tools</h2>
    <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px;">
      Community-recommended AI tools ranked by popularity
    </p>

    <!-- Filter Buttons -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: 10px;">
        <button class="tools-filter-btn btn-primary ${toolsFilter === 'all' ? '' : 'inactive'}" data-tools-filter="all">
          🌍 All Time
        </button>
        <button class="tools-filter-btn btn-primary ${toolsFilter === 'week' ? '' : 'inactive'}" data-tools-filter="week">
          📅 Last Week
        </button>
      </div>
      <button
        id="add-tool-btn"
        class="btn-primary"
        style="background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));"
      >
        ➕ Recommend Tool
      </button>
    </div>

    <!-- Tools List -->
    <div id="tools-list" style="display: flex; flex-direction: column; gap: 15px;">
      ${renderToolsList()}
    </div>

    <!-- Submit Tool Modal (hidden by default) -->
    <div id="submit-tool-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 10002; backdrop-filter: blur(4px);">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 30px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 20px;">🛠️ Recommend an AI Tool</h3>
          <button id="close-modal-btn" style="background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px;">×</button>
        </div>

        <form id="submit-tool-form" style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">Tool Name *</label>
            <input type="text" name="name" required placeholder="e.g., ChatGPT" style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);" />
          </div>

          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">Category *</label>
            <select name="category" required style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); cursor: pointer;">
              <option value="">Select category...</option>
              ${toolCategories.map(cat => `<option value="${cat.name}">${cat.icon || ''} ${cat.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">Description *</label>
            <textarea name="description" required rows="3" placeholder="Brief description of what makes this tool useful..." style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); resize: vertical; font-family: inherit;"></textarea>
          </div>

          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600;">Website URL *</label>
            <input type="url" name="url" required placeholder="https://example.com" style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);" />
          </div>

          <button type="submit" style="width: 100%; padding: 12px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); border: none; border-radius: 8px; color: white; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px;">
            Submit Recommendation
          </button>
        </form>
      </div>
    </div>
  `
}

/**
 * Render leaderboard rows (users)
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
 * Render tools list
 */
function renderToolsList() {
  if (aiTools.length === 0) {
    return `
      <div style="text-align: center; padding: 60px 20px;">
        <p style="font-size: 48px; margin-bottom: 15px;">🛠️</p>
        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No tools found</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">Be the first to recommend an AI tool!</p>
      </div>
    `
  }

  return aiTools.map((tool, index) => {
    const rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`
    const userVote = userVotes.get(tool.id)
    const hasUpvoted = userVote === 'upvote'
    const hasDownvoted = userVote === 'downvote'
    const netScore = tool.net_score || 0
    const submittedBy = tool.users?.display_name || 'Unknown'

    return `
      <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='var(--accent-purple)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='var(--border-color)'">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px;">
          <!-- Voting Column -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 60px;">
            <button
              class="vote-btn upvote-btn"
              data-tool-id="${tool.id}"
              data-vote-type="upvote"
              style="background: ${hasUpvoted ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.1)'}; border: 1px solid ${hasUpvoted ? 'var(--accent-green)' : 'var(--border-color)'}; border-radius: 6px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 16px;"
              title="Upvote"
            >
              ▲
            </button>
            <span style="font-weight: 700; font-size: 16px; color: ${netScore > 0 ? 'var(--accent-green)' : netScore < 0 ? 'var(--accent-red)' : 'var(--text-secondary)'};">
              ${netScore > 0 ? '+' : ''}${netScore}
            </span>
            <button
              class="vote-btn downvote-btn"
              data-tool-id="${tool.id}"
              data-vote-type="downvote"
              style="background: ${hasDownvoted ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.1)'}; border: 1px solid ${hasDownvoted ? 'var(--accent-red)' : 'var(--border-color)'}; border-radius: 6px; padding: 6px 12px; cursor: pointer; transition: all 0.2s; font-size: 16px;"
              title="Downvote"
            >
              ▼
            </button>
          </div>

          <!-- Content Column -->
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
              <span style="font-size: 18px; font-weight: 700;">${rankBadge}</span>
              <h4 style="margin: 0; font-size: 18px; color: var(--text-primary);">${escapeHtml(tool.name)}</h4>
              <span style="font-size: 11px; padding: 4px 8px; background: rgba(168, 85, 247, 0.2); color: var(--accent-purple); border-radius: 8px; font-weight: 600;">
                ${escapeHtml(tool.category)}
              </span>
            </div>

            <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
              ${escapeHtml(tool.description)}
            </p>

            <div style="display: flex; gap: 15px; align-items: center; font-size: 12px; color: var(--text-secondary); flex-wrap: wrap;">
              <span>👍 ${tool.upvotes_count || 0} upvotes</span>
              <span>•</span>
              <span>👎 ${tool.downvotes_count || 0} downvotes</span>
              <span>•</span>
              <span>Recommended by ${escapeHtml(submittedBy)}</span>
            </div>
          </div>

          <!-- Action Column -->
          <a
            href="${tool.url}"
            target="_blank"
            rel="noopener noreferrer"
            style="padding: 10px 16px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); border: none; border-radius: 8px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; white-space: nowrap; transition: transform 0.2s;"
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            Visit →
          </a>
        </div>
      </div>
    `
  }).join('')
}

/**
 * Attach event listeners
 */
function attachEventListeners(container) {
  // View tabs
  const viewTabs = container.querySelectorAll('.view-tab')
  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentView = tab.dataset.view
      const content = container.querySelector('#leaderboard-content')
      if (content) {
        content.innerHTML = renderCurrentView()
        attachContentListeners(container)
      }
    })
  })

  // Attach content-specific listeners
  attachContentListeners(container)
}

/**
 * Attach content-specific listeners
 */
function attachContentListeners(container) {
  if (currentView === 'users') {
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
  } else if (currentView === 'tools') {
    // Tools filter buttons
    const toolsFilterBtns = container.querySelectorAll('.tools-filter-btn')
    toolsFilterBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        toolsFilter = btn.dataset.toolsFilter

        // Update button states
        toolsFilterBtns.forEach(b => {
          if (b.dataset.toolsFilter === toolsFilter) {
            b.classList.remove('inactive')
          } else {
            b.classList.add('inactive')
          }
        })

        // Show loading state
        const toolsList = container.querySelector('#tools-list')
        if (toolsList) {
          toolsList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
              <p style="color: var(--text-secondary);">Loading tools...</p>
            </div>
          `
        }

        // Reload tools data with new filter
        aiTools = await getAIToolsLeaderboard(toolsFilter)
        await loadUserVotes()

        // Re-render tools list
        if (toolsList) {
          toolsList.innerHTML = renderToolsList()
          attachVoteListeners(container)
        }
      })
    })

    // Add tool button
    const addToolBtn = container.querySelector('#add-tool-btn')
    addToolBtn?.addEventListener('click', () => {
      const modal = container.querySelector('#submit-tool-modal')
      if (modal) {
        modal.style.display = 'block'
      }
    })

    // Close modal button
    const closeModalBtn = container.querySelector('#close-modal-btn')
    closeModalBtn?.addEventListener('click', () => {
      const modal = container.querySelector('#submit-tool-modal')
      if (modal) {
        modal.style.display = 'none'
      }
    })

    // Submit tool form
    const submitToolForm = container.querySelector('#submit-tool-form')
    submitToolForm?.addEventListener('submit', async (e) => {
      e.preventDefault()

      const submitBtn = submitToolForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent

      try {
        submitBtn.disabled = true
        submitBtn.textContent = 'Submitting...'

        const formData = new FormData(submitToolForm)
        const toolData = {
          name: formData.get('name'),
          description: formData.get('description'),
          category: formData.get('category'),
          url: formData.get('url')
        }

        // Submit to database
        const result = await submitAITool(toolData)

        if (result.success) {
          // Close modal
          const modal = container.querySelector('#submit-tool-modal')
          if (modal) {
            modal.style.display = 'none'
          }

          // Reset form
          submitToolForm.reset()

          // Reload tools data
          aiTools = await getAIToolsLeaderboard(toolsFilter)
          await loadUserVotes()

          // Re-render tools list
          const toolsList = container.querySelector('#tools-list')
          if (toolsList) {
            toolsList.innerHTML = renderToolsList()
            attachVoteListeners(container)
          }

          alert(result.message)
        }
      } catch (error) {
        console.error('Error submitting tool:', error)
        alert('❌ Failed to submit tool. Please try again.')
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    })

    // Click outside modal to close
    const modal = container.querySelector('#submit-tool-modal')
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none'
      }
    })

    // Attach vote listeners
    attachVoteListeners(container)
  }
}

/**
 * Attach vote listeners to vote buttons
 */
function attachVoteListeners(container) {
  const voteButtons = container.querySelectorAll('.vote-btn')
  voteButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()

      const toolId = btn.dataset.toolId
      const voteType = btn.dataset.voteType

      try {
        btn.disabled = true

        const result = await voteOnTool(toolId, voteType)

        if (result.success) {
          // Update local vote cache
          if (result.action === 'removed') {
            userVotes.delete(toolId)
          } else {
            userVotes.set(toolId, voteType)
          }

          // Reload tools to get updated counts
          aiTools = await getAIToolsLeaderboard(toolsFilter)

          // Re-render tools list
          const toolsList = container.querySelector('#tools-list')
          if (toolsList) {
            toolsList.innerHTML = renderToolsList()
            attachVoteListeners(container)
          }
        }
      } catch (error) {
        console.error('Error voting:', error)
        alert('Failed to record vote. Please try again.')
      } finally {
        btn.disabled = false
      }
    })
  })
}

/**
 * Load user's votes for all tools
 */
async function loadUserVotes() {
  userVotes.clear()

  // Load votes for each tool
  for (const tool of aiTools) {
    try {
      const vote = await getUserVote(tool.id)
      if (vote) {
        userVotes.set(tool.id, vote.vote_type)
      }
    } catch (error) {
      console.error('Error loading user vote for tool:', tool.id, error)
    }
  }
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
