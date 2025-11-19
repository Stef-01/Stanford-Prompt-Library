/**
 * Glass Panel Component
 * Frosted glass effect container with backdrop-filter
 */

/**
 * Render a frosted glass panel
 * @param {Object} options - Panel options
 * @returns {string} HTML string
 */
export function GlassPanel({
  children = '',
  className = '',
  blur = 20,
  opacity = 0.05,
  borderOpacity = 0.1,
  padding = '20px',
  borderRadius = '16px',
  style = ''
} = {}) {
  return `
    <div class="glass-panel ${className}" style="
      position: relative;
      background: rgba(255, 255, 255, ${opacity});
      backdrop-filter: blur(${blur}px) saturate(180%);
      -webkit-backdrop-filter: blur(${blur}px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, ${borderOpacity});
      border-radius: ${borderRadius};
      padding: ${padding};
      ${style}
    ">
      ${children}
    </div>
  `
}

/**
 * Render a glass toolbar (for search/filter controls)
 * @param {Object} options - Toolbar options
 * @returns {string} HTML string
 */
export function GlassToolbar({
  children = '',
  className = '',
  position = 'sticky' // 'sticky' or 'fixed'
} = {}) {
  return `
    <div class="glass-toolbar ${className}" style="
      position: ${position};
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background: rgba(24, 24, 27, 0.8);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    ">
      ${children}
    </div>
  `
}

/**
 * Render a glass search input
 * @param {Object} options - Input options
 * @returns {string} HTML string
 */
export function GlassSearchInput({
  placeholder = 'Search opportunities...',
  id = 'search-input',
  className = '',
  onInput = null
} = {}) {
  const inputId = `glass-search-${id}`

  return `
    <div class="glass-search-input ${className}" style="
      position: relative;
      flex: 1;
      max-width: 500px;
    ">
      <div class="search-icon" style="
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: rgba(255, 255, 255, 0.5);
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21L16.65 16.65" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <input
        type="text"
        id="${inputId}"
        placeholder="${placeholder}"
        style="
          width: 100%;
          height: 42px;
          padding: 0 16px 0 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        "
        ${onInput ? `oninput="${onInput}"` : ''}
      />
    </div>
  `
}

/**
 * Render a glass filter button
 * @param {Object} options - Button options
 * @returns {string} HTML string
 */
export function GlassFilterButton({
  label,
  value,
  active = false,
  onClick = null,
  className = ''
} = {}) {
  return `
    <button
      class="glass-filter-button ${active ? 'active' : ''} ${className}"
      data-filter-value="${value}"
      ${onClick ? `onclick="${onClick}"` : ''}
      style="
        padding: 10px 18px;
        background: ${active ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
        border: 1px solid ${active ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
        border-radius: 10px;
        color: ${active ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)'};
        font-size: 13px;
        font-weight: ${active ? '600' : '500'};
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        white-space: nowrap;
      "
    >${label}</button>
  `
}

/**
 * Render a glass category pill
 * @param {Object} options - Pill options
 * @returns {string} HTML string
 */
export function GlassCategoryPill({
  label,
  icon = null,
  gradient = 'purple-blue',
  onClick = null,
  className = ''
} = {}) {
  const gradientColors = getGradientColors(gradient)

  return `
    <button
      class="glass-category-pill ${className}"
      ${onClick ? `onclick="${onClick}"` : ''}
      style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: linear-gradient(135deg, ${gradientColors.from}15, ${gradientColors.to}15);
        border: 1px solid ${gradientColors.from}40;
        border-radius: 12px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      "
    >
      ${icon ? `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${getIconPath(icon)}
        </svg>
      ` : ''}
      ${label}
    </button>
  `
}

/**
 * Render a glass modal overlay
 * @param {Object} options - Modal options
 * @returns {string} HTML string
 */
export function GlassModal({
  id,
  title = '',
  children = '',
  onClose = null,
  className = ''
} = {}) {
  return `
    <div
      id="${id}"
      class="glass-modal ${className}"
      style="
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        padding: 20px;
      "
      onclick="if(event.target === this) { this.style.display = 'none'; ${onClose ? onClose + '()' : ''} }"
    >
      <div class="modal-content" style="
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        background: rgba(24, 24, 27, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 28px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      ">
        ${title ? `
          <div class="modal-header" style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          ">
            <h3 style="
              font-size: 20px;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.95);
              margin: 0;
            ">${title}</h3>
            <button
              class="modal-close-btn"
              onclick="document.getElementById('${id}').style.display = 'none'; ${onClose ? onClose + '()' : ''}"
              style="
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
              "
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        ` : ''}
        <div class="modal-body">
          ${children}
        </div>
      </div>
    </div>
  `
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
 * Get icon SVG path (subset for UI elements)
 */
function getIconPath(iconName) {
  const icons = {
    'briefcase': '<path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M3 8C3 6.89543 3.89543 6 5 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'graduation-cap': '<path d="M2 9L12 4L22 9L12 14L2 9Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10.5V15.5C6 15.5 8 17 12 17C16 17 18 15.5 18 15.5V10.5" stroke-linecap="round" stroke-linejoin="round"/>',
    'beaker': '<path d="M7 3V12L3.5 18.5C3.16667 19.1667 3 19.5 3 20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20C21 19.5 20.8333 19.1667 20.5 18.5L17 12V3M7 3H17M7 3H5M17 3H19" stroke-linecap="round" stroke-linejoin="round"/>',
    'rocket': '<path d="M4.5 16.5C3 17.76 2.24 18.38 2.5 19C2.99 20.64 6.49 19.77 8 19C9.63 18.2 11.42 17 13 15.5M15.5 10.5C16 8.92 17.2 7.13 18 5.5C18.77 3.99 19.64 0.49 18 0C17.38 -0.24 16.76 0.51 15.5 2M8.11 12.73C7.57 13.27 6.58 14.26 6 14.84C5.46 15.38 5.26 15.59 5.05 16.02C4.97 16.17 4.95 16.33 5 16.5L5.21 17.21C5.27 17.4 5.41 17.57 5.59 17.66C5.78 17.75 6 17.76 6.21 17.66L9.5 16.17C9.96 15.97 10.22 15.76 11.09 14.89C11.67 14.31 12.66 13.32 13.2 12.78M13 7.5C13 9.15685 14.3431 10.5 16 10.5C17.6569 10.5 19 9.15685 19 7.5C19 5.84315 17.6569 4.5 16 4.5C14.3431 4.5 13 5.84315 13 7.5ZM3.5 20.5L2 22L8 21L7 15L3.5 20.5Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'trophy': '<path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9M6 9H3C3 7 4 7 4 7M6 9V3H18V9M18 9H21C21 7 20 7 20 7M12 15V19M12 19H8M12 19H16M7 3H17C17 3 18 3 18 4M6 3C6 3 6 3 6 4" stroke-linecap="round" stroke-linejoin="round"/>',
    'book-open': '<path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke-linecap="round" stroke-linejoin="round"/>',
    'users-group': '<path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke-linecap="round" stroke-linejoin="round"/>'
  }
  return icons[iconName] || ''
}

/**
 * Show a glass modal
 */
export function showGlassModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = 'flex'
  }
}

/**
 * Hide a glass modal
 */
export function hideGlassModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = 'none'
  }
}
