import { getApprovedPrompts, getMyPrompts, exportPromptAsMarkdown, copyPromptToClipboard, likePrompt, hasLiked } from '../../services/prompts.js'
import { Icon } from '../ui/Icon.js'

let allPrompts = []
let myPrompts = []
let filteredPrompts = []
let currentSearchQuery = ''
let currentCategory = 'all'
let currentSortBy = 'newest'
let currentCarouselIndex = 0
let carouselInterval = null
let currentView = 'discover' // discover, myPrompts
let currentViewMode = 'details' // details, image, featured
let discoveryMode = 'featured' // hot, featured, new

// Placeholder prompts for carousel demo
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

const CATEGORIES = ['All', 'Writing', 'Coding', 'Research', 'Creative', 'Other']

/**
 * Capitalize first letter of a string
 */
function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Render Library Window - Monochrome Design
 */
export async function renderLibraryWindow(contentContainer, userData) {
  contentContainer.style.padding = '0'

  // Load prompts
  allPrompts = await getApprovedPrompts()
  myPrompts = await getMyPrompts()

  if (allPrompts.length === 0) {
    allPrompts = placeholderPrompts
  }

  filteredPrompts = allPrompts

  contentContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">

      <!-- Carousel Modal (Hidden) -->
      <div id="carousel-modal" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95);
                                       backdrop-filter: blur(12px); z-index: 99999; opacity: 0; transition: opacity 0.3s ease;">
        <div id="carousel-modal-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
                                                 transform: scale(0.95); transition: transform 0.4s var(--ease-spring), opacity 0.3s ease;">
          <!-- Carousel content will be injected here -->
        </div>
      </div>

      <!-- Prompt Details Modal -->
      <div id="prompt-modal" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9);
                                     backdrop-filter: blur(12px); z-index: 99999; align-items: center; justify-content: center;
                                     opacity: 0; transition: opacity 0.3s ease;">
        <div id="modal-content" style="background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(var(--glass-blur));
                                        border: 1px solid var(--border-subtle); border-radius: 16px;
                                        max-width: 800px; max-height: 85vh; overflow-y: auto;
                                        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.8); padding: 40px;
                                        transform: scale(0.9); transition: transform 0.4s var(--ease-spring), opacity 0.3s ease;">
          <!-- Modal content will be injected here -->
        </div>
      </div>

      <!-- Header Controls - Compact -->
      <div style="padding: 12px 20px; background: var(--white-5); border-bottom: 1px solid var(--border-subtle); flex-shrink: 0;">
        <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between;">
          <!-- View Toggle Tabs (Left) -->
          <div style="display: flex; gap: 8px;">
            <button
              class="view-toggle-btn ${currentView === 'discover' ? 'active' : ''}"
              data-view="discover"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer;
                     font-weight: 600; font-size: 13px; transition: all 0.4s var(--ease-spring);
                     ${currentView === 'discover'
                       ? 'background: var(--primary); color: var(--background-dark); box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);'
                       : 'background: var(--white-5); color: var(--text-subtle); border: 1px solid var(--border-subtle);'}">
              ${Icon({ name: 'explore', className: '!text-[16px]' })}
              <span>Discover</span>
            </button>
            <button
              class="view-toggle-btn ${currentView === 'myPrompts' ? 'active' : ''}"
              data-view="myPrompts"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer;
                     font-weight: 600; font-size: 13px; transition: all 0.4s var(--ease-spring);
                     ${currentView === 'myPrompts'
                       ? 'background: var(--primary); color: var(--background-dark); box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);'
                       : 'background: var(--white-5); color: var(--text-subtle); border: 1px solid var(--border-subtle);'}">
              ${Icon({ name: 'auto_stories', className: '!text-[16px]' })}
              <span>My Submissions (${myPrompts.length})</span>
            </button>
          </div>

          <!-- View Mode Toggle (Right) -->
          <div style="display: flex; gap: 4px; background: var(--white-5); border: 1px solid var(--border-subtle);
                      border-radius: 10px; padding: 3px;">
            <button
              class="view-mode-btn ${currentViewMode === 'details' ? 'active' : ''}"
              data-mode="details"
              style="padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 500;
                     transition: all 0.3s var(--ease-spring); display: inline-flex; align-items: center; gap: 5px;
                     ${currentViewMode === 'details'
                       ? 'background: var(--primary); color: var(--background-dark);'
                       : 'background: transparent; color: var(--text-subtle);'}">
              ${Icon({ name: 'view_list', className: '!text-[14px]' })}
              <span>Details</span>
            </button>
            <button
              class="view-mode-btn ${currentViewMode === 'image' ? 'active' : ''}"
              data-mode="image"
              style="padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 500;
                     transition: all 0.3s var(--ease-spring); display: inline-flex; align-items: center; gap: 5px;
                     ${currentViewMode === 'image'
                       ? 'background: var(--primary); color: var(--background-dark);'
                       : 'background: transparent; color: var(--text-subtle);'}">
              ${Icon({ name: 'image', className: '!text-[14px]' })}
              <span>Images</span>
            </button>
            <button
              class="view-mode-btn ${currentViewMode === 'featured' ? 'active' : ''}"
              data-mode="featured"
              style="padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 500;
                     transition: all 0.3s var(--ease-spring); display: inline-flex; align-items: center; gap: 5px;
                     ${currentViewMode === 'featured'
                       ? 'background: var(--primary); color: var(--background-dark);'
                       : 'background: transparent; color: var(--text-subtle);'}">
              ${Icon({ name: 'stars', className: '!text-[14px]' })}
              <span>Featured</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div id="library-content" style="flex: 1; overflow-y: auto; padding: 24px;">
        ${renderCurrentView()}
      </div>
    </div>
  `

  setupLibraryEventListeners(contentContainer)
}

/**
 * Render monochrome carousel
 */
function renderCarousel() {
  if (allPrompts.length === 0) {
    return `
      <div style="display: flex; align-items: center; justify-center; height: 100%; color: var(--text-primary);">
        <div style="text-align: center;">
          ${Icon({ name: 'auto_stories', className: '!text-[48px] mb-4 opacity-50' })}
          <p style="font-size: 18px; margin-bottom: 10px; opacity: 0.9;">No prompts yet</p>
          <p style="font-size: 13px; opacity: 0.6; color: var(--text-subtle);">Submit your first prompt!</p>
        </div>
      </div>
    `
  }

  const prompt = allPrompts[currentCarouselIndex]
  const categoryIcons = {
    coding: 'code',
    writing: 'edit_note',
    research: 'science',
    creative: 'palette',
    other: 'folder'
  }

  return `
    <div class="carousel-slide" data-prompt-id="${prompt.id}"
         style="position: relative; width: 100%; height: 100%; overflow: hidden;
                background: linear-gradient(135deg, var(--white-10) 0%, var(--white-5) 100%);">

      <!-- Background Icon -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  opacity: 0.08; transition: all 0.6s var(--ease-spring); pointer-events: none;">
        ${Icon({ name: categoryIcons[prompt.category] || 'folder', className: '!text-[180px]' })}
      </div>

      <!-- Content Overlay -->
      <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center;
                  padding: 40px; background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%);">

        <!-- Category Badge -->
        <div style="margin-bottom: 16px;">
          <span style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
                       background: var(--white-10); border: 1px solid var(--white-20); border-radius: 24px;
                       font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: uppercase;">
            ${Icon({ name: categoryIcons[prompt.category] || 'folder', className: '!text-[16px]' })}
            ${prompt.category}
          </span>
        </div>

        <!-- Title -->
        <h2 style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; line-height: 1.2;">
          ${escapeHtml(prompt.title)}
        </h2>

        <!-- Description -->
        <p style="font-size: 16px; color: rgba(255, 255, 255, 0.8); line-height: 1.6; max-width: 600px; margin-bottom: 20px;">
          ${escapeHtml(prompt.description || prompt.content.substring(0, 150))}
        </p>

        <!-- Author -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${prompt.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}"
               alt="Author" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--white-20);">
          <span style="font-size: 14px; color: var(--text-subtle); font-weight: 500;">
            ${prompt.users?.display_name || 'Anonymous'}
          </span>
          <span style="margin-left: auto; display: flex; align-items: center; gap: 6px;
                       padding: 6px 12px; background: var(--white-10); border-radius: 16px; font-size: 14px; color: var(--text-primary);">
            ${Icon({ name: 'favorite', className: '!text-[16px]' })}
            ${prompt.likes_count || 0}
          </span>
        </div>
      </div>

      <!-- Navigation Dots -->
      <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10;">
        ${allPrompts.map((_, index) => `
          <div style="width: ${index === currentCarouselIndex ? '24px' : '8px'}; height: 8px; border-radius: 4px;
                      background: ${index === currentCarouselIndex ? 'var(--primary)' : 'var(--white-20)'};
                      transition: all 0.4s var(--ease-spring); cursor: pointer;"
               data-carousel-index="${index}"></div>
        `).join('')}
      </div>
    </div>
  `
}

/**
 * Render current view
 */
function renderCurrentView() {
  return currentView === 'myPrompts' ? renderMyPromptsView() : renderDiscoverView()
}

/**
 * Render discover view - Monochrome
 */
function renderDiscoverView() {
  // If featured mode, show carousel fullscreen in content area
  if (currentViewMode === 'featured') {
    return `
      <div id="featured-carousel-container" style="position: fixed; inset: 0; top: var(--notch-height, 32px);
                                                     background: var(--background-dark); z-index: 1; margin: 0;">

        <!-- Exit Button and Discovery Mode Selector -->
        <div style="position: absolute; top: 12px; left: 0; right: 0; z-index: 10; padding: 0 20px; display: flex; align-items: center; justify-content: space-between;">
          <!-- Discovery Mode Selector -->
          <div style="display: flex; gap: 8px; background: var(--white-10); backdrop-filter: blur(12px);
                      border: 1px solid var(--border-subtle); border-radius: 12px; padding: 6px;">
            <button
              class="discovery-mode-btn ${discoveryMode === 'hot' ? 'active' : ''}"
              data-discovery-mode="hot"
              style="padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600;
                     transition: all 0.3s var(--ease-spring); display: inline-flex; align-items: center; gap: 6px;
                     ${discoveryMode === 'hot'
                       ? 'background: var(--primary); color: var(--background-dark);'
                       : 'background: transparent; color: var(--text-subtle);'}">
              ${Icon({ name: 'local_fire_department', className: '!text-[16px]' })}
              <span>Hot</span>
            </button>
            <button
              class="discovery-mode-btn ${discoveryMode === 'featured' ? 'active' : ''}"
              data-discovery-mode="featured"
              style="padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600;
                     transition: all 0.3s var(--ease-spring); display: inline-flex; align-items: center; gap: 6px;
                     ${discoveryMode === 'featured'
                       ? 'background: var(--primary); color: var(--background-dark);'
                       : 'background: transparent; color: var(--text-subtle);'}">
              ${Icon({ name: 'star', className: '!text-[16px]' })}
              <span>Featured</span>
            </button>
            <button
              class="discovery-mode-btn ${discoveryMode === 'new' ? 'active' : ''}"
              data-discovery-mode="new"
              style="padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600;
                     transition: all 0.3s var(--ease-spring); display: inline-flex; align-items: center; gap: 6px;
                     ${discoveryMode === 'new'
                       ? 'background: var(--primary); color: var(--background-dark);'
                       : 'background: transparent; color: var(--text-subtle);'}">
              ${Icon({ name: 'fiber_new', className: '!text-[16px]' })}
              <span>New</span>
            </button>
          </div>

          <!-- Exit Button -->
          <button
            id="exit-featured-btn"
            style="width: 40px; height: 40px; border-radius: 50%; background: var(--white-10); backdrop-filter: blur(12px);
                   border: 1px solid var(--border-subtle); cursor: pointer; display: flex; align-items: center; justify-content: center;
                   transition: all 0.3s var(--ease-spring); color: var(--text-primary);">
            ${Icon({ name: 'close', className: '!text-[24px]' })}
          </button>
        </div>

        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding-top: calc(12px + 56px);">
          <div id="prompt-carousel" style="width: 100%; height: 100%; position: relative;">
            ${renderCarousel()}
          </div>
        </div>
      </div>
    `
  }

  // Normal grid view (details or images)
  return `
    <!-- Search and Filters -->
    <div style="margin-bottom: 32px;">
      <!-- Search Bar -->
      <div style="position: relative; margin-bottom: 20px; max-width: 600px;">
        ${Icon({ name: 'search', className: 'search-icon-lib' })}
        <input
          type="text"
          id="prompt-search"
          class="library-search-input"
          placeholder="Search prompts by title, description, or tags..."
          value="${currentSearchQuery}"
          style="width: 100%; padding-left: 48px; padding-right: 16px; padding-top: 14px; padding-bottom: 14px;
                 background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px;
                 color: var(--text-primary); font-size: 16px; transition: all 0.4s var(--ease-spring);"
        />
      </div>

      <!-- Filters and Sort -->
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 16px;">
        <!-- Category Filters -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; flex: 1;">
          ${CATEGORIES.map(category => `
            <button
              class="category-filter-btn ${currentCategory === category.toLowerCase() ? 'active' : ''}"
              data-category="${category.toLowerCase()}"
              style="padding: 10px 20px; font-size: 14px; font-weight: 500; border-radius: 24px; border: none; cursor: pointer;
                     transition: all 0.4s var(--ease-spring);
                     ${currentCategory === category.toLowerCase()
                       ? 'background: var(--primary); color: var(--background-dark); box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1); transform: scale(1.05);'
                       : 'background: var(--white-5); color: var(--text-subtle); border: 1px solid var(--white-10);'}">
              ${category}
            </button>
          `).join('')}
        </div>

        <!-- Sort Dropdown -->
        <select id="sort-select" style="padding: 10px 20px; background: var(--white-5); border: 1px solid var(--border-subtle);
                                        border-radius: 12px; color: var(--text-primary); font-size: 14px; font-weight: 500; cursor: pointer;">
          <option value="newest" ${currentSortBy === 'newest' ? 'selected' : ''}>Newest First</option>
          <option value="oldest" ${currentSortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
          <option value="likes" ${currentSortBy === 'likes' ? 'selected' : ''}>Most Liked</option>
        </select>
      </div>

      <!-- Results Count -->
      <div style="font-size: 14px; color: var(--text-subtle);">
        ${filteredPrompts.length} prompt${filteredPrompts.length !== 1 ? 's' : ''} found
      </div>
    </div>

    <!-- Prompts Grid -->
    <div id="prompts-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(${currentViewMode === 'image' ? '280px' : '260px'}, 1fr)); gap: 20px;">
      ${currentViewMode === 'image' ? renderPromptsGridImage() : renderPromptsGrid()}
    </div>
  `
}

/**
 * Render prompts grid - Monochrome
 */
function renderPromptsGrid() {
  if (filteredPrompts.length === 0) {
    return `
      <div style="grid-column: 1 / -1; text-center; padding: 80px 20px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                    border-radius: 16px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
          ${Icon({ name: 'search_off', className: 'text-subtle-white !text-[48px]' })}
        </div>
        <h3 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">No prompts found</h3>
        <p style="font-size: 16px; color: var(--text-subtle);">Try adjusting your filters or search query</p>
      </div>
    `
  }

  return filteredPrompts.map(prompt => {
    const categoryIcons = {
      writing: 'edit_note',
      coding: 'code',
      research: 'science',
      creative: 'palette',
      other: 'folder'
    }

    const categoryColors = {
      writing: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
      coding: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
      research: 'linear-gradient(135deg, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.06) 100%)',
      creative: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.07) 100%)',
      other: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)'
    }

    return `
      <div class="prompt-card" data-id="${prompt.id}"
           style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px;
                  overflow: hidden; transition: all 0.3s var(--ease-spring); cursor: pointer; position: relative;
                  display: flex; flex-direction: column; height: 100%;">

        <!-- Content Section (Top) -->
        <div style="padding: 20px; display: flex; flex-direction: column; gap: 12px; flex: 1;">
          <!-- Header: Category + Likes -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 24px;
                         font-size: 12px; font-weight: 500; background: var(--white-10); border: 1px solid var(--white-20); color: var(--text-primary);">
              ${Icon({ name: categoryIcons[prompt.category] || 'folder', className: '!text-[14px]' })}
              ${capitalize(prompt.category)}
            </span>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-subtle);">
              ${Icon({ name: 'favorite', className: '!text-[16px]' })}
              ${prompt.likes_count || 0}
            </div>
          </div>

          <!-- Title -->
          <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); line-height: 1.4; transition: color 0.3s ease;">
            ${escapeHtml(prompt.title)}
          </h3>

          <!-- Description -->
          <p style="font-size: 14px; color: var(--text-subtle); line-height: 1.6;
                    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(prompt.description || prompt.content.substring(0, 150))}
          </p>

          <!-- Tags -->
          ${prompt.tags && prompt.tags.length > 0 ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto;">
              ${prompt.tags.slice(0, 3).map(tag => `
                <span style="font-size: 11px; padding: 4px 10px; background: var(--white-5); border-radius: 12px;
                             color: var(--text-subtle); border: 1px solid var(--white-10);">
                  ${escapeHtml(tag)}
                </span>
              `).join('')}
              ${prompt.tags.length > 3 ? `
                <span style="font-size: 11px; padding: 4px 10px; color: var(--text-subtle);">
                  +${prompt.tags.length - 3}
                </span>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Image Section (Bottom) -->
        <div style="position: relative; width: 100%; height: 160px; overflow: hidden; border-top: 1px solid var(--border-subtle);">
          ${prompt.image_url ? `
            <img src="${prompt.image_url}" alt="${escapeHtml(prompt.title)}"
                 style="width: 100%; height: 100%; object-fit: cover;">
          ` : `
            <div style="width: 100%; height: 100%; background: ${categoryColors[prompt.category] || categoryColors.other};
                        display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
              ${Icon({ name: categoryIcons[prompt.category] || 'folder', className: 'opacity-10 !text-[80px] text-white' })}
            </div>
          `}

          <!-- Author overlay on image -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 16px;
                      background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
                      display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${prompt.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}"
                   alt="Author" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.3);">
              <span style="font-size: 12px; color: rgba(255, 255, 255, 0.95); font-weight: 500;">
                ${prompt.users?.display_name || 'Anonymous'}
              </span>
            </div>
            <div class="prompt-arrow" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.15);
                                             backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
                                             opacity: 0; transform: translateX(-8px); transition: all 0.3s var(--ease-spring);">
              ${Icon({ name: 'arrow_forward', className: '!text-[18px] text-white' })}
            </div>
          </div>
        </div>
      </div>
    `
  }).join('')
}

