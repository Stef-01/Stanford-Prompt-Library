/**
 * Explore Window - AI News and Student Articles
 * Modern monochrome design with Material Symbols Outlined icons
 */

import { Icon } from '../ui/Icon.js'

let currentFilter = 'All' // All, AI News, Research, Tutorials, Student Work
let currentSearchQuery = ''

// Curated articles (in production, these would come from a database or API)
const articles = [
  {
    id: 1,
    title: 'OpenAI Announces GPT-4.5 with Enhanced Reasoning',
    description: 'OpenAI releases their latest model with improved logical reasoning and reduced hallucinations, marking a significant leap in AI capabilities.',
    author: 'OpenAI Team',
    date: '2024-01-15',
    category: 'AI News',
    url: 'https://openai.com/blog'
  },
  {
    id: 2,
    title: 'Stanford CS224N: Advanced Prompt Engineering Techniques',
    description: 'A comprehensive guide to advanced prompting strategies, including chain-of-thought, few-shot learning, and prompt optimization.',
    author: 'Stanford CS Department',
    date: '2024-01-10',
    category: 'Tutorial',
    url: '#'
  },
  {
    id: 3,
    title: 'My Journey Building an AI-Powered Study Assistant',
    description: 'A Stanford student shares their experience developing a personalized AI tutor using GPT-4 and RAG architecture.',
    author: 'Sarah Chen, CS \'25',
    date: '2024-01-08',
    category: 'Student Work',
    url: '#'
  },
  {
    id: 4,
    title: 'Anthropic Introduces Constitutional AI Framework',
    description: 'New research on aligning AI systems with human values through constitutional principles and harmlessness training.',
    author: 'Anthropic Research Team',
    date: '2024-01-05',
    category: 'Research',
    url: 'https://anthropic.com/research'
  },
  {
    id: 5,
    title: 'Prompt Injection Attacks: What You Need to Know',
    description: 'Understanding security vulnerabilities in LLM applications and best practices for mitigation.',
    author: 'Stanford AI Lab',
    date: '2024-01-03',
    category: 'Research',
    url: '#'
  },
  {
    id: 6,
    title: 'How I Built a Multi-Agent System for Course Planning',
    description: 'Using LangChain and multiple specialized agents to help students plan their academic path at Stanford.',
    author: 'Michael Zhang, MS \'24',
    date: '2023-12-28',
    category: 'Student Work',
    url: '#'
  }
]

const FILTERS = ['All', 'AI News', 'Research', 'Tutorials', 'Student Work']

/**
 * Render Explore Window Content
 * @param {HTMLElement} contentContainer - Window content container
 */
