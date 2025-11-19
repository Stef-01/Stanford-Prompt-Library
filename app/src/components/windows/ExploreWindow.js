/**
 * Explore Window - AI News and Student Articles
 * Shows curated AI news, research, and student-written content
 */

let currentFilter = 'all' // all, news, research, tutorials, student-work
let currentSearchQuery = ''

// Curated articles (in production, these would come from a database or API)
const articles = [
  {
    id: 1,
    title: 'OpenAI Announces GPT-4.5 with Enhanced Reasoning',
    description: 'OpenAI releases their latest model with improved logical reasoning and reduced hallucinations, marking a significant leap in AI capabilities.',
    author: 'OpenAI Team',
    date: '2024-01-15',
    category: 'news',
    url: 'https://openai.com/blog',
    imageUrl: null,
    tags: ['GPT-4.5', 'Language Models', 'OpenAI']
  },
  {
    id: 2,
    title: 'Stanford CS224N: Advanced Prompt Engineering Techniques',
    description: 'A comprehensive guide to advanced prompting strategies, including chain-of-thought, few-shot learning, and prompt optimization.',
    author: 'Stanford CS Department',
    date: '2024-01-10',
    category: 'tutorials',
    url: '#',
    imageUrl: null,
    tags: ['Prompt Engineering', 'Education', 'Stanford']
  },
  {
    id: 3,
    title: 'My Journey Building an AI-Powered Study Assistant',
    description: 'A Stanford student shares their experience developing a personalized AI tutor using GPT-4 and RAG architecture.',
    author: 'Sarah Chen, CS \'25',
    date: '2024-01-08',
    category: 'student-work',
    url: '#',
    imageUrl: null,
    tags: ['Student Project', 'RAG', 'Education']
  },
  {
    id: 4,
    title: 'Anthropic Introduces Constitutional AI Framework',
    description: 'New research on aligning AI systems with human values through constitutional principles and harmlessness training.',
    author: 'Anthropic Research Team',
    date: '2024-01-05',
    category: 'research',
    url: 'https://anthropic.com/research',
    imageUrl: null,
    tags: ['AI Safety', 'Anthropic', 'Constitutional AI']
  },
  {
    id: 5,
    title: 'Prompt Injection Attacks: What You Need to Know',
    description: 'Understanding security vulnerabilities in LLM applications and best practices for mitigation.',
    author: 'Stanford AI Lab',
    date: '2024-01-03',
    category: 'research',
    url: '#',
    imageUrl: null,
    tags: ['Security', 'Research', 'Best Practices']
  },
  {
    id: 6,
    title: 'How I Built a Multi-Agent System for Course Planning',
    description: 'Using LangChain and multiple specialized agents to help students plan their academic path at Stanford.',
    author: 'Michael Zhang, MS \'24',
    date: '2023-12-28',
    category: 'student-work',
    url: '#',
    imageUrl: null,
    tags: ['Multi-Agent', 'LangChain', 'Education']
  }
]

/**
 * Render Explore Window Content
 * @param {HTMLElement} contentContainer - Window content container
 */
export async function renderExploreWindow(contentContainer) {
  contentContainer.innerHTML = `
    <div style="padding: 20px;">
      <!-- Header -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 24px; margin-bottom: 10px; color: var(--text-primary);">🌟 Explore AI News & Articles</h2>
        <p style="color: var(--text-secondary); font-size: 14px;">Stay updated with the latest AI developments and Stanford community insights</p>
      </div>

      <!-- Search Bar -->
      <input
        type="text"
        id="explore-search"
        class="search-bar"
        placeholder="Search articles, authors, or topics..."
        value="${currentSearchQuery}"
        style="width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 14px; margin-bottom: 20px;"
      />

      <!-- Category Filters -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 25px;">
        <button class="filter-btn ${currentFilter === 'all' ? '' : 'inactive'}" data-filter="all">
          📰 All
        </button>
        <button class="filter-btn ${currentFilter === 'news' ? '' : 'inactive'}" data-filter="news">
          🔥 AI News
        </button>
        <button class="filter-btn ${currentFilter === 'research' ? '' : 'inactive'}" data-filter="research">
          🔬 Research
        </button>
        <button class="filter-btn ${currentFilter === 'tutorials' ? '' : 'inactive'}" data-filter="tutorials">
          📚 Tutorials
        </button>
        <button class="filter-btn ${currentFilter === 'student-work' ? '' : 'inactive'}" data-filter="student-work">
          ✨ Student Work
        </button>
      </div>

      <!-- Articles Grid -->
      <div id="articles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        ${renderArticleCards()}
      </div>
    </div>
  `

  // Attach event listeners
  attachEventListeners(contentContainer)
}

