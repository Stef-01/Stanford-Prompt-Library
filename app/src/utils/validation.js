/**
 * Content validation utilities to prevent spam submissions
 */

/**
 * Detect if text contains repeated words (copy-paste spam)
 * @param {string} text - The text to check
 * @param {number} maxRepeats - Maximum times a word can appear consecutively
 * @returns {Object} - { isValid, message }
 */
export function detectRepeatedWords(text, maxRepeats = 5) {
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: 'Text cannot be empty' }
  }

  // Split into words (remove extra whitespace, newlines, etc.)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)

  if (words.length === 0) {
    return { isValid: false, message: 'Please provide meaningful content' }
  }

  // Check for consecutive repeated words
  let consecutiveCount = 1
  let lastWord = words[0]

  for (let i = 1; i < words.length; i++) {
    if (words[i] === lastWord) {
      consecutiveCount++
      if (consecutiveCount > maxRepeats) {
        return {
          isValid: false,
          message: `Detected repeated word "${lastWord}" ${consecutiveCount} times. Please provide meaningful content instead of copy-pasting the same words.`
        }
      }
    } else {
      consecutiveCount = 1
      lastWord = words[i]
    }
  }

  return { isValid: true, message: '' }
}

/**
 * Check if text has sufficient unique words
 * @param {string} text - The text to check
 * @param {number} minUniqueWords - Minimum unique words required
 * @returns {Object} - { isValid, message }
 */
export function checkUniqueWords(text, minUniqueWords = 10) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2) // Only count words with 3+ characters

  const uniqueWords = new Set(words)

  if (uniqueWords.size < minUniqueWords) {
    return {
      isValid: false,
      message: `Your content needs more variety. Please use at least ${minUniqueWords} different meaningful words (currently: ${uniqueWords.size}).`
    }
  }

  return { isValid: true, message: '' }
}

/**
 * Check if content appears to be meaningful (not just gibberish)
 * @param {string} text - The text to check
 * @returns {Object} - { isValid, message }
 */
export function checkContentQuality(text) {
  // Check for minimum word count
  const words = text.trim().split(/\s+/)
  if (words.length < 10) {
    return {
      isValid: false,
      message: 'Your prompt is too short. Please provide a more detailed prompt (at least 10 words).'
    }
  }

  // Check for excessive character repetition (like "aaaaaaa")
  const charRepeatPattern = /(.)\1{10,}/
  if (charRepeatPattern.test(text)) {
    return {
      isValid: false,
      message: 'Detected excessive character repetition. Please provide meaningful content.'
    }
  }

  // Check for random keyboard mashing (qwerty pattern, asdf pattern, etc.)
  const keyboardMashPatterns = [
    /qwertyuiop/i,
    /asdfghjkl/i,
    /zxcvbnm/i,
    /qazwsxedc/i,
    /1234567890/
  ]

  for (const pattern of keyboardMashPatterns) {
    if (pattern.test(text.replace(/\s/g, ''))) {
      return {
        isValid: false,
        message: 'Detected keyboard mashing. Please provide a real prompt.'
      }
    }
  }

  return { isValid: true, message: '' }
}

/**
 * Comprehensive validation for prompt submissions
 * @param {Object} promptData - The prompt data to validate
 * @returns {Object} - { isValid, message }
 */
export function validatePromptSubmission(promptData) {
  const { title, description, content } = promptData

  // Validate title
  let check = detectRepeatedWords(title, 3)
  if (!check.isValid) {
    return { isValid: false, message: `Title: ${check.message}` }
  }

  check = checkContentQuality(title)
  if (!check.isValid) {
    return { isValid: false, message: `Title: ${check.message}` }
  }

  // Validate description
  check = detectRepeatedWords(description, 4)
  if (!check.isValid) {
    return { isValid: false, message: `Description: ${check.message}` }
  }

  check = checkContentQuality(description)
  if (!check.isValid) {
    return { isValid: false, message: `Description: ${check.message}` }
  }

  // Validate content (main prompt)
  check = detectRepeatedWords(content, 5)
  if (!check.isValid) {
    return { isValid: false, message: `Prompt Content: ${check.message}` }
  }

  check = checkUniqueWords(content, 15)
  if (!check.isValid) {
    return { isValid: false, message: `Prompt Content: ${check.message}` }
  }

  check = checkContentQuality(content)
  if (!check.isValid) {
    return { isValid: false, message: `Prompt Content: ${check.message}` }
  }

  return { isValid: true, message: '' }
}
