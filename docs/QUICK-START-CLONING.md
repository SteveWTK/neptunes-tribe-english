# Quick Start: Clone Habitat in 30 Minutes

This is the express guide to get a cloned app running. For detailed explanations, see [CLONING-GUIDE.md](./CLONING-GUIDE.md).

## Prerequisites (5 minutes)

```bash
# 1. Ensure Habitat is working
cd c:\Developer\INSPIRE\neptunes-tribe-english
npm install
npm run dev  # Test at http://localhost:3000

# 2. Have ready:
# - New app name (e.g., "startupnation")
# - Logo files
# - Color scheme (primary & accent hex codes)
```

## Clone & Setup (25 minutes)

### Step 1: Run Clone Script (2 minutes)

```bash
# In Habitat directory
node scripts/clone-app.js startupnation

# Navigate to new project
cd ..\startupnation-english
```

### Step 2: Supabase Setup (8 minutes)

```bash
# 1. Create project at https://supabase.com/dashboard
# 2. Go to SQL Editor
# 3. Copy/paste supabase-template-schema.sql from Habitat project
# 4. Run it
# 5. Get credentials from Settings → API
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
```

### Step 3: Auth Setup (5 minutes)

```bash
# Generate secret
openssl rand -base64 32
```

Create Google OAuth at https://console.cloud.google.com/:
- Create project
- Enable Google+ API
- Create OAuth 2.0 credentials
- Redirect URI: `http://localhost:3000/api/auth/callback/google`

Edit `.env.local`:
```bash
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 4: Replace Logos (5 minutes)

```bash
# In new project
cd public/logos
# Delete Habitat logos
# Add your logos:
# - main-logo-light.png
# - main-logo-dark.png
# - square-logo.png
# - favicon.png
```

### Step 5: Run & Test (5 minutes)

```bash
npm install
npm run dev
```

Visit http://localhost:3000

✅ Check:
- Logo shows correctly
- Colors match your brand
- Can register/login
- Can view content

## What to Do Next

### Immediate (Same Day)
1. Add 5 sample units to Supabase units table
2. Create gap-fill questions for each unit
3. Test completing a unit
4. Verify progress tracking works

### This Week
1. Customize `src/config/brand.config.js` fully
2. Create `src/data/industriesConfig.js` (or adapt worldsConfig.js)
3. Upload images to Supabase Storage
4. Create 2-3 complete lessons in CMS
5. Set up Stripe products (test mode)

### Next Week
1. Deploy to Vercel
2. Test on mobile devices
3. Create 20+ units of content
4. Design marketing pages
5. Launch beta with friends/colleagues

## Files That Need Customization

### Must Edit
- [ ] `.env.local` - All credentials
- [ ] `public/logos/*` - Your logos
- [ ] `src/config/brand.config.js` - App identity & terminology

### Should Edit
- [ ] `src/data/worldsConfig.js` - Content structure
- [ ] `tailwind.config.mjs` - Fine-tune colors (auto-updated but review)
- [ ] `src/app/(site)/layout.js` - Fonts and metadata

### Optional
- [ ] `next.config.js` - Add your Supabase URL to image domains
- [ ] `package.json` - Update description

## Troubleshooting

**Can't log in?**
→ Check NEXTAUTH_URL and NEXTAUTH_SECRET in .env.local

**Images not loading?**
→ Add Supabase hostname to next.config.js remotePatterns

**Database errors?**
→ Verify Supabase keys in .env.local

**Units not showing?**
→ Check theme_tags match between units and worldsConfig

**CMS not working?**
→ Ensure SUPABASE_SERVICE_ROLE_KEY is set

## Resources

- **Detailed Guide:** [CLONING-GUIDE.md](./CLONING-GUIDE.md)
- **StartupNation Config:** [STARTUPNATION-CONFIG.md](./STARTUPNATION-CONFIG.md)
- **Database Schema:** [supabase-template-schema.sql](./supabase-template-schema.sql)
- **Environment Template:** [.env.template](./.env.template)

## Time Estimates

| Task | Time |
|------|------|
| Run clone script | 2 min |
| Supabase setup | 8 min |
| Auth setup | 5 min |
| Replace logos | 5 min |
| Install & test | 5 min |
| **Total to working app** | **~25 min** |
| | |
| Content customization | 2-4 hours |
| Create initial content | 4-8 hours |
| Deploy to production | 1 hour |
| **Total to launch** | **~1-2 days** |

---

**You're ready!** Run the clone script and follow the steps above. 🚀
