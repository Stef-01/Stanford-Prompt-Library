/**
 * Admin Panel Integration Example
 * Demonstrates how to integrate and use the admin panel
 */

import { renderAdminPanel } from '../app/src/components/admin/index.js'
import { adminStore } from '../app/src/state/index.js'
import { showSuccess, showError, showLoading } from '../app/src/utils/helpers/index.js'

/**
 * Example 1: Basic Admin Panel Setup
 */
export async function setupAdminPanel() {
  const userData = {
    id: 'admin123',
    email: 'admin@stanford.edu',
    name: 'Admin User',
    is_admin: true
  }

  try {
    await renderAdminPanel('admin-container', userData)
    console.log('Admin panel rendered successfully!')
  } catch (error) {
    console.error('Failed to render admin panel:', error)
    showError('Failed to load admin panel')
  }
}

/**
 * Example 2: Monitor Pending Prompts
 */
export function monitorPendingPrompts() {
  adminStore.subscribe(['pendingPrompts'], (state, prevState) => {
    const pendingCount = state.pendingPrompts.length
    console.log(`Pending prompts: ${pendingCount}`)

    // Show notification when new prompts arrive
    if (prevState && pendingCount > prevState.pendingPrompts.length) {
      const newCount = pendingCount - prevState.pendingPrompts.length
      showInfo(`${newCount} new prompt${newCount > 1 ? 's' : ''} pending review`)
    }
  })
}

/**
 * Example 3: Batch Approve Prompts
 */
export async function batchApprovePrompts(promptIds) {
  const loadingToast = showLoading(`Approving ${promptIds.length} prompts...`)

  try {
    let successCount = 0
    let failCount = 0

    for (const id of promptIds) {
      try {
        // Your approve logic here
        // await approvePrompt(id)
        successCount++
      } catch (error) {
        console.error(`Failed to approve prompt ${id}:`, error)
        failCount++
      }
    }

    loadingToast.dismiss()

    if (failCount === 0) {
      showSuccess(`Successfully approved ${successCount} prompts!`)
    } else {
      showWarning(`Approved ${successCount} prompts, ${failCount} failed`)
    }

  } catch (error) {
    loadingToast.dismiss()
    showError('Batch approval failed')
  }
}

/**
 * Example 4: Filter Prompts by Status
 */
export function filterPromptsByStatus(status) {
  const state = adminStore.getState()

  let filteredPrompts
  switch (status) {
    case 'pending':
      filteredPrompts = state.pendingPrompts
      break
    case 'approved':
      filteredPrompts = state.approvedPrompts
      break
    case 'rejected':
      filteredPrompts = state.rejectedPrompts
      break
    default:
      filteredPrompts = state.allPrompts
  }

  console.log(`${status} prompts:`, filteredPrompts.length)
  return filteredPrompts
}

/**
 * Example 5: Get Admin Statistics
 */
export function getAdminStats() {
  const state = adminStore.getState()

  const stats = {
    pending: state.stats.pending || 0,
    approved: state.stats.approved || 0,
    rejected: state.stats.rejected || 0,
    total: state.stats.total || 0,
    approvalRate: state.stats.total > 0
      ? ((state.stats.approved / state.stats.total) * 100).toFixed(1)
      : 0
  }

  console.log('Admin Statistics:', stats)
  return stats
}

/**
 * Example 6: Custom Approval Workflow
 */
export async function customApprovalWorkflow(prompt) {
  // Step 1: Validate prompt quality
  const isHighQuality = prompt.likes > 10 && prompt.prompt_text.length > 200

  if (!isHighQuality) {
    const confirmed = confirm('This prompt may need review. Approve anyway?')
    if (!confirmed) return
  }

  // Step 2: Check for duplicates
  const state = adminStore.getState()
  const duplicates = state.approvedPrompts.filter(p =>
    p.title.toLowerCase() === prompt.title.toLowerCase()
  )

  if (duplicates.length > 0) {
    showWarning('Similar prompts exist in approved list')
  }

  // Step 3: Approve with notification
  try {
    // await approvePrompt(prompt.id)
    showSuccess(`Approved: ${prompt.title}`)
  } catch (error) {
    showError('Approval failed')
  }
}

// Usage:
// setupAdminPanel()
// monitorPendingPrompts()
// batchApprovePrompts(['id1', 'id2', 'id3'])
// filterPromptsByStatus('pending')
// getAdminStats()
