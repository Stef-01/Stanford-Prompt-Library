/**
 * SVG Icon System
 * Custom icons with consistent 2px stroke weight
 */

const icons = {
  // Opportunities
  'briefcase': `
    <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M3 8C3 6.89543 3.89543 6 5 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V8Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'graduation-cap': `
    <path d="M2 9L12 4L22 9L12 14L2 9Z" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 10.5V15.5C6 15.5 8 17 12 17C16 17 18 15.5 18 15.5V10.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 9V13" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'lightbulb': `
    <path d="M9 18H15M10 22H14M12 2C8.13401 2 5 5.13401 5 9C5 11.4301 6.30913 13.5609 8.23244 14.7416C8.71995 15.0537 9 15.5981 9 16.1833V17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17V16.1833C15 15.5981 15.28 15.0537 15.7676 14.7416C17.6909 13.5609 19 11.4301 19 9C19 5.13401 15.866 2 12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'users-group': `
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'rocket': `
    <path d="M4.5 16.5C3 17.76 2.24 18.38 2.5 19C2.99 20.64 6.49 19.77 8 19C9.63 18.2 11.42 17 13 15.5M15.5 10.5C16 8.92 17.2 7.13 18 5.5C18.77 3.99 19.64 0.49 18 0C17.38 -0.24 16.76 0.51 15.5 2M8.11 12.73C7.57 13.27 6.58 14.26 6 14.84C5.46 15.38 5.26 15.59 5.05 16.02C4.97 16.17 4.95 16.33 5 16.5L5.21 17.21C5.27 17.4 5.41 17.57 5.59 17.66C5.78 17.75 6 17.76 6.21 17.66L9.5 16.17C9.96 15.97 10.22 15.76 11.09 14.89C11.67 14.31 12.66 13.32 13.2 12.78M13 7.5C13 9.15685 14.3431 10.5 16 10.5C17.6569 10.5 19 9.15685 19 7.5C19 5.84315 17.6569 4.5 16 4.5C14.3431 4.5 13 5.84315 13 7.5ZM3.5 20.5L2 22L8 21L7 15L3.5 20.5Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'globe': `
    <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 12H22M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'trophy': `
    <path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9M6 9H3C3 7 4 7 4 7M6 9V3H18V9M18 9H21C21 7 20 7 20 7M12 15V19M12 19H8M12 19H16M7 3H17C17 3 18 3 18 4M6 3C6 3 6 3 6 4" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'book-open': `
    <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'beaker': `
    <path d="M7 3V12L3.5 18.5C3.16667 19.1667 3 19.5 3 20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20C21 19.5 20.8333 19.1667 20.5 18.5L17 12V3M7 3H17M7 3H5M17 3H19" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 3V7" stroke-linecap="round"/>
    <path d="M11 3V7" stroke-linecap="round"/>
    <path d="M13 3V7" stroke-linecap="round"/>
    <path d="M15 3V7" stroke-linecap="round"/>
  `,

  'code': `
    <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'sparkles': `
    <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 14L21 17L24 18L21 19L20 22L19 19L16 18L19 17L20 14Z" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 5L5.5 6.5L7 7L5.5 7.5L5 9L4.5 7.5L3 7L4.5 6.5L5 5Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // Status & Actions
  'clock': `
    <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 6V12L16 14" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'check-badge': `
    <path d="M9 12L11 14L15 10M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'fire': `
    <path d="M12 2C12 2 6 6 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 9 15 7 15 7C15 7 15.5 9.5 14 11C14 11 13 9 12 7C12 7 11 8.5 10 10C10 10 9 8 9 6C9 6 6 9 6 13M12 22V19" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'star': `
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'arrow-right': `
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'external-link': `
    <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11M15 3H21M21 3V9M21 3L10 14" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'bell': `
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8ZM13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'bookmark': `
    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'x': `
    <path d="M18 6L6 18M6 6L18 18" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'search': `
    <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  'filter': `
    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke-linecap="round" stroke-linejoin="round"/>
  `
}

/**
 * Render an SVG icon
 * @param {Object} options - Icon options
 * @returns {string} SVG HTML string
 */
export function Icon({
  name = 'briefcase',
  size = 24,
  color = 'currentColor',
  className = '',
  style = ''
} = {}) {
  const iconPath = icons[name] || icons['briefcase']

  return `
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="${color}"
      stroke-width="2"
      class="icon icon-${name} ${className}"
      style="
        flex-shrink: 0;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        ${style}
      "
      aria-hidden="true"
    >
      ${iconPath}
    </svg>
  `
}

/**
 * Get list of all available icons
 * @returns {Array<string>} Array of icon names
 */
export function getAvailableIcons() {
  return Object.keys(icons)
}
