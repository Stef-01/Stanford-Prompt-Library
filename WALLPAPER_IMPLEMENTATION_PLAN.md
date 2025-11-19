# Swappable Desktop Wallpapers - Implementation Plan

## 🎯 Objective
Add swappable wallpapers to the desktop interface, allowing users to customize their desktop background while preserving all existing features.

## 📋 Current State Analysis

### Existing Desktop Background
**Location**: `app/src/style.css` (lines 1345-1352)
```css
body.desktop-mode {
  overflow: hidden;
  height: 100vh;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);
}
```

**Current Implementation**:
- Uses CSS radial gradients
- Applied to `body.desktop-mode`
- Three overlapping gradient circles (blue, purple, pink)
- No wallpaper system exists yet

### Missing Components
- ❌ Wallpaper folder/assets
- ❌ Wallpaper data structure
- ❌ Wallpaper switcher UI
- ❌ Wallpaper persistence (localStorage/database)
- ❌ Wallpaper preview system

## 🏗️ Implementation Architecture

### Phase 1: Wallpaper Asset Structure
**Goal**: Create organized wallpaper storage and data structure

#### 1.1 Folder Structure
```
app/public/wallpapers/
├── thumbnails/           # 200x150px previews
│   ├── gradient-blue.jpg
│   ├── gradient-purple.jpg
│   ├── gradient-pink.jpg
│   ├── dark-abstract.jpg
│   ├── light-abstract.jpg
│   └── custom-1.jpg
└── full/                 # Full resolution (1920x1080)
    ├── gradient-blue.jpg
    ├── gradient-purple.jpg
    ├── gradient-pink.jpg
    ├── dark-abstract.jpg
    ├── light-abstract.jpg
    └── custom-1.jpg
```

#### 1.2 Wallpaper Data Structure
**File**: `app/src/config/wallpapers.js`
```javascript
export const wallpapers = [
  {
    id: 'gradient-default',
    name: 'Stanford Gradient (Default)',
    type: 'css',
    thumbnail: null,
    css: `
      radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
    `,
    category: 'gradient'
  },
  {
    id: 'gradient-blue',
    name: 'Ocean Blue',
    type: 'css',
    thumbnail: null,
    css: `
      linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    `,
    category: 'gradient'
  },
  {
    id: 'gradient-purple',
    name: 'Purple Dream',
    type: 'css',
    thumbnail: null,
    css: `
      linear-gradient(135deg, #a855f7 0%, #ec4899 100%)
    `,
    category: 'gradient'
  },
  {
    id: 'gradient-dark',
    name: 'Dark Matter',
    type: 'css',
    thumbnail: null,
    css: `
      linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)
    `,
    category: 'gradient'
  },
  {
    id: 'image-abstract-1',
    name: 'Abstract Waves',
    type: 'image',
    thumbnail: '/wallpapers/thumbnails/dark-abstract.jpg',
    image: '/wallpapers/full/dark-abstract.jpg',
    category: 'abstract'
  },
  {
    id: 'solid-dark',
    name: 'Solid Dark',
    type: 'css',
    thumbnail: null,
    css: '#0a0a0a',
    category: 'solid'
  }
]

export const wallpaperCategories = [
  { id: 'all', label: 'All Wallpapers' },
  { id: 'gradient', label: 'Gradients' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'solid', label: 'Solid Colors' },
  { id: 'custom', label: 'Custom' }
]
```

---

### Phase 2: Wallpaper Service Layer
**Goal**: Handle wallpaper state and persistence

