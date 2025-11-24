import { Icon } from './Icon.js'

/**
 * Reusable Empty State Component
 * Displays when no content is available with icon, message, and optional CTA
 */
export function EmptyState({
  icon = 'inbox',
  title = 'No items found',
  message = 'There are no items to display.',
  ctaText = null,
  ctaAction = null,
  className = ''
} = {}) {
  return `
    <div class="empty-state text-center py-20 ${className}">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-border-subtle mb-6">
        ${Icon({ name: icon, className: 'text-subtle-white !text-[48px]' })}
      </div>
      <h3 class="text-2xl font-bold text-white mb-3">${title}</h3>
      <p class="text-subtle-white text-center max-w-md mx-auto mb-8">${message}</p>
      ${ctaText ? `
        <button class="empty-state-cta px-6 py-3 bg-white/10 hover:bg-white/20 text-white
                       rounded-xl font-medium transition-all duration-300">
          ${ctaText}
        </button>
      ` : ''}
    </div>
  `
}

/**
 * Initialize empty state CTA event listener
 * @param {HTMLElement} container - Container element
 * @param {Function} onCtaClick - Callback for CTA click
 */
export function initEmptyState(container, onCtaClick) {
  const cta = container.querySelector('.empty-state-cta')
  if (cta && onCtaClick) {
    cta.addEventListener('click', onCtaClick)
  }
}
