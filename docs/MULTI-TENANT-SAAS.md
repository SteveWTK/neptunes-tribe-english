Excellent question! This is a very common challenge in software development. You're essentially managing a multi-tenant SaaS platform with different brands. Here are the best approaches, from simplest to most sophisticated:
Option 1: Manual Migration (Current Approach)
What you're doing now - good for getting started
Process:
Build feature in Habitat
Manually copy files to Startup Nation & FieldTalk
Adapt branding/content
Run database migrations in each Supabase
Pros:
✅ Full control over what gets migrated ✅ No complex setup ✅ Can customize per project easily
Cons:
❌ Time-consuming and error-prone ❌ Features drift out of sync ❌ Bug fixes need to be applied 3 times ❌ Hard to track what's in each project
When to use:
Early stage (where you are now)
Projects are diverging significantly
Small team, infrequent updates

Option 2: Shared Component Library (Recommended for You)
Extract common code into an NPM package
Structure:
habitat-english/ # Main development project
startup-nation/ # Separate Next.js project
fieldtalk/ # Separate Next.js project
@inspire/shared-components/ # NPM package with shared code

What Goes in Shared Package:
@inspire/shared-components/
├── components/
│ ├── activities/ # All activity types
│ ├── games/ # Word Snake, Memory, etc.
│ ├── feedback/ # FeedbackWidget, etc.
│ ├── onboarding/ # Onboarding flows
│ └── ui/ # Buttons, cards, modals
├── lib/
│ ├── utils/ # Helper functions
│ ├── hooks/ # Custom React hooks
│ └── contexts/ # Shared contexts
├── migrations/ # Database migrations
└── package.json

How It Works:

1. Create Shared Package:

# In @inspire/shared-components/package.json

{
"name": "@inspire/shared-components",
"version": "1.0.0",
"main": "index.js",
"peerDependencies": {
"react": "^18.0.0",
"next": "^15.0.0"
}
}

2. Install in Each Project:

# In habitat-english/

npm install ../inspire-shared-components

# Or publish to private NPM registry:

npm install @inspire/shared-components

3. Use in Projects:
   // habitat-english/src/app/activities/page.js
   import { MultipleChoiceActivity } from '@inspire/shared-components/activities';
   import { FeedbackWidget } from '@inspire/shared-components/feedback';

// Customize with props
<MultipleChoiceActivity
theme="ocean" // Habitat's theme
brandName="Habitat English"
/>

// startup-nation/src/app/activities/page.js
import { MultipleChoiceActivity } from '@inspire/shared-components/activities';

<MultipleChoiceActivity
theme="business" // Startup's theme
brandName="Startup Nation"
/>

Workflow:
Develop in Habitat (your main project)
Extract to shared package when feature is stable
Bump version (e.g., 1.0.0 → 1.1.0)
Update package in other projects: npm update @inspire/shared-components
Test in each project
Customize branding/content per project
Pros:
✅ Write once, use everywhere ✅ Bug fixes propagate automatically ✅ Version control (rollback if needed) ✅ Clear separation of shared vs custom code ✅ Each project still fully independent
Cons:
⚠️ Initial setup effort (1-2 days) ⚠️ Need to maintain package versioning ⚠️ Breaking changes affect all projects
Option 3: Monorepo (Best Long-term)
All projects in one Git repository with shared code
Structure:
inspire-platform/
├── packages/
│ ├── shared-components/ # Shared UI components
│ ├── shared-utils/ # Shared utilities
│ ├── shared-db/ # Database schemas & migrations
│ └── shared-config/ # Shared configs
├── apps/
│ ├── habitat-english/ # Next.js app
│ ├── startup-nation/ # Next.js app
│ └── fieldtalk/ # Next.js app
├── package.json # Root package.json
└── pnpm-workspace.yaml # Workspace config

How It Works:
Using Turborepo (recommended):

# Install Turborepo

npx create-turbo@latest

# Structure automatically set up

