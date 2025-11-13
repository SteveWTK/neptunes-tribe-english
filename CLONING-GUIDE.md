# Complete Guide: Cloning Habitat for New Apps

## Overview

This guide walks you through cloning the Habitat codebase to create new English learning apps with different themes (StartupNation, FieldTalk, etc.). The process is designed to be efficient and repeatable.

**Time Estimate:**

- Automated cloning: 5 minutes
- Manual customization: 4-8 hours
- Content creation: Ongoing

---

## Part 1: Understanding the System

### What Gets Cloned (Stays the Same)

✅ **Core Functionality**

- User authentication (NextAuth + Supabase)
- Progress tracking system
- Subscription/payment integration (Stripe)
- Lesson rendering engine
- Unit completion flow
- Gap-fill exercise logic
- Word Snake game
- Translation system
- Admin CMS

✅ **Technical Infrastructure**

- Next.js 15 app structure
- Supabase integration
- Tailwind CSS setup
- Component library
- API routes
- Database schema structure

### What Gets Customized (Changes Per App)

🎨 **Branding**

- Logo and visual identity
- Color scheme
- Typography
- Images and icons
- Copy and messaging

📚 **Content Structure**

- Worlds → Industries/Sports/Topics
- Adventures → Sub-categories
- Terminology (e.g., "Tribe" → "Network")
- Hero profiles (Conservation Heroes → Founders)

💾 **Database Content**

- Units (different subject matter)
- Lessons (different scenarios)
- Weekly themes (different topics)
- Custom extension tables (app-specific data)

---

## Part 2: Before You Clone - Preparation

### 1. Habitat Cleanup (One-Time Setup)

Before cloning, ensure Habitat is in good shape:

```bash
# In Habitat directory
cd c:\Developer\INSPIRE\neptunes-tribe-english

# Make sure all changes are committed
git status
git add .
git commit -m "Prepare Habitat for cloning"

# Install dependencies to ensure everything works
npm install
npm run dev  # Test that it runs
```

### 2. Gather Brand Assets for New App

Create a folder with:

- Logo files (SVG preferred, also PNG)
  - Main logo (light and dark versions)
  - Square logo for mobile
  - Favicon (512x512px)
- Color palette (primary, accent, success, warning)
- Font choices (Google Fonts recommended)
- Hero images for landing page
- Sample content (5-10 units to start)

### 3. Set Up New Accounts

**Required:**

- [ ] Supabase account → Create new project
- [ ] Google Cloud → New OAuth app
- [ ] OpenSSL → Generate NextAuth secret

**For Production:**

- [ ] Stripe account → Set up products
- [ ] Domain name (optional, can use Vercel subdomain)
- [ ] Vercel account for deployment

---

## Part 3: Automated Cloning

### Step 1: Run the Clone Script

```bash
# In Habitat directory
cd c:\Developer\INSPIRE\neptunes-tribe-english

# Clone to StartupNation
node scripts/clone-app.js startupnation

# OR clone to FieldTalk
node scripts/clone-app.js fieldtalk

# OR add your own app to scripts/clone-app.js first
```

### Step 2: Verify Clone

```bash
# Navigate to new project
cd ..\startupnation-english

# Check structure
ls

# You should see:
# - src/
# - public/
# - package.json
# - .env.local (needs filling)
# - SETUP-CHECKLIST.md (your roadmap!)
```

### What the Script Does Automatically

✅ Copies all source code (excludes node_modules, .next, .git)
✅ Updates package.json with new app name
✅ Creates brand.config.js with basic customizations
✅ Creates .env.local from template
✅ Updates Tailwind colors to new brand
✅ Initializes new git repository
✅ Creates SETUP-CHECKLIST.md for next steps

---

## Part 4: Manual Customization

Open `SETUP-CHECKLIST.md` in your new project and follow it. Here's a summary:

### Phase 1: Branding (1-2 hours)

#### 1.1 Replace Logos

```bash
# In new project directory (e.g., startupnation-english)
cd public/logos

# Remove Habitat logos
rm -rf *

# Add your logos:
# - main-logo-light.png
# - main-logo-dark.png
# - square-logo.png
# - favicon.png
```

#### 1.2 Update Brand Config

Edit `src/config/brand.config.js`:

```javascript
export const brandConfig = {
  appName: "StartupNation", // ✏️ Update
  appTagline: "...", // ✏️ Update

  logo: {
    main: "/logos/main-logo-light.png", // ✏️ Update paths
    // ... update all logo paths
  },

  colors: {
    // Already updated by script, but verify
  },

  terminology: {
    world: "Industry", // ✏️ Customize
    adventure: "Topic", // ✏️ Customize
    mainUnit: "Case Study", // ✏️ Customize
    // ... update all terms
  },

  features: {
    // Enable/disable features
    ngoSupport: false, // ✏️ Habitat-specific
    impactTracking: false, // ✏️ Habitat-specific
  },
};
```

