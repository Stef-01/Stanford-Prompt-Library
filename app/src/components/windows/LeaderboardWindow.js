/**
 * Leaderboard Window - Top Contributors & AI Tools
 * Modern monochrome design with Material Symbols Outlined icons
 */

import { Icon } from '../ui/Icon.js'
import { getTimeBasedLeaderboard } from '../../services/prompts.js'
import {
  getAIToolsLeaderboard,
  submitAITool,
  voteOnTool,
  getUserVote,
  getToolCategories
} from '../../services/ai-tools.js'
import {
  staggerIn,
  animateCounter,
  createParticleExplosion,
  showModal,
  hideModal,
  createRipple,
  pulseElement
} from '../../animations/helpers.js'
import {
  initFormAnimations,
  showInputError,
  showInputSuccess,
  setButtonLoading
} from '../../animations/form-animations.js'
import {
  ToolCardSkeleton,
  LeaderboardRowSkeleton,
  TableSkeleton,
  showLoadingState,
  hideLoadingState
} from '../SkeletonLoader.js'

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

  // Render UI structure first
  contentContainer.innerHTML = `
    <div class="leaderboard-window-content" style="height: 100%; overflow-y: auto; overflow-x: hidden;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 48px 24px 96px;">

        <!-- Hero Section -->
        <div class="text-center" style="margin-bottom: 48px; animation: fadeIn 0.4s var(--ease-spring);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                      border-radius: 20px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
            ${Icon({ name: 'leaderboard', className: 'text-white !text-[48px]' })}
          </div>
          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 700; color: var(--text-primary); margin-bottom: 16px; line-height: 1.1; letter-spacing: -0.02em;">
            Leaderboard
          </h1>
          <p style="font-size: 18px; color: var(--text-subtle); max-width: 600px; margin: 0 auto; line-height: 1.6;">
            Discover top contributors and community-recommended AI tools.
          </p>
        </div>

        <!-- View Tabs -->
        <div style="display: flex; gap: 12px; margin-bottom: 40px; justify-content: center;">
          <button
            class="view-tab ${currentView === 'users' ? 'active' : ''}"
            data-view="users"
            style="padding: 12px 24px; background: ${currentView === 'users' ? 'var(--primary)' : 'var(--white-5)'};
                   border: 1px solid ${currentView === 'users' ? 'var(--primary)' : 'var(--border-subtle)'};
                   border-radius: 12px; color: ${currentView === 'users' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                   font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s var(--ease-spring);
                   display: flex; align-items: center; gap: 8px;"
          >
            ${Icon({ name: 'workspace_premium', className: '!text-[20px]' })}
            <span>Top Contributors</span>
          </button>
          <button
            class="view-tab ${currentView === 'tools' ? 'active' : ''}"
            data-view="tools"
            style="padding: 12px 24px; background: ${currentView === 'tools' ? 'var(--primary)' : 'var(--white-5)'};
                   border: 1px solid ${currentView === 'tools' ? 'var(--primary)' : 'var(--border-subtle)'};
                   border-radius: 12px; color: ${currentView === 'tools' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                   font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s var(--ease-spring);
                   display: flex; align-items: center; gap: 8px;"
          >
            ${Icon({ name: 'build', className: '!text-[20px]' })}
            <span>Top AI Tools</span>
          </button>
        </div>

        <!-- Content Area -->
        <div id="leaderboard-content">
          ${renderSkeletonView()}
        </div>
      </div>
    </div>
  `

  // Inject custom styles
  injectStyles()

  attachEventListeners(contentContainer)

  // Load data asynchronously
  await loadLeaderboardData()
}

/**
 * Load leaderboard data and update view
 */
async function loadLeaderboardData() {
  // Load data
  leaderboardData = await getTimeBasedLeaderboard(currentFilter)
  aiTools = await getAIToolsLeaderboard(toolsFilter)
  toolCategories = await getToolCategories()

  // Load user's votes for all tools
  await loadUserVotes()

  // Update content with actual data
  const contentArea = containerRef?.querySelector('#leaderboard-content')
  if (contentArea) {
    hideLoadingState(contentArea, renderCurrentView())

    // Re-attach event listeners for the new content
    if (currentView === 'tools') {
      attachVoteListeners(containerRef)
    }
  }
}

