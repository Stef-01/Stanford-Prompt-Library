/**
 * Utility Helpers Examples
 * Demonstrates how to use the utility helper functions
 */

import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  formatDate,
  formatRelativeTime,
  formatCompactNumber,
  escapeHtml,
  truncate,
  getInitials,
  validateForm,
  commonSchemas
} from '../app/src/utils/helpers/index.js'

/**
 * Example 1: Toast Notifications
 */
export function toastExamples() {
  // Basic success
  showSuccess('Prompt saved successfully!')

  // Error with longer duration
  showError('Failed to load data', { duration: 5000 })

  // Warning with action button
  showWarning('Unsaved changes', {
    action: {
      text: 'Save Now',
      callback: () => console.log('Save clicked')
    }
  })

  // Info toast
  showInfo('New version available')

  // Loading toast
  const loading = showLoading('Processing...')

  setTimeout(() => {
    loading.update('Almost done...')
  }, 1000)

  setTimeout(() => {
    loading.dismiss()
    showSuccess('Complete!')
  }, 2000)
}

/**
 * Example 2: Date Formatting
 */
export function dateFormattingExamples() {
  const now = new Date()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Relative time
  console.log('Now:', formatRelativeTime(now)) // "Just now"
  console.log('Yesterday:', formatRelativeTime(yesterday)) // "1 day ago"
  console.log('Last week:', formatRelativeTime(lastWeek)) // "1 week ago"

  // Formatted dates
  console.log('Short:', formatDate(now, { format: 'short' }))
  // "Jan 15, 2024"

  console.log('Long:', formatDate(now, { format: 'long' }))
  // "January 15, 2024"

  console.log('With time:', formatDate(now, { includeTime: true }))
  // "January 15, 2024 at 2:30 PM"
}

/**
 * Example 3: Number Formatting
 */
export function numberFormattingExamples() {
  console.log(formatCompactNumber(1234)) // "1.2K"
  console.log(formatCompactNumber(1500000)) // "1.5M"
  console.log(formatCompactNumber(2800000000)) // "2.8B"
  console.log(formatCompactNumber(750)) // "750"
}

/**
 * Example 4: Text Formatting
 */
export function textFormattingExamples() {
  // Escape HTML to prevent XSS
  const userInput = '<script>alert("xss")</script>'
  console.log(escapeHtml(userInput))
  // "&lt;script&gt;alert("xss")&lt;/script&gt;"

  // Truncate long text
  const longText = 'This is a very long text that needs to be truncated'
  console.log(truncate(longText, 20))
  // "This is a very lo..."

  // Get initials
  console.log(getInitials('John Doe')) // "JD"
  console.log(getInitials('Mary Jane Watson', 3)) // "MJW"
}

/**
 * Example 5: Form Validation
 */
export function formValidationExample() {
  // Define a custom schema
  const registrationSchema = {
    email: {
      required: true,
      type: 'email',
      label: 'Email'
    },
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      label: 'Username'
    },
    age: {
      required: true,
      type: 'number',
      min: 18,
      max: 120,
      label: 'Age'
    },
    password: {
      required: true,
      minLength: 8,
      label: 'Password',
      validator: (value) => {
        if (!/[A-Z]/.test(value)) {
          return { valid: false, error: 'Must contain uppercase letter' }
        }
        if (!/[0-9]/.test(value)) {
          return { valid: false, error: 'Must contain a number' }
        }
        return { valid: true }
      }
    },
    confirmPassword: {
      required: true,
      label: 'Confirm Password',
      validator: (value, data) => {
        if (value !== data.password) {
          return { valid: false, error: 'Passwords must match' }
        }
        return { valid: true }
      }
    }
  }

  // Validate form data
  const formData = {
    email: 'user@example.com',
    username: 'johndoe',
    age: 25,
    password: 'Password123',
    confirmPassword: 'Password123'
  }

  const result = validateForm(formData, registrationSchema)

  if (result.valid) {
    console.log('Form is valid!')
  } else {
    console.log('Validation errors:', result.errors)
    // Display errors in UI
    Object.entries(result.errors).forEach(([field, error]) => {
      showError(`${field}: ${error}`)
    })
  }
}

/**
 * Example 6: Using Common Schemas
 */
export function commonSchemaExample() {
  // Validate a prompt submission
  const promptData = {
    title: 'My Awesome Prompt',
    description: 'This is a detailed description of what this prompt does',
    prompt_text: 'You are a helpful assistant that helps users with...',
    category: 'coding'
  }

  const result = validateForm(promptData, commonSchemas.prompt)

  if (!result.valid) {
    console.log('Prompt validation failed:', result.errors)

    // Show specific field errors
    if (result.errors.title) {
      showError(`Title: ${result.errors.title}`)
    }
    if (result.errors.description) {
      showError(`Description: ${result.errors.description}`)
    }
  } else {
    showSuccess('Prompt is valid!')
  }
}

/**
 * Example 7: Real-time Form Validation
 */
export function realtimeValidationExample() {
  const form = document.querySelector('#myForm')
  const schema = commonSchemas.prompt

  // Validate on input
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', (e) => {
      const fieldName = e.target.name
      const value = e.target.value

      // Validate single field
      const fieldSchema = { [fieldName]: schema[fieldName] }
      const result = validateForm({ [fieldName]: value }, fieldSchema)

      const errorElement = document.querySelector(`#${fieldName}-error`)

      if (!result.valid && result.errors[fieldName]) {
        errorElement.textContent = result.errors[fieldName]
        errorElement.style.display = 'block'
        e.target.classList.add('error')
      } else {
        errorElement.style.display = 'none'
        e.target.classList.remove('error')
      }
    })
  })

  // Validate on submit
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const data = Object.fromEntries(formData)

    const result = validateForm(data, schema)

    if (result.valid) {
      showSuccess('Form submitted!')
      // Submit form data
    } else {
      showError('Please fix the errors')
      // Errors are already shown by real-time validation
    }
  })
}

/**
 * Example 8: Async Validation
 */
export async function asyncValidationExample(formData) {
  const loading = showLoading('Validating...')

  try {
    // Client-side validation
    const result = validateForm(formData, commonSchemas.prompt)

    if (!result.valid) {
      loading.dismiss()
      showError('Please fix validation errors')
      return { valid: false, errors: result.errors }
    }

    // Server-side validation (simulate)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check for duplicates on server
    // const duplicates = await checkDuplicates(formData.title)
    const duplicates = []

    if (duplicates.length > 0) {
      loading.dismiss()
      showWarning('Similar prompts already exist')
      return { valid: false, errors: { title: 'Duplicate title' } }
    }

    loading.dismiss()
    showSuccess('Validation passed!')
    return { valid: true }

  } catch (error) {
    loading.dismiss()
    showError('Validation failed')
    return { valid: false, errors: { _general: error.message } }
  }
}

// Usage:
// toastExamples()
// dateFormattingExamples()
// numberFormattingExamples()
// textFormattingExamples()
// formValidationExample()
// commonSchemaExample()
// realtimeValidationExample()
// asyncValidationExample({ title: 'Test', description: 'Test desc...' })
