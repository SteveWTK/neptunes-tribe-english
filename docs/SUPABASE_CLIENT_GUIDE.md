# Supabase Client System - Neptune's Tribe

## Overview

Neptune's Tribe uses multiple Supabase clients depending on the context. This guide explains when to use each one.

---

## Client Types

### 1. **Browser Client** (Most Common)
**Files:**
- `lib/supabase-browser.js` (original)
- `lib/supabase/client.js` (new, for lesson system)

**When to use:**
- Client components ("use client")
- Browser-side operations
- When Row Level Security (RLS) should apply

**Example:**
```javascript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Query respects RLS policies
const { data } = await supabase
  .from("lessons")
  .select("*")
  .eq("is_active", true);
```

**Key features:**
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Respects RLS policies
- Safe for client-side code
- User authentication tokens included

---

### 2. **Admin Client** (Server-Side Only)
**File:** `lib/supabase-admin.js`

**When to use:**
- Server components
- API routes
- Server actions
- When you need to bypass RLS

**Example:**
```javascript
import supabaseAdmin from "@/lib/supabase-admin";

// Query bypasses RLS - full access
const { data } = await supabaseAdmin
  .from("users")
  .select("*");
```

**Key features:**
- Uses `SUPABASE_SERVICE_ROLE_KEY`
- Bypasses RLS policies
- Full database access
- **NEVER** expose to client

---

### 3. **NextAuth** (Authentication Only)
**File:** `lib/auth.js`

**When to use:**
- User authentication (login, logout)
- Session management
- OAuth flows (Google)

**Example:**
```javascript
import { auth } from "@/lib/auth";

// Get current session
const session = await auth();
console.log(session.user.email);
```

**Key features:**
- Manages JWT sessions
- Handles OAuth providers
- Stores user data in Supabase `users` table

---

## Current File Structure

```
lib/
├── auth.js                    # NextAuth configuration
├── data-service.js            # Legacy queries (uses browser client)
├── supabase-browser.js        # Original browser client
├── supabase-admin.js          # Admin client (service role)
└── supabase/
    ├── client.js              # Browser client (for lesson system)
    ├── queries.js             # Student-facing lesson queries
    └── lesson-queries.js      # Admin lesson CMS queries
```

---

## Which Client Where?

### **ProtectedRoute Component**
```javascript
// components/ProtectedRoute.js
import { createClient } from "@/lib/supabase/client"; // ✅ Browser client

// Checks user role from database
const supabase = createClient();
const { data } = await supabase
  .from("users")
  .select("role")
  .eq("email", user.email)
  .single();
```

**Why browser client?**
- Runs in client component
- RLS ensures users can only read their own data
- Safe to expose to browser

---

### **Admin Lesson Queries**
```javascript
// lib/supabase/lesson-queries.js
import { createClient } from "./client"; // ✅ Browser client

const supabase = createClient();

export async function getAllLessonsForCMS() {
  // RLS policies control access
  const { data } = await supabase.from("lessons").select("*");
  return data;
}
```

**Why browser client?**
- Used by admin pages (client components)
- RLS policies restrict to platform_admin role
- No need for service role if RLS is configured

**Note:** If you want admins to bypass RLS, use admin client instead:
```javascript
import supabaseAdmin from "@/lib/supabase-admin";
```

---

### **Lesson Player**
```javascript
// app/(site)/lesson/[id]/page.js
import { getLessonById } from "@/lib/supabase/queries"; // ✅ Uses browser client

// Student views lesson
const lesson = await getLessonById(lessonId);
```

**Why browser client?**
- Student-facing feature
- RLS ensures only active lessons visible
- Respects user permissions

---

## Row Level Security (RLS) Policies

For the lesson system to work properly, you need RLS policies in Supabase:

### **Lessons Table**

**Students can view active lessons:**
```sql
CREATE POLICY "Students can view active lessons"
ON lessons FOR SELECT
TO authenticated
USING (is_active = true);
```

**Admins can do everything:**
```sql
CREATE POLICY "Platform admins have full access"
ON lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'platform_admin'
  )
);
```

### **Lesson Completions Table**

**Users can view their own completions:**
```sql
CREATE POLICY "Users can view their own completions"
ON lesson_completions FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

**Users can insert their own completions:**
```sql
CREATE POLICY "Users can insert their own completions"
ON lesson_completions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

---

## Common Patterns

### **Client Component with Data Fetching**
```javascript
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MyComponent() {
  const [data, setData] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from("lessons").select("*");
      setData(data);
    }
    loadData();
  }, []);

  return <div>{/* render data */}</div>;
}
```

### **Server Component with Data Fetching**
```javascript
// app/page.js (server component)
import supabaseAdmin from "@/lib/supabase-admin";

export default async function Page() {
  // Runs on server, bypasses RLS
  const { data } = await supabaseAdmin.from("lessons").select("*");

  return <div>{/* render data */}</div>;
}
```

### **API Route with Admin Access**
```javascript
// app/api/lessons/route.js
import supabaseAdmin from "@/lib/supabase-admin";

export async function GET() {
  const { data } = await supabaseAdmin.from("lessons").select("*");
  return Response.json(data);
}
```

---

## Troubleshooting

### "Module not found: @/lib/supabase/client"
**Solution:** File now exists! Clear your Next.js cache:
```bash
rm -rf .next
npm run dev
```

### "Permission denied" errors
**Problem:** RLS policies blocking access

**Solutions:**
1. Check if user has correct role (`platform_admin` for admin routes)
2. Verify RLS policies exist in Supabase dashboard
3. Use admin client if you need to bypass RLS (server-side only)

### "User not authorized"
**Problem:** `ProtectedRoute` can't verify role

**Solutions:**
1. Ensure user's `role` field is set in `users` table
2. Check that email matches exactly
3. Verify `lib/supabase/client.js` is using correct env vars

---

## Environment Variables

Required in `.env.local`:

```bash
# Public (safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Private (server-only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Best Practices

1. **Always use browser client in client components** unless you have a specific reason not to
2. **Never import admin client in client components** - it exposes your service role key
3. **Use RLS policies** to control access rather than checking permissions in code
4. **Keep service role key secret** - only use in API routes and server components
5. **Test with multiple user roles** to ensure RLS policies work correctly

---

## Migration Notes

The lesson system was migrated from FieldTalk, which used:
- `lib/supabase/client.js` for browser client
- `lib/supabase/server.js` for admin client

We've adapted this to Neptune's Tribe's existing pattern:
- `lib/supabase/client.js` now uses `createBrowserClient` from `@supabase/ssr`
- Matches Neptune's Tribe's `lib/supabase-browser.js` approach
- Compatible with existing codebase

---

## Summary

**Use `lib/supabase/client.js` for:**
- ✅ Client components
- ✅ Browser-side queries
- ✅ When RLS should apply
- ✅ Lesson system (player + admin)

**Use `lib/supabase-admin.js` for:**
- ✅ Server components
- ✅ API routes
- ✅ Bypassing RLS
- ✅ Admin operations

**Use `lib/auth.js` for:**
- ✅ Authentication
- ✅ Session management
- ✅ Login/logout

---

Everything is now set up! The `createClient()` error should be resolved. 🎉