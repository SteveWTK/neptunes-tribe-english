/**
 * App Cloning Script
 *
 * Automates the process of cloning Habitat to create a new branded app
 * Usage: node scripts/clone-app.js <app-name>
 * Example: node scripts/clone-app.js startupnation
 */

const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

// ==================================================
// APP CONFIGURATIONS
// ==================================================
// Add new apps here with their branding configuration

const APPS = {
  startupnation: {
    appName: "StartupNation",
    directory: "startupnation-2026",
    description: "An interactive conversational journey through the world of business.",

    branding: {
      appName: "StartupNation",
      appTagline: "An interactive conversational journey through the world of business.",
      appDescription:
        "Master business English through real startup stories, tech innovation, and entrepreneurial challenges.",
      domain: "https://startupnation-english.com",

      colors: {
        primary: {
          50: "#eef2ff"
          100: "#e0e7ff"
          200: "#c7d2fe"
          300: "#a5b4fc"
          400: "#818cf8"
          500: "#6366f1", // Indigo - tech/innovation
          600: "#4f46e5",
          700: "#4338ca"
          800: "#3730a3"
          900: "#312e81"
          950: "#1e1b4b"
        },
        accent: {
          50: "#fffbeb"
          100: "#fef3c7"
          200: "#fde68a"
          300: "#fcd34d"
          400: "#fbbf24"
          500: "#f59e0b", // Amber - energy/growth
          600: "#d97706",
          700: "#b45309"
          800: "#92400e"
          900: "#78350f"
          950: "#451a03"
        },
      },

      terminology: {
        mainUnit: "Case Study",
        world: "Industry",
        adventure: "Topic",
        lesson: "Business Challenge",
        hero: "Founder Story",
        achievement: "Milestone",
        community: "Network",
        journey: "Growth Path",
        map: "Innovation Map",
      },

      worldsStructure: {
        // Replace ecosystems with business industries
        type: "industries",
        items: [
          {
            id: "technology",
            name: "Technology & Innovation",
            slug: "technology",
            color: "#6366f1",
            topics: [
              "AI & Machine Learning",
              "SaaS Platforms",
              "Mobile Apps",
              "Cloud Computing",
            ],
          },
          {
            id: "ecommerce",
            name: "E-Commerce & Retail",
            slug: "ecommerce",
            color: "#ec4899",
            topics: [
              "Direct-to-Consumer",
              "Marketplaces",
              "Subscription Models",
              "Social Commerce",
            ],
          },
          {
            id: "fintech",
            name: "FinTech & Banking",
            slug: "fintech",
            color: "#10b981",
            topics: [
              "Digital Payments",
              "Cryptocurrency",
              "Lending Platforms",
              "InsurTech",
            ],
          },
          {
            id: "health",
            name: "HealthTech & Wellness",
            slug: "health",
            color: "#f59e0b",
            topics: [
              "Telemedicine",
              "Fitness Tech",
              "Mental Health",
              "MedTech",
            ],
          },
          {
            id: "sustainability",
            name: "Sustainability & Impact",
            slug: "sustainability",
            color: "#22c55e",
            topics: [
              "Clean Energy",
              "Circular Economy",
              "AgriTech",
              "Social Enterprise",
            ],
          },
        ],
      },
    },
  },

  fieldtalk: {
    appName: "FieldTalk",
    directory: "fieldtalk-english",
    description: "Learn English Through Sports",

    branding: {
      appName: "FieldTalk",
      appTagline: "English for Sports Fans & Athletes",
      appDescription:
        "Master English through the exciting world of sports, from football to F1, basketball to boxing.",
      domain: "https://fieldtalk-english.com",

      colors: {
        primary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#475569", // Sophisticated slate
          600: "#334155",
          700: "#1e293b",
          800: "#0f172a",
          900: "#020617",
        },
        accent: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264",
          400: "#a3e635", // Electric lime
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#365314",
          900: "#1a2e05",
        },
        fieldtalk: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        growth: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        attention: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },

      terminology: {
        mainUnit: "Training Drill",
        world: "Sport",
        adventure: "League",
        lesson: "Match Day",
        hero: "Sports Legend",
        achievement: "Trophy",
        community: "Team",
        journey: "Season",
        map: "Stadium Map",
      },
    },
  },

  inspiremindful: {
    appName: "InspireMindful",
    directory: "inspire-mindful",
    description: "Guided meditations and reflections in English and Portuguese",

    branding: {
      appName: "InspireMindful",
      appTagline: "Guided meditations and reflections",
      appDescription: "Cultivate mindfulness and calm",
      domain: "https://inspiremindful.com",

      colors: {
        primary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#475569", // Sophisticated slate
          600: "#334155",
          700: "#1e293b",
          800: "#0f172a",
          900: "#020617",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        inspire: {
          500: "#F9B45C",
          600: "#EC6726",
        },
        gentle: {
          500: "#9D9D9C",
        },
        secondary: {
          500: "#6366f1", // Indigo - tech/innovation
          600: "#4f46e5",
        },
        growth: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },

      terminology: {
        mainUnit: "Guided Meditation",
        world: "World",
        adventure: "Retreat",
        lesson: "Reflection",
        hero: "Guide",
        achievement: "Achievement",
        community: "Community",
        journey: "Growth Path",
        map: "Inner Map",
      },

      // worldsStructure: {
      //   // Replace ecosystems with business industries
      //   type: "wisdom",
      //   items: [
      //     {
      //       id: "technology",
      //       name: "Technology & Innovation",
      //       slug: "technology",
      //       color: "#6366f1",
      //       topics: [
      //         "AI & Machine Learning",
      //         "SaaS Platforms",
      //         "Mobile Apps",
      //         "Cloud Computing",
      //       ],
      //     },
      //     {
      //       id: "ecommerce",
      //       name: "E-Commerce & Retail",
      //       slug: "ecommerce",
      //       color: "#ec4899",
      //       topics: [
      //         "Direct-to-Consumer",
      //         "Marketplaces",
      //         "Subscription Models",
      //         "Social Commerce",
      //       ],
      //     },
      //     {
      //       id: "fintech",
      //       name: "FinTech & Banking",
      //       slug: "fintech",
      //       color: "#10b981",
      //       topics: [
      //         "Digital Payments",
      //         "Cryptocurrency",
      //         "Lending Platforms",
      //         "InsurTech",
      //       ],
      //     },
      //     {
      //       id: "health",
      //       name: "HealthTech & Wellness",
      //       slug: "health",
      //       color: "#f59e0b",
      //       topics: [
      //         "Telemedicine",
      //         "Fitness Tech",
      //         "Mental Health",
      //         "MedTech",
      //       ],
      //     },
      //     {
      //       id: "sustainability",
      //       name: "Sustainability & Impact",
      //       slug: "sustainability",
      //       color: "#22c55e",
      //       topics: [
      //         "Clean Energy",
      //         "Circular Economy",
      //         "AgriTech",
      //         "Social Enterprise",
      //       ],
      //     },
      //   ],
      // },
    },
  },

  // Add more app configurations here
};

