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

// Placeholder prompts for carousel demo (shown when no prompts in database)
const placeholderPrompts = [
  {
    id: 'placeholder-1',
    title: 'Code Review Assistant',
    description: 'A comprehensive prompt for reviewing code with best practices and security considerations.',
    content: 'You are an expert code reviewer. Review the following code for:\n- Code quality and readability\n- Performance optimizations\n- Security vulnerabilities\n- Best practices adherence\n\nProvide specific, actionable feedback.',
    category: 'coding',
    users: { display_name: 'Demo User', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coding' },
    likes_count: 42,
    tags: ['code-review', 'best-practices', 'security'],
    created_at: new Date().toISOString()
  },
  {
    id: 'placeholder-2',
    title: 'Creative Story Writer',
    description: 'Generate engaging short stories with vivid imagery and compelling narratives.',
    content: 'Write a creative short story (500-800 words) about [TOPIC]. Include:\n- Rich, descriptive language\n- Character development\n- An unexpected twist\n- Emotional depth',
    category: 'creative',
    users: { display_name: 'Creative Writer', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creative' },
    likes_count: 38,
    tags: ['creative-writing', 'storytelling'],
    created_at: new Date().toISOString()
  },
  {
    id: 'placeholder-3',
    title: 'Research Paper Analyzer',
    description: 'Analyze academic papers and extract key insights, methodologies, and findings.',
    content: 'Analyze this research paper and provide:\n1. Main hypothesis and research questions\n2. Methodology overview\n3. Key findings and results\n4. Limitations and future work\n5. Practical applications',
    category: 'research',
    users: { display_name: 'Academic', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=research' },
    likes_count: 29,
    tags: ['research', 'academic', 'analysis'],
    created_at: new Date().toISOString()
  }
]

/**
 * Render Library Window Content
 * Primary prompt discovery and search area
 * @param {HTMLElement} contentContainer - Window content container
 * @param {Object} userData - User data
 */
export async function renderLibraryWindow(contentContainer, userData) {
  // Remove default window-content padding for custom layout
  contentContainer.style.padding = '0'

  // Load all approved prompts and user's prompts
  allPrompts = await getApprovedPrompts()
  myPrompts = await getMyPrompts()

  // Use placeholder prompts if database is empty (for demo purposes)
  if (allPrompts.length === 0) {
    allPrompts = placeholderPrompts
  }

  filteredPrompts = allPrompts

  contentContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <!-- Recipe-Book Style Prompt Discovery Carousel -->
      <div id="prompt-carousel" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; position: relative; overflow: hidden; flex-shrink: 0; height: 280px; cursor: pointer;">
        ${renderCarousel()}
      </div>

      <!-- Prompt Details Modal -->
      <div id="prompt-modal" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 99999; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
        <div id="modal-content" style="background: linear-gradient(135deg, rgba(30, 30, 40, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%); backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; max-width: 800px; max-height: 85vh; overflow-y: auto; box-shadow: 0 30px 90px rgba(0, 0, 0, 0.8); padding: 40px; transform: scale(0.9); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;">
          <!-- Modal content will be injected here -->
        </div>
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
 * Render recipe-book style carousel - minimal with hover-to-reveal
 */
function renderCarousel() {
  if (allPrompts.length === 0) {
    return `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white;">
        <div style="text-align: center;">
          <p style="font-size: 18px; margin-bottom: 10px; opacity: 0.9;">🎨 No prompts yet</p>
          <p style="font-size: 13px; opacity: 0.6;">Submit your first prompt!</p>
        </div>
      </div>
    `
  }

  const prompt = allPrompts[currentCarouselIndex]
  const categoryIcons = {
    coding: '💻',
    writing: '✍️',
    research: '🔬',
    creative: '🎨',
    other: '📦'
  }
  const categoryColors = {
    coding: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    writing: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    research: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    creative: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    other: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
  }

  return `
    <div class="carousel-slide" data-prompt-id="${prompt.id}" style="position: relative; width: 100%; height: 100%; background: ${categoryColors[prompt.category] || categoryColors.other}; overflow: hidden;">

      <!-- Background Icon (always visible) -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 180px; opacity: 0.15; transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); pointer-events: none;">
        ${categoryIcons[prompt.category] || categoryIcons.other}
      </div>

      <!-- Subtle progress indicator -->
      <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 2;">
        ${allPrompts.slice(0, Math.min(10, allPrompts.length)).map((_, index) => `
          <div style="width: ${index === currentCarouselIndex ? '32px' : '8px'}; height: 3px; background: rgba(255, 255, 255, ${index === currentCarouselIndex ? '0.9' : '0.3'}); border-radius: 2px; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);"></div>
        `).join('')}
      </div>

      <!-- Hover overlay with details (hidden by default, revealed on hover) -->
      <div class="carousel-overlay" style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.85) 100%); backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; opacity: 0; transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none;">

        <!-- Category badge -->
        <div style="padding: 6px 16px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; transform: translateY(20px); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s, opacity 0.5s ease 0.1s;">
          ${prompt.category}
        </div>

        <!-- Title -->
        <h2 style="font-size: 32px; font-weight: 800; color: white; text-align: center; margin-bottom: 16px; line-height: 1.2; max-width: 600px; transform: translateY(20px); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s, opacity 0.5s ease 0.15s;">
          ${escapeHtml(prompt.title)}
        </h2>

        <!-- Description -->
        <p style="font-size: 15px; color: rgba(255, 255, 255, 0.85); text-align: center; max-width: 500px; line-height: 1.6; margin-bottom: 24px; transform: translateY(20px); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, opacity 0.5s ease 0.2s;">
          ${escapeHtml(prompt.description || prompt.content.substring(0, 120))}${(prompt.description || prompt.content.length > 120) ? '...' : ''}
        </p>

        <!-- Author & Stats -->
        <div style="display: flex; align-items: center; gap: 12px; color: rgba(255, 255, 255, 0.9); font-size: 13px; margin-bottom: 28px; transform: translateY(20px); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s, opacity 0.5s ease 0.25s;">
          <img src="${prompt.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" alt="Author" style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.4);">
          <span style="font-weight: 600;">${prompt.users?.display_name || 'Anonymous'}</span>
          <span style="opacity: 0.7;">•</span>
          <span>❤️ ${prompt.likes_count || 0}</span>
        </div>

        <!-- CTA hint -->
        <div style="padding: 10px 24px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 12px; font-size: 13px; color: white; font-weight: 600; transform: translateY(20px); transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s, opacity 0.5s ease 0.3s;">
          Click to view full prompt
        </div>
      </div>

      <!-- Decorative gradient overlay (always visible) -->
      <div style="position: absolute; inset: 0; background: linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%); pointer-events: none;"></div>
    </div>
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
 * Start carousel auto-rotation (continuous, no pause)
 */
function startCarousel() {
  stopCarousel()
  if (allPrompts.length > 1) {
    carouselInterval = setInterval(() => {
      currentCarouselIndex = (currentCarouselIndex + 1) % allPrompts.length
      updateCarousel()
    }, 3500) // Rotate every 3.5 seconds for smooth discovery
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
  // Click anywhere on carousel to view details
  const carouselSlide = container.querySelector('.carousel-slide')
  if (carouselSlide) {
    carouselSlide.addEventListener('click', () => {
      const promptId = carouselSlide.dataset.promptId
      showPromptModal(promptId)
    })

    // Hover effect to show overlay
    carouselSlide.addEventListener('mouseenter', () => {
      const overlay = carouselSlide.querySelector('.carousel-overlay')
      if (overlay) {
        overlay.style.opacity = '1'
        overlay.style.pointerEvents = 'auto'
        // Animate text elements in
        const elements = overlay.querySelectorAll('div, h2, p')
        elements.forEach((el, index) => {
          el.style.transform = 'translateY(0)'
          el.style.opacity = '1'
        })
      }
    })

    carouselSlide.addEventListener('mouseleave', () => {
      const overlay = carouselSlide.querySelector('.carousel-overlay')
      if (overlay) {
        overlay.style.opacity = '0'
        overlay.style.pointerEvents = 'none'
        // Reset text elements
        const elements = overlay.querySelectorAll('div, h2, p')
        elements.forEach(el => {
          el.style.transform = 'translateY(20px)'
          el.style.opacity = '0'
        })
      }
    })
  }
}

/**
 * Show prompt details in animated modal
 */
function showPromptModal(promptId) {
  const prompt = allPrompts.find(p => p.id === promptId) || myPrompts.find(p => p.id === promptId)
  if (!prompt) return

  const modal = document.getElementById('prompt-modal')
  const modalContent = document.getElementById('modal-content')
  if (!modal || !modalContent) return

  // Category info
  const categoryIcons = {
    coding: '💻',
    writing: '✍️',
    research: '🔬',
    creative: '🎨',
    other: '📦'
  }
  const categoryColors = {
    coding: '#10b981',
    writing: '#8b5cf6',
    research: '#eab308',
    creative: '#ec4899',
    other: '#64748b'
  }

  // Render modal content
  modalContent.innerHTML = `
    <div style="position: relative;">
      <!-- Close button -->
      <button id="modal-close" style="position: absolute; top: -10px; right: -10px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.transform='scale(1)'">
        ✕
      </button>

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; padding: 8px 20px; background: ${categoryColors[prompt.category]}; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
          ${categoryIcons[prompt.category]} ${prompt.category}
        </div>
        <h1 style="font-size: 36px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; line-height: 1.2;">
          ${escapeHtml(prompt.title)}
        </h1>
        ${prompt.description ? `
          <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.6;">
            ${escapeHtml(prompt.description)}
          </p>
        ` : ''}
      </div>

      <!-- Author & Meta -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 16px; padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; margin-bottom: 30px;">
        <img src="${prompt.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" alt="Author" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${categoryColors[prompt.category]};">
        <div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
            ${prompt.users?.display_name || 'Anonymous'}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            ${formatDate(prompt.created_at)}
          </div>
        </div>
        <div style="flex: 1;"></div>
        <div style="display: flex; gap: 16px; font-size: 14px; color: var(--text-secondary);">
          <span>❤️ ${prompt.likes_count || 0} likes</span>
        </div>
      </div>

      <!-- Prompt Content -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 14px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
          📋 Prompt Content
        </h3>
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px;">
          <pre style="font-size: 14px; line-height: 1.7; color: var(--text-primary); white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; margin: 0; max-height: 300px; overflow-y: auto;">${escapeHtml(prompt.content)}</pre>
        </div>
      </div>

      <!-- Tags -->
      ${prompt.tags && prompt.tags.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 14px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
            🏷️ Tags
          </h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${prompt.tags.map(tag => `
              <span style="padding: 6px 14px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; font-size: 12px; color: var(--text-secondary);">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Action Buttons -->
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button style="padding: 12px 28px; background: ${categoryColors[prompt.category]}; border: none; border-radius: 12px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s;" onclick="navigator.clipboard.writeText(\`${escapeHtml(prompt.content).replace(/`/g, '\\`')}\`); this.textContent='✓ Copied!'; setTimeout(() => this.textContent='📋 Copy Prompt', 2000)" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          📋 Copy Prompt
        </button>
      </div>
    </div>
  `

  // Show modal with animation
  modal.style.display = 'flex'
  setTimeout(() => {
    modal.style.opacity = '1'
    modalContent.style.transform = 'scale(1)'
    modalContent.style.opacity = '1'
  }, 10)

  // Attach close listener
  const closeBtn = document.getElementById('modal-close')
  const closeModal = () => {
    modal.style.opacity = '0'
    modalContent.style.transform = 'scale(0.9)'
    setTimeout(() => {
      modal.style.display = 'none'
    }, 300)
  }

  closeBtn?.addEventListener('click', closeModal)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })
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
