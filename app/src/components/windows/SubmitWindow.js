/**
 * Submit Window - Prompt Submission Form
 * Enhanced with comprehensive debugging
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
  console.log('🎯 SubmitWindow: Rendering submit window')
  console.log('🎯 SubmitWindow: Container:', contentContainer)
  console.log('🎯 SubmitWindow: User data:', userData)

  // Clear any existing toast notifications to prevent blocking
  const oldToastContainer = document.getElementById('toast-container')
  if (oldToastContainer) {
    console.log('🎯 SubmitWindow: Removing old toast container')
    oldToastContainer.remove()
  }

  // Load categories
  try {
    categories = await getCategories()
    console.log('🎯 SubmitWindow: Categories loaded:', categories.length)
  } catch (error) {
    console.error('🎯 SubmitWindow: Failed to load categories:', error)
    categories = []
  }

  selectedTags = []
  console.log('🎯 SubmitWindow: Reset selected tags')

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

  console.log('🎯 SubmitWindow: HTML rendered into container')

  // Tag Selection Logic
  const tagBtns = contentContainer.querySelectorAll('.tag-btn')
  console.log('🎯 SubmitWindow: Tag buttons found:', tagBtns.length)

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
      console.log('🎯 SubmitWindow: Selected tags:', selectedTags)
    })
  })

  // Form Submission
  const form = contentContainer.querySelector('#submit-prompt-form')
  const submitBtn = contentContainer.querySelector('#submit-prompt-btn')

  console.log('🎯 SubmitWindow: Form element:', form)
  console.log('🎯 SubmitWindow: Submit button:', submitBtn)

  if (!form || !submitBtn) {
    console.error('🎯 SubmitWindow: ERROR - Form or submit button not found!')
    return
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log('🎯 SubmitWindow: Form submit event triggered')
    console.log('🎯 SubmitWindow: Submit button state - disabled:', submitBtn.disabled, 'loading:', submitBtn.classList.contains('loading'))

    try {
      console.log('🎯 SubmitWindow: Setting button to loading state')
      setButtonLoading(submitBtn, true)

      const formData = new FormData(form)
      const promptData = {
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: selectedTags
      }

      console.log('🎯 SubmitWindow: Prompt data collected:', {
        title: promptData.title?.substring(0, 50),
        description: promptData.description?.substring(0, 50),
        contentLength: promptData.content?.length,
        category: promptData.category,
        tagsCount: promptData.tags?.length
      })

      // Validation
      console.log('🎯 SubmitWindow: Validating prompt data')
      const validation = validatePromptSubmission(promptData)
      console.log('🎯 SubmitWindow: Validation result:', validation)

      if (!validation.isValid) {
        console.warn('🎯 SubmitWindow: Validation failed:', validation.message)
        showToast(validation.message, 'error')
        setButtonLoading(submitBtn, false)
        return
      }

      // Submit
      console.log('🎯 SubmitWindow: Submitting prompt to server...')
      const result = await submitPrompt(promptData)
      console.log('🎯 SubmitWindow: Submit result:', result)

      if (result.success) {
        console.log('🎯 SubmitWindow: Success! Showing toast and closing window')
        showToast('Prompt submitted successfully!', 'success')

        // Reset button state before closing window
        console.log('🎯 SubmitWindow: Resetting button state')
        setButtonLoading(submitBtn, false)

        // Reset form
        form.reset()
        selectedTags = []

        if (onSuccess) {
          console.log('🎯 SubmitWindow: Calling onSuccess callback')
          onSuccess()
        }

        console.log('🎯 SubmitWindow: Scheduling window close in 1500ms')
        setTimeout(() => {
          console.log('🎯 SubmitWindow: Closing window now')
          closeWindow('submit')
        }, 1500)
      } else {
        throw new Error(result.message || 'Submission failed')
      }

    } catch (error) {
      console.error('🎯 SubmitWindow: Submit error:', error)
      console.error('🎯 SubmitWindow: Error message:', error.message)
      console.error('🎯 SubmitWindow: Error stack:', error.stack)
      showToast(error.message || 'Failed to submit prompt', 'error')
      setButtonLoading(submitBtn, false)
    }
  })

  console.log('🎯 SubmitWindow: Render complete, event listeners attached')
  console.log('🎯 SubmitWindow: ---')
}
