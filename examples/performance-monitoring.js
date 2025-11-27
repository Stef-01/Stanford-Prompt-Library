/**
 * Performance Monitoring Examples
 * Demonstrates how to use performance monitoring utilities
 */

import {
  performanceMonitor,
  trackRender,
  trackAsyncRender,
  withPerformanceTracking,
  withAsyncPerformanceTracking
} from '../app/src/utils/performance/index.js'

/**
 * Example 1: Basic Performance Measurement
 */
export function basicMeasurementExample() {
  // Start measurement
  performanceMonitor.start('data-processing')

  // Do some work
  const data = Array.from({ length: 10000 }, (_, i) => i * 2)
  const result = data.filter(n => n % 3 === 0)

  // End measurement
  const duration = performanceMonitor.end('data-processing')
  console.log(`Processing took ${duration}ms`)
}

/**
 * Example 2: Measure Async Function
 */
export async function asyncMeasurementExample() {
  const result = await performanceMonitor.measureAsync('fetch-data', async () => {
    const response = await fetch('/api/prompts')
    return response.json()
  })

  console.log('Data fetched:', result)

  // Get metrics
  const metrics = performanceMonitor.getMetrics('fetch-data')
  console.log('Fetch metrics:', metrics)
}

/**
 * Example 3: Track Component Renders
 */
export function trackComponentExample() {
  // Wrap render function
  const renderPromptCard = trackRender('PromptCard')((prompt) => {
    const card = document.createElement('div')
    card.className = 'prompt-card'
    card.innerHTML = `
      <h3>${prompt.title}</h3>
      <p>${prompt.description}</p>
    `
    return card
  })

  // Use the wrapped function
  const prompts = [
    { title: 'Prompt 1', description: 'Description 1' },
    { title: 'Prompt 2', description: 'Description 2' }
  ]

  prompts.forEach(prompt => renderPromptCard(prompt))

  // Check render stats
  const stats = performanceMonitor.getComponentStats('PromptCard')
  console.log('PromptCard stats:', stats)
}

/**
 * Example 4: Track Async Component Renders
 */
export async function trackAsyncComponentExample() {
  const renderAdminPanel = trackAsyncRender('AdminPanel')(async (userData) => {
    // Simulate async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    const panel = document.createElement('div')
    panel.innerHTML = `<h2>Admin Panel for ${userData.name}</h2>`
    return panel
  })

  await renderAdminPanel({ name: 'John Doe' })

  const stats = performanceMonitor.getComponentStats('AdminPanel')
  console.log('AdminPanel stats:', stats)
}

/**
 * Example 5: Wrap Functions with Tracking
 */