#### 2.1 Wallpaper Service
**File**: `app/src/services/wallpaper.js`
```javascript
import { wallpapers } from '../config/wallpapers.js'

const STORAGE_KEY = 'stanford-wallpaper'
const DEFAULT_WALLPAPER = 'gradient-default'

/**
 * Get current wallpaper from localStorage or default
 */
export function getCurrentWallpaper() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    const wallpaper = wallpapers.find(w => w.id === saved)
    if (wallpaper) return wallpaper
  }
  return wallpapers.find(w => w.id === DEFAULT_WALLPAPER)
}

/**
 * Set wallpaper and persist to localStorage
 */
export function setWallpaper(wallpaperId) {
  const wallpaper = wallpapers.find(w => w.id === wallpaperId)
  if (!wallpaper) {
    console.error('Wallpaper not found:', wallpaperId)
    return false
  }

  // Apply wallpaper to desktop
  applyWallpaper(wallpaper)

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, wallpaperId)

  return true
}

/**
 * Apply wallpaper to desktop background
 */
function applyWallpaper(wallpaper) {
  const desktop = document.querySelector('body.desktop-mode')
  if (!desktop) return

  if (wallpaper.type === 'css') {
    desktop.style.backgroundImage = wallpaper.css
    desktop.style.backgroundSize = 'cover'
    desktop.style.backgroundPosition = 'center'
    desktop.style.backgroundRepeat = 'no-repeat'
  } else if (wallpaper.type === 'image') {
    desktop.style.backgroundImage = `url('${wallpaper.image}')`
    desktop.style.backgroundSize = 'cover'
    desktop.style.backgroundPosition = 'center'
    desktop.style.backgroundRepeat = 'no-repeat'
  }
}

/**
 * Initialize wallpaper on page load
 */
export function initWallpaper() {
  const current = getCurrentWallpaper()
  applyWallpaper(current)
}

/**
 * Get all wallpapers
 */
export function getAllWallpapers() {
  return wallpapers
}

/**
 * Get wallpapers by category
 */
export function getWallpapersByCategory(categoryId) {
  if (categoryId === 'all') return wallpapers
  return wallpapers.filter(w => w.category === categoryId)
}
```

---

### Phase 3: UI Components
**Goal**: Create wallpaper picker interface

