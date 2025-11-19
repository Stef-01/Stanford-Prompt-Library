/**
 * Placeholder Windows
 * These are placeholder windows for features to be implemented in the future
 */

/**
 * Render Games Window - Placeholder for gamification features
 */
export function renderGamesWindow(contentContainer) {
  contentContainer.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">🎮</div>
      <h2 style="font-size: 24px; margin-bottom: 15px; color: var(--text-primary);">Games & Challenges</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6;">
        Coming soon! Compete in prompt engineering challenges, earn badges, and test your skills against the community.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; max-width: 600px; margin: 0 auto;">
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 10px;">🏅</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Daily Challenges</h3>
          <p style="font-size: 12px; color: var(--text-secondary);">Complete daily prompt challenges</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Speed Rounds</h3>
          <p style="font-size: 12px; color: var(--text-secondary);">Fast-paced prompt writing</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Achievements</h3>
          <p style="font-size: 12px; color: var(--text-secondary);">Unlock special badges</p>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: rgba(59, 130, 246, 0.1); border: 1px solid var(--accent-blue); border-radius: 12px; max-width: 500px; margin-left: auto; margin-right: auto;">
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
          <strong style="color: var(--accent-blue);">💡 Have ideas?</strong><br/>
          Let us know what games and challenges you'd like to see!
        </p>
      </div>
    </div>
  `
}

/**
 * Render Learn Window - Placeholder for educational resources
 */
export function renderLearnWindow(contentContainer) {
  contentContainer.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">📚</div>
      <h2 style="font-size: 24px; margin-bottom: 15px; color: var(--text-primary);">Learn Prompt Engineering</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6;">
        Coming soon! Access tutorials, best practices, and courses on prompt engineering and AI interaction.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; max-width: 700px; margin: 0 auto;">
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">🎓</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Beginner Tutorials</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Learn the basics of prompt engineering</p>
          <span style="font-size: 11px; color: var(--accent-blue);">6 lessons planned</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">🚀</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Advanced Techniques</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Master complex prompting strategies</p>
          <span style="font-size: 11px; color: var(--accent-purple);">Coming soon</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">💼</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Use Cases</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Real-world applications and examples</p>
          <span style="font-size: 11px; color: var(--accent-green);">12+ examples</span>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: rgba(168, 85, 247, 0.1); border: 1px solid var(--accent-purple); border-radius: 12px; max-width: 500px; margin-left: auto; margin-right: auto;">
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
          <strong style="color: var(--accent-purple);">📖 Meanwhile...</strong><br/>
          Browse our prompt library to learn from real examples!
        </p>
      </div>
    </div>
  `
}

/**
 * Render Opportunities Window - Placeholder for job board and collaborations
 */
export function renderOpportunitiesWindow(contentContainer) {
  contentContainer.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">💼</div>
      <h2 style="font-size: 24px; margin-bottom: 15px; color: var(--text-primary);">Opportunities & Collaboration</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6;">
        Coming soon! Find research opportunities, internships, and collaboration projects in the AI space.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; max-width: 700px; margin: 0 auto;">
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">🔬</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Research Projects</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Join AI research initiatives at Stanford</p>
          <span style="font-size: 11px; color: var(--accent-blue);">Coming soon</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">👥</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Team Formation</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Find collaborators for hackathons and projects</p>
          <span style="font-size: 11px; color: var(--accent-green);">Coming soon</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">💰</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Internships & Jobs</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">AI-focused career opportunities</p>
          <span style="font-size: 11px; color: var(--accent-purple);">Coming soon</span>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: rgba(34, 197, 94, 0.1); border: 1px solid var(--accent-green); border-radius: 12px; max-width: 500px; margin-left: auto; margin-right: auto;">
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
          <strong style="color: var(--accent-green);">🌟 Want to post an opportunity?</strong><br/>
          Contact us to feature your AI project or job posting!
        </p>
      </div>
    </div>
  `
}

/**
 * Render Settings Window - Placeholder for user preferences
 */
export function renderSettingsWindow(contentContainer, userData) {
  contentContainer.innerHTML = `
    <div style="padding: 40px;">
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 24px; margin-bottom: 10px; color: var(--text-primary);">⚙️ Settings</h2>
        <p style="color: var(--text-secondary); font-size: 14px;">Manage your account preferences</p>
      </div>

      <!-- Account Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Account</h3>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Display Name</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(userData?.display_name || 'User')}</div>
            </div>
            <button disabled style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 6px; color: var(--text-secondary); font-size: 12px; cursor: not-allowed;">Coming Soon</button>
          </div>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Email</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(userData?.email || 'email@stanford.edu')}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Notifications</h3>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Email Notifications</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Get notified about prompt approvals</div>
            </div>
            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
              <input type="checkbox" disabled style="opacity: 0; width: 0; height: 0;">
              <span style="position: absolute; cursor: not-allowed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.2); border-radius: 24px; transition: 0.4s;"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Appearance Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Appearance</h3>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Theme</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Currently: Dark Mode</div>
            </div>
            <button disabled style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 6px; color: var(--text-secondary); font-size: 12px; cursor: not-allowed;">Coming Soon</button>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div style="padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; text-align: center;">
        <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">
          More settings coming soon! 🚀
        </p>
      </div>
    </div>
  `
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
