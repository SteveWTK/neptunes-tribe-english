# Domain Migration Checklist: neptunes-tribe.com → habitatenglish.com

## ✅ Code Changes (COMPLETED)

All hardcoded domain references have been updated:

- [x] `src/config/brand.config.js` - Updated domain and support email
- [x] `src/lib/actions.js` - Updated getBaseUrl() to use environment variable
- [x] `src/app/(site)/terms/page.js` - Updated contact email and website
- [x] `src/app/(site)/partnerships/page.js` - Updated partnership email (EN & PT)

## 🔧 Vercel Environment Variables (YOU NEED TO DO THIS)

**CRITICAL: You must update these in Vercel Dashboard AND redeploy**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update the following for Production:

```
NEXTAUTH_URL=https://habitatenglish.com
NEXT_PUBLIC_SITE_URL=https://habitatenglish.com
NEXT_PUBLIC_BASE_URL=https://habitatenglish.com
```

3. **IMPORTANT:** After changing, you MUST redeploy your app:
   - Go to Deployments tab
   - Click the three dots on latest deployment
   - Click "Redeploy"
   - OR push a new commit to trigger deployment

**Why this matters:** Vercel caches environment variables. Changes won't take effect until you redeploy!

## 🔐 Google OAuth Configuration (YOU NEED TO VERIFY THIS)

Go to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs

### Authorized JavaScript origins:
```
https://habitatenglish.com
http://localhost:3000
https://neptunes-tribe.com (optional - keep during transition)
```

### Authorized redirect URIs:
```
https://habitatenglish.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
https://neptunes-tribe.com/api/auth/callback/google (optional - keep during transition)
```

**Note:** The error "Access blocked: habitatenglish.com's request is invalid" usually means:
- The domain isn't in Authorized JavaScript origins, OR
- The redirect URI isn't exactly right, OR
- You updated Google settings but Vercel env vars don't match

## 🗄️ Supabase URL Configuration (YOU NEED TO VERIFY THIS)

Go to Supabase Dashboard → Project Settings → Authentication → URL Configuration

### Site URL:
```
https://habitatenglish.com
```

### Redirect URLs (add all of these):
```
https://habitatenglish.com/**
http://localhost:3000/**
https://neptunes-tribe.com/** (optional - keep during transition)
```

**Important:** The `**` wildcard is critical - it allows all paths under that domain.

## 🌐 Domain Transition Strategy

You have two options:

### Option 1: Gradual Transition (Recommended for 2-4 weeks)
- Keep both domains in Google OAuth and Supabase
- Set up DNS redirect: neptunes-tribe.com → habitatenglish.com
- Users with old links will be redirected automatically
- After transition period, remove old domain from configs

### Option 2: Hard Cutoff (Immediate)
- Only configure habitatenglish.com
- Old links won't work
- Users must use new domain
- Simpler but more disruptive

## 🧪 Testing Checklist

After making all changes and redeploying:

- [ ] Test Google login at habitatenglish.com
- [ ] Test email/password login at habitatenglish.com
- [ ] Test password reset flow
- [ ] Test new user registration
- [ ] Check that redirects go to /worlds after login
- [ ] Verify localhost:3000 still works for development

## 🐛 Common Issues & Solutions

### "Access blocked: request is invalid"
**Cause:** Mismatch between Google OAuth config and actual request
**Fix:**
1. Verify habitatenglish.com is in Authorized JavaScript origins
2. Verify exact redirect URI is configured
3. Make sure Vercel env vars match (and you redeployed!)

### Login works on localhost but not production
**Cause:** Vercel environment variables not updated or not redeployed
**Fix:**
1. Check Vercel env vars are set to habitatenglish.com
2. Redeploy the application
3. Clear browser cache and try again

### Still redirecting to neptunes-tribe.com
**Cause:** Old environment variables cached or hardcoded values
**Fix:**
1. Check all env vars in Vercel are updated
2. Redeploy
3. Check for any remaining hardcoded references (use grep)

### Email/password login not working
**Cause:** Supabase redirect URLs not configured
**Fix:**
1. Add `https://habitatenglish.com/**` to Supabase redirect URLs
2. Make sure Site URL is set to `https://habitatenglish.com`

## 📋 Post-Migration Tasks

After everything is working:

- [ ] Update DNS settings if needed
- [ ] Update any external links (social media, marketing materials)
- [ ] Notify users of domain change (if applicable)
- [ ] Monitor error logs for any missed references
- [ ] After 2-4 weeks, consider removing neptunes-tribe.com from OAuth configs
- [ ] Update Google Search Console with new domain
- [ ] Update any analytics tracking to new domain

## 🆘 Still Having Issues?

If you've followed all steps and still have problems:

1. Check browser console for exact error messages
2. Check Vercel deployment logs
3. Verify all three systems match:
   - Google OAuth: habitatenglish.com
   - Supabase: habitatenglish.com
   - Vercel env vars: habitatenglish.com
4. Make sure you redeployed after changing env vars!

## 📝 Files Changed in This Migration

- `src/config/brand.config.js` - Line 18: domain
- `src/config/brand.config.js` - Line 258: support email
- `src/lib/actions.js` - Line 15: getBaseUrl() function
- `src/app/(site)/terms/page.js` - Lines 208, 212: contact info
- `src/app/(site)/partnerships/page.js` - Lines 136, 247: partnership emails

All changes use environment variables where possible, making future domain changes easier!