#### 1.3 Create Content Structure Config

Create `src/data/industriesConfig.js` (or similar):

```javascript
// For StartupNation - Industries instead of Worlds
export const INDUSTRIES = {
  technology: {
    id: "technology",
    name: "Technology & Innovation",
    slug: "technology",
    color: { primary: "#6366f1" },
    topics: [
      {
        id: "ai_ml",
        name: "AI & Machine Learning",
        themeTag: "ai",
      },
      // ... more topics
    ],
  },
  // ... more industries
};
```

**OR** keep using `worldsConfig.js` and just modify the content:

- Change region names
- Update adventure names and theme tags
- Modify colors and icons

#### 1.4 Update Visual Assets

```bash
# Replace images in public/
# - Landing page hero
# - Background images
# - Icons and badges
# - Team photos (if applicable)
```

### Phase 2: Supabase Setup (30-60 minutes)

#### 2.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and region
4. Set database password (save it!)
5. Wait for project to initialize (~2 minutes)

#### 2.2 Run Template Schema

1. In Supabase dashboard → SQL Editor
2. Copy contents of `supabase-template-schema.sql`
3. Paste and run
4. Verify tables created: Go to Table Editor

#### 2.3 Add App-Specific Tables

For StartupNation, also run:

```sql
-- founder_stories table
CREATE TABLE founder_stories (
  id SERIAL PRIMARY KEY,
  founder_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  bio TEXT,
  image_url TEXT,
  unit_id INTEGER REFERENCES units(id)
);

-- business_terms table
CREATE TABLE business_terms (
  id SERIAL PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  category TEXT,
  examples TEXT[]
);

-- Add more tables from STARTUPNATION-CONFIG.md
```

#### 2.4 Set Up Storage Buckets

1. In Supabase → Storage
2. Create bucket: `unit-images` (public)
3. Upload sample images
4. Note the URLs for testing

#### 2.5 Update Environment Variables

Edit `.env.local`:

```bash
# Get these from Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Phase 3: Authentication Setup (20 minutes)

#### 3.1 Generate NextAuth Secret

```bash
# In terminal (Git Bash on Windows, or PowerShell)
openssl rand -base64 32

# Copy the output
```

#### 3.2 Set Up Google OAuth

1. Go to https://console.cloud.google.com/
2. Create new project (e.g., "StartupNation")
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google` (for production)
6. Copy Client ID and Secret

#### 3.3 Update .env.local

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret

GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Phase 4: Content Creation (2-4 hours initial)

#### 4.1 Create Sample Units

In Supabase → Table Editor → units table:

Add 5-10 units with:

- Title (e.g., "The Lean Startup Method")
- Description
- Content text with gaps marked as [1], [2], etc.
- Theme tag (matches your config)
- Difficulty level
- Image URL (from Storage)

#### 4.2 Create Gap-Fill Questions

In gap_fill_questions table:

For each unit, add questions for each gap:

- text_id (unit ID)
- gap_number (1, 2, 3...)
- correct_answer
- options (array of 4 choices)

#### 4.3 Create Sample Lessons

Use the CMS at `/admin/lessons/new`:

1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/admin/lessons/new
3. Create a lesson with mixed step types:
   - unit_reference steps
   - word_snake steps
   - Future: video, quiz, etc.

#### 4.4 Test Content Flow

1. Navigate to worlds/industries page
2. Click on an adventure/topic
3. Verify units and lessons appear
4. Complete a unit → check progress tracking
5. Complete a lesson → verify completion

### Phase 5: Stripe Setup (Optional, 30 minutes)

#### 5.1 Create Stripe Account

1. Go to https://stripe.com
2. Sign up
3. Complete verification (for live mode)
4. Start in Test Mode for development

#### 5.2 Create Products

In Stripe Dashboard → Products:

1. **Premium Subscription**

   - Name: "Premium"
   - Recurring: Monthly & Yearly prices
   - Amount: e.g., $19.99/month, $199/year
   - Copy Price IDs

2. **Enterprise Subscription**
   - Name: "Enterprise"
   - Recurring: Monthly & Yearly prices
   - Amount: Custom
   - Copy Price IDs

#### 5.3 Update .env.local

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