/**
 * Render article cards
 */
function renderArticleCards() {
  const filteredArticles = filterArticles()

  if (filteredArticles.length === 0) {
    return `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <p style="font-size: 48px; margin-bottom: 15px;">📭</p>
        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No articles found</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">Try adjusting your filters or search query</p>
      </div>
    `
  }

  return filteredArticles.map(article => {
    const categoryInfo = getCategoryInfo(article.category)

    return `
      <div class="article-card" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; transition: all 0.2s; cursor: pointer;" onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'; this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='var(--border-color)'" onclick="window.openArticle('${article.url}')">
        <!-- Category Badge -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 11px; padding: 4px 10px; background: ${categoryInfo.color}; color: white; border-radius: 12px; font-weight: 600;">
            ${categoryInfo.icon} ${categoryInfo.label}
          </span>
          <span style="font-size: 11px; color: var(--text-secondary);">
            ${formatDate(article.date)}
          </span>
        </div>

        <!-- Title -->
        <h3 style="font-size: 16px; margin-bottom: 10px; color: var(--text-primary); line-height: 1.4;">
          ${escapeHtml(article.title)}
        </h3>

        <!-- Description -->
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 15px;">
          ${escapeHtml(article.description)}
        </p>

        <!-- Author & Tags -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 12px; color: var(--text-secondary);">
            <strong>By:</strong> ${escapeHtml(article.author)}
          </div>

          ${article.tags && article.tags.length > 0 ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${article.tags.map(tag => `
                <span style="font-size: 10px; padding: 3px 8px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; color: var(--text-secondary);">
                  ${escapeHtml(tag)}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `
  }).join('')
}

/**
 * Filter articles based on current filter and search query
 */
function filterArticles() {
  let filtered = articles

  // Filter by category
  if (currentFilter !== 'all') {
    filtered = filtered.filter(article => article.category === currentFilter)
  }

  // Filter by search query
  if (currentSearchQuery.trim()) {
    const query = currentSearchQuery.toLowerCase()
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
}

/**
 * Get category information
 */
function getCategoryInfo(category) {
  const categoryMap = {
    'news': { icon: '🔥', label: 'AI News', color: '#ef4444' },
    'research': { icon: '🔬', label: 'Research', color: '#8b5cf6' },
    'tutorials': { icon: '📚', label: 'Tutorial', color: '#10b981' },
    'student-work': { icon: '✨', label: 'Student Work', color: '#3b82f6' }
  }

  return categoryMap[category] || { icon: '📰', label: 'Article', color: '#64748b' }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
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
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners(contentContainer) {
  // Search input
  const searchInput = contentContainer.querySelector('#explore-search')
  searchInput?.addEventListener('input', debounce((e) => {
    currentSearchQuery = e.target.value
    const grid = contentContainer.querySelector('#articles-grid')
    if (grid) {
      grid.innerHTML = renderArticleCards()
    }
  }, 300))

  // Filter buttons
  const filterBtns = contentContainer.querySelectorAll('[data-filter]')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter

      // Update button states
      filterBtns.forEach(b => {
        if (b.dataset.filter === currentFilter) {
          b.classList.remove('inactive')
        } else {
          b.classList.add('inactive')
        }
      })

      // Re-render articles
      const grid = contentContainer.querySelector('#articles-grid')
      if (grid) {
        grid.innerHTML = renderArticleCards()
      }
    })
  })
}

/**
 * Open article (global function for onclick)
 */
window.openArticle = function(url) {
  if (url && url !== '#') {
    window.open(url, '_blank')
  } else {
    alert('📰 Article content coming soon!\n\nThis is a placeholder article. In production, this would link to the full article or open in a reader.')
  }
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
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