export function wrapFunctionExample() {
  // Original function
  function processData(data) {
    return data.map(item => item * 2).filter(item => item > 10)
  }

  // Wrapped with tracking
  const trackedProcess = withPerformanceTracking(processData, 'process-data')

  // Use it
  const result = trackedProcess([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  console.log('Result:', result)

  // Check metrics
  const metrics = performanceMonitor.getMetrics('process-data')
  console.log('Processing metrics:', metrics)
}

/**
 * Example 6: Track API Calls
 */
export async function trackApiCallsExample() {
  async function fetchPrompts() {
    const startTime = performance.now()

    try {
      const response = await fetch('/api/prompts')
      const data = await response.json()
      const duration = performance.now() - startTime

      performanceMonitor.trackApiCall('/api/prompts', duration, {
        success: true,
        itemCount: data.length
      })

      return data
    } catch (error) {
      const duration = performance.now() - startTime

      performanceMonitor.trackApiCall('/api/prompts', duration, {
        success: false,
        error: error.message
      })

      throw error
    }
  }

  await fetchPrompts()

  // Get API stats
  const stats = performanceMonitor.getApiCallStats()
  console.log('API call stats:', stats)
}

/**
 * Example 7: Integrate with State Updates
 */
export function trackStateUpdatesExample() {
  // Wrap setState to track performance
  function createTrackedStore(storeName, initialState) {
    let state = initialState
    const subscribers = []

    return {
      getState: () => state,

      setState: (updates) => {
        const startTime = performance.now()

        state = { ...state, ...updates }

        const duration = performance.now() - startTime

        performanceMonitor.trackStateUpdate(storeName, updates, duration)

        // Notify subscribers
        subscribers.forEach(fn => fn(state))
      },

      subscribe: (fn) => {
        subscribers.push(fn)
        return () => {
          const index = subscribers.indexOf(fn)
          if (index > -1) subscribers.splice(index, 1)
        }
      }
    }
  }

  const myStore = createTrackedStore('myStore', { count: 0 })

  // Make updates
  myStore.setState({ count: 1 })
  myStore.setState({ count: 2, name: 'Test' })

  // Check stats
  const stats = performanceMonitor.getStateUpdateStats()
  console.log('State update stats:', stats)
}

/**
 * Example 8: Monitor Slow Operations
 */
export function monitorSlowOperationsExample() {
  // Set a threshold for slow operations
  const SLOW_THRESHOLD = 100 // ms

  // Custom logging for slow operations
  function warnIfSlow(label, duration) {
    if (duration > SLOW_THRESHOLD) {
      console.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
    }
  }

  // Wrap function with slow operation warning
  function processWithWarning(data) {
    performanceMonitor.start('process-with-warning')

    // Simulate slow operation
    for (let i = 0; i < 1000000; i++) {
      Math.sqrt(i)
    }

    const duration = performanceMonitor.end('process-with-warning')
    warnIfSlow('process-with-warning', duration)
  }

  processWithWarning()
}

/**
 * Example 9: Generate Performance Report
 */
export function generateReportExample() {
  // Simulate some operations
  performanceMonitor.start('operation-1')
  Array.from({ length: 10000 }, (_, i) => i * 2)
  performanceMonitor.end('operation-1')

  performanceMonitor.start('operation-2')
  Array.from({ length: 20000 }, (_, i) => i * 3)
  performanceMonitor.end('operation-2')

  performanceMonitor.trackComponentRender('ComponentA', 15.5)
  performanceMonitor.trackComponentRender('ComponentB', 32.1)
  performanceMonitor.trackComponentRender('ComponentA', 12.3)

  // Get full report
  const report = performanceMonitor.getReport()
  console.log('Full performance report:', report)

  // Log formatted report to console
  performanceMonitor.logReport()
}

/**
 * Example 10: Real-world Integration
 */
export async function realWorldExample() {
  // Track library loading
  const loadLibrary = trackAsyncRender('LibraryWindow')(async (userData) => {
    performanceMonitor.start('library-fetch-data')
    const prompts = await fetch('/api/prompts').then(r => r.json())
    performanceMonitor.end('library-fetch-data')

    performanceMonitor.start('library-filter')
    const filtered = prompts.filter(p => p.status === 'approved')
    performanceMonitor.end('library-filter')

    performanceMonitor.start('library-render-cards')
    const cards = filtered.map(p => renderCard(p))
    performanceMonitor.end('library-render-cards')

    return cards
  })

  function renderCard(prompt) {
    performanceMonitor.trackComponentRender('PromptCard', 5.2)
    return `<div class="card">${prompt.title}</div>`
  }

  await loadLibrary({ id: 'user123' })

  // Check all component stats
  const allStats = performanceMonitor.getAllComponentStats()
  console.log('All component stats:', allStats)

  // Find slowest components
  const slowest = allStats.slice(0, 3)
  console.log('Slowest components:', slowest)
}

/**
 * Example 11: Performance Budget
 */
export function performanceBudgetExample() {
  const BUDGETS = {
    'page-load': 1000,
    'component-render': 16.67, // 60fps
    'api-call': 500,
    'state-update': 10
  }

  function checkBudget(label, duration) {
    const budget = BUDGETS[label]
    if (budget && duration > budget) {
      console.error(
        `❌ Performance budget exceeded for ${label}: ` +
        `${duration.toFixed(2)}ms (budget: ${budget}ms)`
      )
      return false
    }
    return true
  }

  // Use with measurements
  performanceMonitor.start('page-load')
  // ... page load operations ...
  const duration = performanceMonitor.end('page-load')
  checkBudget('page-load', duration)
}

/**
 * Example 12: Export Metrics
 */
export function exportMetricsExample() {
  const report = performanceMonitor.getReport()

  // Convert to CSV
  function toCSV(data) {
    const headers = Object.keys(data[0])
    const rows = data.map(obj => headers.map(h => obj[h]).join(','))
    return [headers.join(','), ...rows].join('\n')
  }

  // Export component stats
  const csv = toCSV(report.components)
  console.log('CSV Export:', csv)

  // Could save to file or send to analytics service
  // await sendToAnalytics(report)
}

// Usage:
// basicMeasurementExample()
// await asyncMeasurementExample()
// trackComponentExample()
// await trackAsyncComponentExample()
// wrapFunctionExample()
// await trackApiCallsExample()
// trackStateUpdatesExample()
// monitorSlowOperationsExample()
// generateReportExample()
// await realWorldExample()
// performanceBudgetExample()
// exportMetricsExample()