/**
 * Render prompts grid - Image Mode
 */
function renderPromptsGridImage() {
  if (filteredPrompts.length === 0) {
    return `
      <div style="grid-column: 1 / -1; text-center; padding: 80px 20px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                    border-radius: 16px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
          ${Icon({ name: 'search_off', className: 'text-subtle-white !text-[48px]' })}
        </div>
        <h3 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">No prompts found</h3>
        <p style="font-size: 16px; color: var(--text-subtle);">Try adjusting your filters or search query</p>
      </div>
    `
  }

  return filteredPrompts.map(prompt => {
    // Use prompt image if available, otherwise generate placeholder based on category
    const categoryColors = {
      writing: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
      coding: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)',
      research: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
      creative: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%)',
      other: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)'
    }

    const categoryIcons = {
      writing: 'edit_note',
      coding: 'code',
      research: 'science',
      creative: 'palette',
      other: 'folder'
    }

    const promptImage = prompt.image_url || null

    return `
      <div class="prompt-card-image" data-id="${prompt.id}"
           style="position: relative; border-radius: 16px; overflow: hidden; cursor: pointer;
                  aspect-ratio: 4/3; transition: all 0.3s var(--ease-spring); border: 1px solid var(--border-subtle);">

        <!-- Image or Placeholder -->
        <div style="position: absolute; inset: 0; background: ${promptImage ? `url('${promptImage}')` : categoryColors[prompt.category] || categoryColors.other};
                    background-size: cover; background-position: center;">
          ${!promptImage ? `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
              ${Icon({ name: categoryIcons[prompt.category] || 'folder', className: 'text-white opacity-10 !text-[120px]' })}
            </div>
          ` : ''}
        </div>

        <!-- Dark Overlay -->
        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.8) 100%);
                    transition: all 0.3s ease;" class="image-overlay"></div>

        <!-- Title Bar at Bottom -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 16px 16px;
                    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 30%);
                    transform: translateY(0); transition: all 0.3s var(--ease-spring);">
          <h3 style="font-size: 16px; font-weight: 600; color: white; line-height: 1.3; margin-bottom: 8px;
                     display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(prompt.title)}
          </h3>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: rgba(255, 255, 255, 0.7);">
            <span style="display: flex; align-items: center; gap: 4px;">
              ${Icon({ name: categoryIcons[prompt.category] || 'folder', className: '!text-[14px]' })}
              ${prompt.category}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              ${Icon({ name: 'favorite', className: '!text-[14px]' })}
              ${prompt.likes_count || 0}
            </span>
          </div>
        </div>

        <!-- Hover Indicator -->
        <div class="image-hover-icon" style="position: absolute; top: 16px; right: 16px; width: 40px; height: 40px;
                                             background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);
                                             border-radius: 50%; display: flex; align-items: center; justify-content: center;
                                             opacity: 0; transform: scale(0.8); transition: all 0.3s var(--ease-spring);">
          ${Icon({ name: 'arrow_forward', className: '!text-[20px] text-white' })}
        </div>
      </div>
    `
  }).join('')
}

