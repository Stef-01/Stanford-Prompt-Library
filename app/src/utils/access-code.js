/**
 * Access Code Bypass System
 * Allows bypassing authentication with a secret code for testing
 */

const ACCESS_CODE = 'Easy'
const BYPASS_KEY = 'sp_access_bypass'

/**
 * Check if access code bypass is active
 */
export function isBypassActive() {
  return localStorage.getItem(BYPASS_KEY) === 'true'
}

/**
 * Activate bypass mode
 */
export function activateBypass() {
  localStorage.setItem(BYPASS_KEY, 'true')
  console.log('🔓 Bypass mode activated')
}

/**
 * Deactivate bypass mode
 */
export function deactivateBypass() {
  localStorage.removeItem(BYPASS_KEY)
  console.log('🔒 Bypass mode deactivated')
}

/**
 * Verify access code
 * @param {string} code - The code to verify
 * @returns {boolean} - Whether the code is correct
 */
export function verifyAccessCode(code) {
  return code === ACCESS_CODE
}

/**
 * Show access code modal
 * @param {Function} onSuccess - Callback when code is verified
 */
export function showAccessCodeModal(onSuccess) {
  const modal = document.createElement('div')
  modal.className = 'access-code-modal show'
  modal.innerHTML = `
    <h2>🔓 Access Code</h2>
    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; text-align: center;">
      Enter the access code to bypass authentication for testing
    </p>
    <input
      type="text"
      id="access-code-input"
      placeholder="Enter code..."
      autocomplete="off"
    />
    <button class="btn-primary" id="verify-code-btn">
      Verify Code
    </button>
    <div class="error-message" id="code-error"></div>
    <button
      class="btn-secondary"
      style="margin-top: 1rem; background: rgba(255, 255, 255, 0.05);"
      id="cancel-code-btn"
    >
      Cancel
    </button>
  `

  document.body.appendChild(modal)

  const input = modal.querySelector('#access-code-input')
  const verifyBtn = modal.querySelector('#verify-code-btn')
  const cancelBtn = modal.querySelector('#cancel-code-btn')
  const errorEl = modal.querySelector('#code-error')

  // Focus input
  setTimeout(() => input.focus(), 100)

  // Handle verify
  const handleVerify = () => {
    const code = input.value.trim()
    if (verifyAccessCode(code)) {
      activateBypass()
      modal.remove()
      onSuccess()
    } else {
      errorEl.textContent = 'Invalid access code'
      input.value = ''
      input.focus()

      // Shake animation
      modal.style.animation = 'shake 0.5s'
      setTimeout(() => {
        modal.style.animation = ''
      }, 500)
    }
  }

  verifyBtn.addEventListener('click', handleVerify)

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
  })

  cancelBtn.addEventListener('click', () => {
    modal.remove()
  })

  // Add shake animation
  const style = document.createElement('style')
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translate(-50%, -50%); }
      10%, 30%, 50%, 70%, 90% { transform: translate(-52%, -50%); }
      20%, 40%, 60%, 80% { transform: translate(-48%, -50%); }
    }
  `
  document.head.appendChild(style)
}
