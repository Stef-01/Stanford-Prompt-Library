/**
 * Submit Window - Prompt Submission Form
 * Fixed version - prevents button stuck in loading state
 */

import { Icon } from '../ui/Icon.js'
import { showToast, clearAllToasts } from '../ui/Toast.js'
import { submitPrompt, getCategories } from '../../services/prompts.js'
import { validatePromptSubmission } from '../../utils/validation.js'
import { closeWindow } from '../../utils/desktop-windows.js'
import { setButtonLoading } from '../../animations/form-animations.js'

let categories = []
let selectedTags = []
let isSubmitting = false  // Prevent double submissions

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

  // Reset state
  isSubmitting = false
  selectedTags = []

  // Clear any existing toast notifications
  clearAllToasts()
  console.log('🎯 SubmitWindow: Cleared all toasts')

  // Load categories
  try {
    categories = await getCategories()
    console.log('🎯 SubmitWindow: Categories loaded:', categories.length)
  } catch (error) {
    console.error('🎯 SubmitWindow: Failed to load categories:', error)
    categories = []
  }

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
          <button type="submit" id="submit-prompt-btn" class="btn-primary"
            style="margin-top: 16px; width: 100%;">
            ${Icon({ name: 'send' })}
            Submit for Review
          </button>

        </form>
      </div>
    </div>
  `

  console.log('🎯 SubmitWindow: HTML rendered')

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
    })
  })

  // Form Submission
  const form = contentContainer.querySelector('#submit-prompt-form')
  const submitBtn = contentContainer.querySelector('#submit-prompt-btn')

  console.log('🎯 SubmitWindow: Form:', form)
  console.log('🎯 SubmitWindow: Button state - disabled:', submitBtn?.disabled, 'class:', submitBtn?.className)

  if (!form || !submitBtn) {
    console.error('🎯 SubmitWindow: ERROR - Form or button not found!')
    return
  }

  // Ensure button starts in correct state
  submitBtn.disabled = false
  submitBtn.classList.remove('loading')
  const oldSpinner = submitBtn.querySelector('.button-spinner')
  if (oldSpinner) oldSpinner.remove()
  console.log('🎯 SubmitWindow: Button reset to initial state')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Prevent double submissions
    if (isSubmitting) {
      console.warn('🎯 SubmitWindow: Already submitting, ignoring duplicate submit')
      return
    }

    console.log('🎯 SubmitWindow: Form submitted!')
    isSubmitting = true

    try {
      // Set button to loading state
      setButtonLoading(submitBtn, true)
      console.log('🎯 SubmitWindow: Button set to loading')

      const formData = new FormData(form)
      const promptData = {
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: selectedTags
      }

      console.log('🎯 SubmitWindow: Data collected:', {
        titleLength: promptData.title?.length,
        descLength: promptData.description?.length,
        contentLength: promptData.content?.length,
        category: promptData.category,
        tags: promptData.tags
      })

      // Validation
      const validation = validatePromptSubmission(promptData)
      console.log('🎯 SubmitWindow: Validation:', validation)

      if (!validation.isValid) {
        console.warn('🎯 SubmitWindow: Validation failed')
        showToast(validation.message, 'error')
        setButtonLoading(submitBtn, false)
        isSubmitting = false
        return
      }

      // Submit
      console.log('🎯 SubmitWindow: Submitting to server...')
      const result = await submitPrompt(promptData)
      console.log('🎯 SubmitWindow: Result:', result)

      if (result.success) {
        console.log('🎯 SubmitWindow: SUCCESS!')

        // Show success message
        showToast('Prompt submitted successfully! 🎉', 'success')

        // IMPORTANT: Reset button IMMEDIATELY before any delays
        setButtonLoading(submitBtn, false)
        submitBtn.disabled = true  // Disable to prevent resubmission
        isSubmitting = false

        // Reset form
        form.reset()
        selectedTags = []

        // Call success callback
        if (onSuccess) {
          try {
            onSuccess()
          } catch (err) {
            console.error('🎯 SubmitWindow: onSuccess error:', err)
          }
        }

        // Close window after delay
        console.log('🎯 SubmitWindow: Closing in 2000ms')
        setTimeout(() => {
          closeWindow('submit')
        }, 2000)

      } else {
        throw new Error(result.message || 'Submission failed')
      }

    } catch (error) {
      console.error('🎯 SubmitWindow: ERROR:', error)
      showToast(error.message || 'Failed to submit prompt', 'error')

      // Reset button on error
      if (submitBtn) {
        setButtonLoading(submitBtn, false)
      }
      isSubmitting = false
    }
  })

  console.log('🎯 SubmitWindow: Ready!')
}
