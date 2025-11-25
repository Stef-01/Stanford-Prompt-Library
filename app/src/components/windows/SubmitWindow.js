/**
 * Submit Window - Prompt Submission Form
 * Simplified and robust version to prevent UI bugs
 */

import { Icon } from '../ui/Icon.js'
import { showToast } from '../ui/Toast.js'
import { submitPrompt, getCategories } from '../../services/prompts.js'
import { validatePromptSubmission } from '../../utils/validation.js'
import { closeWindow } from '../../utils/desktop-windows.js'
import { setButtonLoading } from '../../animations/form-animations.js'

let categories = []
let selectedTags = []

// Simplified tag list (flat structure for robustness)
const COMMON_TAGS = [
  'Python', 'JavaScript', 'React', 'Data Analysis', 'Writing',
  'Creative', 'Productivity', 'Education', 'Business', 'Marketing',
  'Coding', 'Research', 'Design', 'SEO', 'Email'
]

/**
 * Render Submit Window Content
 */
export async function renderSubmitWindow(contentContainer, userData, onSuccess) {
  // Load categories
  categories = await getCategories()
  selectedTags = []

  contentContainer.innerHTML = `
    <div class="submit-window-content" style="height: 100%; overflow-y: auto; padding: 24px;">
      <div style="max-width: 700px; margin: 0 auto;">
        
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
          ${Icon({ name: 'add_circle', className: 'text-primary' })}
          Submit a Prompt
        </h2>

        <form id="submit-prompt-form" style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Title -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Title *</label>
            <input type="text" name="title" required minlength="3" maxlength="200" placeholder="e.g., Code Review Assistant"
              class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--white-5); color: var(--text-primary);">
          </div>

          <!-- Category -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Category *</label>
            <select name="category" required class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--white-5); color: var(--text-primary);">
              <option value="">Select a category...</option>
              ${categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
            </select>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Description *</label>
            <textarea name="description" required minlength="20" maxlength="500" rows="3" placeholder="Brief description..."
              class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--white-5); color: var(--text-primary);"></textarea>
          </div>

          <!-- Content -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Prompt Content *</label>
            <textarea name="content" required minlength="50" rows="8" placeholder="Paste your prompt here..."
              class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--white-5); color: var(--text-primary); font-family: monospace;"></textarea>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">Tags</label>
            <div id="tags-container" style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${COMMON_TAGS.map(tag => `
                <button type="button" class="tag-btn" data-tag="${tag}" 
                  style="padding: 6px 12px; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--white-5); color: var(--text-secondary); cursor: pointer; transition: all 0.2s;">
                  ${tag}
                </button>
              `).join('')}
            </div>
            <input type="hidden" name="tags" id="tags-input">
          </div>

          <!-- Submit Button -->
          <button type="submit" id="submit-prompt-btn" 
            style="margin-top: 16px; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${Icon({ name: 'send' })}
            Submit for Review
          </button>

        </form>
      </div>
    </div>
  `

  // Tag Selection Logic
  const tagBtns = contentContainer.querySelectorAll('.tag-btn')
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag)
        btn.style.background = 'var(--white-5)'
        btn.style.color = 'var(--text-secondary)'
        btn.style.borderColor = 'var(--border-subtle)'
      } else {
        selectedTags.push(tag)
        btn.style.background = 'var(--primary)'
        btn.style.color = 'white'
        btn.style.borderColor = 'var(--primary)'
      }
    })
  })

  // Form Submission
  const form = contentContainer.querySelector('#submit-prompt-form')
  const submitBtn = contentContainer.querySelector('#submit-prompt-btn')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    try {
      setButtonLoading(submitBtn, true)

      const formData = new FormData(form)
      const promptData = {
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: selectedTags
      }

      // Validation
      const validation = validatePromptSubmission(promptData)
      if (!validation.isValid) {
        showToast(validation.message, 'error')
        setButtonLoading(submitBtn, false)
        return
      }

      // Submit
      const result = await submitPrompt(promptData)

      if (result.success) {
        showToast('Prompt submitted successfully!', 'success')
        if (onSuccess) onSuccess()
        setTimeout(() => closeWindow('submit'), 1000)
      } else {
        throw new Error('Submission failed')
      }

    } catch (error) {
      console.error('Submit error:', error)
      showToast(error.message || 'Failed to submit prompt', 'error')
      setButtonLoading(submitBtn, false)
    }
  })
}