Root package.json:
{
"name": "inspire-platform",
"private": true,
"workspaces": [
"apps/*",
"packages/*"
],
"scripts": {
"dev": "turbo run dev",
"build": "turbo run build",
"test": "turbo run test"
}
}

Each app imports from packages:
// apps/habitat-english/src/app/page.js
import { MultipleChoiceActivity } from '@inspire/shared-components';
import { useAuth } from '@inspire/shared-utils';

Run all projects at once:

# Start all 3 projects simultaneously

pnpm dev

# Or just one

pnpm dev --filter=habitat-english

Pros:
✅ True single source of truth ✅ Atomic commits (change shared code + all apps together) ✅ Faster development (see changes across all apps instantly) ✅ Better testing (test shared code across all apps) ✅ Shared CI/CD pipeline ✅ TypeScript works seamlessly across packages
Cons:
⚠️ Steeper learning curve ⚠️ Requires restructuring existing projects ⚠️ Git repo gets larger ⚠️ Need Turborepo/NX knowledge
Option 4: Template/Boilerplate + Git Branches
Use Git to manage shared code
Structure:
habitat-english (Git repo)
├── main branch # Habitat-specific
├── shared branch # Generic/shared code
└── feature/\* branches # New features

startup-nation (Separate Git repo)
└── Merges from habitat-english/shared branch

Workflow:
Develop feature in Habitat on feature branch
Merge to main (Habitat-specific)
Cherry-pick generic parts to shared branch
Other projects pull from shared branch
Resolve conflicts with their customizations
Pros:
✅ Uses existing Git skills ✅ No new tools required ✅ Clear history of what was shared
Cons:
❌ Complex merge conflicts ❌ Easy to make mistakes ❌ Hard to track what's shared vs custom ❌ Database migrations tricky
My Recommendation for You
Start with Option 2 (Shared Component Library), migrate to Option 3 (Monorepo) when you're ready.
Phase 1: Immediate (Next 2 weeks)
Create a simple shared package with your most reusable components: Start small:
@inspire/shared/
├── components/
│ ├── activities/
│ │ ├── MultipleChoice.js
│ │ ├── FillInBlanks.js
│ │ └── DragDrop.js
│ ├── games/
│ │ ├── WordSnake.js
│ │ └── MemoryGame.js
│ └── feedback/
│ └── FeedbackWidget.js
├── utils/
│ ├── supabase.js
│ └── scoring.js
└── package.json

Implementation steps:
Create new folder: inspire-shared-components/
Copy your best components there
Make them configurable (accept brand name, theme as props)
Publish locally or to private NPM
Install in all 3 projects
Test thoroughly
Phase 2: Medium-term (1-3 months)
Add more shared code:
All games
All activity types
Onboarding system
Feedback system
Premium code system
Authentication helpers
Phase 3: Long-term (3-6 months)
Convert to Monorepo when:
You have 5+ shared packages
Coordinating versions becomes painful
You want faster development workflow

Handling Database Migrations
Important: Each project has its own Supabase database.
Approach: Migration Templates
Create migration templates in shared package:
@inspire/shared/migrations/
├── 001-beta-tester-codes.sql
├── 002-feedback-system.sql
├── 003-premium-bulk-codes.sql
└── README.md # Instructions for running

Each project runs migrations independently:

# In habitat-english Supabase

Run: @inspire/shared/migrations/003-premium-bulk-codes.sql

# In startup-nation Supabase

Run: @inspire/shared/migrations/003-premium-bulk-codes.sql

# In fieldtalk Supabase

Run: @inspire/shared/migrations/003-premium-bulk-codes.sql

Track migration status:
-- In each database
CREATE TABLE applied_migrations (
id SERIAL PRIMARY KEY,
migration_name TEXT UNIQUE,
applied_at TIMESTAMP DEFAULT NOW()
);

-- After running migration
INSERT INTO applied_migrations (migration_name)
VALUES ('003-premium-bulk-codes');

