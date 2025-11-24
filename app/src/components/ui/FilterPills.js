/**
 * Reusable Filter Pills Component
 * Monochrome pill-shaped filters with active state
 */
export function FilterPills({
  filters = [],
  activeFilter = '',
  onClick = null,
  className = ''
} = {}) {
  return `
    <div class="flex flex-wrap gap-3 justify-center ${className}">
      ${filters.map(filter => `
        <button
          class="filter-pill px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-400
                 ${activeFilter === filter
                   ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                   : 'bg-white/5 text-subtle-white hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'}"
          data-filter="${filter}"
        >
          ${filter}
        </button>
      `).join('')}
    </div>
  `
}

/**
 * Initialize filter pills event listeners
 * @param {HTMLElement} container - Container element
 * @param {Function} onClick - Callback for filter clicks
 */
export function initFilterPills(container, onClick) {
  const pills = container.querySelectorAll('.filter-pill')
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      const filter = e.currentTarget.dataset.filter
      if (onClick) onClick(filter)

      // Update active states
      pills.forEach(p => {
        p.classList.remove('bg-white', 'text-black', 'shadow-lg', 'shadow-white/10', 'scale-105')
        p.classList.add('bg-white/5', 'text-subtle-white', 'border', 'border-white/10')
      })
      e.currentTarget.classList.remove('bg-white/5', 'text-subtle-white', 'border', 'border-white/10')
      e.currentTarget.classList.add('bg-white', 'text-black', 'shadow-lg', 'shadow-white/10', 'scale-105')
    })
  })
}
