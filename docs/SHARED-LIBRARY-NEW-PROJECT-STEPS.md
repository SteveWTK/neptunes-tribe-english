Step-by-Step Guide: Creating FieldTalk with @inspire/shared
Phase 1: Local Project Setup
1.1 Create the Next.js Project

cd C:\Developer\INSPIRE
npx create-next-app@latest fieldtalk-english
When prompted, select:
TypeScript: No (to match Habitat)
ESLint: Yes
Tailwind CSS: Yes
src/ directory: Yes
App Router: Yes
Import alias: Yes (keep default @/\*)
1.2 Install Dependencies

cd fieldtalk-english
npm install @supabase/supabase-js @supabase/ssr next-auth framer-motion lucide-react sonner canvas-confetti mapbox-gl
npm install --save-dev tailwindcss postcss autoprefixer
1.3 Link the Shared Package

npm install ../inspire-shared
1.4 Configure next.config.js Create/update next.config.js:

const path = require("path");

const nextConfig = {
transpilePackages: ["@inspire/shared"],
images: {
remotePatterns: [
{ protocol: "https", hostname: "**.supabase.co" },
// Add other domains as needed
],
},
webpack: (config) => {
config.resolve.modules = [
path.resolve(__dirname, "node_modules"),
"node_modules",
];
return config;
},
};

module.exports = nextConfig;
1.5 Set Up Tailwind Config Update tailwind.config.js to include shared components and FieldTalk colors:

/** @type {import('tailwindcss').Config} \*/
module.exports = {
content: [
"./src/**/_.{js,ts,jsx,tsx,mdx}",
"../inspire-shared/\*\*/_.{js,ts,jsx,tsx}", // Include shared components
],
darkMode: "class",
theme: {
extend: {
colors: {
// FieldTalk brand colors (agricultural/farm theme)
primary: {
50: "#f0fdf4",
100: "#dcfce7",
200: "#bbf7d0",
300: "#86efac",
400: "#4ade80",
500: "#22c55e", // Main green
600: "#16a34a",
700: "#15803d",
800: "#166534",
900: "#14532d",
950: "#052e16",
},
accent: {
50: "#fffbeb",
100: "#fef3c7",
200: "#fde68a",
300: "#fcd34d",
400: "#fbbf24", // Golden/wheat color
500: "#f59e0b",
600: "#d97706",
700: "#b45309",
800: "#92400e",
900: "#78350f",
},
fieldtalk: {
// Custom FieldTalk-specific colors
earth: "#8B4513",
wheat: "#F5DEB3",
sky: "#87CEEB",
grass: "#228B22",
},
},
},
},
plugins: [],
};
Phase 2: External Tools Setup
2.1 Create Supabase Project
Go to supabase.com → New Project
Name: fieldtalk-english
Choose region (same as Habitat for lower latency)
Save the generated password securely
Wait for project to initialize
2.2 Get Supabase Credentials From your Supabase dashboard:
Go to Settings → API
Copy:
Project URL → NEXT_PUBLIC_SUPABASE_URL
anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
service_role key → SUPABASE_SERVICE_ROLE_KEY (keep secret!)
2.3 Set Up Database Schema In Supabase SQL Editor, run the core tables (you can adapt from Habitat):

-- Users table
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email TEXT UNIQUE NOT NULL,
name TEXT,
avatar_url TEXT,
role TEXT DEFAULT 'user',
user_type TEXT DEFAULT 'individual',
current_level TEXT DEFAULT 'Level 1',
preferred_language TEXT DEFAULT 'en',
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table (game progress)
CREATE TABLE players (
id UUID PRIMARY KEY REFERENCES users(id),
xp INTEGER DEFAULT 0,
level INTEGER DEFAULT 1,
preferred_language TEXT DEFAULT 'en',
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add more tables as needed (lessons, vocabulary, etc.)
2.4 Set Up Authentication In Supabase Dashboard:
Go to Authentication → Providers
Enable Email (with magic link or password)
Optional: Enable Google, GitHub, etc.
Go to Authentication → URL Configuration
Set Site URL: http://localhost:3000 (dev) and your production URL
2.5 Create Environment Files Create .env.local in FieldTalk root:

# Supabase

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (if using)

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-here

# MapBox (if using maps)

NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token

# App Config

NEXT_PUBLIC_APP_NAME=FieldTalk
NEXT_PUBLIC_APP_THEME=fieldtalk
Phase 3: VSCode Setup
3.1 Workspace Configuration Create .vscode/settings.json:

{
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.codeActionsOnSave": {
"source.fixAll.eslint": "explicit"
},
"tailwindCSS.experimental.classRegex": [
["clsx\\(([^)]_)\\)", "(?:'|\"|`)([^']_)(?:'|\"|`)"]
],
"files.associations": {
"\*.js": "javascriptreact"
}
}
3.2 Recommended Extensions
ESLint
Prettier
Tailwind CSS IntelliSense
ES7+ React/Redux/React-Native snippets
3.3 Multi-Root Workspace (Optional but Recommended) Create inspire-apps.code-workspace in C:\Developer\INSPIRE\:

