# Admin Panel Quick Start Guide

## ✅ Admin Panel is READY TO USE!

The admin panel is **fully implemented** and ready for approving/rejecting prompts. Follow these steps to get started.

---

## 🚀 Quick Setup (5 minutes)

### 1. Set Yourself as Admin

Run this in Supabase SQL Editor (replace with your email):

```sql
UPDATE users
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

### 2. Verify Setup

```sql
SELECT email, is_admin FROM users WHERE is_admin = TRUE;
```

### 3. Create Test Prompts (Optional)

If you don't have pending prompts, create one:

```sql
INSERT INTO prompts (user_id, title, content, category, status, is_initial_prompt)
SELECT
  id,
  'Test Prompt for Review',
  'This is a test prompt that should appear in the admin panel.',
  'AI Agents',
  'pending',
  TRUE
FROM users
WHERE email = 'your-email@example.com'
LIMIT 1;
```

### 4. Open Admin Panel

1. Log in to the app
2. Look for the **shield icon** (🛡️) in the top-right corner
3. Click it to open the Admin Panel

---

## 🎯 How to Use the Admin Panel

### Viewing Prompts

- **Pending Tab**: Shows prompts awaiting review
- **Approved Tab**: Shows approved prompts
- **Rejected Tab**: Shows rejected prompts
- **All Prompts Tab**: Shows everything

### Approving a Prompt

1. Click the **"Approve"** button on any pending prompt
2. Confirm the action
3. The prompt status changes to "approved"
4. If it's the user's first prompt (`is_initial_prompt = TRUE`), they automatically gain access to the library

### Rejecting a Prompt

1. Click the **"Reject"** button
2. Enter an optional rejection reason
3. The prompt status changes to "rejected"
4. The user does NOT gain library access

### Real-time Feedback

- **Toast Notifications**: Success/error messages appear in bottom-right corner
- **Loading States**: Buttons show "Approving..." or "Rejecting..." while processing
- **Auto-refresh**: Stats and prompt list update automatically after actions

---

## 🔍 Debugging

### Open Browser DevTools (F12)

The enhanced admin panel now includes detailed console logging:

#### What to look for:

```
🟢 handleApprove called with promptId: xxx-xxx-xxx
📤 Calling approvePrompt API...
✅ Prompt approved successfully
🔄 Reloading admin data...
✅ Admin panel refreshed successfully
```

#### Common Console Messages:

| Message | Meaning |
|---------|---------|
| `🔧 Setting up action listeners...` | Event handlers are being attached |
| `✅ Found X approve buttons` | Buttons were rendered correctly |
| `👆 Approve button clicked` | User clicked approve |
| `📤 Calling approvePrompt API...` | Making database request |
| `❌ Approve error:` | Something went wrong |

### If Buttons Don't Work

**Check 1**: Verify buttons exist
```javascript
document.querySelectorAll('.btn-approve').length
// Should return number > 0
```

**Check 2**: Verify admin status
```javascript
// In browser console
const { isAdmin } = await import('./services/admin.js')
await isAdmin()  // Should return true
```

**Check 3**: Look for errors in Console tab
- JavaScript errors?
- Network errors?
- Permission denied errors?

---

## 📊 What's Implemented

### ✅ Backend (app/src/services/admin.js)
- `approvePrompt()` - Updates status to 'approved', sets is_public = true
- `rejectPrompt()` - Updates status to 'rejected', stores reason
- `getPendingPrompts()` - Fetches prompts with status = 'pending'
- `getAllPrompts()` - Fetches all prompts with optional filtering
- `getAdminStats()` - Gets counts for dashboard

### ✅ Database
- `prompts` table has `status` column ('pending', 'approved', 'rejected')
- RLS policies allow admins to view and update all prompts
- Trigger automatically grants member access when initial prompt approved

### ✅ UI (app/src/components/AdminPanel.js)
- Dashboard with live stats
- Filter tabs (Pending, Approved, Rejected, All)
- Prompt cards with full details
- Approve and Reject buttons with event handlers
- Toast notifications for user feedback
- Loading states during API calls
- Enhanced error handling and debugging

### ✅ Integration
- Admin shield icon in top bar (if user is admin)
- Admin dock icon (if user is admin)
- Window management system integration

---

## 🐛 Troubleshooting

### Problem: "No pending prompts" but there are pending prompts in DB

**Solution**: Check RLS policies
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'prompts' AND policyname LIKE '%admin%';
```

If no admin policies exist, run the main schema.sql file again.

### Problem: Buttons don't respond to clicks

**Solution 1**: Check browser console for JavaScript errors

**Solution 2**: Verify event listeners are attached
```javascript
// Should see console logs when admin panel loads:
// "🔧 Setting up action listeners..."
// "✅ Found X approve buttons"
```

**Solution 3**: Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)

### Problem: "Permission denied" error

**Solution**: Verify you're marked as admin in the database
```sql
SELECT id, email, is_admin FROM users WHERE id = auth.uid();
```

If `is_admin` is FALSE, run:
```sql
UPDATE users SET is_admin = TRUE WHERE id = auth.uid();
```

### Problem: Approving prompt doesn't grant user access

**Cause**: The prompt has `is_initial_prompt = FALSE`

**Solution**: Only initial prompts grant library access. Check with:
```sql
SELECT id, title, is_initial_prompt, status FROM prompts WHERE id = 'PROMPT_ID';
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/src/components/AdminPanel.js` | Main admin UI component |
| `app/src/services/admin.js` | Backend API calls |
| `app/database/schema.sql` | Database tables and RLS policies |
| `app/database/ADMIN_SETUP_AND_TEST.sql` | Setup and testing script |
| `ADMIN_PANEL_DIAGNOSTIC.md` | Comprehensive diagnostic guide |

---

## 🎉 You're Ready!

The admin panel should now be fully functional. If you encounter any issues:

1. ✅ Check the browser console for detailed logs
2. ✅ Run the queries in `ADMIN_SETUP_AND_TEST.sql`
3. ✅ Review `ADMIN_PANEL_DIAGNOSTIC.md` for detailed troubleshooting

**The approve and reject buttons ARE working** - they just need proper setup (admin status) and data (pending prompts) to test with!
