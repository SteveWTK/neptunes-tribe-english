# Complete Guide: Cloning Your Web App for Multiple Niches

## Overview Strategy

You'll create a **"Master Template"** from Habitat that can be cloned and customized for:
- FieldTalk (Sports English)
- Business/Startup English
- Travel English
- Future projects

## Architecture: Two Approaches

### Approach 1: Separate Apps (Recommended for your case)
**Best for:** Different branding, separate user bases, independent scaling

```
habitat/           (Eco English)
fieldtalk/         (Sports English)  
bizventure/        (Business English)
travelwise/        (Travel English)
```

**Pros:**
- Complete independence
- Different domains/subdomains
- Separate databases per niche
- Easy to sell/transfer individual apps
- No cross-contamination of data

**Cons:**
- More deployment overhead
- Duplicate code (mitigated by template approach)

### Approach 2: Multi-tenant Single App
**Best for:** Shared user base, unified platform

```
ecosystem-english/
  ├── apps/
  │   ├── habitat/
  │   ├── fieldtalk/
  │   └── bizventure/
  └── shared/       (shared components/logic)
```

**For your case, I recommend Approach 1** - separate apps with a shared template.

## Step-by-Step Cloning Process

### Phase 1: Create the Master Template

#### Step 1.1: Clean Up Habitat

```bash
# Remove project-specific content
# Keep structure and logic
# Document all customization points
```

**Create a checklist of what's project-specific:**
- [ ] Branding (logo, colors, fonts)
- [ ] Content (units, challenges, news)
- [ ] Domain-specific terminology
- [ ] Theme/niche-specific features
- [ ] Database schema (content tables)

#### Step 1.2: Extract Configuration

Create a `template-config.js` for easy customization:

```javascript
// src/config/brand.config.js
export const brandConfig = {
  // App Identity
  appName: "Habitat",
  appDescription: "Learn English through Environmental Action",
  domain: "habitat-english.com",
  
  // Branding
  logo: {
    light: "/logos/habitat-light.svg",
    dark: "/logos/habitat-dark.svg",
  },
  
  // Theme Colors (Tailwind)
  colors: {
    primary: {
      50: '#f0fdf4',
      500: '#10b981',  // Main green
      900: '#064e3b',
    },
    accent: {
      500: '#3b82f6',  // Blue
    },
  },
  
  // Content Structure
  contentTypes: {
    mainUnit: "Learning Unit",      // "Training Drill" for FieldTalk
    theme: "Ecosystem",             // "Sport" for FieldTalk
    hero: "Environmental Hero",     // "Sports Legend" for FieldTalk
    map: "Eco-Map",                 // "Stadium Map" for FieldTalk
  },
  
  // Features
  features: {
    weeklyTheme: true,
    conversationClasses: true,
    impactTracking: true,
    ngoSupport: true,               // Set to false for non-charity apps
    progressMap: true,
  },
  
  // Tier Names (can customize)
  tiers: {
    free: { name: "Explorer", icon: "🌱" },
    pro: { name: "Pro", icon: "🌟" },
    premium: { name: "Premium", icon: "👑" },
  },
  
  // Copy/Terminology
  terminology: {
    community: "Tribe",             // "Team" for FieldTalk
    journey: "Adventure",           // "Season" for FieldTalk
    achievement: "Impact",          // "Victory" for FieldTalk
  },
};
```

#### Step 1.3: Environment Template

Create `.env.template`:

```bash
# .env.template
# Copy this to .env.local and fill in your values

# App Identity
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI (for assessments)
OPENAI_API_KEY=
```

### Phase 2: Supabase Database Template

#### Step 2.1: Export Schema

```bash
# Export your current Habitat schema
npx supabase db dump --schema public > habitat-schema.sql
```

#### Step 2.2: Create Reusable Schema Template

```sql
-- template-schema.sql
-- Generic schema that works for all niches

-- Users table (same across all apps)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'explorer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units table (flexible for any content)
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_text TEXT,
  gap_fill_text TEXT,
  image TEXT,
  audio TEXT,
  theme TEXT,                    -- "Ecosystem" or "Sport" or "Business Topic"
  region_code TEXT[],            -- Can be regions, stadiums, cities, etc.
  difficulty_level TEXT,
  length INTEGER,
  featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translations table (works for all)
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id),
  language_code TEXT NOT NULL,   -- 'pt', 'es', 'fr'
  translated_text TEXT NOT NULL
);

-- Gap fill questions (universal)
CREATE TABLE gap_fill_questions (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL,
  gap_number INTEGER NOT NULL,
  correct_answer TEXT NOT NULL,
  options TEXT[] NOT NULL,
  part_before TEXT,
  part_after TEXT,
  notes TEXT
);

-- User progress (same logic)
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  completed_exercises INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ
);

-- Completed units tracking
CREATE TABLE completed_units (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  unit_id INTEGER REFERENCES units(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id)
);

-- Weekly themes (flexible naming)
CREATE TABLE weekly_themes (
  id SERIAL PRIMARY KEY,
  theme_title TEXT NOT NULL,
  theme_title_pt TEXT,
  theme_description TEXT,
  theme_description_pt TEXT,
  featured_regions TEXT[],       -- Flexible: can be anything
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Add RLS policies, functions, etc.
```

#### Step 2.3: Content-Specific Extensions

For each niche, add specific tables:

```sql
-- For Habitat: Conservation data
CREATE TABLE conservation_heroes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  region TEXT,
  unit_id INTEGER REFERENCES units(id)
);

-- For FieldTalk: Sports data
CREATE TABLE sports_legends (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  sport TEXT,
  unit_id INTEGER REFERENCES units(id)
);

-- For BizVenture: Startup data
CREATE TABLE startup_stories (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  founder TEXT,
  industry TEXT,
  unit_id INTEGER REFERENCES units(id)
);
```

### Phase 3: Clone Script

Create an automated cloning script:

```javascript
// scripts/clone-app.js
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function cloneApp(config) {
  const { appName, sourcePath, targetPath, branding } = config;
  
  console.log(`🚀 Cloning ${appName}...`);
  
  // 1. Copy entire project structure
  await fs.copy(sourcePath, targetPath, {
    filter: (src) => {
      // Exclude node_modules, .next, .git
      return !src.includes('node_modules') && 
             !src.includes('.next') && 
             !src.includes('.git');
    }
  });
  
  // 2. Update package.json
  const packageJson = await fs.readJson(path.join(targetPath, 'package.json'));
  packageJson.name = appName.toLowerCase();
  await fs.writeJson(path.join(targetPath, 'package.json'), packageJson, { spaces: 2 });
  
  // 3. Create brand config
  const brandConfigPath = path.join(targetPath, 'src/config/brand.config.js');
  const brandConfigContent = `
export const brandConfig = ${JSON.stringify(branding, null, 2)};
  `;
  await fs.writeFile(brandConfigPath, brandConfigContent);
  
  // 4. Copy .env.template to .env.local
  await fs.copy(
    path.join(targetPath, '.env.template'),
    path.join(targetPath, '.env.local')
  );
  
  // 5. Initialize git
  process.chdir(targetPath);
  execSync('git init');
  execSync('git add .');
  execSync(`git commit -m "Initial commit for ${appName}"`);
  
  console.log(`✅ ${appName} cloned successfully!`);
  console.log(`📝 Next steps:`);
  console.log(`   1. cd ${targetPath}`);
  console.log(`   2. Fill in .env.local with your credentials`);
  console.log(`   3. Create Supabase project and run schema`);
  console.log(`   4. npm install`);
  console.log(`   5. npm run dev`);
}

// Usage
const APPS = {
  fieldtalk: {
    appName: 'FieldTalk',
    sourcePath: './habitat-template',
    targetPath: '../fieldtalk',
    branding: {
      appName: 'FieldTalk',
      colors: {
        primary: { 500: '#22c55e' },  // Football green
        accent: { 500: '#eab308' },    // Yellow
      },
      contentTypes: {
        mainUnit: 'Training Drill',
        theme: 'Sport',
        hero: 'Sports Legend',
        map: 'Stadium Map',
      },
    },
  },
  // Add more apps here
};

// Run
const appToClone = process.argv[2];
if (!APPS[appToClone]) {
  console.error(`App "${appToClone}" not found. Available: ${Object.keys(APPS).join(', ')}`);
  process.exit(1);
}

cloneApp(APPS[appToClone]);
```

### Phase 4: Supabase Setup for New App

```bash
# For each new app:

# 1. Create new Supabase project at supabase.com
# 2. Copy connection details to .env.local
# 3. Run schema setup

npx supabase db push --db-url "your-postgres-url" < template-schema.sql

# 4. Add niche-specific tables
npx supabase db push --db-url "your-postgres-url" < fieldtalk-extensions.sql
```

### Phase 5: Customization Checklist

For each new app:

```markdown
## Customization Checklist

### Branding
- [ ] Update `src/config/brand.config.js`
- [ ] Replace logo files in `/public/logos/`
- [ ] Update `tailwind.config.js` colors
- [ ] Update favicon and metadata

### Content
- [ ] Set up Supabase project
- [ ] Run template schema
- [ ] Add niche-specific tables
- [ ] Import initial content

### Configuration
- [ ] Fill in `.env.local`
- [ ] Update `next.config.js` domain
- [ ] Configure Stripe products
- [ ] Set up Google OAuth app

### Testing
- [ ] Test authentication flow
- [ ] Test unit creation/completion
- [ ] Test payment flow
- [ ] Test responsive design
- [ ] Test translations

### Deployment
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Test production build
```

## Maintenance Strategy

### Shared Updates

When you improve core functionality (auth, UI components, etc.):

```bash
# 1. Update habitat-template
cd habitat-template
# Make improvements

# 2. Create patch
git diff > improvements.patch

# 3. Apply to other apps
cd ../fieldtalk
git apply ../habitat-template/improvements.patch

cd ../bizventure
git apply ../habitat-template/improvements.patch
```

### Alternative: Monorepo

For easier shared updates:

```
ecosystem-apps/
├── packages/
│   ├── shared-ui/          # Shared components
│   ├── shared-auth/        # Auth logic
│   └── shared-db/          # DB utilities
├── apps/
│   ├── habitat/
│   ├── fieldtalk/
│   └── bizventure/
└── package.json            # Workspace config
```

## Quick Clone Command

```bash
# Clone script usage
npm run clone-app fieldtalk
npm run clone-app bizventure
npm run clone-app travelwise
```

## Time Estimates

- **Template creation**: 4-6 hours (one-time)
- **Clone new app**: 30 minutes
- **Supabase setup**: 30 minutes
- **Content customization**: 2-4 hours
- **Testing**: 2 hours
- **Total per new app**: ~6-8 hours

Much faster than building from scratch (40+ hours)!