{
"folders": [
{ "path": "neptunes-tribe-english", "name": "Habitat" },
{ "path": "fieldtalk-english", "name": "FieldTalk" },
{ "path": "inspire-shared", "name": "Shared Library" }
],
"settings": {
"files.exclude": {
"**/node_modules": true,
"**/.next": true
}
}
}
Open with: File → Open Workspace from File
Phase 4: Project Structure
Create this folder structure:

fieldtalk-english/
├── src/
│ ├── app/
│ │ ├── (site)/ # Authenticated routes
│ │ │ ├── dashboard/
│ │ │ ├── lesson/
│ │ │ ├── games/
│ │ │ └── layout.js
│ │ ├── (landing)/ # Public routes
│ │ │ ├── page.js # Landing page
│ │ │ └── layout.js
│ │ ├── api/ # API routes
│ │ ├── globals.css
│ │ └── layout.js # Root layout
│ ├── components/ # App-specific components
│ ├── lib/
│ │ ├── supabase/
│ │ │ ├── client.js
│ │ │ └── server.js
│ │ └── contexts/
│ ├── config/ # App-specific config
│ │ └── levelsConfig.js
│ └── hooks/
├── public/
│ ├── images/
│ └── audio/
└── .env.local
Phase 5: Core Files Setup
5.1 Supabase Client (src/lib/supabase/client.js)

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
return createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
}
5.2 Root Layout (src/app/layout.js)

import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
title: "FieldTalk - Learn English for Agriculture",
description: "Master agricultural English vocabulary and communication",
};

export default function RootLayout({ children }) {
return (
<html lang="en">
<body>
{children}
<Toaster position="top-center" richColors />
</body>
</html>
);
}
5.3 Site Layout with Shared Components (src/app/(site)/layout.js)

import { FeedbackWidget } from "@inspire/shared";

export default function SiteLayout({ children }) {
return (
<div className="min-h-screen bg-gray-50 dark:bg-primary-950">
{/_ Your header/navigation here _/}
<main>{children}</main>
<FeedbackWidget
appName="FieldTalk"
lang="en"
apiEndpoint="/api/feedback"
translations={{
          title: "Share Your Feedback",
          placeholder: "How can we improve FieldTalk?",
          submit: "Send Feedback",
          success: "Thanks for your feedback!",
        }}
/>
</div>
);
}
5.4 Example Page Using Shared Components

"use client";
import {
WordSnakeLesson,
MemoryMatchLesson,
Button,
Card,
CardHeader,
CardTitle,
CardContent,
} from "@inspire/shared";

export default function GamesPage() {
const vocabulary = [
{ id: 1, en: "tractor", pt: "trator" },
{ id: 2, en: "harvest", pt: "colheita" },
{ id: 3, en: "irrigation", pt: "irrigação" },
// ... more vocabulary
];

return (
<div className="container mx-auto p-6">
<Card>
<CardHeader>
<CardTitle>Farm Vocabulary Games</CardTitle>
</CardHeader>
<CardContent>
<MemoryMatchLesson
vocabulary={vocabulary}
lessonId="farm-basics"
onComplete={(score) => console.log("Score:", score)}
/>
</CardContent>
</Card>
</div>
);
}
Phase 6: Branding & Theming Checklist
Item Location FieldTalk Customization
Colors tailwind.config.js Agricultural greens, wheat golds
Logo public/images/logo.svg Farm/field themed logo
Favicon public/favicon.ico Matching icon
App Name .env.local NEXT_PUBLIC_APP_NAME=FieldTalk
Metadata src/app/layout.js Title, description, OG images
Fonts globals.css Import custom fonts if needed
Phase 7: Development Workflow
Start Development:

cd C:\Developer\INSPIRE\fieldtalk-english
npm run dev
When Updating Shared Library:
Make changes in inspire-shared/
Changes are picked up automatically (symlinked)
Restart dev server if you add new exports
Build for Production:

npm run build
Quick Reference: Importing from Shared

// Games
import { WordSnakeLesson, MemoryMatchLesson } from "@inspire/shared";

// Maps
import { LocationPicker, ContentPinsMap } from "@inspire/shared";

// UI Components
import {
Button, Card, Badge, Input, Dialog, Progress,
VideoPlayer, AnimatedCounter, GlossaryTooltip
} from "@inspire/shared";

// Lessons
import { VocabularyItem } from "@inspire/shared";

// Feedback
import { FeedbackWidget } from "@inspire/shared";

// Config & Hooks
import { AppConfigProvider, useTheme, themes } from "@inspire/shared";
