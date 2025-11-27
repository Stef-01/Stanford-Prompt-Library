/**
 * Performance Monitoring Utilities
 * Track component render times, state updates, and performance metrics
 */

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.enabled = options.enabled !== false
    this.metrics = new Map()
    this.marks = new Map()
    this.componentRenderTimes = new Map()
    this.stateUpdateTimes = []
    this.apiCallTimes = []
    this.config = {
      logToConsole: options.logToConsole ?? false,
      trackStateUpdates: options.trackStateUpdates ?? true,
      trackComponentRenders: options.trackComponentRenders ?? true,
      trackApiCalls: options.trackApiCalls ?? true,
      sampleRate: options.sampleRate ?? 1.0, // 1.0 = 100% sampling
      maxMetrics: options.maxMetrics ?? 1000
    }
  }

  /**
   * Start a performance measurement
   * @param {string} label - Measurement label
   */
  start(label) {
    if (!this.enabled || !this.shouldSample()) return

    const markName = `${label}-start`
    this.marks.set(label, performance.now())

    if (performance.mark) {
      performance.mark(markName)
    }
  }

  /**
   * End a performance measurement
   * @param {string} label - Measurement label
   * @param {Object} metadata - Additional metadata
   */
  end(label, metadata = {}) {
    if (!this.enabled || !this.marks.has(label)) return

    const startTime = this.marks.get(label)
    const endTime = performance.now()
    const duration = endTime - startTime

    this.marks.delete(label)

    // Store metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }

    const measurements = this.metrics.get(label)
    measurements.push({
      duration,
      timestamp: endTime,
      metadata
    })

    // Limit stored metrics
    if (measurements.length > this.config.maxMetrics) {
      measurements.shift()
    }

    if (this.config.logToConsole) {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`, metadata)
    }

    // Performance marks
    if (performance.mark && performance.measure) {
      const endMark = `${label}-end`
      performance.mark(endMark)
      try {
        performance.measure(label, `${label}-start`, endMark)
      } catch (e) {
        // Mark may not exist
      }
    }

    return duration
  }

  /**
   * Measure async function execution
   * @param {string} label - Measurement label
   * @param {Function} fn - Async function to measure
   * @returns {Promise<any>} Function result
   */
  async measureAsync(label, fn) {
    this.start(label)
    try {
      const result = await fn()
      this.end(label, { success: true })
      return result
    } catch (error) {
      this.end(label, { success: false, error: error.message })
      throw error
    }
  }

  /**
   * Measure sync function execution
   * @param {string} label - Measurement label
   * @param {Function} fn - Function to measure
   * @returns {any} Function result
   */
  measure(label, fn) {
    this.start(label)
    try {
      const result = fn()
      this.end(label, { success: true })
      return result
    } catch (error) {
      this.end(label, { success: false, error: error.message })
      throw error
    }
  }

  /**
   * Track component render
   * @param {string} componentName - Component name
   * @param {number} duration - Render duration
   * @param {Object} metadata - Additional metadata
   */
  trackComponentRender(componentName, duration, metadata = {}) {
    if (!this.enabled || !this.config.trackComponentRenders) return

    if (!this.componentRenderTimes.has(componentName)) {
      this.componentRenderTimes.set(componentName, [])
    }

    const renders = this.componentRenderTimes.get(componentName)
    renders.push({
      duration,
      timestamp: performance.now(),
      metadata
    })

    if (renders.length > this.config.maxMetrics) {
      renders.shift()
    }
  }

  /**
   * Track state update
   * @param {string} storeName - Store name
   * @param {Object} updates - State updates
   * @param {number} duration - Update duration
   */
  trackStateUpdate(storeName, updates, duration) {
    if (!this.enabled || !this.config.trackStateUpdates) return

    this.stateUpdateTimes.push({
      storeName,
      updates: Object.keys(updates),
      duration,
      timestamp: performance.now()
    })

    if (this.stateUpdateTimes.length > this.config.maxMetrics) {
      this.stateUpdateTimes.shift()
    }
  }

  /**
   * Track API call
   * @param {string} endpoint - API endpoint
   * @param {number} duration - Call duration
   * @param {Object} metadata - Additional metadata
   */
  trackApiCall(endpoint, duration, metadata = {}) {
    if (!this.enabled || !this.config.trackApiCalls) return

    this.apiCallTimes.push({
      endpoint,
      duration,
      timestamp: performance.now(),
      metadata
    })

    if (this.apiCallTimes.length > this.config.maxMetrics) {
      this.apiCallTimes.shift()
    }
  }

  /**
   * Get metrics summary for a label
   * @param {string} label - Metric label
   * @returns {Object} Summary statistics
   */
  getMetrics(label) {
    const measurements = this.metrics.get(label)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const durations = measurements.map(m => m.duration)
    const sum = durations.reduce((a, b) => a + b, 0)

    return {
      count: measurements.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: sum / measurements.length,
      median: this.calculateMedian(durations),
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99),
      total: sum
    }
  }

  /**
   * Get component render statistics
   * @param {string} componentName - Component name
   * @returns {Object} Render statistics
   */
  getComponentStats(componentName) {
    const renders = this.componentRenderTimes.get(componentName)
    if (!renders || renders.length === 0) {
      return null
    }

    const durations = renders.map(r => r.duration)
    const sum = durations.reduce((a, b) => a + b, 0)

    return {
      renderCount: renders.length,
      minRenderTime: Math.min(...durations),
      maxRenderTime: Math.max(...durations),
      avgRenderTime: sum / renders.length,
      totalRenderTime: sum,
      lastRender: renders[renders.length - 1]
    }
  }

  /**
   * Get all component statistics
   * @returns {Array} All component stats
   */
  getAllComponentStats() {
    const stats = []
    for (const [name, _] of this.componentRenderTimes) {
      stats.push({
        name,
        ...this.getComponentStats(name)
      })
    }
    return stats.sort((a, b) => b.avgRenderTime - a.avgRenderTime)
  }

  /**
   * Get state update statistics
   * @returns {Object} State update stats
   */
  getStateUpdateStats() {
    if (this.stateUpdateTimes.length === 0) {
      return null
    }

    const durations = this.stateUpdateTimes.map(u => u.duration)
    const sum = durations.reduce((a, b) => a + b, 0)

    return {
      updateCount: this.stateUpdateTimes.length,
      minUpdateTime: Math.min(...durations),
      maxUpdateTime: Math.max(...durations),
      avgUpdateTime: sum / this.stateUpdateTimes.length,
      totalUpdateTime: sum,
      byStore: this.groupStateUpdatesByStore()
    }
  }

  /**
   * Get API call statistics
   * @returns {Object} API call stats
   */
  getApiCallStats() {
    if (this.apiCallTimes.length === 0) {
      return null
    }

    const durations = this.apiCallTimes.map(c => c.duration)
    const sum = durations.reduce((a, b) => a + b, 0)

    return {
      callCount: this.apiCallTimes.length,
      minCallTime: Math.min(...durations),
      maxCallTime: Math.max(...durations),
      avgCallTime: sum / this.apiCallTimes.length,
      totalCallTime: sum,
      byEndpoint: this.groupApiCallsByEndpoint()
    }
  }

  /**
   * Get performance report
   * @returns {Object} Complete performance report
   */
  getReport() {
    return {
      components: this.getAllComponentStats(),
      stateUpdates: this.getStateUpdateStats(),
      apiCalls: this.getApiCallStats(),
      customMetrics: this.getAllMetrics()
    }
  }

  /**
   * Log performance report to console
   */
  logReport() {
    const report = this.getReport()

    console.group('📊 Performance Report')

    if (report.components.length > 0) {
      console.group('🎨 Component Renders')
      console.table(report.components)
      console.groupEnd()
    }

    if (report.stateUpdates) {
      console.group('📦 State Updates')
      console.log(report.stateUpdates)
      console.groupEnd()
    }

    if (report.apiCalls) {
      console.group('🌐 API Calls')
      console.log(report.apiCalls)
      console.groupEnd()
    }

    if (report.customMetrics.length > 0) {
      console.group('📈 Custom Metrics')
      console.table(report.customMetrics)
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear()
    this.marks.clear()
    this.componentRenderTimes.clear()
    this.stateUpdateTimes = []
    this.apiCallTimes = []
  }

  /**
   * Enable monitoring
   */
  enable() {
    this.enabled = true
  }

  /**
   * Disable monitoring
   */
  disable() {
    this.enabled = false
  }

  // Helper methods

  shouldSample() {
    return Math.random() < this.config.sampleRate
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index]
  }

  groupStateUpdatesByStore() {
    const byStore = {}
    this.stateUpdateTimes.forEach(update => {
      if (!byStore[update.storeName]) {
        byStore[update.storeName] = {
          count: 0,
          totalDuration: 0
        }
      }
      byStore[update.storeName].count++
      byStore[update.storeName].totalDuration += update.duration
    })
    return byStore
  }

  groupApiCallsByEndpoint() {
    const byEndpoint = {}
    this.apiCallTimes.forEach(call => {
      if (!byEndpoint[call.endpoint]) {
        byEndpoint[call.endpoint] = {
          count: 0,
          totalDuration: 0,
          successes: 0,
          failures: 0
        }
      }
      byEndpoint[call.endpoint].count++
      byEndpoint[call.endpoint].totalDuration += call.duration
      if (call.metadata.success) {
        byEndpoint[call.endpoint].successes++
      } else {
        byEndpoint[call.endpoint].failures++
      }
    })
    return byEndpoint
  }

  getAllMetrics() {
    const allMetrics = []
    for (const [label, _] of this.metrics) {
      allMetrics.push({
        label,
        ...this.getMetrics(label)
      })
    }
    return allMetrics.sort((a, b) => b.avg - a.avg)
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor({
  enabled: true,
  logToConsole: false,
  sampleRate: 1.0
})

// Convenience exports
export const { start, end, measure, measureAsync } = performanceMonitor

export default performanceMonitor