Handling Branding/Content Differences
Make Components Theme-Aware:
// @inspire/shared/components/Hero.js
export function Hero({ brandName, theme, tagline }) {
const themes = {
ocean: {
gradient: "from-blue-500 to-teal-500",
icon: "🌊",
},
business: {
gradient: "from-purple-500 to-pink-500",
icon: "🚀",
},
agriculture: {
gradient: "from-green-500 to-lime-500",
icon: "🌱",
},
};

const currentTheme = themes[theme];

return (
<div className={`bg-gradient-to-r ${currentTheme.gradient}`}>
<h1>{currentTheme.icon} {brandName}</h1>
<p>{tagline}</p>
</div>
);
}

Usage in each project:
// habitat-english
<Hero 
  brandName="Habitat English"
  theme="ocean"
  tagline="Learn English for Conservation"
/>

// startup-nation
<Hero 
  brandName="Startup Nation"
  theme="business"
  tagline="English for Entrepreneurs"
/>

// fieldtalk
<Hero 
  brandName="FieldTalk"
  theme="agriculture"
  tagline="English for Agriculture Professionals"
/>

Real-World Example: What Others Do
Vercel (Next.js creators)
Monorepo with Turborepo
Shared components across vercel.com, nextjs.org, etc.
Shopify
Shared component library (Polaris)
Used across all Shopify products
Stripe
Monorepo with custom tooling
Shared core, customized per region
WordPress
Template/plugin system
Core is shared, themes/plugins are custom

Action Plan for You
Week 1: Set Up Shared Package

# 1. Create package

mkdir inspire-shared-components
cd inspire-shared-components
npm init -y

# 2. Set up structure

mkdir -p components/activities components/games components/feedback
mkdir -p lib/utils lib/hooks

# 3. Copy your best components

# Start with FeedbackWidget, WordSnake, MultipleChoice

# 4. Make them configurable

# Add brand/theme props

# 5. Install in Habitat

cd ../habitat-english
npm install ../inspire-shared-components

# 6. Test thoroughly

# 7. Install in other projects

cd ../startup-nation
npm install ../inspire-shared-components

Week 2-3: Migrate Existing Features
Priority order:
✅ Feedback system (already done, move to shared)
✅ Beta code system (already done, move to shared)
✅ Games (Word Snake, Memory)
✅ Activities (Multiple Choice, Fill in Blanks)
✅ Onboarding
Month 2: Establish Workflow
Develop in Habitat first (your flagship)
Extract to shared when stable
Version and test
Update other projects
Document changes

Tools to Help
For Shared Package (Option 2):
Changesets: Manage versions automatically
Storybook: Document shared components
Jest: Test shared code
For Monorepo (Option 3):
Turborepo: Build/dev orchestration
Changesets: Version management
pnpm: Fast package manager

Quick Win: Start Today
Extract FeedbackWidget right now:

# 1. Create shared package

mkdir inspire-shared
cd inspire-shared
npm init -y

# 2. Copy FeedbackWidget

mkdir -p components/feedback
cp ../habitat-english/src/components/feedback/FeedbackWidget.js components/feedback/

# 3. Make it generic (accept brandName prop)

# 4. Create index.js

echo "export { FeedbackWidget } from './components/feedback/FeedbackWidget';" > index.js

# 5. Install in Habitat

cd ../habitat-english
npm install ../inspire-shared

# 6. Update import

// Before:
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

// After:
import { FeedbackWidget } from "@inspire/shared";

If it works in Habitat, do the same in Startup Nation!
My Specific Recommendation
Given your situation:
Start with Option 2 (shared package) for the next 3-6 months
Extract these systems first (they're already generic):
Feedback system
Beta/premium code system
Games
Activity templates
Keep developing in Habitat as your main project
Extract to shared when features are stable
Migrate to Monorepo when you have 10+ shared components and the overhead becomes worth it
This gives you immediate benefits without disrupting your current workflow. Would you like me to help you set up the initial shared package structure right now?
