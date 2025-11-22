/**
 * Submit Window - Prompt Submission Form
 * Modern monochrome design with Material Symbols Outlined icons
 */

import { Icon } from '../ui/Icon.js'
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

// Category icons mapping
const categoryIcons = {
  'Writing': 'edit_note',
  'Coding': 'code',
  'Research': 'science',
  'Creative': 'palette',
  'Other': 'folder'
}

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
    <div class="submit-window-content" style="height: 100%; overflow-y: auto; overflow-x: hidden;">
      <div style="max-width: 800px; margin: 0 auto; padding: 48px 24px 96px;">

        <!-- Hero Section -->
        <div class="text-center" style="margin-bottom: 48px; animation: fadeIn 0.4s var(--ease-spring);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                      border-radius: 20px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
            ${Icon({ name: 'add_circle', className: 'text-white !text-[48px]' })}
          </div>
          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 700; color: var(--text-primary); margin-bottom: 16px; line-height: 1.1; letter-spacing: -0.02em;">
            Submit a Prompt
          </h1>
          <p style="font-size: 18px; color: var(--text-subtle); max-width: 600px; margin: 0 auto; line-height: 1.6;">
            Share your best AI prompts with the Stanford community and earn recognition on the leaderboard.
          </p>
        </div>

        <!-- Submission Form -->
        <form id="submit-prompt-form" style="display: flex; flex-direction: column; gap: 24px;">

          <!-- Title -->
          <div class="form-group">
            <label for="submit-title" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              ${Icon({ name: 'title', className: '!text-[20px]' })}
              <span>Title <span style="color: var(--text-subtle);">*</span></span>
            </label>
            <input
              type="text"
              id="submit-title"
              name="title"
              required
              minlength="3"
              maxlength="200"
              placeholder="e.g., GPT-4 Code Review Assistant"
              class="form-input"
              style="width: 100%; padding: 14px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                     border-radius: 12px; color: var(--text-primary); font-size: 16px;
                     transition: all 0.4s var(--ease-spring);"
            />
            <small style="font-size: 13px; color: var(--text-subtle); margin-top: 8px; display: block;">A clear, descriptive title for your prompt</small>
          </div>

          <!-- Category -->
          <div class="form-group">
            <label for="submit-category" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              ${Icon({ name: 'category', className: '!text-[20px]' })}
              <span>Category <span style="color: var(--text-subtle);">*</span></span>
            </label>
            <select
              id="submit-category"
              name="category"
              required
              class="form-input"
              style="width: 100%; padding: 14px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                     border-radius: 12px; color: var(--text-primary); font-size: 16px; cursor: pointer;
                     transition: all 0.4s var(--ease-spring);"
            >
              <option value="">Select a category...</option>
              ${categories.map(cat => `
                <option value="${cat.name}">${cat.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="submit-description" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              ${Icon({ name: 'subject', className: '!text-[20px]' })}
              <span>Description <span style="color: var(--text-subtle);">*</span></span>
            </label>
            <textarea
              id="submit-description"
              name="description"
              required
              minlength="20"
              maxlength="500"
              rows="3"
              placeholder="Brief description of what your prompt does and when to use it..."
              class="form-input"
              style="width: 100%; padding: 14px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                     border-radius: 12px; color: var(--text-primary); font-size: 16px; resize: vertical; font-family: inherit; line-height: 1.6;
                     transition: all 0.4s var(--ease-spring);"
            ></textarea>
            <small style="font-size: 13px; color: var(--text-subtle); margin-top: 8px; display: block;">20-500 characters</small>
          </div>

          <!-- Prompt Content -->
          <div class="form-group">
            <label for="submit-content" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              ${Icon({ name: 'article', className: '!text-[20px]' })}
              <span>Prompt Content <span style="color: var(--text-subtle);">*</span></span>
            </label>
            <textarea
              id="submit-content"
              name="content"
              required
              minlength="50"
              rows="10"
              placeholder="Paste your complete prompt here...&#10;&#10;Include:&#10;• Clear instructions for the AI&#10;• Context or background information&#10;• Example input/output (optional)&#10;• Any special formatting requirements"
              class="form-input"
              style="width: 100%; padding: 14px 16px; background: var(--white-8); border: 1px solid var(--border-subtle);
                     border-radius: 12px; color: var(--text-primary); font-size: 14px; resize: vertical;
                     font-family: 'Courier New', monospace; line-height: 1.6;
                     transition: all 0.4s var(--ease-spring);"
            ></textarea>
            <small style="font-size: 13px; color: var(--text-subtle); margin-top: 8px; display: block;">Minimum 50 characters</small>
          </div>

          <!-- Image Upload (Optional) -->
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              ${Icon({ name: 'image', className: '!text-[20px]' })}
              <span>Example Image <span style="font-size: 13px; font-weight: 400; color: var(--text-subtle);">(optional)</span></span>
            </label>
            <div style="display: flex; gap: 12px; align-items: start; flex-wrap: wrap;">
              <label for="submit-image" class="image-upload-btn" style="cursor: pointer; padding: 12px 20px; background: var(--white-5);
                     border: 1px solid var(--border-subtle); border-radius: 12px; font-size: 14px; font-weight: 500;
                     color: var(--text-primary); transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 10px;">
                ${Icon({ name: 'upload', className: '!text-[20px]' })}
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
                style="display: none; padding: 12px 20px; background: var(--white-5); border: 1px solid var(--border-subtle);
                       border-radius: 12px; color: var(--text-subtle); cursor: pointer; font-size: 14px; font-weight: 500;
                       transition: all 0.3s ease;"
              >
                Remove
              </button>
            </div>
            <div id="image-preview" style="display: none; margin-top: 16px; padding: 16px; background: var(--white-5);
                 border: 1px solid var(--border-subtle); border-radius: 12px;">
              <!-- Image preview will appear here -->
            </div>
            <small style="font-size: 13px; color: var(--text-subtle); margin-top: 8px; display: block;">
              Upload an example screenshot or diagram (PNG, JPG, WebP • Max 5MB)
            </small>
          </div>

          <!-- Tags - Visual Tag Picker -->
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);">
              ${Icon({ name: 'local_offer', className: '!text-[20px]' })}
              <span>Tags <span style="font-size: 13px; font-weight: 400; color: var(--text-subtle);">(optional)</span></span>
            </label>

            <!-- Selected Tags Display -->
            <div id="selected-tags" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; min-height: 48px;
                 padding: 16px; background: var(--white-5); border-radius: 12px; border: 1px dashed var(--border-subtle);">
              <!-- Selected tags will appear here -->
            </div>

            <!-- Suggested Tags -->
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${SUGGESTED_TAGS.map(tag => `
                <button
                  type="button"
                  class="tag-suggestion"
                  data-tag="${tag}"
                  style="padding: 10px 16px; background: var(--white-5); border: 1px solid var(--border-subtle);
                         border-radius: 24px; font-size: 13px; font-weight: 500; color: var(--text-subtle); cursor: pointer;
                         transition: all 0.3s var(--ease-spring);"
                >
                  ${tag}
                </button>
              `).join('')}
            </div>
            <small style="font-size: 13px; color: var(--text-subtle); margin-top: 12px; display: block;">
              Click tags to add them to your prompt
            </small>
          </div>

          <!-- Submit Button -->
          <div style="margin-top: 16px;">
            <button
              type="submit"
              id="submit-prompt-btn"
              style="width: 100%; padding: 16px; background: var(--primary); border: none; border-radius: 12px;
                     color: var(--background-dark); font-size: 16px; font-weight: 600; cursor: pointer;
                     transition: all 0.3s var(--ease-spring); display: flex; align-items: center; justify-content: center; gap: 10px;"
            >
              ${Icon({ name: 'send', className: '!text-[20px]' })}
              <span>Submit for Review</span>
            </button>
          </div>

          <!-- Info Box -->
          <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; margin-top: 8px;">
            <div style="display: flex; align-items: start; gap: 16px;">
              ${Icon({ name: 'info', className: 'text-white !text-[24px]' })}
              <div>
                <p style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">What happens next?</p>
                <ol style="font-size: 14px; color: var(--text-subtle); margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Your prompt will be reviewed by our team (usually within 24 hours)</li>
                  <li>Once approved, it will appear in the library for everyone to use</li>
                  <li>You'll earn points and recognition on the leaderboard!</li>
                </ol>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `

  // Inject custom styles
  injectStyles()

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

  // Initialize selected tags display
  renderSelectedTags(selectedTagsContainer)

  // Tag suggestion clicks
  tagSuggestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag

      if (selectedTags.includes(tag)) {
        // Remove tag
        selectedTags = selectedTags.filter(t => t !== tag)
      } else {
        // Add tag
        selectedTags.push(tag)
      }

      // Update selected tags display
      renderSelectedTags(selectedTagsContainer)
      updateTagButtonStates()
    })

    // Hover effects
    btn.addEventListener('mouseenter', (e) => {
      if (!selectedTags.includes(e.target.dataset.tag)) {
        e.target.style.background = 'var(--white-10)'
        e.target.style.borderColor = 'var(--white-20)'
        e.target.style.color = 'var(--text-primary)'
      }
    })

    btn.addEventListener('mouseleave', (e) => {
      if (!selectedTags.includes(e.target.dataset.tag)) {
        e.target.style.background = 'var(--white-5)'
        e.target.style.borderColor = 'var(--border-subtle)'
        e.target.style.color = 'var(--text-subtle)'
      }
    })
  })

  // Image upload handling
  const imageInput = contentContainer.querySelector('#submit-image')
  const imagePreview = contentContainer.querySelector('#image-preview')
  const imageLabel = contentContainer.querySelector('#image-upload-label')
  const clearImageBtn = contentContainer.querySelector('#clear-image-btn')
  const imageUploadBtn = contentContainer.querySelector('.image-upload-btn')
  let selectedImage = null

  // Upload button hover
  imageUploadBtn.addEventListener('mouseenter', (e) => {
    e.currentTarget.style.background = 'var(--white-10)'
    e.currentTarget.style.borderColor = 'var(--white-20)'
  })

  imageUploadBtn.addEventListener('mouseleave', (e) => {
    e.currentTarget.style.background = 'var(--white-5)'
    e.currentTarget.style.borderColor = 'var(--border-subtle)'
  })

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
        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px; display: block; margin: 0 auto;" />
        <p style="text-align: center; margin-top: 12px; font-size: 13px; color: var(--text-subtle);">
          ${file.name} • ${(file.size / 1024).toFixed(1)} KB
        </p>
      `
      imageLabel.textContent = 'Image Selected'
      clearImageBtn.style.display = 'inline-flex'
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

  clearImageBtn.addEventListener('mouseenter', (e) => {
    e.target.style.background = 'var(--white-10)'
    e.target.style.borderColor = 'var(--white-20)'
    e.target.style.color = 'var(--text-primary)'
  })

  clearImageBtn.addEventListener('mouseleave', (e) => {
    e.target.style.background = 'var(--white-5)'
    e.target.style.borderColor = 'var(--border-subtle)'
    e.target.style.color = 'var(--text-subtle)'
  })

  // Submit button hover
  submitBtn.addEventListener('mouseenter', (e) => {
    e.target.style.transform = 'scale(1.02)'
    e.target.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.15)'
  })

  submitBtn.addEventListener('mouseleave', (e) => {
    e.target.style.transform = 'scale(1)'
    e.target.style.boxShadow = 'none'
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
        updateTagButtonStates()

        // Clear image
        selectedImage = null
        imagePreview.style.display = 'none'
        imagePreview.innerHTML = ''
        imageLabel.textContent = 'Choose Image'
        clearImageBtn.style.display = 'none'

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

  // Form input focus effects
  const formInputs = contentContainer.querySelectorAll('.form-input')
  formInputs.forEach(input => {
    input.addEventListener('focus', (e) => {
      e.target.style.outline = 'none'
      e.target.style.boxShadow = '0 0 0 2px var(--white-20)'
      e.target.style.borderColor = 'var(--white-30)'
      e.target.style.background = 'var(--white-10)'
    })

    input.addEventListener('blur', (e) => {
      e.target.style.boxShadow = 'none'
      e.target.style.borderColor = 'var(--border-subtle)'
      if (e.target.id === 'submit-content') {
        e.target.style.background = 'var(--white-8)'
      } else {
        e.target.style.background = 'var(--white-5)'
      }
    })
  })
}

/**
 * Render selected tags
 */
function renderSelectedTags(container) {
  if (selectedTags.length === 0) {
    container.innerHTML = '<span style="font-size: 14px; color: var(--text-subtle);">No tags selected</span>'
    return
  }

  container.innerHTML = selectedTags.map(tag => `
    <span class="selected-tag" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px;
           background: var(--primary); border-radius: 24px; font-size: 13px; font-weight: 500;
           color: var(--background-dark);">
      ${tag}
      <button
        type="button"
        class="remove-tag"
        data-tag="${tag}"
        style="background: none; border: none; color: var(--background-dark); cursor: pointer;
               font-size: 18px; padding: 0; line-height: 1; display: flex; align-items: center; opacity: 0.7;
               transition: opacity 0.2s;"
        onclick="window.removeTag('${tag}')"
      >
        ×
      </button>
    </span>
  `).join('')

  // Add hover effects to remove buttons
  const removeBtns = container.querySelectorAll('.remove-tag')
  removeBtns.forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
      e.target.style.opacity = '1'
    })
    btn.addEventListener('mouseleave', (e) => {
      e.target.style.opacity = '0.7'
    })
  })
}

/**
 * Update tag button states
 */
function updateTagButtonStates() {
  const tagBtns = document.querySelectorAll('.tag-suggestion')
  tagBtns.forEach(btn => {
    const tag = btn.dataset.tag
    if (selectedTags.includes(tag)) {
      btn.style.background = 'var(--primary)'
      btn.style.borderColor = 'var(--primary)'
      btn.style.color = 'var(--background-dark)'
    } else {
      btn.style.background = 'var(--white-5)'
      btn.style.borderColor = 'var(--border-subtle)'
      btn.style.color = 'var(--text-subtle)'
    }
  })
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

  // Update button states
  updateTagButtonStates()
}

/**
 * Inject custom styles for submit window
 */
function injectStyles() {
  if (document.getElementById('submit-window-styles')) return

  const style = document.createElement('style')
  style.id = 'submit-window-styles'
  style.textContent = `
    .form-input::placeholder {
      color: var(--text-subtle);
    }

    .form-input option {
      background: var(--background-dark);
      color: var(--text-primary);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
  document.head.appendChild(style)
}
