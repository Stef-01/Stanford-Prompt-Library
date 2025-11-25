/**
 * TEST SCRIPT FOR PROMPT SUBMISSION BUG
 *
 * USAGE:
 * 1. Open the Submit window
 * 2. Open browser console (F12)
 * 3. Copy and paste this ENTIRE file into console
 * 4. Press Enter
 * 5. Fill out the form and click Submit
 * 6. Watch the console output
 * 7. Report what you see
 */

console.clear()
console.log('%c🧪 SUBMISSION BUG TEST SCRIPT LOADED', 'background: #0f0; color: #000; font-size: 16px; padding: 8px;')
console.log('Fill out the form and click Submit. Watch for output below...\n')

// Test 1: Check if elements exist
const submitBtn = document.getElementById('submit-prompt-btn')
const form = document.getElementById('submit-prompt-form')

if (!submitBtn) {
  console.error('❌ TEST FAILED: Submit button not found!')
  console.log('Make sure you have the Submit window open')
} else {
  console.log('✅ Submit button found')
}

if (!form) {
  console.error('❌ TEST FAILED: Form not found!')
} else {
  console.log('✅ Form found')
}

// Test 2: Check if OLD CODE is running (form.reset exists)
if (form) {
  const originalReset = form.reset
  let resetWasCalled = false

  form.reset = function() {
    resetWasCalled = true
    console.error('🚨 BUG CONFIRMED: form.reset() WAS CALLED!')
    console.error('This means OLD CODE is still running.')
    console.error('Solution: Clear browser cache and rebuild app')
    console.log('\n%cOLD CODE DETECTED - NEED TO:', 'background: #f00; color: #fff; font-size: 14px; padding: 8px;')
    console.log('1. Run: git pull')
    console.log('2. Run: cd app && npm run dev')
    console.log('3. Hard refresh: Ctrl+Shift+R')
    console.log('4. Try Incognito mode\n')

    // Still call original to avoid breaking form
    originalReset.call(this)
  }

  console.log('✅ Monitoring for form.reset() calls')
}

// Test 3: Monitor button state changes
if (submitBtn) {
  const buttonStates = []

  const observer = new MutationObserver((mutations) => {
    const state = {
      time: new Date().toLocaleTimeString(),
      innerHTML: submitBtn.innerHTML.substring(0, 80) + '...',
      background: submitBtn.style.background,
      color: submitBtn.style.color,
      disabled: submitBtn.disabled,
      classList: Array.from(submitBtn.classList)
    }

    buttonStates.push(state)

    console.log('%c📊 Button State Changed:', 'color: #00f; font-weight: bold')
    console.table(state)

    // Check for success state
    if (state.innerHTML.includes('Submitted Successfully') || state.innerHTML.includes('check_circle')) {
      console.log('%c✅ SUCCESS STATE DETECTED!', 'background: #0f0; color: #000; font-size: 14px; padding: 8px;')
      console.log('Button turned green with checkmark')
      console.log('Form should stay filled for 0.8 seconds, then alert should show')
    }

    // Check for loading state
    if (state.innerHTML.includes('button-spinner') || state.classList.includes('loading')) {
      console.log('%c⏳ LOADING STATE DETECTED', 'background: #ff0; color: #000; font-size: 12px; padding: 4px;')
    }
  })

  observer.observe(submitBtn, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeOldValue: true
  })

  console.log('✅ Monitoring button changes')
}

// Test 4: Track form visibility
if (form) {
  let formWasHidden = false

  const formObserver = new MutationObserver(() => {
    const isVisible = form.style.display !== 'none' && form.offsetParent !== null
    const inputs = form.querySelectorAll('input, textarea, select')
    const hasValues = Array.from(inputs).some(input => input.value && input.value.length > 0)

    if (!hasValues && formWasHidden === false) {
      formWasHidden = true
      console.warn('⚠️ FORM APPEARS EMPTY!')
      console.log('Checking if this is the bug...')
      console.log('Form visible:', isVisible)
      console.log('Has values:', hasValues)
    }
  })

  formObserver.observe(form, {
    attributes: true,
    childList: true,
    subtree: true
  })

  console.log('✅ Monitoring form state')
}

// Test 5: Intercept submitPrompt function
console.log('✅ Tests initialized')
console.log('\n%c📝 NOW: Fill out the form and click Submit', 'background: #00f; color: #fff; font-size: 16px; padding: 8px;')
console.log('Watch the console for diagnostic output...\n')

// Create summary function
window.showTestSummary = function() {
  console.log('\n%c📊 TEST SUMMARY:', 'background: #000; color: #fff; font-size: 18px; padding: 12px;')

  if (resetWasCalled) {
    console.log('%c❌ DIAGNOSIS: OLD CODE IS RUNNING', 'background: #f00; color: #fff; font-size: 16px; padding: 8px;')
    console.log('The old code with form.reset() is still being executed.')
    console.log('This means your browser is caching the old JavaScript bundle.\n')
    console.log('FIX:')
    console.log('1. git pull')
    console.log('2. cd app && npm run dev')
    console.log('3. Hard refresh: Ctrl+Shift+R')
    console.log('4. If still broken, try Incognito mode')
  } else {
    console.log('%c✅ NEW CODE IS RUNNING', 'background: #0f0; color: #000; font-size: 16px; padding: 8px;')
    console.log('form.reset() was NOT called - this is correct!')
    console.log('If you still see the bug, it\'s a different issue.')
    console.log('Please share this console output with me.')
  }

  console.log('\n%cButton State Changes:', 'font-weight: bold; font-size: 14px;')
  console.table(buttonStates)
}

console.log('💡 TIP: After submitting, run showTestSummary() to see diagnosis')