/**
 * Render skeleton view based on current view
 */
function renderSkeletonView() {
  if (currentView === 'users') {
    return `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-subtle);">
        Loading leaderboard...
      </div>
    `
  } else {
    return `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-subtle);">
        Loading tools...
      </div>
    `
  }
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
    <!-- Filter Pills -->
    <div style="display: flex; gap: 12px; margin-bottom: 32px; justify-content: center; flex-wrap: wrap;">
      <button class="filter-pill ${currentFilter === 'all' ? 'active' : ''}" data-filter="all"
              style="padding: 10px 20px; background: ${currentFilter === 'all' ? 'var(--primary)' : 'var(--white-5)'};
                     border: 1px solid ${currentFilter === 'all' ? 'var(--primary)' : 'var(--border-subtle)'};
                     border-radius: 24px; color: ${currentFilter === 'all' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                     font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s var(--ease-spring);">
        All Time
      </button>
      <button class="filter-pill ${currentFilter === 'month' ? 'active' : ''}" data-filter="month"
              style="padding: 10px 20px; background: ${currentFilter === 'month' ? 'var(--primary)' : 'var(--white-5)'};
                     border: 1px solid ${currentFilter === 'month' ? 'var(--primary)' : 'var(--border-subtle)'};
                     border-radius: 24px; color: ${currentFilter === 'month' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                     font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s var(--ease-spring);">
        This Month
      </button>
      <button class="filter-pill ${currentFilter === 'week' ? 'active' : ''}" data-filter="week"
              style="padding: 10px 20px; background: ${currentFilter === 'week' ? 'var(--primary)' : 'var(--white-5)'};
                     border: 1px solid ${currentFilter === 'week' ? 'var(--primary)' : 'var(--border-subtle)'};
                     border-radius: 24px; color: ${currentFilter === 'week' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                     font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s var(--ease-spring);">
        This Week
      </button>
    </div>

    <!-- Leaderboard Table -->
    <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--white-5); border-bottom: 1px solid var(--border-subtle);">
            <th style="text-align: center; padding: 16px; font-size: 14px; font-weight: 600; color: var(--text-subtle);">Rank</th>
            <th style="text-align: left; padding: 16px; font-size: 14px; font-weight: 600; color: var(--text-subtle);">Contributor</th>
            <th style="text-align: center; padding: 16px; font-size: 14px; font-weight: 600; color: var(--text-subtle);">Prompts</th>
            <th style="text-align: center; padding: 16px; font-size: 14px; font-weight: 600; color: var(--text-subtle);">Likes</th>
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
    <!-- Filter Pills + Add Button -->
    <div style="display: flex; gap: 12px; margin-bottom: 32px; justify-content: space-between; align-items: center; flex-wrap: wrap;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="tools-filter-pill ${toolsFilter === 'all' ? 'active' : ''}" data-tools-filter="all"
                style="padding: 10px 20px; background: ${toolsFilter === 'all' ? 'var(--primary)' : 'var(--white-5)'};
                       border: 1px solid ${toolsFilter === 'all' ? 'var(--primary)' : 'var(--border-subtle)'};
                       border-radius: 24px; color: ${toolsFilter === 'all' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                       font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s var(--ease-spring);">
          All Time
        </button>
        <button class="tools-filter-pill ${toolsFilter === 'week' ? 'active' : ''}" data-tools-filter="week"
                style="padding: 10px 20px; background: ${toolsFilter === 'week' ? 'var(--primary)' : 'var(--white-5)'};
                       border: 1px solid ${toolsFilter === 'week' ? 'var(--primary)' : 'var(--border-subtle)'};
                       border-radius: 24px; color: ${toolsFilter === 'week' ? 'var(--background-dark)' : 'var(--text-subtle)'};
                       font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s var(--ease-spring);">
          Last Week
        </button>
      </div>
      <button
        id="add-tool-btn"
        style="padding: 12px 20px; background: var(--primary); border: none; border-radius: 12px;
               color: var(--background-dark); font-size: 14px; font-weight: 600; cursor: pointer;
               transition: all 0.3s var(--ease-spring); display: flex; align-items: center; gap: 8px;"
      >
        ${Icon({ name: 'add', className: '!text-[20px]' })}
        <span>Recommend Tool</span>
      </button>
    </div>

    <!-- Tools List -->
    <div id="tools-list" style="display: flex; flex-direction: column; gap: 16px;">
      ${renderToolsList()}
    </div>

    <!-- Submit Tool Modal (hidden by default) -->
    <div id="submit-tool-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10002; backdrop-filter: blur(8px);">
      <div class="modal-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
           background: var(--background-dark); border: 1px solid var(--border-subtle); border-radius: 20px;
           padding: 32px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;
           box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h3 style="margin: 0; font-size: 24px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 12px;">
            ${Icon({ name: 'build', className: '!text-[28px]' })}
            <span>Recommend an AI Tool</span>
          </h3>
          <button id="close-modal-btn" style="background: var(--white-5); border: 1px solid var(--border-subtle);
                  border-radius: 8px; width: 36px; height: 36px; color: var(--text-subtle); font-size: 20px;
                  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;">
            ${Icon({ name: 'close', className: '!text-[20px]' })}
          </button>
        </div>

        <form id="submit-tool-form" style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              Tool Name <span style="color: var(--text-subtle);">*</span>
            </label>
            <input type="text" name="name" required placeholder="e.g., ChatGPT" class="modal-input"
                   style="width: 100%; padding: 12px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                          border-radius: 12px; color: var(--text-primary); font-size: 15px; transition: all 0.3s;" />
          </div>

          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              Category <span style="color: var(--text-subtle);">*</span>
            </label>
            <select name="category" required class="modal-input"
                    style="width: 100%; padding: 12px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                           border-radius: 12px; color: var(--text-primary); font-size: 15px; cursor: pointer; transition: all 0.3s;">
              <option value="">Select category...</option>
              ${toolCategories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              Description <span style="color: var(--text-subtle);">*</span>
            </label>
            <textarea name="description" required rows="3" placeholder="Brief description of what makes this tool useful..." class="modal-input"
                      style="width: 100%; padding: 12px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                             border-radius: 12px; color: var(--text-primary); font-size: 15px; resize: vertical; font-family: inherit;
                             line-height: 1.6; transition: all 0.3s;"></textarea>
          </div>

          <div>
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              Website URL <span style="color: var(--text-subtle);">*</span>
            </label>
            <input type="url" name="url" required placeholder="https://example.com" class="modal-input"
                   style="width: 100%; padding: 12px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                          border-radius: 12px; color: var(--text-primary); font-size: 15px; transition: all 0.3s;" />
          </div>

          <button type="submit" style="width: 100%; padding: 14px; background: var(--primary); border: none;
                  border-radius: 12px; color: var(--background-dark); font-size: 16px; font-weight: 600;
                  cursor: pointer; margin-top: 8px; transition: all 0.3s var(--ease-spring);">
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
        <td colspan="4" style="text-align: center; padding: 60px 20px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px;
                      border-radius: 12px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
            ${Icon({ name: 'inbox', className: 'text-subtle-white !text-[32px]' })}
          </div>
          <p style="color: var(--text-subtle); font-size: 16px; margin: 0;">
            No leaderboard data yet. Be the first to contribute!
          </p>
        </td>
      </tr>
    `
  }

  return leaderboardData.map((user, index) => {
    const medals = ['🥇', '🥈', '🥉']
    const rankDisplay = index < 3 ? medals[index] : `#${index + 1}`

    return `
      <tr class="leaderboard-row" style="border-bottom: 1px solid var(--white-5); transition: background 0.2s;">
        <td style="padding: 20px; text-align: center;">
          <span style="font-size: ${index < 3 ? '24px' : '16px'}; font-weight: ${index < 3 ? '700' : '500'}; color: var(--text-primary);">
            ${rankDisplay}
          </span>
        </td>
        <td style="padding: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${user.avatar_url ? `
              <img src="${user.avatar_url}" alt="${user.display_name}"
                   style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--border-subtle);" />
            ` : `
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--white-10);
                          border: 2px solid var(--border-subtle); display: flex; align-items: center; justify-content: center;
                          font-weight: 600; font-size: 16px; color: var(--text-primary);">
                ${user.display_name[0].toUpperCase()}
              </div>
            `}
            <span style="font-size: 16px; font-weight: 500; color: var(--text-primary);">
              ${escapeHtml(user.display_name)}
            </span>
          </div>
        </td>
        <td style="padding: 20px; text-align: center;">
          <span style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
            ${user.total_prompts || 0}
          </span>
        </td>
        <td style="padding: 20px; text-align: center;">
          <span style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
            ${user.total_likes_received || 0}
          </span>
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
      <div style="text-align: center; padding: 80px 20px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                    border-radius: 16px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
          ${Icon({ name: 'build', className: 'text-subtle-white !text-[48px]' })}
        </div>
        <h3 style="color: var(--text-primary); margin-bottom: 12px; font-size: 20px;">No tools found</h3>
        <p style="color: var(--text-subtle); font-size: 16px;">Be the first to recommend an AI tool!</p>
      </div>
    `
  }

  // Apply stagger animation after render
  setTimeout(() => {
    const toolCards = containerRef?.querySelectorAll('.tool-card')
    if (toolCards) {
      staggerIn(toolCards, 50)
    }
  }, 10)

  return aiTools.map((tool, index) => {
    const medals = ['🥇', '🥈', '🥉']
    const rankBadge = index < 3 ? medals[index] : `#${index + 1}`
    const userVote = userVotes.get(tool.id)
    const hasUpvoted = userVote === 'upvote'
    const hasDownvoted = userVote === 'downvote'
    const netScore = tool.net_score || 0
    const submittedBy = tool.users?.display_name || 'Unknown'

    return `
      <div class="tool-card" style="background: var(--white-5); border: 1px solid var(--border-subtle);
           border-radius: 16px; padding: 24px; transition: all 0.3s var(--ease-spring);">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px;">

          <!-- Voting Column -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 60px;">
            <button
              class="vote-btn upvote-btn"
              data-tool-id="${tool.id}"
              data-vote-type="upvote"
              style="background: ${hasUpvoted ? 'var(--primary)' : 'var(--white-5)'};
                     border: 1px solid ${hasUpvoted ? 'var(--primary)' : 'var(--border-subtle)'};
                     border-radius: 8px; padding: 8px 14px; cursor: pointer;
                     transition: all 0.3s var(--ease-spring); font-size: 18px;
                     color: ${hasUpvoted ? 'var(--background-dark)' : 'var(--text-subtle)'};"
              title="Upvote"
            >
              ▲
            </button>
            <span class="net-score" data-score="${netScore}"
                  style="font-weight: 700; font-size: 18px; color: var(--text-primary);
                         transition: all 0.4s var(--ease-spring);">
              ${netScore > 0 ? '+' : ''}${netScore}
            </span>
            <button
              class="vote-btn downvote-btn"
              data-tool-id="${tool.id}"
              data-vote-type="downvote"
              style="background: ${hasDownvoted ? 'var(--primary)' : 'var(--white-5)'};
                     border: 1px solid ${hasDownvoted ? 'var(--primary)' : 'var(--border-subtle)'};
                     border-radius: 8px; padding: 8px 14px; cursor: pointer;
                     transition: all 0.3s var(--ease-spring); font-size: 18px;
                     color: ${hasDownvoted ? 'var(--background-dark)' : 'var(--text-subtle)'};"
              title="Downvote"
            >
              ▼
            </button>
          </div>

          <!-- Content Column -->
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
              <span style="font-size: 24px;">${rankBadge}</span>
              <h4 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--text-primary);">
                ${escapeHtml(tool.name)}
              </h4>
              <span style="font-size: 12px; padding: 6px 12px; background: var(--white-10);
                           border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: 24px; font-weight: 500;">
                ${escapeHtml(tool.category)}
              </span>
            </div>

            <p style="color: var(--text-subtle); font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              ${escapeHtml(tool.description)}
            </p>

            <div style="display: flex; gap: 16px; align-items: center; font-size: 13px; color: var(--text-subtle); flex-wrap: wrap;">
              <span style="display: flex; align-items: center; gap: 6px;">
                ${Icon({ name: 'thumb_up', className: '!text-[16px]' })}
                ${tool.upvotes_count || 0}
              </span>
              <span>•</span>
              <span style="display: flex; align-items: center; gap: 6px;">
                ${Icon({ name: 'thumb_down', className: '!text-[16px]' })}
                ${tool.downvotes_count || 0}
              </span>
              <span>•</span>
              <span>Recommended by ${escapeHtml(submittedBy)}</span>
            </div>
          </div>

          <!-- Action Column -->
          <a
            href="${tool.url}"
            target="_blank"
            rel="noopener noreferrer"
            style="padding: 12px 20px; background: var(--primary); border: none; border-radius: 12px;
                   color: var(--background-dark); font-size: 14px; font-weight: 600; cursor: pointer;
                   text-decoration: none; white-space: nowrap; transition: all 0.3s var(--ease-spring);
                   display: flex; align-items: center; gap: 8px;"
          >
            <span>Visit</span>
            ${Icon({ name: 'arrow_forward', className: '!text-[18px]' })}
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
    tab.addEventListener('click', async () => {
      const newView = tab.dataset.view
      if (newView === currentView) return

      currentView = newView
      const content = container.querySelector('#leaderboard-content')
      if (content) {
        // Show skeleton while switching
        content.innerHTML = renderSkeletonView()

        // Small delay to show skeleton
        await new Promise(resolve => setTimeout(resolve, 100))

        // Update with actual content
        hideLoadingState(content, renderCurrentView())
        attachContentListeners(container)
      }

      // Update active tab styling
      viewTabs.forEach(t => {
        const isActive = t.dataset.view === currentView
        t.style.background = isActive ? 'var(--primary)' : 'var(--white-5)'
        t.style.borderColor = isActive ? 'var(--primary)' : 'var(--border-subtle)'
        t.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
      })
    })

    // Hover effects
    tab.addEventListener('mouseenter', (e) => {
      if (!e.target.classList.contains('active')) {
        e.target.style.background = 'var(--white-10)'
        e.target.style.borderColor = 'var(--white-20)'
        e.target.style.color = 'var(--text-primary)'
      }
    })

    tab.addEventListener('mouseleave', (e) => {
      if (!e.target.classList.contains('active')) {
        e.target.style.background = 'var(--white-5)'
        e.target.style.borderColor = 'var(--border-subtle)'
        e.target.style.color = 'var(--text-subtle)'
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
          const isActive = b.dataset.filter === currentFilter
          b.style.background = isActive ? 'var(--primary)' : 'var(--white-5)'
          b.style.borderColor = isActive ? 'var(--primary)' : 'var(--border-subtle)'
          b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        })

        // Show loading state
        const tableContainer = container.querySelector('tbody')
        if (tableContainer) {
          tableContainer.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: center; padding: 40px 20px; color: var(--text-subtle);">
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
      })

      // Hover effects
      btn.addEventListener('mouseenter', (e) => {
        if (e.target.dataset.filter !== currentFilter) {
          e.target.style.background = 'var(--white-10)'
          e.target.style.borderColor = 'var(--white-20)'
          e.target.style.color = 'var(--text-primary)'
        }
      })

      btn.addEventListener('mouseleave', (e) => {
        if (e.target.dataset.filter !== currentFilter) {
          e.target.style.background = 'var(--white-5)'
          e.target.style.borderColor = 'var(--border-subtle)'
          e.target.style.color = 'var(--text-subtle)'
        }
      })
    })

    // Row hover effects
    const rows = container.querySelectorAll('.leaderboard-row')
    rows.forEach(row => {
      row.addEventListener('mouseenter', (e) => {
        e.currentTarget.style.background = 'var(--white-5)'
      })
      row.addEventListener('mouseleave', (e) => {
        e.currentTarget.style.background = 'transparent'
      })
    })
  } else if (currentView === 'tools') {
    // Tools filter buttons
    const toolsFilterBtns = container.querySelectorAll('.tools-filter-pill')
    toolsFilterBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        toolsFilter = btn.dataset.toolsFilter

        // Update button states
        toolsFilterBtns.forEach(b => {
          const isActive = b.dataset.toolsFilter === toolsFilter
          b.style.background = isActive ? 'var(--primary)' : 'var(--white-5)'
          b.style.borderColor = isActive ? 'var(--primary)' : 'var(--border-subtle)'
          b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        })

        // Show loading state
        const toolsList = container.querySelector('#tools-list')
        if (toolsList) {
          toolsList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
              <p style="color: var(--text-subtle);">Loading tools...</p>
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

      // Hover effects
      btn.addEventListener('mouseenter', (e) => {
        if (e.target.dataset.toolsFilter !== toolsFilter) {
          e.target.style.background = 'var(--white-10)'
          e.target.style.borderColor = 'var(--white-20)'
          e.target.style.color = 'var(--text-primary)'
        }
      })

      btn.addEventListener('mouseleave', (e) => {
        if (e.target.dataset.toolsFilter !== toolsFilter) {
          e.target.style.background = 'var(--white-5)'
          e.target.style.borderColor = 'var(--border-subtle)'
          e.target.style.color = 'var(--text-subtle)'
        }
      })
    })

    // Tool card hover effects
    const toolCards = container.querySelectorAll('.tool-card')
    toolCards.forEach(card => {
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

    // Add tool button
    const addToolBtn = container.querySelector('#add-tool-btn')
    addToolBtn?.addEventListener('click', () => {
      const modal = container.querySelector('#submit-tool-modal')
      const modalContent = modal?.querySelector('.modal-content')
      if (modal && modalContent) {
        showModal(modal, modalContent)
        initFormAnimations(modalContent)
      }
    })

    addToolBtn?.addEventListener('mouseenter', (e) => {
      e.target.style.transform = 'scale(1.05)'
      e.target.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.15)'
    })

    addToolBtn?.addEventListener('mouseleave', (e) => {
      e.target.style.transform = 'scale(1)'
      e.target.style.boxShadow = 'none'
    })

    // Close modal button
    const closeModalBtn = container.querySelector('#close-modal-btn')
    closeModalBtn?.addEventListener('click', () => {
      const modal = container.querySelector('#submit-tool-modal')
      const modalContent = modal?.querySelector('.modal-content')
      if (modal && modalContent) {
        hideModal(modal, modalContent)
      }
    })

    closeModalBtn?.addEventListener('mouseenter', (e) => {
      e.target.style.background = 'var(--white-10)'
      e.target.style.borderColor = 'var(--white-20)'
    })

    closeModalBtn?.addEventListener('mouseleave', (e) => {
      e.target.style.background = 'var(--white-5)'
      e.target.style.borderColor = 'var(--border-subtle)'
    })

    // Submit tool form
    const submitToolForm = container.querySelector('#submit-tool-form')
    submitToolForm?.addEventListener('submit', async (e) => {
      e.preventDefault()

      const submitBtn = submitToolForm.querySelector('button[type="submit"]')

      try {
        setButtonLoading(submitBtn, true)

        const formData = new FormData(submitToolForm)
        const toolData = {
          name: formData.get('name'),
          description: formData.get('description'),
          category: formData.get('category'),
          url: formData.get('url')
        }

        // Validate with animations
        const nameInput = submitToolForm.querySelector('input[name="name"]')
        const descInput = submitToolForm.querySelector('textarea[name="description"]')
        const categorySelect = submitToolForm.querySelector('select[name="category"]')
        const urlInput = submitToolForm.querySelector('input[name="url"]')

        let hasErrors = false

        if (!toolData.name || toolData.name.length < 2) {
          showInputError(nameInput, 'Tool name must be at least 2 characters')
          hasErrors = true
        } else {
          showInputSuccess(nameInput)
        }

        if (!toolData.description || toolData.description.length < 20) {
          showInputError(descInput, 'Description must be at least 20 characters')
          hasErrors = true
        } else {
          showInputSuccess(descInput)
        }

        if (!toolData.category) {
          showInputError(categorySelect, 'Please select a category')
          hasErrors = true
        } else {
          showInputSuccess(categorySelect)
        }

        if (!toolData.url || !toolData.url.match(/^https?:\/\//)) {
          showInputError(urlInput, 'Please enter a valid URL')
          hasErrors = true
        } else {
          showInputSuccess(urlInput)
        }

        if (hasErrors) {
          setButtonLoading(submitBtn, false)
          return
        }

        // Submit to database
        const result = await submitAITool(toolData)

        if (result.success) {
          // Close modal with animation
          const modal = container.querySelector('#submit-tool-modal')
          const modalContent = modal?.querySelector('.modal-content')
          if (modal && modalContent) {
            hideModal(modal, modalContent)
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

          // Show success message
          alert(result.message)
        }
      } catch (error) {
        console.error('Error submitting tool:', error)
        alert('❌ Failed to submit tool. Please try again.')
      } finally {
        setButtonLoading(submitBtn, false)
      }
    })

    // Modal input focus effects
    const modalInputs = container.querySelectorAll('.modal-input')
    modalInputs.forEach(input => {
      input.addEventListener('focus', (e) => {
        e.target.style.outline = 'none'
        e.target.style.boxShadow = '0 0 0 2px var(--white-20)'
        e.target.style.borderColor = 'var(--white-30)'
        e.target.style.background = 'var(--white-10)'
      })

      input.addEventListener('blur', (e) => {
        e.target.style.boxShadow = 'none'
        e.target.style.borderColor = 'var(--border-subtle)'
        e.target.style.background = 'var(--white-5)'
      })
    })

    // Click outside modal to close
    const modal = container.querySelector('#submit-tool-modal')
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        const modalContent = modal.querySelector('.modal-content')
        if (modalContent) {
          hideModal(modal, modalContent)
        }
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
    // Add ripple effect on click
    btn.addEventListener('click', (e) => {
      createRipple(e, btn)
    })

    // Hover effects
    btn.addEventListener('mouseenter', (e) => {
      e.target.style.transform = 'scale(1.1)'
    })

    btn.addEventListener('mouseleave', (e) => {
      e.target.style.transform = 'scale(1)'
    })

    btn.addEventListener('click', async (e) => {
      e.preventDefault()

      const toolId = btn.dataset.toolId
      const voteType = btn.dataset.voteType
      const toolCard = btn.closest('.tool-card')
      const scoreElement = toolCard?.querySelector('.net-score')
      const oldScore = parseInt(scoreElement?.dataset.score || '0')

      try {
        btn.disabled = true

        // Visual feedback: button animation
        btn.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.3) rotate(' + (voteType === 'upvote' ? '10' : '-10') + 'deg)' },
          { transform: 'scale(1) rotate(0deg)' }
        ], {
          duration: 300,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        })

        const result = await voteOnTool(toolId, voteType)

        if (result.success) {
          // Particle explosion at button position
          const rect = btn.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          const color = voteType === 'upvote' ? '#22c55e' : '#ef4444'
          createParticleExplosion(x, y, color, 12)

          // Update local vote cache
          if (result.action === 'removed') {
            userVotes.delete(toolId)
          } else {
            userVotes.set(toolId, voteType)
          }

          // Reload tools to get updated counts
          aiTools = await getAIToolsLeaderboard(toolsFilter)

          // Find the new score for this tool
          const updatedTool = aiTools.find(t => t.id === toolId)
          const newScore = updatedTool?.net_score || 0

          // Animate the counter if score changed
          if (scoreElement && newScore !== oldScore) {
            animateCounter(scoreElement, oldScore, newScore)
            scoreElement.dataset.score = newScore
          }

          // Pulse the tool card
          if (toolCard) {
            pulseElement(toolCard)
          }

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
 * Inject custom styles for leaderboard window
 */
function injectStyles() {
  if (document.getElementById('leaderboard-window-styles')) return

  const style = document.createElement('style')
  style.id = 'leaderboard-window-styles'
  style.textContent = `
    .modal-input option {
      background: var(--background-dark);
      color: var(--text-primary);
    }

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
  `
  document.head.appendChild(style)
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
