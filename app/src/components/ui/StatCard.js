import { Icon } from './Icon.js'

/**
 * Reusable Stat Card Component
 * Displays a statistic with icon, value, and label in monochrome design
 */
export function StatCard({
  icon = 'analytics',
  value = '0',
  label = 'Stat',
  className = ''
} = {}) {
  return `
    <div class="stat-card bg-white/5 p-6 rounded-2xl border border-border-subtle
                hover:bg-white/[0.08] transition-all duration-300 ${className}">
      ${Icon({ name: icon, className: 'text-white !text-[32px] mb-3 block' })}
      <div class="text-2xl font-bold text-white mb-1">${value}</div>
      <div class="text-subtle-white text-sm">${label}</div>
    </div>
  `
}

/**
 * Create a grid of stat cards
 * @param {Array} stats - Array of stat objects {icon, value, label}
 * @param {string} className - Additional classes for the grid
 */
export function StatCardGrid(stats = [], className = '') {
  return `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 ${className}">
      ${stats.map(stat => StatCard(stat)).join('')}
    </div>
  `
}
