/**
 * Bento Grid Layout System
 * Asymmetric card grid with varied sizes (1x1, 2x1, 1x2, 2x2)
 * Supports scroll-triggered reveals with stagger
 */

import { prefersReducedMotion } from '../../animations/config.js'
import { getEasing } from '../../animations/helpers.js'

/**
 * Render a bento grid with opportunity cards
 * @param {Object} options - Grid options
 * @returns {string} HTML string
 */
export function BentoGrid({
  items = [],
  className = '',
  gap = 16,
  enableScrollReveal = true,
  staggerDelay = 100
} = {}) {
  const gridId = `bento-grid-${Date.now()}`

  return `
    <div
      class="bento-grid ${className}"
      id="${gridId}"
      data-scroll-reveal="${enableScrollReveal}"
      data-stagger="${staggerDelay}"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: ${gap}px;
        padding: 20px;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        position: relative;
      "
    >
      ${items.map((item, index) => renderBentoCard(item, index)).join('')}
    </div>
  `
}

/**
 * Render a single bento card
 * @param {Object} item - Card data
 * @param {number} index - Card index for stagger
 * @returns {string} HTML string
 */
function renderBentoCard(item, index) {
  const {
    id,
    title,
    description,
    category,
    organization,
    location,
    url,
    tags = [],
    status = 'active',
    card_size = '1x1',
    gradient = 'purple-blue',
    icon = 'briefcase',
    deadline,
    saves_count = 0,
    views_count = 0
  } = item

  // Determine grid span based on card size
  const { colSpan, rowSpan } = getCardSpan(card_size)

  // Get gradient colors
  const gradientColors = getGradientColors(gradient)

  // Format deadline if exists
  const deadlineText = deadline ? formatDeadline(deadline) : null

  // Status badge
  const statusBadge = status === 'featured' ? `
    <div class="status-badge featured">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Featured
    </div>
  ` : ''

  return `
    <article
      class="bento-card bento-card-${card_size} gradient-${gradient} scroll-reveal-item"
      data-card-id="${id}"
      data-index="${index}"
      style="
        grid-column: span ${colSpan};
        grid-row: span ${rowSpan};
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        opacity: 0;
        transform: translateY(20px);
      "
      onclick="window.handleCardClick && window.handleCardClick('${id}', '${url}')"
    >
      <!-- Frosted Glass Background -->
      <div class="card-glass-bg" style="
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1;
      "></div>

      <!-- Gradient Overlay -->
      <div class="card-gradient-overlay" style="
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%);
        opacity: 0.08;
        z-index: 2;
        transition: opacity 0.4s ease;
      "></div>

      <!-- Animated Border Glow -->
      <div class="card-border-glow" style="
        position: absolute;
        inset: -1px;
        border-radius: 20px;
        padding: 1px;
        background: linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to});
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: 3;
      "></div>

      <!-- Card Content -->
      <div class="card-content" style="
        position: relative;
        z-index: 4;
        padding: 24px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
      ">
        <!-- Header -->
        <div class="card-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
          <div class="card-icon gradient-${gradient}" style="
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 4px 12px ${gradientColors.from}40;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              ${getIconPath(icon)}
            </svg>
          </div>
          ${statusBadge}
        </div>

        <!-- Title -->
        <h3 class="card-title" style="
          font-size: ${card_size === '2x2' ? '24px' : '18px'};
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.3;
          margin: 0;
        ">${title}</h3>

        <!-- Organization & Location -->
        <div class="card-meta" style="
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        ">
          <div class="meta-organization">${organization}</div>
          ${location ? `<div class="meta-location">${location}</div>` : ''}
        </div>

        <!-- Description -->
        <p class="card-description" style="
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: ${card_size === '2x2' ? 4 : card_size === '2x1' ? 3 : 2};
          -webkit-box-orient: vertical;
        ">${description}</p>

        <!-- Tags -->
        ${tags.length > 0 ? `
          <div class="card-tags" style="
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          ">
            ${tags.slice(0, card_size === '2x2' ? 5 : 3).map(tag => `
              <span class="tag" style="
                padding: 4px 10px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                font-size: 11px;
                color: rgba(255, 255, 255, 0.85);
                text-transform: lowercase;
                backdrop-filter: blur(10px);
              ">${tag}</span>
            `).join('')}
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="card-footer" style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        ">
          ${deadlineText ? `
            <div class="card-deadline" style="
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.7);
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 6V12L16 14" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${deadlineText}
            </div>
          ` : '<div></div>'}

          <div class="card-actions" style="
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <button
              class="action-bookmark"
              onclick="event.stopPropagation(); window.handleBookmarkClick && window.handleBookmarkClick('${id}')"
              style="
                background: none;
                border: none;
                cursor: pointer;
                padding: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255, 255, 255, 0.7);
                transition: all 0.2s ease;
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div class="card-stats" style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
            ">
              ${saves_count > 0 ? `<span>${saves_count} saved</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    </article>
  `
}

/**
 * Get grid span for card size
 */
function getCardSpan(size) {
  const spans = {
    '1x1': { colSpan: 1, rowSpan: 1 },
    '2x1': { colSpan: 2, rowSpan: 1 },
    '1x2': { colSpan: 1, rowSpan: 2 },
    '2x2': { colSpan: 2, rowSpan: 2 }
  }
  return spans[size] || spans['1x1']
}

/**
 * Get gradient color values
 */
function getGradientColors(gradient) {
  const gradients = {
    'purple-blue': { from: '#A855F7', to: '#3B82F6' },
    'blue-cyan': { from: '#3B82F6', to: '#06B6D4' },
    'green-teal': { from: '#10B981', to: '#14B8A6' },
    'orange-red': { from: '#F97316', to: '#EF4444' },
    'pink-purple': { from: '#EC4899', to: '#A855F7' }
  }
  return gradients[gradient] || gradients['purple-blue']
}