#### 3.1 Wallpaper Picker Window
**File**: `app/src/components/windows/WallpaperWindow.js`
```javascript
import { getAllWallpapers, getCurrentWallpaper, setWallpaper } from '../../services/wallpaper.js'
import { wallpaperCategories } from '../../config/wallpapers.js'
import { GlassPanel } from '../ui/GlassPanel.js'

export function renderWallpaperWindow(container) {
  const wallpapers = getAllWallpapers()
  const current = getCurrentWallpaper()

  container.innerHTML = `
    <div class="wallpaper-window" style="
      width: 100%;
      height: 100%;
      padding: 20px;
      overflow-y: auto;
    ">
      <!-- Header -->
      <div class="wallpaper-header" style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
          Desktop Wallpaper
        </h2>
        <p style="font-size: 14px; color: var(--text-secondary);">
          Customize your desktop background
        </p>
      </div>

      <!-- Category Filter -->
      <div class="wallpaper-categories" style="
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        overflow-x: auto;
      ">
        ${wallpaperCategories.map(cat => `
          <button
            class="category-filter ${cat.id === 'all' ? 'active' : ''}"
            data-category="${cat.id}"
            style="
              padding: 8px 16px;
              border-radius: 8px;
              border: 1px solid var(--border-color);
              background: rgba(255, 255, 255, 0.05);
              color: var(--text-secondary);
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s ease;
              white-space: nowrap;
            "
          >
            ${cat.label}
          </button>
        `).join('')}
      </div>

      <!-- Wallpaper Grid -->
      <div class="wallpaper-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      ">
        ${wallpapers.map(wallpaper => `
          <div
            class="wallpaper-item ${current.id === wallpaper.id ? 'active' : ''}"
            data-wallpaper-id="${wallpaper.id}"
            data-category="${wallpaper.category}"
            style="
              position: relative;
              border-radius: 12px;
              overflow: hidden;
              cursor: pointer;
              border: 2px solid ${current.id === wallpaper.id ? 'var(--accent-blue)' : 'var(--border-color)'};
              transition: all 0.3s ease;
              aspect-ratio: 16 / 10;
            "
          >
            <!-- Preview -->
            <div class="wallpaper-preview" style="
              width: 100%;
              height: 100%;
              ${wallpaper.type === 'css'
                ? `background-image: ${wallpaper.css};`
                : `background-image: url('${wallpaper.thumbnail || wallpaper.image}');`
              }
              background-size: cover;
              background-position: center;
            "></div>

            <!-- Active Indicator -->
            ${current.id === wallpaper.id ? `
              <div class="active-indicator" style="
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: var(--accent-blue);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            ` : ''}

            <!-- Name Overlay -->
            <div class="wallpaper-name" style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 12px;
              background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
              color: white;
              font-size: 13px;
              font-weight: 500;
            ">
              ${wallpaper.name}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  // Initialize interactions
  initWallpaperWindowInteractions()
}

function initWallpaperWindowInteractions() {
  // Wallpaper selection
  document.querySelectorAll('.wallpaper-item').forEach(item => {
    item.addEventListener('click', () => {
      const wallpaperId = item.dataset.wallpaperId

      // Set wallpaper
      const success = setWallpaper(wallpaperId)

      if (success) {
        // Update UI
        document.querySelectorAll('.wallpaper-item').forEach(i => {
          i.classList.remove('active')
          i.style.borderColor = 'var(--border-color)'
        })

        item.classList.add('active')
        item.style.borderColor = 'var(--accent-blue)'

        // Show toast
        showToast('Wallpaper changed successfully!', 'success')
      }
    })
  })

  // Category filtering
  document.querySelectorAll('.category-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category

      // Update active button
      document.querySelectorAll('.category-filter').forEach(b => {
        b.classList.remove('active')
        b.style.background = 'rgba(255, 255, 255, 0.05)'
        b.style.color = 'var(--text-secondary)'
      })

      btn.classList.add('active')
      btn.style.background = 'var(--accent-blue)'
      btn.style.color = 'white'

      // Filter wallpapers
      document.querySelectorAll('.wallpaper-item').forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = 'block'
        } else {
          item.style.display = 'none'
        }
      })
    })
  })

  // Hover effects
  document.querySelectorAll('.wallpaper-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (!item.classList.contains('active')) {
        item.style.borderColor = 'rgba(59, 130, 246, 0.5)'
        item.style.transform = 'scale(1.02)'
      }
    })

    item.addEventListener('mouseleave', () => {
      if (!item.classList.contains('active')) {
        item.style.borderColor = 'var(--border-color)'
        item.style.transform = 'scale(1)'
      }
    })
  })
}

function showToast(message, type = 'success') {
  // Use existing toast system from OpportunitiesWindow
  // (Implementation matches OpportunitiesWindow toast)
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6'
  }

  toast.style.cssText = `
    background: rgba(24, 24, 27, 0.95);
    border: 1px solid ${colors[type]};
    border-radius: 12px;
    padding: 14px 18px;
    color: white;
    font-size: 14px;
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `

  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}
```

#### 3.2 Quick Wallpaper Picker (Settings Menu)
**Location**: Add to Settings Window
```javascript
// Quick picker in settings panel
<div class="settings-section">
  <h3>Desktop Wallpaper</h3>
  <div class="wallpaper-quick-picker">
    <!-- 3-5 most popular wallpapers -->
    <!-- "More wallpapers" button opens full window -->
  </div>
</div>
```

---

### Phase 4: Integration
**Goal**: Wire up wallpaper system to existing app

#### 4.1 Modify MainApp.js
**File**: `app/src/components/MainApp.js`

**Changes**:
1. Import wallpaper service
2. Initialize wallpaper on app load
3. Add wallpaper window to window list (optional)

```javascript
// Add to imports
import { initWallpaper } from '../services/wallpaper.js'

// In renderMainApp() function, after initAnimationSystem()
export async function renderMainApp(container, user) {
  // ... existing code ...

  // Initialize animation system
  initAnimationSystem()

  // Initialize wallpaper system (NEW)
  initWallpaper()

  // ... rest of existing code ...
}
```

#### 4.2 Add to Settings Window
**File**: `app/src/components/windows/PlaceholderWindows.js` (or create SettingsWindow.js)

Add wallpaper picker section to settings.

#### 4.3 Optional: Add Wallpaper Window to Dock
If you want a dedicated wallpaper picker window:

**In MainApp.js**:
```javascript
// Add to window definitions
{
  id: 'wallpaper',
  title: 'Wallpaper',
  icon: '🖼️',
  width: 800,
  height: 600,
  top: 100,
  left: 200
}

// Add to dock
<div class="dock-icon" data-window="wallpaper" title="Change Wallpaper">
  <svg><!-- wallpaper icon --></svg>
  <span class="dock-label">Wallpaper</span>
</div>

// Add to renderWindowContent
case 'wallpaper':
  renderWallpaperWindow(contentContainer)
  break
```

---

### Phase 5: Styling
**Goal**: Add CSS for wallpaper components

#### 5.1 CSS Additions
**File**: `app/src/style.css`

```css
/* ============================================================================
   WALLPAPER SYSTEM
   ============================================================================ */

/* Wallpaper Window */
.wallpaper-window {
  background: var(--bg-primary);
}

.wallpaper-grid {
  padding-bottom: 20px;
}

.wallpaper-item {
  will-change: transform, border-color;
}

.wallpaper-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.wallpaper-item.active {
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.category-filter.active {
  background: var(--accent-blue) !important;
  color: white !important;
  border-color: var(--accent-blue) !important;
}

.category-filter:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  transform: translateY(-1px);
}

/* Wallpaper Preview Animation */
@keyframes wallpaperFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.wallpaper-item {
  animation: wallpaperFadeIn 0.3s ease;
}

/* Desktop Background Transition */
body.desktop-mode {
  transition: background-image 0.5s ease-in-out;
}
```

---

## 📊 Implementation Checklist

### Phase 1: Setup (30 minutes)
- [ ] Create `/app/public/wallpapers/` folder structure
- [ ] Create `/app/public/wallpapers/thumbnails/` folder
- [ ] Create `/app/public/wallpapers/full/` folder
- [ ] Add sample wallpaper images (or use CSS gradients)
- [ ] Create `app/src/config/wallpapers.js` with wallpaper data
- [ ] Test wallpaper data structure

### Phase 2: Service Layer (45 minutes)
- [ ] Create `app/src/services/wallpaper.js`
- [ ] Implement `getCurrentWallpaper()`
- [ ] Implement `setWallpaper()`
- [ ] Implement `applyWallpaper()`
- [ ] Implement `initWallpaper()`
- [ ] Test localStorage persistence
- [ ] Test wallpaper application to DOM

### Phase 3: UI Components (90 minutes)
- [ ] Create `app/src/components/windows/WallpaperWindow.js`
- [ ] Implement wallpaper grid rendering
- [ ] Implement category filtering
- [ ] Implement wallpaper selection
- [ ] Add hover effects
- [ ] Add active state indicators
- [ ] Test UI interactions
- [ ] Add toast notifications

### Phase 4: Integration (30 minutes)
- [ ] Import wallpaper service in `MainApp.js`
- [ ] Call `initWallpaper()` on app load
- [ ] Add wallpaper window to window definitions (optional)
- [ ] Add dock icon for wallpaper window (optional)
- [ ] Add wallpaper section to settings window (optional)
- [ ] Test integration with existing features

### Phase 5: Styling (30 minutes)
- [ ] Add wallpaper window CSS
- [ ] Add hover effects CSS
- [ ] Add transition effects
- [ ] Test responsive design
- [ ] Test on different screen sizes

### Phase 6: Testing (45 minutes)
- [ ] Test wallpaper switching
- [ ] Test localStorage persistence (refresh page)
- [ ] Test category filtering
- [ ] Test with all window operations (minimize, maximize, close)
- [ ] Test with existing features (windows, dock, etc.)
- [ ] Test on different browsers
- [ ] Test performance (no lag when switching)

### Phase 7: Documentation (30 minutes)
- [ ] Add wallpaper system to README
- [ ] Document how to add new wallpapers
- [ ] Document wallpaper data structure
- [ ] Create sample wallpaper templates

---

## 🔒 Safety Measures

### 1. No Breaking Changes
✅ **Preserve existing desktop background as default**
- Default wallpaper uses current CSS gradients
- No changes to existing CSS if wallpaper not set
- Graceful fallback to default

✅ **Don't modify existing components**
- Only add new files
- Only add calls to `initWallpaper()`
- Existing desktop/dock/windows untouched

✅ **Backward compatibility**
- If localStorage empty, use default
- If wallpaper not found, use default
- If error occurs, fall back to CSS gradient

### 2. Performance
✅ **Optimize images**
- Use WebP format for images
- Compress to < 500KB per wallpaper
- Lazy load thumbnails
- Use CSS gradients where possible (no HTTP request)

✅ **Minimize DOM operations**
- Only update `background-image` style
- No layout thrashing
- Use CSS transitions (GPU-accelerated)

### 3. User Experience
✅ **Instant feedback**
- Wallpaper applies immediately
- Toast notification confirms change
- Active state updates instantly

✅ **Smooth transitions**
- 0.5s fade between wallpapers
- No jarring flashes
- Respect `prefers-reduced-motion`

---

## 🎨 Sample Wallpapers

### Gradient Wallpapers (No Files Needed)
1. **Stanford Gradient (Default)** - Current radial gradients
2. **Ocean Blue** - Linear gradient blue
3. **Purple Dream** - Linear gradient purple
4. **Dark Matter** - Dark gradient
5. **Sunset** - Orange/pink gradient
6. **Forest** - Green gradient

### Image Wallpapers (Optional)
1. **Abstract Waves** - Dark abstract pattern
2. **Light Abstract** - Light abstract pattern
3. **Geometric** - Geometric shapes
4. **Minimal** - Minimal design

---

## 🚀 Deployment Strategy

### Step 1: Create wallpaper system (no UI)
- Add service layer
- Test with browser console: `setWallpaper('gradient-blue')`
- Verify localStorage works
- Verify wallpaper applies

### Step 2: Add UI in Settings
- Add quick picker to settings window
- Test with 3-5 wallpapers
- Get user feedback

### Step 3: Add full wallpaper window (optional)
- Create dedicated wallpaper picker window
- Add to dock
- Add all wallpapers

### Step 4: Add custom wallpapers (future)
- Allow users to upload images
- Store in Supabase storage
- Per-user wallpaper library

---

## 📝 Future Enhancements

### Phase 2 Features
- [ ] Custom wallpaper upload
- [ ] Wallpaper collections/packs
- [ ] Time-based wallpaper rotation
- [ ] Blur/transparency adjustments
- [ ] Parallax effect on window drag
- [ ] Per-workspace wallpapers

### Advanced Features
- [ ] AI-generated wallpapers
- [ ] Community wallpaper sharing
- [ ] Wallpaper marketplace
- [ ] Dynamic wallpapers (video/animated)
- [ ] Seasonal wallpapers
- [ ] Stanford-themed wallpaper packs

---

## ⏱️ Estimated Timeline

**Total Time**: 4-5 hours

- Phase 1 (Setup): 30 minutes
- Phase 2 (Service): 45 minutes
- Phase 3 (UI): 90 minutes
- Phase 4 (Integration): 30 minutes
- Phase 5 (Styling): 30 minutes
- Phase 6 (Testing): 45 minutes
- Phase 7 (Documentation): 30 minutes

**Minimal Implementation** (just gradients, no images): 2-3 hours
**Full Implementation** (with images and dedicated window): 4-5 hours

---

## ✅ Success Criteria

1. ✅ Users can switch between multiple wallpapers
2. ✅ Wallpaper choice persists across sessions (localStorage)
3. ✅ No breaking changes to existing features
4. ✅ Smooth transitions between wallpapers
5. ✅ Works on all screen sizes
6. ✅ Performance impact < 50ms
7. ✅ Accessible (keyboard navigation, reduced motion)
8. ✅ Documentation complete

---

**Ready to proceed with implementation?**

This plan provides a complete, safe, and extensible wallpaper system while preserving all existing features. We can start with Phase 1 (minimal gradients-only implementation) or go for the full implementation with images and dedicated UI.
