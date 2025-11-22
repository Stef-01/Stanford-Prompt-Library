import { Icon } from './Icon.js'

/**
 * Reusable Search Bar Component
 * Modern glassmorphism design with icon and focus states
 */
export function SearchBar({
  value = '',
  placeholder = 'Search...',
  onInput = null,
  className = ''
} = {}) {
  const inputId = `search-${Math.random().toString(36).substr(2, 9)}`

  return `
    <div class="relative w-full max-w-2xl group ${className}">
      ${Icon({ name: 'search', className: 'absolute left-4 top-1/2 -translate-y-1/2 text-subtle-white group-focus-within:text-white transition-colors !text-[20px]' })}
      <input
        id="${inputId}"
        class="search-input w-full pl-12 pr-4 py-3.5 bg-white/5 border border-border-subtle rounded-xl
               placeholder-subtle-white text-white text-base
               focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 focus:bg-white/10
               transition-all duration-400"
        placeholder="${placeholder}"
        type="text"
        value="${value}"
      />
    </div>
  `
}

/**
 * Initialize search bar event listeners
 * @param {HTMLElement} container - Container element
 * @param {Function} onInput - Callback for input changes
 */
export function initSearchBar(container, onInput) {
  const input = container.querySelector('.search-input')
  if (input && onInput) {
    input.addEventListener('input', (e) => onInput(e.target.value))
  }
}