/**
 * Get icon SVG path
 */
function getIconPath(iconName) {
  const icons = {
    'briefcase': '<path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M3 8C3 6.89543 3.89543 6 5 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'graduation-cap': '<path d="M2 9L12 4L22 9L12 14L2 9Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5V15.5C6 15.5 8 17 12 17C16 17 18 15.5 18 15.5V10.5" stroke-linecap="round" stroke-linejoin="round"/>',
    'lightbulb': '<path d="M9 18H15M10 22H14M12 2C8.13401 2 5 5.13401 5 9C5 11.4301 6.30913 13.5609 8.23244 14.7416C8.71995 15.0537 9 15.5981 9 16.1833V17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17V16.1833C15 15.5981 15.28 15.0537 15.7676 14.7416C17.6909 13.5609 19 11.4301 19 9C19 5.13401 15.866 2 12 2Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'users-group': '<path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'rocket': '<path d="M4.5 16.5C3 17.76 2.24 18.38 2.5 19C2.99 20.64 6.49 19.77 8 19C9.63 18.2 11.42 17 13 15.5M15.5 10.5C16 8.92 17.2 7.13 18 5.5C18.77 3.99 19.64 0.49 18 0C17.38 -0.24 16.76 0.51 15.5 2M8.11 12.73C7.57 13.27 6.58 14.26 6 14.84C5.46 15.38 5.26 15.59 5.05 16.02C4.97 16.17 4.95 16.33 5 16.5L5.21 17.21C5.27 17.4 5.41 17.57 5.59 17.66C5.78 17.75 6 17.76 6.21 17.66L9.5 16.17C9.96 15.97 10.22 15.76 11.09 14.89C11.67 14.31 12.66 13.32 13.2 12.78M13 7.5C13 9.15685 14.3431 10.5 16 10.5C17.6569 10.5 19 9.15685 19 7.5C19 5.84315 17.6569 4.5 16 4.5C14.3431 4.5 13 5.84315 13 7.5ZM3.5 20.5L2 22L8 21L7 15L3.5 20.5Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'trophy': '<path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9M6 9H3C3 7 4 7 4 7M6 9V3H18V9M18 9H21C21 7 20 7 20 7M12 15V19M12 19H8M12 19H16M7 3H17C17 3 18 3 18 4M6 3C6 3 6 3 6 4" stroke-linecap="round" stroke-linejoin="round"/>',
    'book-open': '<path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'beaker': '<path d="M7 3V12L3.5 18.5C3.16667 19.1667 3 19.5 3 20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20C21 19.5 20.8333 19.1667 20.5 18.5L17 12V3M7 3H17M7 3H5M17 3H19" stroke-linecap="round" stroke-linejoin="round"/>',
    'code': '<path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke-linecap="round" stroke-linejoin="round"/>',
    'globe': '<circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12H22M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke-linecap="round" stroke-linejoin="round"/>',
    'sparkles': '<path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 14L21 17L24 18L21 19L20 22L19 19L16 18L19 17L20 14Z" stroke-linecap="round" stroke-linejoin="round"/>'
  }
  return icons[iconName] || icons['briefcase']
}

/**
 * Format deadline for display
 */
function formatDeadline(deadline) {
  const date = new Date(deadline)
  const now = new Date()
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Closed'
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays < 7) return `${diffDays} days left`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Initialize bento grid interactions
 * Adds hover effects and scroll-triggered reveals
 */
export function initBentoGrid(gridElement) {
  if (!gridElement) return

  const cards = gridElement.querySelectorAll('.bento-card')

  // Add hover effects
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (prefersReducedMotion()) return

      card.style.transform = 'translateY(-4px)'
      card.style.boxShadow = `
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 10px 20px rgba(0, 0, 0, 0.3),
        0 5px 10px rgba(0, 0, 0, 0.2)
      `

      const gradientOverlay = card.querySelector('.card-gradient-overlay')
      const borderGlow = card.querySelector('.card-border-glow')

      if (gradientOverlay) gradientOverlay.style.opacity = '0.15'
      if (borderGlow) borderGlow.style.opacity = '1'
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = ''
      card.style.boxShadow = ''

      const gradientOverlay = card.querySelector('.card-gradient-overlay')
      const borderGlow = card.querySelector('.card-border-glow')

      if (gradientOverlay) gradientOverlay.style.opacity = '0.08'
      if (borderGlow) borderGlow.style.opacity = '0'
    })
  })

  // Scroll-triggered reveals
  if (gridElement.dataset.scrollReveal === 'true') {
    const staggerDelay = parseInt(gridElement.dataset.stagger) || 100
    initScrollReveal(gridElement, staggerDelay)
  }
}

/**
 * Initialize scroll-triggered card reveals
 */
function initScrollReveal(gridElement, staggerDelay) {
  if (prefersReducedMotion()) {
    // Skip animation, just show all cards
    gridElement.querySelectorAll('.scroll-reveal-item').forEach(item => {
      item.style.opacity = '1'
      item.style.transform = 'translateY(0)'
    })
    return
  }

  const items = Array.from(gridElement.querySelectorAll('.scroll-reveal-item'))

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item = entry.target
        const index = parseInt(item.dataset.index) || 0

        setTimeout(() => {
          item.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], {
            duration: 600,
            easing: getEasing('spring'),
            fill: 'forwards'
          })
        }, index * staggerDelay)

        observer.unobserve(item)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  items.forEach(item => observer.observe(item))
}
