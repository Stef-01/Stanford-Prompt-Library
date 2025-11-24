# Remaining Features To Implement

## Status: Partially Complete

### ✅ Completed Features:
1. **Pseudonym Option** - Users can now choose display name for prompts
2. **Admin Panel Button** - Added to top bar (visible to admins only)
3. **Space Invaders Fixes** - 10 bears in wave 1, progressive difficulty, bears shoot from start, no exit confirmation

### 🔄 Remaining Features:

#### 1. Prompt Library Discovery Mode Improvements
**Location**: `app/src/components/windows/LibraryWindow.js`

**Required Changes**:
- Add small 'X' button at top of featured prompt carousel to exit discovery mode
- Add "Discovery Mode" button/selector with options: "Hot", "Featured", "New"
- Update carousel to filter based on selected mode

**Implementation Notes**:
- Featured carousel starts around line 860 in LibraryWindow.js
- Add close button in carousel header
- Add mode selector buttons before carousel
- Filter prompts based on:
  - Hot: Sort by likes_count DESC
  - Featured: Filter where status='featured'
  - New: Sort by created_at DESC

#### 2. Prompt Card Sizing Fixes
**Location**: `app/src/components/windows/LibraryWindow.js`

**Required Changes**:
- Fix cards to adapt to long text (add text truncation with "...more" button)
- Ensure images scale properly within cards
- Remove weird empty space in grid layout
- Add "Read More" button for long descriptions

**Implementation Notes**:
- Cards render at lines 371-500 (Details View), 503-600 (Image View)
- Add CSS for text truncation: `display: -webkit-box; -webkit-line-clamp: 3;`
- Add "Read More" button that expands or opens modal
- Fix image aspect ratio with `object-fit: cover`

#### 3. Fix Like Feature
**Location**:
- `app/src/components/windows/LibraryWindow.js` (UI)
- `app/src/services/prompts.js` (Service)

**Current Issue**: Like feature is implemented but may not be fully wired up in all views

**Required Changes**:
- Verify like button click handlers in all card views (Details, Image, Carousel)
- Ensure real-time like count updates
- Add visual feedback when liking (heart animation)
- Test with actual database

**Implementation Notes**:
- Like button in modal: lines 946-952
- Like click handler: lines 1009-1018
- Service functions exist: `likePrompt()`, `unlikePrompt()`, `hasLiked()`
- Need to verify event listeners are attached after re-renders

#### 4. Add Member Approval to Admin Panel
**Location**: `app/src/components/AdminPanel.js`

**Required Changes**:
- Add new tab/section for "Pending Members"
- Show list of users where `is_approved_member = false`
- Add "Approve" button for each user
- Update user's `is_approved_member` to true when approved

**Implementation Notes**:
- Admin panel has tabs: Pending, Approved, Rejected, All
- Add new tab: "Members"
- Create service function in `app/src/services/admin.js`:
  ```javascript
  export async function getPendingMembers()
  export async function approveMember(userId)
  ```
- Update RLS policies if needed to allow admin to update user approval status

#### 5. Opportunities Filter Enhancement
**Status**: Already working correctly!

The filter is functional with visual selection. No changes needed.

---

## Implementation Priority:

1. **HIGH**: Fix Like Feature (most user-facing)
2. **HIGH**: Prompt Library Discovery Mode (UX improvement)
3. **MEDIUM**: Prompt Card Sizing (polish)
4. **MEDIUM**: Member Approval (admin feature)

## Database Changes Needed:

None - all existing tables support these features

## Testing Checklist:

- [ ] Pseudonym shows correctly on submitted prompts
- [ ] Admin button only visible to admins
- [ ] Space Invaders has 10 bears in wave 1
- [ ] Bears shoot back from wave 1
- [ ] No exit confirmation in Space Invaders
- [ ] Like button works and updates count
- [ ] Discovery mode selector filters correctly
- [ ] Prompt cards adapt to long text
- [ ] Admin can approve new members
- [ ] All features build without errors

---

**Last Updated**: 2025-11-24
**Commit**: acf322d
