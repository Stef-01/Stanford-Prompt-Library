import { submitPrompt, getCategories } from '../../services/prompts.js'
import { validatePromptSubmission } from '../../utils/validation.js'
import {
  initFormAnimations,
  showInputError,
  showInputSuccess,
  setButtonLoading,
  validateFormWithAnimations
} from '../../animations/form-animations.js'

let categories = []
let selectedTags = []

// Common suggested tags
const SUGGESTED_TAGS = [
  'Python', 'JavaScript', 'Code Review', 'Debugging', 'API',
  'Documentation', 'Testing', 'Data Analysis', 'Writing',
  'Research', 'Creative', 'Productivity', 'Education'
]

/**
 * Render Submit Window Content
 * @param {HTMLElement} contentContainer - Window content container
 * @param {Object} userData - User data
 * @param {Function} onSuccess - Callback after successful submission
 */
export async function renderSubmitWindow(contentContainer, userData, onSuccess) {
  // Load categories
  categories = await getCategories()
  selectedTags = []

  contentContainer.innerHTML = `
    <div style="padding: 20px;">
      <!-- Header -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 24px; margin-bottom: 10px; color: var(--text-primary);">✨ Submit a Prompt</h2>
        <p style="color: var(--text-secondary); font-size: 14px;">Share your best AI prompts with the Stanford community</p>
      </div>

      <!-- Submission Form -->
      <form id="submit-prompt-form" style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Title -->
        <div class="form-group">
          <label for="submit-title" style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            Title <span style="color: var(--accent-red);">*</span>
          </label>
          <input
            type="text"
            id="submit-title"
            name="title"
            required
            minlength="3"
            maxlength="200"
            placeholder="e.g., GPT-4 Code Review Assistant"
            style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 14px;"
          />
          <small style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">A clear, descriptive title</small>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label for="submit-category" style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            Category <span style="color: var(--accent-red);">*</span>
          </label>
          <select
            id="submit-category"
            name="category"
            required
            style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 14px; cursor: pointer;"
          >
            <option value="">Select a category...</option>
            ${categories.map(cat => `
              <option value="${cat.name}">${cat.icon} ${cat.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="submit-description" style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            Description <span style="color: var(--accent-red);">*</span>
          </label>
          <textarea
            id="submit-description"
            name="description"
            required
            minlength="20"
            maxlength="500"
            rows="3"
            placeholder="Brief description of what your prompt does..."
            style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 14px; resize: vertical; font-family: inherit;"
          ></textarea>
          <small style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">20-500 characters</small>
        </div>

        <!-- Prompt Content -->
        <div class="form-group">
          <label for="submit-content" style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            Prompt Content <span style="color: var(--accent-red);">*</span>
          </label>
          <textarea
            id="submit-content"
            name="content"
            required
            minlength="50"
            rows="8"
            placeholder="Paste your complete prompt here...&#10;&#10;Include:&#10;- Clear instructions&#10;- Context or background&#10;- Example input/output (optional)&#10;- Any special formatting"
            style="width: 100%; padding: 10px; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 13px; resize: vertical; font-family: 'Courier New', monospace; line-height: 1.5;"
          ></textarea>
          <small style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">Minimum 50 characters</small>
        </div>

        <!-- Image Upload (Optional) -->
        <div class="form-group">
          <label for="submit-image" style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            Example Image <span style="font-size: 11px; font-weight: 400; color: var(--text-secondary);">(optional)</span>
          </label>
          <div style="display: flex; gap: 10px; align-items: start;">
            <label for="submit-image" style="cursor: pointer; padding: 10px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; color: var(--text-primary); transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;" onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='var(--border-color)'">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span id="image-upload-label">Choose Image</span>
            </label>
            <input
              type="file"
              id="submit-image"
              name="image"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style="display: none;"
            />
            <button
              type="button"
              id="clear-image-btn"
              style="display: none; padding: 10px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 6px; color: var(--accent-red); cursor: pointer; font-size: 13px;"
              onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'"
              onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'"
            >
              Remove
            </button>
          </div>
          <div id="image-preview" style="display: none; margin-top: 10px; padding: 10px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 6px;">
            <!-- Image preview will appear here -->
          </div>
          <small style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: block;">Upload an example screenshot or diagram (PNG, JPG, WebP • Max 5MB)</small>
        </div>

        <!-- Tags - Visual Tag Picker -->
        <div class="form-group">
          <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--text-primary);">
            Tags (optional)
          </label>

          <!-- Selected Tags Display -->
          <div id="selected-tags" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; min-height: 32px; padding: 8px; background: rgba(255, 255, 255, 0.03); border-radius: 6px; border: 1px dashed var(--border-color);">
            <!-- Selected tags will appear here -->
          </div>

          <!-- Suggested Tags -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${SUGGESTED_TAGS.map(tag => `
              <button
                type="button"
                class="tag-suggestion"
                data-tag="${tag}"
                style="padding: 6px 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); border-radius: 12px; font-size: 12px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='var(--accent-blue)'; this.style.color='var(--text-primary)'"
                onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.borderColor='var(--border-color)'; this.style.color='var(--text-secondary)'"
              >
                + ${tag}
              </button>
            `).join('')}
          </div>
          <small style="font-size: 11px; color: var(--text-secondary); margin-top: 8px; display: block;">Click tags to add them to your prompt</small>
        </div>

        <!-- Submit Button -->
        <div style="margin-top: 10px;">
          <button
            type="submit"
            id="submit-prompt-btn"
            style="width: 100%; padding: 12px; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; border-radius: 8px; color: white; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform 0.2s;"
            onmouseover="this.style.transform='scale(1.02)'"
            onmouseout="this.style.transform='scale(1)'"
          >
            Submit for Review
          </button>
        </div>

        <!-- Info Box -->
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid var(--accent-blue); border-radius: 8px; padding: 15px; margin-top: 10px;">
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;"><strong style="color: var(--accent-blue);">What happens next?</strong></p>
          <ol style="font-size: 12px; color: var(--text-secondary); margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Your prompt will be reviewed by our team (usually within 24 hours)</li>
            <li>Once approved, it will appear in the library</li>
            <li>You'll earn points on the leaderboard!</li>
          </ol>
        </div>
      </form>
    </div>
  `

  // Set up event listeners
  setupSubmitWindowEventListeners(contentContainer, onSuccess)

  // Initialize form animations
  initFormAnimations(contentContainer)
}

/**
 * Set up event listeners
 */
function setupSubmitWindowEventListeners(contentContainer, onSuccess) {
  const form = contentContainer.querySelector('#submit-prompt-form')
  const submitBtn = contentContainer.querySelector('#submit-prompt-btn')
  const selectedTagsContainer = contentContainer.querySelector('#selected-tags')
  const tagSuggestions = contentContainer.querySelectorAll('.tag-suggestion')

  // Tag suggestion clicks
  tagSuggestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag

      if (selectedTags.includes(tag)) {
        // Remove tag
        selectedTags = selectedTags.filter(t => t !== tag)
        btn.style.background = 'rgba(255, 255, 255, 0.05)'
        btn.style.borderColor = 'var(--border-color)'
        btn.style.color = 'var(--text-secondary)'
        btn.textContent = `+ ${tag}`
      } else {
        // Add tag
        selectedTags.push(tag)
        btn.style.background = 'var(--accent-blue)'
        btn.style.borderColor = 'var(--accent-blue)'
        btn.style.color = 'white'
        btn.textContent = `✓ ${tag}`
      }

      // Update selected tags display
      renderSelectedTags(selectedTagsContainer)
    })
  })

  // Image upload handling
  const imageInput = contentContainer.querySelector('#submit-image')
  const imagePreview = contentContainer.querySelector('#image-preview')
  const imageLabel = contentContainer.querySelector('#image-upload-label')
  const clearImageBtn = contentContainer.querySelector('#clear-image-btn')
  let selectedImage = null

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Maximum size is 5MB.')
      imageInput.value = ''
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WebP).')
      imageInput.value = ''
      return
    }

    selectedImage = file

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.style.display = 'block'
      imagePreview.innerHTML = `
        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 4px; display: block; margin: 0 auto;" />
        <p style="text-align: center; margin-top: 8px; font-size: 12px; color: var(--text-secondary);">${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
      `
      imageLabel.textContent = '✓ Image Selected'
      clearImageBtn.style.display = 'inline-block'
    }
    reader.readAsDataURL(file)
  })

  clearImageBtn.addEventListener('click', () => {
    imageInput.value = ''
    selectedImage = null
    imagePreview.style.display = 'none'
    imagePreview.innerHTML = ''
    imageLabel.textContent = 'Choose Image'
    clearImageBtn.style.display = 'none'
  })

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    try {
      // Set button loading state
      setButtonLoading(submitBtn, true)

      const formData = new FormData(form)

      const promptData = {
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: selectedTags
      }

      // Validate with animations
      const titleInput = form.querySelector('#submit-title')
      const descInput = form.querySelector('#submit-description')
      const contentInput = form.querySelector('#submit-content')
      const categorySelect = form.querySelector('#submit-category')

      let hasErrors = false

      if (!promptData.title || promptData.title.length < 3) {
        showInputError(titleInput, 'Title must be at least 3 characters')
        hasErrors = true
      } else {
        showInputSuccess(titleInput)
      }

      if (!promptData.description || promptData.description.length < 20) {
        showInputError(descInput, 'Description must be at least 20 characters')
        hasErrors = true
      } else {
        showInputSuccess(descInput)
      }

      if (!promptData.content || promptData.content.length < 50) {
        showInputError(contentInput, 'Content must be at least 50 characters')
        hasErrors = true
      } else {
        showInputSuccess(contentInput)
      }

      if (!promptData.category) {
        showInputError(categorySelect, 'Please select a category')
        hasErrors = true
      } else {
        showInputSuccess(categorySelect)
      }

      if (hasErrors) {
        setButtonLoading(submitBtn, false)
        return
      }

      // Validate content quality to prevent spam
      const validation = validatePromptSubmission(promptData)
      if (!validation.isValid) {
        alert(`❌ Validation Failed:\n\n${validation.message}\n\nPlease revise your submission and try again.`)
        setButtonLoading(submitBtn, false)
        return
      }

      const result = await submitPrompt(promptData)

      if (result.success) {
        // Show success message
        alert(`✅ Success!\n\n${result.message}`)

        // Reset form
        form.reset()
        selectedTags = []
        renderSelectedTags(selectedTagsContainer)

        // Reset tag buttons
        tagSuggestions.forEach(btn => {
          btn.style.background = 'rgba(255, 255, 255, 0.05)'
          btn.style.borderColor = 'var(--border-color)'
          btn.style.color = 'var(--text-secondary)'
          btn.textContent = `+ ${btn.dataset.tag}`
        })

        // Call success callback
        if (onSuccess) {
          onSuccess()
        }
      }

      setButtonLoading(submitBtn, false)

    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit prompt: ' + error.message)
      setButtonLoading(submitBtn, false)
    }
  })
}

/**
 * Render selected tags
 */
function renderSelectedTags(container) {
  if (selectedTags.length === 0) {
    container.innerHTML = '<span style="font-size: 12px; color: var(--text-secondary);">No tags selected</span>'
    return
  }

  container.innerHTML = selectedTags.map(tag => `
    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--accent-blue); border-radius: 12px; font-size: 12px; color: white; font-weight: 500;">
      ${tag}
      <button
        type="button"
        class="remove-tag"
        data-tag="${tag}"
        style="background: none; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; line-height: 1;"
        onclick="window.removeTag('${tag}')"
      >
        ×
      </button>
    </span>
  `).join('')
}

/**
 * Remove tag (called from onclick)
 */
window.removeTag = function(tag) {
  selectedTags = selectedTags.filter(t => t !== tag)

  // Update display
  const selectedTagsContainer = document.querySelector('#selected-tags')
  if (selectedTagsContainer) {
    renderSelectedTags(selectedTagsContainer)
  }

  // Update suggestion button
  const tagBtn = document.querySelector(`.tag-suggestion[data-tag="${tag}"]`)
  if (tagBtn) {
    tagBtn.style.background = 'rgba(255, 255, 255, 0.05)'
    tagBtn.style.borderColor = 'var(--border-color)'
    tagBtn.style.color = 'var(--text-secondary)'
    tagBtn.textContent = `+ ${tag}`
  }
}