// ==================================================
// HELPER FUNCTIONS
// ==================================================

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
  };
  const reset = "\x1b[0m";
  console.log(`${colors[type]}${message}${reset}`);
}

function updateFileContent(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    log(`⚠️  File not found: ${filePath}`, "warning");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  replacements.forEach(({ find, replace }) => {
    if (typeof find === "string") {
      content = content.replace(new RegExp(find, "g"), replace);
    } else {
      content = content.replace(find, replace);
    }
  });

  fs.writeFileSync(filePath, content, "utf8");
}

// ==================================================
// MAIN CLONING FUNCTION
// ==================================================

async function cloneApp(appKey) {
  const config = APPS[appKey];
  if (!config) {
    log(
      `❌ App "${appKey}" not found. Available apps: ${Object.keys(APPS).join(
        ", "
      )}`,
      "error"
    );
    process.exit(1);
  }

  const sourcePath = process.cwd();
  const targetPath = path.join(path.dirname(sourcePath), config.directory);

  log("========================================", "info");
  log(`🚀 Cloning Habitat to ${config.appName}...`, "info");
  log("========================================", "info");

  // Step 1: Copy project structure
  log("\n📁 Step 1: Copying project files...", "info");
  try {
    await fs.copy(sourcePath, targetPath, {
      filter: (src) => {
        const shouldExclude =
          src.includes("node_modules") ||
          src.includes(".next") ||
          src.includes(".git") ||
          src.includes(".env.local") ||
          src.includes("supabase-schema-export-guide.md") ||
          src.includes("web-app-cloning-guide.md") ||
          src.includes("PROJECT_STATUS.md");
        return !shouldExclude;
      },
    });
    log("✅ Files copied successfully", "success");
  } catch (error) {
    log(`❌ Error copying files: ${error.message}`, "error");
    process.exit(1);
  }

  // Step 2: Update package.json
  log("\n📦 Step 2: Updating package.json...", "info");
  const packageJsonPath = path.join(targetPath, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.name = config.directory;
  packageJson.description = config.description;
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  log("✅ package.json updated", "success");

  // Step 3: Create brand config
  log("\n🎨 Step 3: Creating brand configuration...", "info");
  const brandConfigPath = path.join(targetPath, "src/config/brand.config.js");
  const brandConfigTemplate = await fs.readFile(brandConfigPath, "utf8");

  // Create custom brand config with replacements
  let newBrandConfig = brandConfigTemplate;

  // Replace basic values
  newBrandConfig = newBrandConfig.replace(
    /appName: "Habitat"/g,
    `appName: "${config.branding.appName}"`
  );
  newBrandConfig = newBrandConfig.replace(
    /appTagline: ".*?"/,
    `appTagline: "${config.branding.appTagline}"`
  );
  newBrandConfig = newBrandConfig.replace(
    /appDescription: ".*?"/,
    `appDescription: "${config.branding.appDescription}"`
  );

  await fs.writeFile(brandConfigPath, newBrandConfig, "utf8");
  log("✅ Brand configuration created", "success");

  // Step 4: Set up environment template
  log("\n🔐 Step 4: Setting up environment file...", "info");
  await fs.copy(
    path.join(targetPath, ".env.template"),
    path.join(targetPath, ".env.local")
  );
  updateFileContent(path.join(targetPath, ".env.local"), [
    { find: "Your App Name", replace: config.branding.appName },
  ]);
  log("✅ .env.local created (fill in your credentials!)", "success");

  // Step 5: Update Tailwind colors
  log("\n🎨 Step 5: Updating Tailwind colors...", "info");
  const tailwindPath = path.join(targetPath, "tailwind.config.mjs");
  updateFileContent(tailwindPath, [
    { find: /#5E82A6/g, replace: config.branding.colors.primary[500] },
    { find: /#4C6B8A/g, replace: config.branding.colors.primary[600] },
    { find: /#C69963/g, replace: config.branding.colors.accent[500] },
    { find: /#B78343/g, replace: config.branding.colors.accent[600] },
  ]);
  log("✅ Tailwind colors updated", "success");

  // Step 6: Create worlds/industries config if needed
  if (config.branding.worldsStructure) {
    log("\n🌍 Step 6: Creating content structure config...", "info");
    // This would create a new worldsConfig or industriesConfig
    // For now, we'll leave the existing worldsConfig and note it needs manual update
    log(
      "⚠️  worldsConfig.js needs manual customization for your content",
      "warning"
    );
  }

  // Step 7: Initialize git
  log("\n📝 Step 7: Initializing git repository...", "info");
  try {
    process.chdir(targetPath);
    execSync("git init", { stdio: "ignore" });
    execSync("git add .", { stdio: "ignore" });
    execSync(`git commit -m "Initial commit for ${config.appName}"`, {
      stdio: "ignore",
    });
    log("✅ Git repository initialized", "success");
  } catch (error) {
    log("⚠️  Git initialization failed (may already exist)", "warning");
  }

  // Step 8: Create checklist file
  log("\n📋 Step 8: Creating customization checklist...", "info");
  const checklistContent = `
# ${config.appName} Customization Checklist

## Completed Automatically ✅
- [x] Project files copied
- [x] package.json updated
- [x] Brand configuration created
- [x] .env.local template created
- [x] Tailwind colors updated
- [x] Git repository initialized

## Manual Steps Required 🔧

### 1. Branding & Assets
- [ ] Replace logo files in /public/logos/
- [ ] Update favicon in /public/
- [ ] Add brand-specific images to /public/
- [ ] Review and customize src/config/brand.config.js

### 2. Content Structure
- [ ] Customize src/data/worldsConfig.js (or create industriesConfig.js)
- [ ] Update terminology throughout the app
- [ ] Modify hero section content
- [ ] Update footer links and copy

### 3. Supabase Setup
- [ ] Create new Supabase project at https://supabase.com
- [ ] Run supabase-template-schema.sql in SQL Editor
- [ ] Create app-specific extension tables
- [ ] Update .env.local with Supabase credentials
- [ ] Set up Row Level Security policies
- [ ] Add initial content to units/lessons tables

### 4. Authentication
- [ ] Create Google OAuth app at https://console.cloud.google.com/
- [ ] Add OAuth credentials to .env.local
- [ ] Generate NextAuth secret: openssl rand -base64 32
- [ ] Update NEXTAUTH_URL in .env.local

### 5. Payments (Stripe)
- [ ] Create Stripe account
- [ ] Create subscription products in Stripe Dashboard
- [ ] Create price tiers (monthly/yearly)
- [ ] Add Stripe credentials to .env.local
- [ ] Update pricing page with correct price IDs
- [ ] Set up webhook endpoint

### 6. Content Creation
- [ ] Import or create initial units
- [ ] Create lessons for first adventure/topic
- [ ] Set up weekly themes
- [ ] Add gap-fill questions
- [ ] Upload images to Supabase Storage

### 7. Testing
- [ ] npm install
- [ ] npm run dev
- [ ] Test user registration & login
- [ ] Test unit completion flow
- [ ] Test lesson flow
- [ ] Test payment flow (use Stripe test mode)
- [ ] Test on mobile devices
- [ ] Test dark mode

### 8. Deployment
- [ ] Create Vercel project
- [ ] Connect Git repository
- [ ] Add all environment variables in Vercel
- [ ] Deploy to production
- [ ] Set up custom domain
- [ ] Update NEXTAUTH_URL to production URL
- [ ] Switch Stripe to live mode
- [ ] Test production build thoroughly

## App-Specific Notes

${
  config.branding.worldsStructure
    ? `
### Content Structure for ${config.appName}
This app uses "${config.branding.worldsStructure.type}" instead of "worlds".

Industries/Topics:
${config.branding.worldsStructure.items
  ?.map((item) => `- ${item.name} (${item.topics?.join(", ")})`)
  .join("\n")}

You'll need to:
1. Create a new config file: src/data/${
        config.branding.worldsStructure.type
      }Config.js
2. Update references from worldsConfig to ${
        config.branding.worldsStructure.type
      }Config
3. Adapt the map component or remove it
`
    : ""
}

## Resources
- Habitat Documentation: [Link to docs]
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- NextAuth Docs: https://next-auth.js.org/

## Need Help?
If you encounter issues during setup, refer to:
- web-app-cloning-guide.md in the original Habitat project
- PROJECT_STATUS.md for recent development context
`;

  await fs.writeFile(
    path.join(targetPath, "SETUP-CHECKLIST.md"),
    checklistContent.trim(),
    "utf8"
  );
  log("✅ Customization checklist created", "success");

  // Final summary
  log("\n========================================", "success");
  log(`✨ ${config.appName} cloned successfully!`, "success");
  log("========================================", "success");
  log("\n📝 Next steps:", "info");
  log(`   1. cd ${config.directory}`, "info");
  log(`   2. Open SETUP-CHECKLIST.md and follow the steps`, "info");
  log(`   3. Fill in .env.local with your credentials`, "info");
  log(`   4. Create Supabase project and run schema`, "info");
  log(`   5. npm install`, "info");
  log(`   6. npm run dev`, "info");
  log(
    "\n💡 Tip: Complete the checklist items in order for best results!\n",
    "warning"
  );
}

// ==================================================
// RUN SCRIPT
// ==================================================

const appToClone = process.argv[2];

if (!appToClone) {
  log("❌ Please specify an app to clone", "error");
  log(`Usage: node scripts/clone-app.js <app-name>`, "info");
  log(`Available apps: ${Object.keys(APPS).join(", ")}`, "info");
  process.exit(1);
}

cloneApp(appToClone.toLowerCase()).catch((error) => {
  log(`❌ Cloning failed: ${error.message}`, "error");
  console.error(error);
  process.exit(1);
});