/**
 * Render My Prompts View - Monochrome
 */
function renderMyPromptsView() {
  return `
    <div>
      <!-- Stats Summary -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 32px;">
        <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; text-align: center;">
          <p style="font-size: 32px; font-weight: 700; color: var(--text-primary);">${myPrompts.length}</p>
          <p style="font-size: 13px; color: var(--text-subtle); margin-top: 6px; font-weight: 500;">Total Prompts</p>
        </div>
        <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; text-align: center;">
          <p style="font-size: 32px; font-weight: 700; color: var(--text-primary);">${myPrompts.filter(p => p.status === 'approved').length}</p>
          <p style="font-size: 13px; color: var(--text-subtle); margin-top: 6px; font-weight: 500;">Approved</p>
        </div>
        <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; text-align: center;">
          <p style="font-size: 32px; font-weight: 700; color: var(--text-primary);">${myPrompts.filter(p => p.status === 'pending').length}</p>
          <p style="font-size: 13px; color: var(--text-subtle); margin-top: 6px; font-weight: 500;">Pending</p>
        </div>
        <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; text-align: center;">
          <p style="font-size: 32px; font-weight: 700; color: var(--text-primary);">${myPrompts.filter(p => p.status === 'rejected').length}</p>
          <p style="font-size: 13px; color: var(--text-subtle); margin-top: 6px; font-weight: 500;">Rejected</p>
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
 * Render My Prompts List - Monochrome
 */
function renderMyPromptsList() {
  if (myPrompts.length === 0) {
    return `
      <div style="text-center; padding: 80px 20px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                    border-radius: 16px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
          ${Icon({ name: 'description', className: 'text-subtle-white !text-[48px]' })}
        </div>
        <h3 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">No prompts yet</h3>
        <p style="font-size: 16px; color: var(--text-subtle);">Submit your first prompt to get started!</p>
      </div>
    `
  }

  return myPrompts.map(prompt => {
    const statusColors = {
      approved: { bg: 'var(--white-10)', text: 'var(--text-primary)', icon: 'check_circle' },
      pending: { bg: 'var(--white-10)', text: 'var(--text-subtle)', icon: 'schedule' },
      rejected: { bg: 'var(--white-5)', text: 'var(--text-subtle)', icon: 'cancel' }
    }
    const status = statusColors[prompt.status] || statusColors.pending

    return `
      <div class="my-prompt-card" data-id="${prompt.id}"
           style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px;
                  padding: 24px; margin-bottom: 16px; transition: all 0.3s ease; cursor: pointer;">

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <h3 style="font-size: 18px; font-weight: 600; color: var(--text-primary); flex: 1; margin-right: 16px;">
            ${escapeHtml(prompt.title)}
          </h3>
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 24px;
                       background: ${status.bg}; color: ${status.text}; font-size: 12px; font-weight: 500;">
            ${Icon({ name: status.icon, className: '!text-[14px]' })}
            ${capitalize(prompt.status)}
          </div>
        </div>

        <!-- Description -->
        <p style="font-size: 14px; color: var(--text-subtle); line-height: 1.6; margin-bottom: 16px;
                  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(prompt.description || prompt.content.substring(0, 150))}
        </p>

        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px;
                    border-top: 1px solid var(--white-5); font-size: 13px; color: var(--text-subtle);">
          <span>${formatDate(prompt.created_at)}</span>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">${Icon({ name: 'favorite', className: '!text-[16px]' })} ${prompt.likes_count || 0}</span>
            <span style="text-transform: uppercase; font-weight: 500; letter-spacing: 0.5px;">${prompt.category}</span>
          </div>
        </div>
      </div>
    `
  }).join('')
}

/**
 * Filter prompts
 */
function filterPrompts() {
  let filtered = allPrompts

  // Category filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory)
  }

  // Search filter
  if (currentSearchQuery.trim()) {
    const query = currentSearchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      p.content.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Sort
  filtered.sort((a, b) => {
    switch (currentSortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'likes':
        return (b.likes_count || 0) - (a.likes_count || 0)
      default:
        return 0
    }
  })

  filteredPrompts = filtered
}

/**
 * Carousel functions
 */
function startCarousel() {
  stopCarousel()
  if (allPrompts.length > 1) {
    carouselInterval = setInterval(() => {
      currentCarouselIndex = (currentCarouselIndex + 1) % allPrompts.length
      updateCarousel()
    }, 5000)
  }
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

function updateCarousel() {
  // Update main carousel if it exists
  const carousel = document.getElementById('prompt-carousel')
  if (carousel) {
    carousel.innerHTML = renderCarousel()
    attachCarouselListeners(carousel)
  }

  // Update modal carousel if it exists
  const modalCarousel = document.getElementById('carousel-modal-content')
  if (modalCarousel) {
    modalCarousel.innerHTML = renderCarousel()
    attachCarouselListeners(modalCarousel)
  }
}

function attachCarouselListeners(container) {
  if (!container) return

  // Click to view prompt
  const slide = container.querySelector('.carousel-slide')
  slide?.addEventListener('click', (e) => {
    if (!e.target.closest('[data-carousel-index]')) {
      const promptId = slide.dataset.promptId
      if (promptId) showPromptModal(promptId)
    }
  })

  // Dot navigation
  const dots = container.querySelectorAll('[data-carousel-index]')
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation()
      currentCarouselIndex = parseInt(dot.dataset.carouselIndex)
      stopCarousel()
      updateCarousel()
      startCarousel()
    })
  })
}

/**
 * Show Carousel Modal - Fullscreen Featured Prompts
 */
function showCarouselModal(contentContainer) {
  // Get or create modal container
  let modal = document.getElementById('carousel-modal')
  if (!modal) {
    modal = document.createElement('div')
    modal.id = 'carousel-modal'
    document.body.appendChild(modal)
  }

  // Render modal
  modal.innerHTML = `
    <div style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 10000;
                display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;">

      <!-- Close Button - Enhanced Prominence -->
      <button id="carousel-modal-close" style="position: absolute; top: 24px; right: 24px;
                   padding: 12px 20px; background: rgba(239, 68, 68, 0.9); border: 2px solid rgba(255, 255, 255, 0.3);
                   border-radius: 12px; cursor: pointer; z-index: 10001;
                   display: flex; align-items: center; justify-content: center; gap: 8px;
                   transition: all 0.3s var(--ease-spring); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                   font-size: 14px; font-weight: 600; color: white;">
        ${Icon({ name: 'close', className: '!text-[20px] text-white' })}
        <span>Exit Featured View</span>
      </button>

      <!-- Size Toggle Button -->
      <button id="carousel-size-toggle" style="position: absolute; top: 24px; left: 24px; padding: 12px 20px;
                   background: var(--white-10); border: 1px solid var(--border-subtle); border-radius: 24px; cursor: pointer;
                   display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--text-primary);
                   transition: all 0.2s ease; z-index: 10001;">
        ${Icon({ name: 'fullscreen', className: '!text-[18px]' })}
        <span>Fullscreen</span>
      </button>

      <!-- Carousel Container -->
      <div id="carousel-modal-content" style="width: 90%; max-width: 1200px; height: 80vh; border-radius: 16px; overflow: hidden;
                                               background: var(--white-5); border: 1px solid var(--border-subtle);
                                               transition: all 0.4s var(--ease-spring);">
        ${renderCarousel()}
      </div>
    </div>
  `

  modal.style.display = 'block'

  // Attach carousel listeners
  const carouselContent = modal.querySelector('#carousel-modal-content')
  attachCarouselListeners(carouselContent)

  // Start carousel auto-play
  startCarousel()

  // Size toggle
  const sizeToggle = modal.querySelector('#carousel-size-toggle')
  let isFullscreen = false
  sizeToggle?.addEventListener('click', () => {
    isFullscreen = !isFullscreen
    if (isFullscreen) {
      carouselContent.style.width = '100%'
      carouselContent.style.height = '100vh'
      carouselContent.style.maxWidth = 'none'
      carouselContent.style.borderRadius = '0'
      sizeToggle.querySelector('span').textContent = 'Exit Fullscreen'
      sizeToggle.querySelector('.material-symbols-outlined').textContent = 'fullscreen_exit'
    } else {
      carouselContent.style.width = '90%'
      carouselContent.style.height = '80vh'
      carouselContent.style.maxWidth = '1200px'
      carouselContent.style.borderRadius = '16px'
      sizeToggle.querySelector('span').textContent = 'Fullscreen'
      sizeToggle.querySelector('.material-symbols-outlined').textContent = 'fullscreen'
    }
  })

  sizeToggle?.addEventListener('mouseenter', (e) => {
    e.currentTarget.style.background = 'var(--white-15)'
    e.currentTarget.style.borderColor = 'var(--white-30)'
  })

  sizeToggle?.addEventListener('mouseleave', (e) => {
    e.currentTarget.style.background = 'var(--white-10)'
    e.currentTarget.style.borderColor = 'var(--border-subtle)'
  })

  // Close button
  const closeBtn = modal.querySelector('#carousel-modal-close')
  closeBtn?.addEventListener('click', () => {
    stopCarousel()
    modal.style.display = 'none'
    modal.remove()
  })

  closeBtn?.addEventListener('mouseenter', (e) => {
    e.currentTarget.style.background = 'rgba(239, 68, 68, 1)'
    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
    e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)'
  })

  closeBtn?.addEventListener('mouseleave', (e) => {
    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'
    e.currentTarget.style.transform = 'scale(1) translateY(0)'
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)'
  })

  // Close on background click
  modal.querySelector('div').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      stopCarousel()
      modal.style.display = 'none'
      modal.remove()
    }
  })

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      stopCarousel()
      modal.style.display = 'none'
      modal.remove()
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
}

/**
 * Show Prompt Modal - Monochrome
 */
async function showPromptModal(promptId) {
  const prompt = [...allPrompts, ...myPrompts].find(p => p.id === promptId)
  if (!prompt) return

  const userHasLiked = await hasLiked(promptId)
  const modal = document.getElementById('prompt-modal')
  const modalContent = document.getElementById('modal-content')

  const categoryIcons = {
    writing: 'edit_note',
    coding: 'code',
    research: 'science',
    creative: 'palette',
    other: 'folder'
  }

  modalContent.innerHTML = `
    <!-- Close Button -->
    <button id="modal-close" style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px;
                                     background: var(--white-10); border: none; border-radius: 50%; cursor: pointer;
                                     display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
      ${Icon({ name: 'close', className: '!text-[20px] text-white' })}
    </button>

    <!-- Header -->
    <div style="margin-bottom: 24px;">
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--white-10);
                  border: 1px solid var(--white-20); border-radius: 24px; font-size: 12px; font-weight: 600;
                  color: var(--text-primary); text-transform: uppercase; margin-bottom: 16px;">
        ${Icon({ name: categoryIcons[prompt.category] || 'folder', className: '!text-[16px]' })}
        ${prompt.category}
      </div>
      <h2 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; line-height: 1.3;">
        ${escapeHtml(prompt.title)}
      </h2>
      ${prompt.description ? `
        <p style="font-size: 16px; color: var(--text-subtle); line-height: 1.6;">
          ${escapeHtml(prompt.description)}
        </p>
      ` : ''}
    </div>

    <!-- Author & Stats -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0;
                border-top: 1px solid var(--white-5); border-bottom: 1px solid var(--white-5); margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${prompt.users?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}"
             alt="Author" style="width: 32px; height: 32px; border-radius: 50%;">
        <div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
            ${prompt.users?.display_name || 'Anonymous'}
          </div>
          <div style="font-size: 12px; color: var(--text-subtle);">
            ${formatDate(prompt.created_at)}
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <button id="like-btn" data-prompt-id="${prompt.id}"
                style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: ${userHasLiked ? 'var(--white-15)' : 'var(--white-5)'};
                       border: 1px solid var(--border-subtle); border-radius: 12px; cursor: pointer;
                       font-size: 14px; font-weight: 500; color: var(--text-primary); transition: all 0.2s ease;">
          ${Icon({ name: userHasLiked ? 'favorite' : 'favorite_border', className: '!text-[18px]' })}
          ${prompt.likes_count || 0}
        </button>
      </div>
    </div>

    ${prompt.image_url ? `
      <!-- Example Image -->
      <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 600; color: var(--text-subtle); margin-bottom: 12px; text-transform: uppercase; display: flex; align-items: center; gap: 8px;">
          ${Icon({ name: 'image', className: '!text-[16px]' })}
          Example Image
        </div>
        <img src="${prompt.image_url}" alt="${escapeHtml(prompt.title)}"
             style="width: 100%; height: auto; border-radius: 8px; display: block;" />
      </div>
    ` : ''}

    <!-- Prompt Content -->
    <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <pre style="white-space: pre-wrap; font-family: 'Inter', monospace; font-size: 14px; line-height: 1.8;
                  color: var(--text-primary); margin: 0;">${escapeHtml(prompt.content)}</pre>
    </div>

    <!-- Tags -->
    ${prompt.tags && prompt.tags.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 600; color: var(--text-subtle); margin-bottom: 12px; text-transform: uppercase;">Tags</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${prompt.tags.map(tag => `
            <span style="padding: 6px 12px; background: var(--white-5); border: 1px solid var(--white-10); border-radius: 12px;
                         font-size: 13px; color: var(--text-primary);">
              ${escapeHtml(tag)}
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Action Buttons -->
    <div style="display: flex; gap: 12px;">
      <button id="copy-btn" data-prompt-id="${prompt.id}"
              style="flex: 1; padding: 12px 24px; background: var(--primary); color: var(--background-dark);
                     border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
                     display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease;">
        ${Icon({ name: 'content_copy', className: '!text-[18px]' })}
        Copy to Clipboard
      </button>
      <button id="export-btn" data-prompt-id="${prompt.id}"
              style="padding: 12px 24px; background: var(--white-10); color: var(--text-primary);
                     border: 1px solid var(--border-subtle); border-radius: 12px; font-size: 14px; font-weight: 600;
                     cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
        ${Icon({ name: 'download', className: '!text-[18px]' })}
        Export
      </button>
    </div>
  `

  // Show modal
  modal.style.display = 'flex'
  setTimeout(() => {
    modal.style.opacity = '1'
    modalContent.style.transform = 'scale(1)'
  }, 10)

  // Event listeners
  document.getElementById('modal-close').addEventListener('click', closeModal)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })

  document.getElementById('like-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget
    const success = await likePrompt(promptId)
    if (success) {
      const newCount = (prompt.likes_count || 0) + 1
      prompt.likes_count = newCount
      btn.innerHTML = `${Icon({ name: 'favorite', className: '!text-[18px]' })} ${newCount}`
      btn.style.background = 'var(--white-15)'
    }
  })

  document.getElementById('copy-btn').addEventListener('click', async () => {
    const success = await copyPromptToClipboard(promptId)
    if (success) {
      const btn = document.getElementById('copy-btn')
      btn.innerHTML = `${Icon({ name: 'check', className: '!text-[18px]' })} Copied!`
      setTimeout(() => {
        btn.innerHTML = `${Icon({ name: 'content_copy', className: '!text-[18px]' })} Copy to Clipboard`
      }, 2000)
    }
  })

  document.getElementById('export-btn').addEventListener('click', () => {
    exportPromptAsMarkdown(promptId)
  })
}

function closeModal() {
  const modal = document.getElementById('prompt-modal')
  const modalContent = document.getElementById('modal-content')
  modal.style.opacity = '0'
  modalContent.style.transform = 'scale(0.9)'
  setTimeout(() => {
    modal.style.display = 'none'
  }, 300)
}

/**
 * Setup Event Listeners
 */
function setupLibraryEventListeners(contentContainer) {
  // View toggle
  const viewBtns = contentContainer.querySelectorAll('.view-toggle-btn')
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view
      const contentArea = contentContainer.querySelector('#library-content')
      if (contentArea) {
        contentArea.innerHTML = renderCurrentView()
        reattachContentListeners(contentArea)
      }

      // Update button styles
      viewBtns.forEach(b => {
        const isActive = b.dataset.view === currentView
        b.style.background = isActive ? 'var(--primary)' : 'var(--white-5)'
        b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        b.style.boxShadow = isActive ? '0 4px 16px rgba(255, 255, 255, 0.1)' : 'none'
        b.style.border = isActive ? 'none' : '1px solid var(--border-subtle)'
      })
    })
  })

  // View Mode Toggle (in header)
  const viewModeBtns = contentContainer.querySelectorAll('.view-mode-btn')
  viewModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const oldMode = currentViewMode
      currentViewMode = btn.dataset.mode
      const contentArea = contentContainer.querySelector('#library-content')

      if (contentArea) {
        contentArea.innerHTML = renderCurrentView()
        reattachContentListeners(contentArea)

        // If entering featured mode, start carousel auto-rotation
        if (currentViewMode === 'featured' && oldMode !== 'featured') {
          const carousel = contentArea.querySelector('#prompt-carousel')
          if (carousel) {
            attachCarouselListeners(carousel)
            startCarousel()
          }
        }

        // If leaving featured mode, stop carousel
        if (oldMode === 'featured' && currentViewMode !== 'featured') {
          stopCarousel()
        }
      }

      // Update button styles
      viewModeBtns.forEach(b => {
        const isActive = b.dataset.mode === currentViewMode
        b.style.background = isActive ? 'var(--primary)' : 'transparent'
        b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        b.style.fontWeight = isActive ? '600' : '500'
      })
    })
  })

  // Content area listeners
  const contentArea = contentContainer.querySelector('#library-content')
  reattachContentListeners(contentArea)

  // Inject styles
  injectLibraryStyles()
}

function reattachContentListeners(contentArea) {
  if (!contentArea) return

  // If in featured mode, attach carousel listeners
  if (currentViewMode === 'featured') {
    const carousel = contentArea.querySelector('#prompt-carousel')
    if (carousel) {
      attachCarouselListeners(carousel)
      startCarousel()
    }

    // Exit featured mode button
    const exitBtn = contentArea.querySelector('#exit-featured-btn')
    exitBtn?.addEventListener('click', () => {
      currentViewMode = 'details'
      const contentContainer = document.querySelector('[data-window-id="library"] .window-content')
      const contentArea = contentContainer?.querySelector('#library-content')
      if (contentArea) {
        contentArea.innerHTML = renderCurrentView()
        reattachContentListeners(contentArea)
        stopCarousel()
      }

      // Update view mode button styles
      const viewModeBtns = contentContainer?.querySelectorAll('.view-mode-btn')
      viewModeBtns?.forEach(b => {
        const isActive = b.dataset.mode === currentViewMode
        b.style.background = isActive ? 'var(--primary)' : 'transparent'
        b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
      })
    })

    // Discovery mode selector buttons
    const discoveryBtns = contentArea.querySelectorAll('.discovery-mode-btn')
    discoveryBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        discoveryMode = btn.dataset.discoveryMode

        // Filter prompts based on discovery mode
        if (discoveryMode === 'hot') {
          // Sort by likes_count (hot prompts)
          allPrompts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
        } else if (discoveryMode === 'new') {
          // Sort by created_at (newest first)
          allPrompts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        } else {
          // Featured - keep as is or filter featured status
          allPrompts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }

        // Reset carousel index and refresh
        currentCarouselIndex = 0
        const carousel = contentArea.querySelector('#prompt-carousel')
        if (carousel) {
          carousel.innerHTML = renderCarousel()
          attachCarouselListeners(carousel)
        }

        // Update button styles
        discoveryBtns.forEach(b => {
          const isActive = b.dataset.discoveryMode === discoveryMode
          b.style.background = isActive ? 'var(--primary)' : 'transparent'
          b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        })
      })
    })

    return // No other listeners needed in featured mode
  }

  // Search
  const searchInput = contentArea.querySelector('#prompt-search')
  searchInput?.addEventListener('input', debounce((e) => {
    currentSearchQuery = e.target.value
    filterPrompts()
    const grid = contentArea.querySelector('#prompts-grid')
    if (grid) grid.innerHTML = currentViewMode === 'image' ? renderPromptsGridImage() : renderPromptsGrid()
    attachPromptCardListeners(grid)
  }, 300))

  // Search focus
  searchInput?.addEventListener('focus', (e) => {
    e.target.style.boxShadow = '0 0 0 2px var(--white-20)'
    e.target.style.borderColor = 'var(--white-30)'
    e.target.style.background = 'var(--white-10)'
    const icon = contentArea.querySelector('.search-icon-lib')
    if (icon) icon.style.color = 'var(--text-primary)'
  })

  searchInput?.addEventListener('blur', (e) => {
    e.target.style.boxShadow = 'none'
    e.target.style.borderColor = 'var(--border-subtle)'
    e.target.style.background = 'var(--white-5)'
    const icon = contentArea.querySelector('.search-icon-lib')
    if (icon) icon.style.color = 'var(--text-subtle)'
  })

  // Category filters
  const filterBtns = contentArea.querySelectorAll('.category-filter-btn')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category
      filterPrompts()
      const grid = contentArea.querySelector('#prompts-grid')
      if (grid) grid.innerHTML = currentViewMode === 'image' ? renderPromptsGridImage() : renderPromptsGrid()
      attachPromptCardListeners(grid)

      // Update button styles
      filterBtns.forEach(b => {
        const isActive = b.dataset.category === currentCategory
        b.style.background = isActive ? 'var(--primary)' : 'var(--white-5)'
        b.style.color = isActive ? 'var(--background-dark)' : 'var(--text-subtle)'
        b.style.boxShadow = isActive ? '0 4px 16px rgba(255, 255, 255, 0.1)' : 'none'
        b.style.transform = isActive ? 'scale(1.05)' : 'scale(1)'
        b.style.border = isActive ? 'none' : '1px solid var(--white-10)'
      })
    })

    // Hover effects
    btn.addEventListener('mouseenter', (e) => {
      if (e.target.dataset.category !== currentCategory) {
        e.target.style.background = 'var(--white-10)'
        e.target.style.color = 'var(--text-primary)'
        e.target.style.borderColor = 'var(--white-20)'
      }
    })

    btn.addEventListener('mouseleave', (e) => {
      if (e.target.dataset.category !== currentCategory) {
        e.target.style.background = 'var(--white-5)'
        e.target.style.color = 'var(--text-subtle)'
        e.target.style.borderColor = 'var(--white-10)'
      }
    })
  })

  // Sort
  const sortSelect = contentArea.querySelector('#sort-select')
  sortSelect?.addEventListener('change', (e) => {
    currentSortBy = e.target.value
    filterPrompts()
    const grid = contentArea.querySelector('#prompts-grid')
    if (grid) grid.innerHTML = currentViewMode === 'image' ? renderPromptsGridImage() : renderPromptsGrid()
    attachPromptCardListeners(grid)
  })

  // Prompt cards
  const grid = contentArea.querySelector('#prompts-grid')
  attachPromptCardListeners(grid)

  // My prompt cards
  const myPromptCards = contentArea.querySelectorAll('.my-prompt-card')
  myPromptCards.forEach(card => {
    card.addEventListener('click', () => {
      showPromptModal(card.dataset.id)
    })

    card.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'
    })

    card.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
    })
  })
}

function attachPromptCardListeners(grid) {
  if (!grid) return

  // Handle detail mode cards
  const cards = grid.querySelectorAll('.prompt-card')
  cards.forEach(card => {
    card.addEventListener('click', () => {
      showPromptModal(card.dataset.id)
    })

    card.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'
      const arrow = e.currentTarget.querySelector('.prompt-arrow')
      if (arrow) {
        arrow.style.opacity = '1'
        arrow.style.transform = 'translateX(0)'
      }
    })

    card.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
      const arrow = e.currentTarget.querySelector('.prompt-arrow')
      if (arrow) {
        arrow.style.opacity = '0'
        arrow.style.transform = 'translateX(-8px)'
      }
    })
  })

  // Handle image mode cards
  const imageCards = grid.querySelectorAll('.prompt-card-image')
  imageCards.forEach(card => {
    card.addEventListener('click', () => {
      showPromptModal(card.dataset.id)
    })

    card.addEventListener('mouseenter', (e) => {
      const hoverIcon = e.currentTarget.querySelector('.image-hover-icon')
      if (hoverIcon) {
        hoverIcon.style.opacity = '1'
        hoverIcon.style.transform = 'scale(1)'
      }
      e.currentTarget.style.transform = 'translateY(-4px)'
    })

    card.addEventListener('mouseleave', (e) => {
      const hoverIcon = e.currentTarget.querySelector('.image-hover-icon')
      if (hoverIcon) {
        hoverIcon.style.opacity = '0'
        hoverIcon.style.transform = 'scale(0.8)'
      }
      e.currentTarget.style.transform = 'translateY(0)'
    })
  })
}

function injectLibraryStyles() {
  if (document.getElementById('library-window-styles')) return

  const style = document.createElement('style')
  style.id = 'library-window-styles'
  style.textContent = `
    .library-search-input::placeholder {
      color: var(--text-subtle);
    }

    .search-icon-lib {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-subtle);
      transition: color 0.4s ease;
      font-size: 20px !important;
      pointer-events: none;
    }

    .prompt-arrow .material-symbols-outlined {
      color: var(--text-primary);
    }

    #modal-close:hover {
      background: var(--white-20);
      transform: scale(1.1);
    }

    #like-btn:hover,
    #copy-btn:hover,
    #export-btn:hover {
      transform: scale(1.05);
    }

    #copy-btn:hover {
      box-shadow: 0 6px 20px rgba(255, 255, 255, 0.15);
    }

    #export-btn:hover {
      background: var(--white-15);
    }

    /* Image Mode Cards */
    .prompt-card-image {
      cursor: pointer;
      transition: all 0.4s var(--ease-spring);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .prompt-card-image:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    .image-hover-icon {
      transition: all 0.3s var(--ease-spring);
    }

    /* Carousel Modal Animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Featured Button Hover */
    #featured-prompts-btn:hover {
      background: var(--white-10);
      border-color: var(--white-30);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
    }
  `
  document.head.appendChild(style)
}

// Utility functions
function debounce(func, wait) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return 'Today'
  if (diffDays < 2) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
