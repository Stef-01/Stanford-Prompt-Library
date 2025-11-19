import { getApprovedPrompts, getMyPrompts, exportPromptAsMarkdown, copyPromptToClipboard, likePrompt, hasLiked } from '../../services/prompts.js'

let allPrompts = []
let myPrompts = []
let filteredPrompts = []
let currentSearchQuery = ''
let currentCategory = 'all'
let currentSortBy = 'newest'
let currentCarouselIndex = 0
let carouselInterval = null
let currentView = 'discover' // discover, myPrompts

/**
 * Render Library Window Content
 * Primary prompt discovery and search area
 * @param {HTMLElement} contentContainer - Window content container
 * @param {Object} userData - User data
 */
export async function renderLibraryWindow(contentContainer, userData) {
  // Load all approved prompts and user's prompts
  allPrompts = await getApprovedPrompts()
  myPrompts = await getMyPrompts()
  filteredPrompts = allPrompts

  contentContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <!-- Rotating Prompt Discovery Carousel -->
      <div id="prompt-carousel" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; position: relative; overflow: hidden; flex-shrink: 0;">
        ${renderCarousel()}
      </div>

      <!-- View Toggle Tabs -->
      <div style="display: flex; gap: 10px; padding: 15px 20px; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid var(--border-color); flex-shrink: 0;">
        <button
          class="view-toggle-btn ${currentView === 'discover' ? 'active' : ''}"
          data-view="discover"
          style="flex: 1; padding: 10px 20px; background: ${currentView === 'discover' ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentView === 'discover' ? 'var(--accent-blue)' : 'var(--border-color)'}; border-radius: 8px; color: var(--text-primary); font-weight: 600; cursor: pointer; transition: all 0.2s;">
          🔍 Discover Prompts
        </button>
        <button
          class="view-toggle-btn ${currentView === 'myPrompts' ? 'active' : ''}"
          data-view="myPrompts"
          style="flex: 1; padding: 10px 20px; background: ${currentView === 'myPrompts' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentView === 'myPrompts' ? 'var(--accent-purple)' : 'var(--border-color)'}; border-radius: 8px; color: var(--text-primary); font-weight: 600; cursor: pointer; transition: all 0.2s;">
          📚 My Submissions (${myPrompts.length})
        </button>
      </div>

      <!-- Content Area -->
      <div id="library-content" style="flex: 1; overflow-y: auto; padding: 20px;">
        ${renderCurrentView()}
      </div>
    </div>
  `

  // Attach event listeners
  setupLibraryEventListeners(contentContainer)

  // Start carousel auto-rotation
  startCarousel()
}

/**
 * Render rotating prompt discovery carousel
 */
function renderCarousel() {
  if (allPrompts.length === 0) {
    return `
      <div style="text-align: center; color: white;">
        <p style="font-size: 18px; margin-bottom: 10px;">🎨 No prompts available yet</p>
        <p style="font-size: 14px; opacity: 0.9;">Be the first to submit a prompt!</p>
      </div>
    `
  }

  const prompt = allPrompts[currentCarouselIndex]

  return `
    <div style="position: relative; z-index: 1;">
      <!-- Carousel Navigation -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="color: white; font-size: 12px; font-weight: 600; opacity: 0.9;">
          ✨ PROMPT DISCOVERY
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="color: white; font-size: 12px; opacity: 0.9;">
            ${currentCarouselIndex + 1} / ${allPrompts.length}
          </span>
          <button id="carousel-prev" style="background: rgba(255, 255, 255, 0.2); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; color: white; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
            ◀
          </button>
          <button id="carousel-next" style="background: rgba(255, 255, 255, 0.2); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; color: white; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
            ▶
          </button>
          <button id="carousel-pause" style="background: rgba(255, 255, 255, 0.2); border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; color: white; font-size: 12px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
            ${carouselInterval ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      <!-- Prompt Display -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;">
        <!-- Prompt Info -->
        <div style="color: white;">
          <div style="display: inline-block; padding: 4px 12px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; font-size: 11px; font-weight: 600; margin-bottom: 15px;">
            ${prompt.category}
          </div>
          <h2 style="font-size: 24px; margin-bottom: 12px; line-height: 1.3; font-weight: 700;">
            ${escapeHtml(prompt.title)}
          </h2>
          <p style="font-size: 14px; opacity: 0.95; line-height: 1.6; margin-bottom: 20px;">
            ${escapeHtml(prompt.description || prompt.content.substring(0, 150))}${prompt.description ? '' : '...'}
          </p>
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px;">
            <img src="${prompt.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" alt="Author" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;">
            <span style="font-size: 13px; font-weight: 600;">
              ${prompt.users?.display_name || 'Anonymous'}
            </span>
            <span style="font-size: 13px; opacity: 0.8;">
              ❤️ ${prompt.likes_count || 0}
            </span>
          </div>
          <button id="carousel-view-btn" data-id="${prompt.id}" style="padding: 10px 24px; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0, 0, 0, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.2)'">
            View Details →
          </button>
        </div>

        <!-- Prompt Output Preview (Placeholder for images) -->
        <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 12px; padding: 20px; text-align: center; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid rgba(255, 255, 255, 0.2);">
          ${prompt.image_url ? `
            <img src="${prompt.image_url}" alt="Prompt output" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: contain;">
          ` : `
            <div style="font-size: 48px; margin-bottom: 10px; opacity: 0.7;">🎨</div>
            <p style="color: white; font-size: 13px; opacity: 0.8;">Output preview</p>
            <pre style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; font-size: 11px; line-height: 1.4; color: white; margin-top: 15px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: pre-wrap; max-height: 120px; overflow-y: auto;">${escapeHtml(prompt.content.substring(0, 200))}...</pre>
          `}
        </div>
      </div>

      <!-- Progress Dots -->
      <div style="display: flex; gap: 6px; justify-content: center; margin-top: 20px;">
        ${allPrompts.slice(0, Math.min(10, allPrompts.length)).map((_, index) => `
          <div style="width: ${index === currentCarouselIndex ? '24px' : '8px'}; height: 8px; background: rgba(255, 255, 255, ${index === currentCarouselIndex ? '1' : '0.3'}); border-radius: 4px; transition: all 0.3s; cursor: pointer;" data-carousel-dot="${index}"></div>
        `).join('')}
        ${allPrompts.length > 10 ? `<span style="color: white; font-size: 12px; opacity: 0.8; margin-left: 5px;">+${allPrompts.length - 10}</span>` : ''}
      </div>
    </div>

    <!-- Decorative Background Pattern -->
    <div style="position: absolute; inset: 0; opacity: 0.1; background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px; pointer-events: none;"></div>
  `
}

/**
 * Render current view content
 */
function renderCurrentView() {
  if (currentView === 'myPrompts') {
    return renderMyPromptsView()
  } else {
    return renderDiscoverView()
  }
}

/**
 * Render discover prompts view
 */
function renderDiscoverView() {
  return `
    <!-- Search and Filters -->
    <div style="margin-bottom: 25px;">
      <!-- Search Bar -->
      <div style="position: relative; margin-bottom: 15px;">
        <input
          type="text"
          id="prompt-search"
          class="search-bar"
          placeholder="🔍 Search prompts by title, description, or tags..."
          value="${currentSearchQuery}"
          style="width: 100%; padding: 14px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); font-size: 14px;"
        />
      </div>

      <!-- Filters and Sort -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <!-- Category Filters -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; flex: 1;">
          <button class="category-filter-btn ${currentCategory === 'all' ? 'active' : ''}" data-category="all" style="padding: 8px 16px; background: ${currentCategory === 'all' ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentCategory === 'all' ? 'var(--accent-blue)' : 'var(--border-color)'}; border-radius: 20px; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            All
          </button>
          <button class="category-filter-btn ${currentCategory === 'writing' ? 'active' : ''}" data-category="writing" style="padding: 8px 16px; background: ${currentCategory === 'writing' ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentCategory === 'writing' ? 'var(--accent-purple)' : 'var(--border-color)'}; border-radius: 20px; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            ✍️ Writing
          </button>
          <button class="category-filter-btn ${currentCategory === 'coding' ? 'active' : ''}" data-category="coding" style="padding: 8px 16px; background: ${currentCategory === 'coding' ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentCategory === 'coding' ? 'var(--accent-green)' : 'var(--border-color)'}; border-radius: 20px; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            💻 Coding
          </button>
          <button class="category-filter-btn ${currentCategory === 'research' ? 'active' : ''}" data-category="research" style="padding: 8px 16px; background: ${currentCategory === 'research' ? 'var(--accent-yellow)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentCategory === 'research' ? 'var(--accent-yellow)' : 'var(--border-color)'}; border-radius: 20px; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            🔬 Research
          </button>
          <button class="category-filter-btn ${currentCategory === 'creative' ? 'active' : ''}" data-category="creative" style="padding: 8px 16px; background: ${currentCategory === 'creative' ? '#ec4899' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentCategory === 'creative' ? '#ec4899' : 'var(--border-color)'}; border-radius: 20px; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            🎨 Creative
          </button>
          <button class="category-filter-btn ${currentCategory === 'other' ? 'active' : ''}" data-category="other" style="padding: 8px 16px; background: ${currentCategory === 'other' ? '#64748b' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${currentCategory === 'other' ? '#64748b' : 'var(--border-color)'}; border-radius: 20px; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            📦 Other
          </button>
        </div>

        <!-- Sort Dropdown -->
        <select id="sort-select" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 12px; font-weight: 600; cursor: pointer;">
          <option value="newest" ${currentSortBy === 'newest' ? 'selected' : ''}>🕐 Newest First</option>
          <option value="oldest" ${currentSortBy === 'oldest' ? 'selected' : ''}>📅 Oldest First</option>
          <option value="likes" ${currentSortBy === 'likes' ? 'selected' : ''}>❤️ Most Liked</option>
        </select>
      </div>

      <!-- Results Count -->
      <div style="margin-top: 15px; font-size: 13px; color: var(--text-secondary);">
        ${filteredPrompts.length} prompt${filteredPrompts.length !== 1 ? 's' : ''} found
      </div>
    </div>

    <!-- Prompts Grid -->
    <div id="prompts-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
      ${renderPromptsGrid()}
    </div>
  `
}

/**
 * Render prompts grid
 */
function renderPromptsGrid() {
  if (filteredPrompts.length === 0) {
    return `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
        <p style="font-size: 48px; margin-bottom: 15px;">🔍</p>
        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No prompts found</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">Try adjusting your filters or search query</p>
      </div>
    `
  }

  return filteredPrompts.map(prompt => {
    const categoryColors = {
      writing: '#8b5cf6',
      coding: '#10b981',
      research: '#eab308',
      creative: '#ec4899',
      other: '#64748b'
    }

    return `
      <div class="prompt-card" data-id="${prompt.id}" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden;" onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='var(--accent-blue)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='var(--border-color)'; this.style.transform='translateY(0)'">

        <!-- Category Badge -->
        <div style="position: absolute; top: 15px; right: 15px; padding: 4px 10px; background: ${categoryColors[prompt.category] || '#64748b'}; color: white; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; z-index: 1;">
          ${prompt.category}
        </div>

        <!-- Preview Image or Icon -->
        ${prompt.image_url ? `
          <div style="width: 100%; height: 140px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
            <img src="${prompt.image_url}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        ` : `
          <div style="width: 100%; height: 140px; background: linear-gradient(135deg, ${categoryColors[prompt.category]}22 0%, ${categoryColors[prompt.category]}11 100%); border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; font-size: 48px;">
            ${getCategoryIcon(prompt.category)}
          </div>
        `}

        <!-- Title -->
        <h3 style="font-size: 16px; margin-bottom: 10px; color: var(--text-primary); line-height: 1.4; font-weight: 600; padding-right: 60px;">
          ${escapeHtml(prompt.title)}
        </h3>

        <!-- Description -->
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(prompt.description || prompt.content.substring(0, 100))}
        </p>

        <!-- Author and Stats -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${prompt.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" alt="Author" style="width: 20px; height: 20px; border-radius: 50%;">
            <span style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">
              ${prompt.users?.display_name || 'Anonymous'}
            </span>
          </div>
          <div style="display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary);">
            <span>❤️ ${prompt.likes_count || 0}</span>
          </div>
        </div>

        <!-- Tags -->
        ${prompt.tags && prompt.tags.length > 0 ? `
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px;">
            ${prompt.tags.slice(0, 3).map(tag => `
              <span style="font-size: 10px; padding: 3px 8px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; color: var(--text-secondary);">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
            ${prompt.tags.length > 3 ? `<span style="font-size: 10px; padding: 3px 8px; color: var(--text-secondary);">+${prompt.tags.length - 3}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `
  }).join('')
}

/**
 * Render my prompts view
 */
function renderMyPromptsView() {
  return `
    <div>
      <!-- Stats Summary -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 30px;">
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-blue);">${myPrompts.length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Total Prompts</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-green);">${myPrompts.filter(p => p.status === 'approved').length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Approved</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-yellow);">${myPrompts.filter(p => p.status === 'pending').length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Pending</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-red);">${myPrompts.filter(p => p.status === 'rejected').length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Rejected</p>
        </div>
      </div>

      <!-- My Prompts List -->
      <div id="my-prompts-list">
        ${renderMyPromptsList()}
      </div>
    </div>
  `
}

/**
 * Render user's prompts list
 */
function renderMyPromptsList() {
  if (myPrompts.length === 0) {
    return `
      <div style="text-align: center; padding: 60px 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
        <p style="font-size: 48px; margin-bottom: 15px;">📝</p>
        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No prompts yet</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">Submit your first prompt to get started!</p>
      </div>
    `
  }

  return myPrompts.map(prompt => {
    const statusColors = {
      pending: 'var(--accent-yellow)',
      approved: 'var(--accent-green)',
      rejected: 'var(--accent-red)'
    }

    const statusIcons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌'
    }

    return `
      <div class="my-prompt-card" data-id="${prompt.id}" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${statusColors[prompt.status] || 'var(--border-color)'};">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div style="flex: 1;">
            <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text-primary);">${escapeHtml(prompt.title)}</h3>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; font-size: 12px; font-weight: 600; color: ${statusColors[prompt.status]};">
                ${statusIcons[prompt.status]} ${prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
              </span>
              <span style="padding: 4px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; font-size: 12px; color: var(--text-secondary);">
                ${prompt.category}
              </span>
              <span style="font-size: 12px; color: var(--text-secondary);">
                📅 ${formatDate(prompt.created_at)}
              </span>
            </div>
          </div>
          <button class="export-btn" data-id="${prompt.id}" title="Export as markdown" style="background: rgba(255, 255, 255, 0.1); border: none; border-radius: 6px; padding: 8px 12px; cursor: pointer; color: var(--text-primary); font-size: 14px;">
            ⬇️
          </button>
        </div>

        <!-- Description -->
        ${prompt.description ? `
          <p style="color: var(--text-secondary); margin-bottom: 15px; font-size: 14px; line-height: 1.5;">
            ${escapeHtml(prompt.description)}
          </p>
        ` : ''}

        <!-- Tags -->
        ${prompt.tags && prompt.tags.length > 0 ? `
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 15px;">
            ${prompt.tags.map(tag => `
              <span style="padding: 3px 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; font-size: 11px; color: var(--text-secondary);">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <!-- Content Preview -->
        <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
          <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; text-transform: uppercase; font-weight: 600;">Prompt Content</div>
          <pre style="font-size: 13px; line-height: 1.5; color: var(--text-primary); white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; max-height: 150px; overflow-y: auto; margin: 0;">${escapeHtml(prompt.content.substring(0, 300))}${prompt.content.length > 300 ? '...' : ''}</pre>
        </div>

        <!-- Rejection Reason (if rejected) -->
        ${prompt.status === 'rejected' && prompt.rejection_reason ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
            <div style="font-size: 11px; color: var(--accent-red); margin-bottom: 5px; text-transform: uppercase; font-weight: 600;">❌ Rejection Reason</div>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">${escapeHtml(prompt.rejection_reason)}</p>
          </div>
        ` : ''}

        <!-- Stats -->
        <div style="display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary);">
          ${prompt.status === 'approved' ? `
            <span>❤️ ${prompt.likes_count || 0} likes</span>
          ` : ''}
          ${prompt.is_initial_prompt ? '<span style="color: var(--accent-purple);">⭐ Initial Prompt</span>' : ''}
        </div>
      </div>
    `
  }).join('')
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
  const icons = {
    writing: '✍️',
    coding: '💻',
    research: '🔬',
    creative: '🎨',
    other: '📦'
  }
  return icons[category] || '📝'
}

/**
 * Filter prompts based on search and filters
 */
function filterPrompts() {
  let filtered = allPrompts

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory)
  }

  // Filter by search query
  if (currentSearchQuery.trim()) {
    const query = currentSearchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Sort
  if (currentSortBy === 'likes') {
    filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
  } else if (currentSortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  filteredPrompts = filtered
}

/**
 * Start carousel auto-rotation
 */
function startCarousel() {
  stopCarousel()
  if (allPrompts.length > 1) {
    carouselInterval = setInterval(() => {
      currentCarouselIndex = (currentCarouselIndex + 1) % allPrompts.length
      updateCarousel()
    }, 5000) // Rotate every 5 seconds
  }
}

/**
 * Stop carousel auto-rotation
 */
function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

/**
 * Update carousel display
 */
function updateCarousel() {
  const carouselContainer = document.getElementById('prompt-carousel')
  if (carouselContainer) {
    carouselContainer.innerHTML = renderCarousel()
    attachCarouselListeners(carouselContainer)
  }
}

/**
 * Attach carousel event listeners
 */
function attachCarouselListeners(container) {
  // Previous button
  const prevBtn = container.querySelector('#carousel-prev')
  prevBtn?.addEventListener('click', () => {
    stopCarousel()
    currentCarouselIndex = (currentCarouselIndex - 1 + allPrompts.length) % allPrompts.length
    updateCarousel()
  })

  // Next button
  const nextBtn = container.querySelector('#carousel-next')
  nextBtn?.addEventListener('click', () => {
    stopCarousel()
    currentCarouselIndex = (currentCarouselIndex + 1) % allPrompts.length
    updateCarousel()
  })

  // Pause/Play button
  const pauseBtn = container.querySelector('#carousel-pause')
  pauseBtn?.addEventListener('click', () => {
    if (carouselInterval) {
      stopCarousel()
    } else {
      startCarousel()
    }
    updateCarousel()
  })

  // View details button
  const viewBtn = container.querySelector('#carousel-view-btn')
  viewBtn?.addEventListener('click', () => {
    const promptId = viewBtn.dataset.id
    showPromptDetails(promptId)
  })

  // Dot navigation
  const dots = container.querySelectorAll('[data-carousel-dot]')
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopCarousel()
      currentCarouselIndex = parseInt(dot.dataset.carouselDot)
      updateCarousel()
    })
  })
}

/**
 * Show prompt details modal
 */
function showPromptDetails(promptId) {
  const prompt = allPrompts.find(p => p.id === promptId) || myPrompts.find(p => p.id === promptId)
  if (!prompt) return

  alert(`📋 Prompt Details\n\n${prompt.title}\n\n${prompt.description || ''}\n\nPrompt content:\n${prompt.content.substring(0, 200)}...\n\n(Full prompt modal coming soon!)`)
}

/**
 * Set up event listeners
 */
function setupLibraryEventListeners(contentContainer) {
  // View toggle buttons
  const viewToggleBtns = contentContainer.querySelectorAll('.view-toggle-btn')
  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view
      if (view !== currentView) {
        currentView = view
        const contentArea = contentContainer.querySelector('#library-content')
        if (contentArea) {
          contentArea.innerHTML = renderCurrentView()
          reattachContentListeners(contentArea)
        }

        // Update button styles
        viewToggleBtns.forEach(b => {
          const isActive = b.dataset.view === currentView
          b.style.background = isActive ? (currentView === 'discover' ? 'var(--accent-blue)' : 'var(--accent-purple)') : 'rgba(255, 255, 255, 0.05)'
          b.style.borderColor = isActive ? (currentView === 'discover' ? 'var(--accent-blue)' : 'var(--accent-purple)') : 'var(--border-color)'
        })
      }
    })
  })

  // Carousel listeners
  const carouselContainer = contentContainer.querySelector('#prompt-carousel')
  if (carouselContainer) {
    attachCarouselListeners(carouselContainer)
  }

  // Content listeners
  const contentArea = contentContainer.querySelector('#library-content')
  if (contentArea) {
    reattachContentListeners(contentArea)
  }
}

/**
 * Reattach content listeners after view change
 */
function reattachContentListeners(contentArea) {
  if (currentView === 'discover') {
    // Search input
    const searchInput = contentArea.querySelector('#prompt-search')
    searchInput?.addEventListener('input', debounce((e) => {
      currentSearchQuery = e.target.value
      filterPrompts()
      const grid = contentArea.querySelector('#prompts-grid')
      if (grid) {
        grid.innerHTML = renderPromptsGrid()
        attachPromptCardListeners(grid)
      }
    }, 300))

    // Category filters
    const categoryBtns = contentArea.querySelectorAll('.category-filter-btn')
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category
        filterPrompts()

        // Update button styles
        categoryBtns.forEach(b => {
          const isActive = b.dataset.category === currentCategory
          const activeColor = b.dataset.category === 'all' ? 'var(--accent-blue)' :
                             b.dataset.category === 'writing' ? 'var(--accent-purple)' :
                             b.dataset.category === 'coding' ? 'var(--accent-green)' :
                             b.dataset.category === 'research' ? 'var(--accent-yellow)' :
                             b.dataset.category === 'creative' ? '#ec4899' : '#64748b'

          b.style.background = isActive ? activeColor : 'rgba(255, 255, 255, 0.05)'
          b.style.borderColor = isActive ? activeColor : 'var(--border-color)'
        })

        const grid = contentArea.querySelector('#prompts-grid')
        if (grid) {
          grid.innerHTML = renderPromptsGrid()
          attachPromptCardListeners(grid)
        }
      })
    })

    // Sort select
    const sortSelect = contentArea.querySelector('#sort-select')
    sortSelect?.addEventListener('change', (e) => {
      currentSortBy = e.target.value
      filterPrompts()
      const grid = contentArea.querySelector('#prompts-grid')
      if (grid) {
        grid.innerHTML = renderPromptsGrid()
        attachPromptCardListeners(grid)
      }
    })

    // Prompt cards
    const grid = contentArea.querySelector('#prompts-grid')
    if (grid) {
      attachPromptCardListeners(grid)
    }
  } else {
    // Export buttons
    const exportBtns = contentArea.querySelectorAll('.export-btn')
    exportBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const promptId = btn.dataset.id
        const prompt = myPrompts.find(p => p.id === promptId)
        if (prompt) {
          await exportPromptAsMarkdown(prompt)
        }
      })
    })
  }
}

/**
 * Attach prompt card listeners
 */
function attachPromptCardListeners(grid) {
  const cards = grid.querySelectorAll('.prompt-card')
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const promptId = card.dataset.id
      showPromptDetails(promptId)
    })
  })
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
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Recently'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return 'Today'
  } else if (diffDays < 2) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