export async function renderExploreWindow(contentContainer) {
  const filteredArticles = filterArticles()

  contentContainer.innerHTML = `
    <div class="explore-window-content" style="height: 100%; overflow-y: auto; overflow-x: hidden;">
      <div style="max-width: 1400px; margin: 0 auto; padding: 48px 24px 96px;">

        <!-- Hero Section -->
        <div class="text-center" style="margin-bottom: 48px; animation: fadeIn 0.4s var(--ease-spring);">
          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 700; color: var(--text-primary); margin-bottom: 24px; line-height: 1.1; letter-spacing: -0.02em;">
            Explore AI News & Articles
          </h1>
          <p style="font-size: 18px; color: var(--text-subtle); max-width: 600px; margin: 0 auto; line-height: 1.6;">
            Stay updated with the latest AI developments and Stanford community insights.
            A curated feed of knowledge from the forefront of artificial intelligence.
          </p>
        </div>

        <!-- Search and Filters -->
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 48px; gap: 32px;">

          <!-- Search Bar -->
          <div class="relative w-full" style="max-width: 600px; position: relative; width: 100%;">
            ${Icon({ name: 'search', className: 'search-icon' })}
            <input
              id="explore-search"
              class="explore-search-input"
              placeholder="Search articles, authors, or topics..."
              type="text"
              value="${escapeHtml(currentSearchQuery)}"
              style="width: 100%; padding-left: 48px; padding-right: 16px; padding-top: 14px; padding-bottom: 14px;
                     background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px;
                     color: var(--text-primary); font-size: 16px;
                     transition: all 0.4s var(--ease-spring);"
            />
          </div>

          <!-- Filter Pills -->
          <div class="explore-filters" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
            ${FILTERS.map(filter => `
              <button
                class="explore-filter-pill ${currentFilter === filter ? 'active' : ''}"
                data-filter="${filter}"
                style="padding: 10px 20px; font-size: 14px; font-weight: 500; border-radius: 24px;
                       border: none; cursor: pointer;
                       transition: all 0.4s var(--ease-spring);
                       ${currentFilter === filter
                         ? 'background: var(--primary); color: var(--background-dark); box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1); transform: scale(1.05);'
                         : 'background: var(--white-5); color: var(--text-subtle); border: 1px solid var(--white-10);'}"
              >
                ${filter}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Content Grid -->
        ${filteredArticles.length > 0 ? `
          <div id="articles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; padding-bottom: 96px;">
            ${renderArticleCards(filteredArticles)}
          </div>
        ` : `
          <div class="empty-state" style="text-center; padding: 80px 20px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                        border-radius: 16px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
              ${Icon({ name: 'search_off', className: 'text-subtle-white' })}
            </div>
            <h3 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">No articles found</h3>
            <p style="font-size: 16px; color: var(--text-subtle); max-width: 400px; margin: 0 auto 32px;">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              id="clear-filters-btn"
              style="padding: 12px 24px; background: var(--white-10); color: var(--text-primary);
                     border: none; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;
                     transition: all 0.3s ease;"
            >
              Clear all filters
            </button>
          </div>
        `}
      </div>
    </div>
  `

  // Add custom CSS for this window
  injectStyles()

  // Attach event listeners
  attachEventListeners(contentContainer)
}

/**
 * Render article cards
 */
function renderArticleCards(articles) {
  return articles.map(article => `
    <div class="article-card" data-url="${article.url}"
         style="background: var(--white-5); padding: 24px; border-radius: 16px; border: 1px solid var(--border-subtle);
                display: flex; flex-direction: column; gap: 16px; cursor: pointer;
                transition: all 0.3s var(--ease-spring); height: 100%;">

      <!-- Header: Category + Date -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <span style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 24px;
                     font-size: 12px; font-weight: 500; background: var(--white-10); border: 1px solid var(--white-20); color: var(--text-primary);">
          ${escapeHtml(article.category)}
        </span>
        <span style="font-size: 14px; color: var(--text-subtle); font-weight: 500; letter-spacing: 0.02em;">
          ${formatDate(article.date)}
        </span>
      </div>

      <!-- Content -->
      <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 8px;">
        <h2 class="article-title" style="font-size: 18px; font-weight: 600; color: var(--text-primary); line-height: 1.4;
                                          transition: color 0.3s ease;">
          ${escapeHtml(article.title)}
        </h2>
        <p style="font-size: 14px; color: var(--text-subtle); line-height: 1.6;
                  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(article.description)}
        </p>
      </div>

      <!-- Footer: Author + Arrow -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; margin-top: auto;
                  border-top: 1px solid var(--white-5);">
        <p style="font-size: 12px; color: var(--text-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">
          By: <span style="font-weight: 500; color: rgba(255, 255, 255, 0.7);">${escapeHtml(article.author)}</span>
        </p>
        <div class="article-arrow" style="width: 32px; height: 32px; border-radius: 50%; background: var(--white-5);
                                           display: flex; align-items: center; justify-content: center;
                                           opacity: 0; transform: translateX(-8px);
                                           transition: all 0.3s var(--ease-spring);">
          ${Icon({ name: 'arrow_forward', className: '' })}
        </div>
      </div>
    </div>
  `).join('')
}

/**
 * Filter articles based on current filter and search query
 */
function filterArticles() {
  let filtered = articles

  // Filter by category
  if (currentFilter !== 'All') {
    // Map filter name to category (handle "Tutorials" -> "Tutorial")
    let categoryMatch = currentFilter
    if (currentFilter === 'Tutorials') categoryMatch = 'Tutorial'

    filtered = filtered.filter(article => article.category === categoryMatch)
  }

  // Filter by search query
  if (currentSearchQuery.trim()) {
    const query = currentSearchQuery.toLowerCase()
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.author.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query)
    )
  }

  return filtered
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
    return `${diffDays}d ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}w ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
    renderExploreWindow(contentContainer)
  }, 300))

  // Search input focus effects
  searchInput?.addEventListener('focus', (e) => {
    e.target.style.outline = 'none'
    e.target.style.boxShadow = '0 0 0 2px var(--white-20)'
    e.target.style.borderColor = 'var(--white-30)'
    e.target.style.background = 'var(--white-10)'

    const icon = contentContainer.querySelector('.search-icon')
    if (icon) icon.style.color = 'var(--text-primary)'
  })

  searchInput?.addEventListener('blur', (e) => {
    e.target.style.boxShadow = 'none'
    e.target.style.borderColor = 'var(--border-subtle)'
    e.target.style.background = 'var(--white-5)'

    const icon = contentContainer.querySelector('.search-icon')
    if (icon) icon.style.color = 'var(--text-subtle)'
  })

  // Filter buttons
  const filterBtns = contentContainer.querySelectorAll('[data-filter]')
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter
      renderExploreWindow(contentContainer)
    })

    // Hover effects for inactive filters
    btn.addEventListener('mouseenter', (e) => {
      if (!e.target.classList.contains('active')) {
        e.target.style.color = 'var(--text-primary)'
        e.target.style.background = 'var(--white-10)'
        e.target.style.borderColor = 'var(--white-20)'
      }
    })

    btn.addEventListener('mouseleave', (e) => {
      if (!e.target.classList.contains('active')) {
        e.target.style.color = 'var(--text-subtle)'
        e.target.style.background = 'var(--white-5)'
        e.target.style.borderColor = 'var(--white-10)'
      }
    })
  })

  // Article cards
  const articleCards = contentContainer.querySelectorAll('.article-card')
  articleCards.forEach(card => {
    card.addEventListener('click', () => {
      const url = card.dataset.url
      if (url && url !== '#') {
        window.open(url, '_blank')
      } else {
        alert('📰 Article content coming soon!\n\nThis is a placeholder article. In production, this would link to the full article.')
      }
    })

    // Hover effects
    card.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'

      const arrow = e.currentTarget.querySelector('.article-arrow')
      if (arrow) {
        arrow.style.opacity = '1'
        arrow.style.transform = 'translateX(0)'
      }
    })

    card.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'

      const arrow = e.currentTarget.querySelector('.article-arrow')
      if (arrow) {
        arrow.style.opacity = '0'
        arrow.style.transform = 'translateX(-8px)'
      }
    })
  })

  // Clear filters button
  const clearBtn = contentContainer.querySelector('#clear-filters-btn')
  clearBtn?.addEventListener('click', () => {
    currentSearchQuery = ''
    currentFilter = 'All'
    renderExploreWindow(contentContainer)
  })

  clearBtn?.addEventListener('mouseenter', (e) => {
    e.target.style.background = 'var(--white-20)'
  })

  clearBtn?.addEventListener('mouseleave', (e) => {
    e.target.style.background = 'var(--white-10)'
  })
}

/**
 * Inject custom styles for explore window
 */
function injectStyles() {
  if (document.getElementById('explore-window-styles')) return

  const style = document.createElement('style')
  style.id = 'explore-window-styles'
  style.textContent = `
    .explore-search-input::placeholder {
      color: var(--text-subtle);
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-subtle);
      transition: color 0.4s ease;
      font-size: 20px !important;
      pointer-events: none;
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

    .article-card .article-arrow .material-symbols-outlined {
      color: var(--text-primary);
      font-size: 18px !important;
    }
  `
  document.head.appendChild(style)
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
