# Glossary Feature - Bug Fixes

## Issues Fixed

### 1. Memory Match Save Error ✅

**Error:**
```
ReferenceError: setSaveError is not defined
```

**Location:** `src/components/exercises/MemoryMatch.js`

**Cause:** The `handleSaveToPersonalList` function was calling `setSaveError()` but the state variable was never declared.

**Fix:**
Added missing state variable on line 97:
```javascript
const [saveError, setSaveError] = useState(null);
```

---

### 2. Glossary Save 500 Error ⚠️

**Error:**
```
POST /api/vocabulary/personal 500 (Internal Server Error)
Error: Failed to add vocabulary
```

**Location:** API endpoint `/api/vocabulary/personal`

**Likely Cause:** The `personal_vocabulary` table doesn't exist or is missing required columns.

**Solution:** Run the database migration to create the table.

---

## Database Setup Required

### Step 1: Create `personal_vocabulary` Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create personal_vocabulary table if it doesn't exist
create table if not exists public.personal_vocabulary (
  id serial not null,
  user_id integer not null,
  english text not null,
  portuguese text not null,
  english_image text null,
  portuguese_image text null,
  lesson_id integer null,
  step_type text null,
  times_practiced integer default 0,
  last_practiced_at timestamp with time zone null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint personal_vocabulary_pkey primary key (id),
  constraint personal_vocabulary_user_id_fkey foreign key (user_id)
    references users (id) on delete cascade
);

-- Create indexes
create index if not exists idx_personal_vocabulary_user_id
  on public.personal_vocabulary (user_id);
create index if not exists idx_personal_vocabulary_english
  on public.personal_vocabulary (lower(english));

-- Prevent duplicate words for same user
create unique index if not exists idx_personal_vocabulary_user_english
  on public.personal_vocabulary (user_id, lower(english));
```

**Or simply run the migration file:**
```bash
# Copy contents of: supabase/migrations/create_personal_vocabulary_table.sql
# Paste into Supabase SQL Editor and run
```

---

## Improved Error Logging

### Enhanced Glossary Save Function

**Location:** `src/components/MultiGapFillExerciseNew.js` (lines 306-344)

**Added:**
- Console logs for debugging:
  - `🔍 Saving glossary word:` - Shows payload being sent
  - `📥 Response status:` - Shows HTTP status code
  - `📥 Response data:` - Shows API response
  - `❌ API Error:` - Shows specific error from API
  - `✅ Word saved successfully` - Confirms success
  - `ℹ️ Word already exists` - Shows duplicate detection

**Improved Error Messages:**
- Now shows `data.details` from API response
- Toast shows actual error message instead of generic message

---

## Testing After Fix

### Test Memory Match:
1. Open Memory Match game
2. Match a pair
3. Click "Save for Practice"
4. Should see success toast
5. No console errors

### Test Glossary Save:
1. Open a unit with glossary terms
2. Click a glossary word
3. Click "Save for Practice"
4. Check console for detailed logs
5. Should see success toast

### Expected Console Output (Success):
```
🔍 Saving glossary word: { english: "ecosystem", portuguese: "ecossistema", ... }
📥 Response status: 200
📥 Response data: { success: true, message: "Word added..." }
✅ Word saved successfully
```

### Expected Console Output (Already Exists):
```
🔍 Saving glossary word: { english: "ecosystem", portuguese: "ecossistema", ... }
📥 Response status: 200
📥 Response data: { success: false, alreadyExists: true }
ℹ️ Word already exists
```

### Expected Console Output (Error):
```
🔍 Saving glossary word: { english: "ecosystem", portuguese: "ecossistema", ... }
📥 Response status: 500
📥 Response data: { error: "Failed to add vocabulary", details: "..." }
❌ API Error: [specific error message]
```

---

## Verification Checklist

After running the migration:

- [ ] `personal_vocabulary` table exists in Supabase
- [ ] Table has all required columns
- [ ] Foreign key to `users` table is set up
- [ ] Indexes are created
- [ ] Unique constraint prevents duplicates
- [ ] Memory Match save works
- [ ] Glossary save works
- [ ] Toast notifications appear
- [ ] No console errors

---

## If Issues Persist

### Check Supabase Logs:
1. Go to Supabase Dashboard
2. Navigate to Logs > Postgres Logs
3. Look for errors around the time of save attempt

### Verify User Table:
Make sure the `users` table exists and has an `id` column (integer):
```sql
SELECT id, email FROM users LIMIT 5;
```

### Test API Directly:
Use browser console or Postman to test the endpoint:
```javascript
fetch('/api/vocabulary/personal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    english: 'test',
    portuguese: 'teste',
    stepType: 'glossary'
  })
}).then(r => r.json()).then(console.log)
```

---

## Files Modified

1. ✅ `src/components/exercises/MemoryMatch.js` - Added missing state variable
2. ✅ `src/components/MultiGapFillExerciseNew.js` - Enhanced error logging
3. ✅ `supabase/migrations/create_personal_vocabulary_table.sql` - NEW migration file

---

**Status:** Partially Fixed
- ✅ Memory Match error resolved
- ⚠️ Glossary save requires database migration
- ✅ Better error logging in place

**Next Step:** Run the database migration to create `personal_vocabulary` table
