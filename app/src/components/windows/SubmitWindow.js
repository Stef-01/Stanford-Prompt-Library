/**
 * Submit Window - Prompt Submission Form
 * Simplified and robust version to prevent UI bugs
 */

import './submit-window.css'
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
    <div class="submit-window-content">
      <div class="submit-window-inner">

        <h2 class="submit-window-title">
          ${Icon({ name: 'add_circle', className: 'text-primary' })}
          Submit a Prompt
        </h2>

        <form id="submit-prompt-form" class="submit-prompt-form">

          <!-- Title -->
          <div class="submit-form-group">
            <label class="submit-form-label">Title *</label>
            <input type="text" name="title" required minlength="3" maxlength="200" placeholder="e.g., Code Review Assistant"
              class="submit-form-input">
          </div>

          <!-- Category -->
          <div class="submit-form-group">
            <label class="submit-form-label">Category *</label>
            <select name="category" required class="submit-form-input">
              <option value="">Select a category...</option>
              ${categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
            </select>
          </div>

          <!-- Description -->
          <div class="submit-form-group">
            <label class="submit-form-label">Description *</label>
            <textarea name="description" required minlength="20" maxlength="500" rows="3" placeholder="Brief description..."
              class="submit-form-textarea"></textarea>
          </div>

          <!-- Content -->
          <div class="submit-form-group">
            <label class="submit-form-label">Prompt Content *</label>
            <textarea name="content" required minlength="50" rows="8" placeholder="Paste your prompt here..."
              class="submit-form-textarea mono"></textarea>
          </div>

          <!-- Tags -->
          <div class="submit-form-group">
            <label class="submit-form-label">Tags</label>
            <div id="tags-container" class="submit-tags-container">
              ${COMMON_TAGS.map(tag => `
                <button type="button" class="submit-tag-btn" data-tag="${tag}">
                  ${tag}
                </button>
              `).join('')}
            </div>
            <input type="hidden" name="tags" id="tags-input">
          </div>

          <!-- Submit Button -->
          <button type="submit" id="submit-prompt-btn" class="submit-prompt-btn">
            ${Icon({ name: 'send' })}
            Submit for Review
          </button>

        </form>
      </div>
    </div>
  `

  // Tag Selection Logic
  const tagBtns = contentContainer.querySelectorAll('.submit-tag-btn')
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag
      if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag)
        btn.classList.remove('selected')
      } else {
        selectedTags.push(tag)
        btn.classList.add('selected')
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
