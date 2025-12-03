/**
 * Validate authentication configuration
 * Helps diagnose common OAuth and redirect issues
 */
export function validateAuthConfig() {
  const errors = []
  const warnings = []

  const currentOrigin = window.location.origin
  const configuredUrl = import.meta.env.VITE_APP_URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  console.log('🔍 [Config Validation] Starting auth configuration check...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Current URLs
  console.log('📍 Current Environment:')
  console.log('  • Current URL:', currentOrigin)
  console.log('  • Configured URL:', configuredUrl || '(not set, using dynamic)')
  console.log('  • Protocol:', window.location.protocol)
  console.log('  • Hostname:', window.location.hostname)
  console.log('  • Port:', window.location.port || '(default)')

  // Check for URL mismatches
  if (configuredUrl && configuredUrl !== currentOrigin) {
    // Check if it's just a trailing slash difference
    if (configuredUrl.replace(/\/$/, '') === currentOrigin.replace(/\/$/, '')) {
      warnings.push(`URL trailing slash mismatch: Configured="${configuredUrl}", Actual="${currentOrigin}"`)
    } else {
      warnings.push(`URL mismatch: Configured="${configuredUrl}", Actual="${currentOrigin}"`)
    }
  }

  // Check for localhost without explicit config
  if (currentOrigin.includes('localhost') && !configuredUrl) {
    console.log('  ℹ️  Using localhost without explicit VITE_APP_URL (OK for dev)')
  }

  // Check for production without explicit config
  if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1') && !configuredUrl) {
    warnings.push('Production deployment without explicit VITE_APP_URL - may cause redirect issues')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Supabase configuration
  console.log('🔧 Supabase Configuration:')
  console.log('  • VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('  • VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '✗ Missing')

  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL not configured')
  } else {
    // Validate URL format
    try {
      const url = new URL(supabaseUrl)
      console.log('  • Supabase Project:', url.hostname)
      if (!url.hostname.includes('.supabase.co')) {
        warnings.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL')
      }
    } catch (e) {
      errors.push('VITE_SUPABASE_URL is not a valid URL')
    }
  }

  if (!supabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY not configured')
  } else {
    console.log('  • Key length:', supabaseKey.length, 'chars')
    if (supabaseKey.length < 100) {
      warnings.push('VITE_SUPABASE_ANON_KEY seems too short (should be ~200+ chars)')
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // OAuth redirect checks
  console.log('🔄 OAuth Redirect Configuration:')
  if (supabaseUrl) {
    const callbackUrl = `${supabaseUrl}/auth/v1/callback`
    console.log('  • OAuth Callback URL:', callbackUrl)
    console.log('  • App Redirect URL:', configuredUrl || currentOrigin)
    console.log('')
    console.log('  ⚠️  Important: Verify in Supabase Dashboard:')
    console.log('     1. Auth → URL Configuration → Site URL =', configuredUrl || currentOrigin)
    console.log('     2. Auth → URL Configuration → Redirect URLs includes:')
    console.log('        -', `${configuredUrl || currentOrigin}/**`)
    console.log('')
    console.log('  ⚠️  Important: Verify in Google Cloud Console:')
    console.log('     • Authorized redirect URIs includes:', callbackUrl)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Storage checks
  console.log('💾 Browser Storage:')
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    console.log('  • localStorage:', '✓ Available')
  } catch (e) {
    errors.push('localStorage not available (required for auth)')
    console.log('  • localStorage:', '✗ Not available')
  }

  // Check for existing session
  const authToken = localStorage.getItem('supabase.auth.token')
  console.log('  • Existing auth token:', authToken ? '✓ Found' : '✗ None')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Report findings
  console.log('📊 Validation Results:')
  if (errors.length > 0) {
    console.error('  ❌ ERRORS:', errors.length)
    errors.forEach((err, i) => console.error(`     ${i + 1}. ${err}`))
  } else {
    console.log('  ✅ No critical errors')
  }

  if (warnings.length > 0) {
    console.warn('  ⚠️  WARNINGS:', warnings.length)
    warnings.forEach((warn, i) => console.warn(`     ${i + 1}. ${warn}`))
  } else {
    console.log('  ✅ No warnings')
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('  ✅ Configuration looks good!')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return { errors, warnings, currentOrigin, configuredUrl }
}

/**
 * Display configuration validation on page if there are issues
 */
export function displayConfigValidation(containerEl) {
  const { errors, warnings, currentOrigin, configuredUrl } = validateAuthConfig()

  if (errors.length === 0 && warnings.length === 0) {
    return false // No issues
  }

  const hasErrors = errors.length > 0

  const html = `
    <div style="position: fixed; bottom: 1rem; right: 1rem; max-width: 500px; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); border: 2px solid ${hasErrors ? '#ef4444' : '#f59e0b'}; border-radius: 12px; padding: 1.5rem; z-index: 10000; color: white; font-family: monospace; font-size: 12px;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
        <span style="font-size: 24px;">${hasErrors ? '❌' : '⚠️'}</span>
        <strong style="font-size: 14px;">${hasErrors ? 'Configuration Errors' : 'Configuration Warnings'}</strong>
      </div>
      ${errors.length > 0 ? `
        <div style="margin-bottom: 1rem;">
          <div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Errors:</div>
          <ul style="margin: 0; padding-left: 1.5rem; color: #fca5a5;">
            ${errors.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${warnings.length > 0 ? `
        <div style="margin-bottom: 1rem;">
          <div style="color: #f59e0b; font-weight: bold; margin-bottom: 0.5rem;">Warnings:</div>
          <ul style="margin: 0; padding-left: 1.5rem; color: #fbbf24;">
            ${warnings.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 6px; margin-top: 1rem;">
        <div style="color: #a0a0a0; font-size: 10px; margin-bottom: 0.5rem;">Current: ${currentOrigin}</div>
        ${configuredUrl ? `<div style="color: #a0a0a0; font-size: 10px;">Config: ${configuredUrl}</div>` : ''}
      </div>
      <button data-action="close-validation" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    </div>
  `

  if (containerEl) {
    containerEl.insertAdjacentHTML('beforeend', html)
    // Attach event listener after inserting HTML
    const closeBtn = containerEl.querySelector('[data-action="close-validation"]')
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        this.parentElement.style.display = 'none'
      })
    }
  }

  return true // Issues found
}
