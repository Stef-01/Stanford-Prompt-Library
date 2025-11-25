/**
 * TEST SCRIPT FOR PROMPT SUBMISSION FIX
 *
 * USAGE:
 * 1. Open the Submit window
 * 2. Open browser console (F12)
 * 3. Copy and paste this ENTIRE file into console
 * 4. Press Enter
 * 5. Fill out the form and click Submit
 * 6. Watch the console output
 */

console.clear()
console.log('%c🧪 SUBMISSION FIX TEST SCRIPT LOADED', 'background: #0f0; color: #000; font-size: 16px; padding: 8px;')
console.log('Fill out the form and click Submit. Watch for output below...\n')

// Test 1: Check if Toast component exists
const toastContainer = document.getElementById('toast-container')
if (toastContainer) {
    console.log('✅ Toast container found (might be empty)')
} else {
    console.log('ℹ️ Toast container not found yet (will be created on first toast)')
}

// Test 2: Monitor for Toast notifications
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
                if (node.id === 'toast-container') {
                    console.log('✅ Toast Container Created!')
                    // Observe the container for toasts
                    new MutationObserver((toastMutations) => {
                        toastMutations.forEach(tm => {
                            tm.addedNodes.forEach(toast => {
                                console.log('%c🔔 TOAST APPEARED:', 'background: #0f0; color: #000; font-size: 14px; padding: 4px;')
                                console.log('Content:', toast.innerText)

                                if (toast.innerText.includes('Success') || toast.innerText.includes('submitted')) {
                                    console.log('✅ SUCCESS TOAST DETECTED!')
                                }
                            })
                        })
                    }).observe(node, { childList: true })
                }
            })
        }
    }
})

observer.observe(document.body, { childList: true, subtree: false })

// Test 3: Monitor Submit Button
const submitBtn = document.getElementById('submit-prompt-btn')
if (submitBtn) {
    console.log('✅ Submit button found')

    // Monitor button state
    const btnObserver = new MutationObserver((mutations) => {
        const state = {
            text: submitBtn.innerText,
            disabled: submitBtn.disabled,
            background: submitBtn.style.background
        }

        console.log('Button State:', state)

        if (state.text.includes('Submitted Successfully')) {
            console.log('✅ BUTTON SUCCESS STATE DETECTED!')
        }
    })

    btnObserver.observe(submitBtn, { attributes: true, childList: true, subtree: true })
}

// Test 4: Monitor Window Closing
const submitWindow = document.getElementById('window-submit')
if (submitWindow) {
    const windowObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (m.attributeName === 'class') {
                const classes = submitWindow.className
                console.log('Window Classes:', classes)

                if (classes.includes('closing') || !classes.includes('active')) {
                    console.log('✅ WINDOW CLOSING DETECTED!')
                }
            }
        })
    })

    windowObserver.observe(submitWindow, { attributes: true })
}

// Overwrite alert to detect if it's still called
const originalAlert = window.alert
window.alert = function (msg) {
    console.error('❌ ALERT DETECTED! Fix failed if this appears during submission.')
    console.error('Message:', msg)
    originalAlert(msg)
}

console.log('✅ Alert monitoring enabled')
console.log('🚀 READY FOR TEST')
