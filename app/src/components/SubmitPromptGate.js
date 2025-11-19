import { signOut } from '../services/auth.js'
import { submitPrompt, getCategories } from '../services/prompts.js'
import { checkAccessAndRender } from '../main.js'
import { validatePromptSubmission } from '../utils/validation.js'

/**
 * Render the submit prompt gate for users who haven't submitted their first prompt
 */
export async function renderSubmitPromptGate(container, userData) {
  // Get categories for the form
  const categories = await getCategories()

  container.innerHTML = `
    <div class="access-gate">
      <div class="gate-content">
        <div class="gate-icon">🔒</div>
        <h1 class="gate-title">Submit Your First Prompt to Unlock Access</h1>
        <p class="gate-message">
          To maintain quality and encourage contributions, we ask all members to share at least one prompt before accessing the library.
        </p>

        <div class="gate-benefits">
          <h3>What you'll get access to:</h3>
          <ul>
            <li>✨ Browse hundreds of curated AI prompts</li>
            <li>🔍 Advanced search and filtering</li>
            <li>⭐ Upvote and favorite prompts</li>
            <li>🏆 Compete on leaderboards</li>
            <li>📚 Learn from the Stanford community</li>
          </ul>
        </div>

        <div class="submission-form">
          <h2>Submit Your Prompt</h2>

          <form id="initial-prompt-form">
            <div class="form-group">
              <label for="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                minlength="3"
                maxlength="200"
                placeholder="e.g., GPT-4 Code Review Assistant"
                class="form-input"
              />
              <small>A clear, descriptive title for your prompt</small>
            </div>

            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" name="category" required class="form-select">
                <option value="">Select a category...</option>
                ${categories.map(cat => `
                  <option value="${cat.name}">${cat.icon} ${cat.name}</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea
                id="description"
                name="description"
                required
                minlength="20"
                maxlength="500"
                rows="3"
                placeholder="Brief description of what your prompt does..."
                class="form-textarea"
              ></textarea>
              <small>20-500 characters</small>
            </div>

            <div class="form-group">
              <label for="content">Prompt Content *</label>
              <textarea
                id="content"
                name="content"
                required
                minlength="50"
                rows="8"
                placeholder="Paste your complete prompt here...&#10;&#10;Include:&#10;- Clear instructions&#10;- Context or background&#10;- Example input/output (optional)&#10;- Any special formatting"
                class="form-textarea"
              ></textarea>
              <small>Minimum 50 characters</small>
            </div>

            <div class="form-group">
              <label for="tags">Tags (optional)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="python, api, debugging (comma-separated)"
                class="form-input"
              />
              <small>Comma-separated tags to help others find your prompt</small>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary btn-large" id="submit-btn">
                Submit Prompt for Review
              </button>
              <button type="button" class="btn-secondary" id="signout-btn">
                Sign Out
              </button>
            </div>
          </form>

          <div class="form-info">
            <p><strong>What happens next?</strong></p>
            <ol>
              <li>Your prompt will be reviewed by our team (usually within 24 hours)</li>
              <li>Once approved, you'll have full access to the library</li>
              <li>You'll be notified via email when approved</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `

  // Attach event listeners
  const form = container.querySelector('#initial-prompt-form')
  const submitBtn = container.querySelector('#submit-btn')
  const signoutBtn = container.querySelector('#signout-btn')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    try {
      submitBtn.disabled = true
      submitBtn.textContent = 'Validating...'

      const formData = new FormData(form)
      const tags = formData.get('tags')
        ? formData.get('tags').split(',').map(t => t.trim()).filter(Boolean)
        : []

      const promptData = {
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags
      }

      // Validate content quality to prevent spam
      const validation = validatePromptSubmission(promptData)
      if (!validation.isValid) {
        alert(`❌ Validation Failed:\n\n${validation.message}\n\nPlease revise your submission and try again.`)
        submitBtn.disabled = false
        submitBtn.textContent = 'Submit Prompt for Review'
        return
      }

      submitBtn.textContent = 'Submitting...'

      const result = await submitPrompt(promptData)

      if (result.success) {
        // Show success message
        alert(result.message)

        // Small delay to ensure database trigger has completed
        submitBtn.textContent = 'Redirecting...'
        await new Promise(resolve => setTimeout(resolve, 500))

        // Refresh to show pending approval gate
        await checkAccessAndRender()
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit prompt: ' + error.message)
      submitBtn.disabled = false
      submitBtn.textContent = 'Submit Prompt for Review'
    }
  })

  signoutBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  })
}
