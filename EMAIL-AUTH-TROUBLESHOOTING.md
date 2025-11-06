# Email Authentication Troubleshooting Guide

## 🔴 Current Issues

1. **Registration**: "Please check your email" message appears, but no email is sent
2. **Login**: Users get stuck on login page (can't sign in with existing accounts)
3. **Users in Supabase**: Show up in Authentication table but are not confirmed

## 🕵️ Root Causes Identified

### Issue 1: Email Provider Configuration
**Problem**: Supabase is not configured to actually SEND emails through Resend

**Why**: Supabase has its own built-in email service by default. To use Resend (or any SMTP provider), you need to configure it in Supabase settings.

**Current behavior**:
- Your code generates confirmation links
- But Supabase isn't configured to send them via Resend
- So the emails never leave Supabase

### Issue 2: Domain Mismatch
**Problem**: Neptune's Tribe domain in Resend, but using habitatenglish.com in production

**Why**: Email providers require domain verification. Emails "from" a domain that doesn't match the verified domain will be rejected.

## 🔧 Complete Fix Strategy

### Step 1: Check Supabase Email Configuration

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Authentication**
2. Scroll to **SMTP Settings** section
3. Check if it says:
   - ❌ "Using Supabase's built-in email service" (THIS IS THE PROBLEM)
   - ✅ "Using custom SMTP server" (This is what you want)

### Step 2: Configure Supabase to Use Resend

**In Supabase Dashboard** → **Settings** → **Authentication** → **SMTP Settings**:

Enable Custom SMTP and use these settings for **Resend**:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: [Your Resend API Key]
Sender Email: noreply@habitatenglish.com (or support@habitatenglish.com)
Sender Name: Habitat English
Enable TLS: Yes
```

**IMPORTANT**: The Sender Email MUST match a domain verified in Resend!

### Step 3: Domain & Email Migration Strategy

You have two options:

#### Option A: Keep Using Neptune's Tribe Domain Temporarily (Quick Fix)
- Don't change anything in Resend yet
- Set Sender Email in Supabase to: `support@neptunes-tribe.com`
- This will work immediately since the domain is already verified
- Migrate to habitatenglish.com when ready

#### Option B: Migrate to Habitat Domain Now (Recommended)

**YES, you can safely:**
- Delete Neptune's Tribe domain from Resend
- Add habitatenglish.com domain to Resend
- You won't lose anything (just domain verification records)

## 📧 Zoho Email Setup for habitatenglish.com

### Option 1: Add New Domain to Existing Zoho Account (Recommended)

**Zoho Free Plan allows 1 domain**, so you need to:

1. **Remove Neptune's Tribe domain** (if you're done with it)
   - Log in to Zoho Mail
   - Go to Control Panel → Domains
   - Remove neptunes-tribe.com

2. **Add Habitat domain**
   - Control Panel → Domains → Add Domain
   - Enter: habitatenglish.com
   - Follow verification steps (add TXT records to DNS)

3. **Create email addresses**
   - support@habitatenglish.com
   - noreply@habitatenglish.com
   - info@habitatenglish.com (optional)

### Option 2: Keep Both Domains (Requires Paid Plan)

If you want both neptunes-tribe.com and habitatenglish.com emails:
- Upgrade to Zoho Mail Standard ($1/user/month)
- This allows multiple domains

### Quick Zoho Setup Steps:

1. **Add Domain to Zoho**
   - Go to https://www.zoho.com/mail/
   - Control Panel → Add Domain → habitatenglish.com

2. **Verify Domain Ownership**
   - Add TXT record to your DNS provider (where you bought habitatenglish.com)
   ```
   Type: TXT
   Name: @
   Value: [Zoho provides this - looks like: zoho-verification=abcd1234]
   ```

3. **Configure MX Records** (for receiving emails)
   ```
   Priority 10: mx.zoho.com
   Priority 20: mx2.zoho.com
   Priority 50: mx3.zoho.com
   ```

4. **Configure SPF Record** (for sending emails)
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:zoho.com ~all
   ```

5. **Configure DKIM** (for email authentication)
   - Zoho provides a DKIM record
   - Add as TXT record to DNS

6. **Create Email Accounts**
   - Control Panel → Users → Add User
   - Create: support@habitatenglish.com
   - Create: noreply@habitatenglish.com

## 🎯 Recommended Action Plan

### Phase 1: Quick Fix to Get Auth Working NOW

1. **Configure Supabase SMTP** (Step 2 above)
   - Use your existing Resend API key
   - Set sender to: `support@neptunes-tribe.com` (already verified)
   - Test registration → Should receive email!

2. **Verify Supabase Redirect URLs**
   - In Supabase → Authentication → URL Configuration
   - Make sure these are added:
   ```
   https://habitatenglish.com/**
   https://neptunes-tribe.com/**
   http://localhost:3000/**
   ```

3. **Test Everything**
   - Try registering a new account
   - Check email arrival
   - Click confirmation link
   - Try logging in
   - Try password reset

### Phase 2: Migrate to Habitat Domain (Do After Testing)

1. **Set up Zoho for habitatenglish.com**
   - Add domain to Zoho
   - Verify domain
   - Configure DNS records (MX, SPF, DKIM)
   - Create support@habitatenglish.com

2. **Add Domain to Resend**
   - Remove neptunes-tribe.com from Resend (if no longer needed)
   - Add habitatenglish.com to Resend
   - Verify domain in Resend (add DNS records they provide)

3. **Update Supabase SMTP Settings**
   - Change Sender Email to: `support@habitatenglish.com`

4. **Update Vercel Environment Variables**
   - Already done in previous migration!

## 🐛 Troubleshooting Specific Issues

### "No email received" after registration

**Check these in order:**

1. **Supabase SMTP configured?**
   - Settings → Authentication → SMTP Settings
   - Should show custom SMTP, not built-in

2. **Resend API key valid?**
   - Test at: https://resend.com/api-keys
   - Make sure it hasn't expired

3. **Sender domain verified?**
   - Check Resend dashboard
   - Domain should show green checkmark

4. **Check spam folder**
   - Sometimes first emails go to spam

5. **Check Supabase email logs**
   - Supabase Dashboard → Logs
   - Look for email sending errors

### "Stuck on login page" with existing accounts

**Problem**: Users are unconfirmed

**Solution**:

1. Go to Supabase → Authentication → Users
2. Find the user
3. Click on them → **Confirm email** button
4. Or delete and have them re-register (once email is working)

### Why `generateLink()` doesn't send emails

The code in [actions.js:58-65](src/lib/actions.js#L58-L65) generates a confirmation link but **doesn't send it**:

```javascript
const { data: linkData, error: linkError } =
  await getSupabaseAdmin().auth.admin.generateLink({
    type: "signup",
    email: email,
  });
```

This just creates the link - you'd need to send it manually via Resend.

**Better approach**: Let Supabase handle email sending by configuring SMTP properly. Then use:
```javascript
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectUrl,
  },
});
```

This will automatically trigger Supabase to send the confirmation email via your configured SMTP.

## 🔄 Alternative: Switch to a Different Email Provider

If Resend is limiting (1 domain on free tier), consider:

### SendGrid
- **Free tier**: 100 emails/day forever
- Multiple domains allowed
- Easy setup with Supabase
- SMTP: smtp.sendgrid.net

### Mailgun
- **Free tier**: 5,000 emails/month for 3 months
- Multiple domains allowed
- SMTP: smtp.mailgun.org

### Amazon SES
- **Free tier**: 62,000 emails/month (first year)
- Then $0.10 per 1,000 emails
- More technical setup
- Very reliable

## 📝 Code Changes Needed (Optional)

If you want to simplify your registration flow, I can update [src/lib/actions.js](src/lib/actions.js) to:

1. Use `signUp()` instead of `admin.createUser()` + `generateLink()`
2. Let Supabase automatically send confirmation emails
3. Cleaner code, fewer potential issues

Let me know if you want me to make these changes!

## ✅ Quick Checklist

- [ ] Configure Supabase SMTP with Resend API key
- [ ] Set sender email to verified domain (neptunes-tribe.com temporarily)
- [ ] Verify Supabase redirect URLs include habitatenglish.com
- [ ] Test registration → Email should arrive
- [ ] Manually confirm existing users OR have them re-register
- [ ] Set up Zoho for habitatenglish.com (when ready to migrate)
- [ ] Add habitatenglish.com to Resend (when Zoho is ready)
- [ ] Switch Supabase sender to support@habitatenglish.com
- [ ] Celebrate! 🎉

---

## 🆘 Still Not Working?

If you've followed all steps and still have issues, check:

1. **Vercel logs** for any errors during registration
2. **Supabase logs** → Look for "email" or "auth" errors
3. **Resend dashboard** → Activity log to see if emails were attempted
4. **Browser console** → Check for any client-side errors

Let me know at which step you're getting stuck!