STRIPE_USD_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_USD_PREMIUM_YEARLY_PRICE_ID=price_...
# ... etc
```

### Phase 6: Testing (1-2 hours)

#### 6.1 Install & Run

```bash
npm install
npm run dev
```

Navigate to http://localhost:3000

#### 6.2 Test Checklist

- [ ] Home page loads with correct branding
- [ ] Logo displays correctly (light/dark mode)
- [ ] Colors match brand
- [ ] Can register new account
- [ ] Can log in with Google
- [ ] Worlds/Industries page shows correct structure
- [ ] Can click into adventure/topic
- [ ] Units display correctly
- [ ] Can complete a unit
- [ ] Progress tracking updates
- [ ] Can start a lesson
- [ ] All lesson step types work
- [ ] Can complete a lesson
- [ ] Admin CMS accessible
- [ ] Can create new unit in CMS
- [ ] Can create new lesson in CMS

#### 6.3 Mobile Testing

- Test on actual mobile device or browser DevTools
- Verify swipe controls work in Word Snake
- Check responsive layout
- Test navigation and menus

---

## Part 5: Deployment

### Vercel Deployment (Recommended)

#### 5.1 Push to GitHub

```bash
# In your new project
git remote add origin https://github.com/yourusername/startupnation-english.git
git branch -M main
git push -u origin main
```

#### 5.2 Deploy to Vercel

1. Go to https://vercel.com
2. Import Git Repository
3. Select your new repo
4. Add environment variables (copy from .env.local)
5. Deploy

#### 5.3 Post-Deployment

1. Get deployment URL
2. Update Google OAuth authorized URIs
3. Update NEXTAUTH_URL in Vercel env vars
4. Update NEXT_PUBLIC_BASE_URL
5. Redeploy

### Custom Domain (Optional)

1. In Vercel → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate

---

## Part 6: Ongoing Maintenance

### Updating Multiple Apps

When you improve Habitat (fix bugs, add features):

#### Option 1: Manual Update

1. Note the changes you made in Habitat
2. Apply same changes to cloned apps
3. Test each app

#### Option 2: Git Patches

```bash
# In Habitat
git diff > improvements.patch

# In StartupNation
git apply ../neptunes-tribe-english/improvements.patch
```

#### Option 3: Shared Components (Advanced)

Consider creating a monorepo:

```
english-learning-apps/
├── packages/
│   ├── shared-ui/
│   ├── shared-auth/
│   └── shared-db/
├── apps/
│   ├── habitat/
│   ├── startupnation/
│   └── fieldtalk/
```

### Content Updates

Each app maintains its own:

- Supabase database (separate content)
- Image assets
- Brand configuration
- Custom features

Share:

- Core components
- UI patterns
- Bug fixes
- Feature improvements

---

## Part 7: Quick Reference

### Clone New App Checklist

1. [ ] Run: `node scripts/clone-app.js <app-name>`
2. [ ] Update logos in `/public/logos/`
3. [ ] Edit `src/config/brand.config.js`
4. [ ] Create Supabase project & run schema
5. [ ] Set up Google OAuth
6. [ ] Update `.env.local`
7. [ ] Create sample content
8. [ ] `npm install && npm run dev`
9. [ ] Test all functionality
10. [ ] Deploy to Vercel
11. [ ] Update production env vars

### Key Files to Customize

```
your-new-app/
├── src/
│   ├── config/
│   │   └── brand.config.js          ← Main customization
│   ├── data/
│   │   └── worldsConfig.js          ← Content structure
│   └── app/
│       └── (site)/
│           └── layout.js            ← Fonts, metadata
├── public/
│   ├── logos/                       ← All logos
│   └── ...                          ← Images, assets
├── tailwind.config.mjs              ← Colors (auto-updated)
└── .env.local                       ← All secrets
```

### Common Issues & Solutions

**Issue:** "Supabase connection failed"
**Solution:** Check NEXT_PUBLIC_SUPABASE_URL and keys in .env.local

**Issue:** "Google OAuth not working"
**Solution:** Verify redirect URI includes exact callback URL

**Issue:** "Images not loading"
**Solution:** Add Supabase hostname to next.config.js remotePatterns

**Issue:** "Stripe webhook errors"
**Solution:** Set up webhook endpoint in Stripe Dashboard

**Issue:** "Can't create units in CMS"
**Solution:** Check RLS policies in Supabase, ensure service role key is set

---

## Part 8: Resources

### Documentation

- [Habitat PROJECT_STATUS.md](./PROJECT_STATUS.md) - Recent development context
- [StartupNation CONFIG](./STARTUPNATION-CONFIG.md) - Detailed brand config
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)

### Tools

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)

### Design Resources

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Google Fonts](https://fonts.google.com/)
- [Lucide Icons](https://lucide.dev/) (used in the app)
- [Heroicons](https://heroicons.com/)

---

## Success! 🎉

You now have a fully functional clone of Habitat, customized for your new brand!

**Next Steps:**

1. Create more content (units, lessons, weekly themes)
2. Build marketing pages
3. Set up analytics (Google Analytics, etc.)
4. Launch beta with test users
5. Gather feedback and iterate
6. Scale content creation
7. Launch publicly!

**Questions or Issues?**
Refer to the original cloning guide in the Habitat project, or check the detailed config files for your specific app.

Happy building! 🚀
