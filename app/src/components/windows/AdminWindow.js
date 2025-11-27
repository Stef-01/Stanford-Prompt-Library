import { renderAdminPanel } from '../admin/index.js'

/**
 * Render Admin Window Content
 * @param {HTMLElement} contentContainer - Window content container
 * @param {Object} userData - User data
 */
export async function renderAdminWindow(contentContainer, userData) {
  // Simply delegate to the existing AdminPanel component
  await renderAdminPanel(contentContainer, userData)
}
