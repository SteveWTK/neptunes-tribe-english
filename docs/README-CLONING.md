# 🚀 Habitat Cloning System

> Clone this web app in 30 minutes to create new English learning platforms

## What Is This?

This is a complete system for **cloning the Habitat web app** to create new branded English learning platforms. Everything is automated and documented.

## 📦 What's Included

- ✅ **Automated cloning script** - Copies and configures everything
- ✅ **Brand configuration system** - Easy customization
- ✅ **Database templates** - Ready-to-use Supabase schema
- ✅ **Complete documentation** - Step-by-step guides
- ✅ **Example configurations** - StartupNation, FieldTalk ready to go

## ⚡ Quick Start

### Clone StartupNation (Business English)

```bash
# 1. Run the clone script
npm run clone startupnation

# 2. Navigate to new project
cd ../startupnation-english

# 3. Follow the setup checklist
cat SETUP-CHECKLIST.md

# 4. Install and run
npm install
npm run dev
```

**That's it!** You'll have a working clone in ~30 minutes (plus content customization time).

## 📚 Documentation

| Guide | Purpose | Time |
|-------|---------|------|
| **[QUICK-START-CLONING.md](./QUICK-START-CLONING.md)** | Express 30-min guide | 30 min |
| **[CLONING-GUIDE.md](./CLONING-GUIDE.md)** | Complete walkthrough | 2-3 hours |
| **[CLONING-SYSTEM-SUMMARY.md](./CLONING-SYSTEM-SUMMARY.md)** | System overview | 15 min read |
| **[STARTUPNATION-CONFIG.md](./STARTUPNATION-CONFIG.md)** | Example app config | 30 min read |

## 🎨 Apps Ready to Clone

### 1. StartupNation
**Theme:** Business English for entrepreneurs
**Target:** Startup founders, business professionals
**Command:** `npm run clone startupnation`

### 2. FieldTalk
**Theme:** English through sports
**Target:** Sports fans, athletes, coaches
**Command:** `npm run clone fieldtalk`

### 3. Create Your Own
Edit `scripts/clone-app.js` to add your own app configuration.

## 🛠️ What Gets Cloned

### Automatically Copied & Configured
- ✅ Full Next.js application
- ✅ All components and pages
- ✅ Authentication system (NextAuth + Supabase)
- ✅ Payment integration (Stripe)
- ✅ Progress tracking
- ✅ Admin CMS
- ✅ Lesson system (units, lessons, games)
- ✅ Updated branding (colors, names)
- ✅ Environment template
- ✅ Git repository

### What You Customize
- 🎨 Logos and visual assets
- 🌈 Fine-tune colors
- 📝 Content structure (worlds → industries)
- 💬 Terminology
- 📊 Content (units, lessons)
- 🔐 Credentials (Supabase, OAuth, Stripe)

## ⏱️ Time Investment

| Task | Time |
|------|------|
| Run clone script | 2 min |
| Supabase + Auth setup | 15 min |
| Replace logos | 5 min |
| Test locally | 5 min |
| **Get working app** | **~25 min** |
| Customize content structure | 2-4 hours |
| Create initial content | 4-8 hours |
| Deploy to production | 1 hour |
| **Total to launch** | **8-14 hours** |

Compare to building from scratch: **40+ hours** 🎉

## 📋 Prerequisites

### Required Tools
- Node.js 18+
- Git
- Code editor (VS Code recommended)

### Required Accounts (Free Tiers Available)
- Supabase (database)
- Google Cloud (OAuth)

### Optional (For Production)
- Stripe (payments)
- Vercel (hosting)
- Custom domain

## 🔥 How It Works

```
Habitat (Master)
    ↓
    ↓ npm run clone startupnation
    ↓
New App
  ├── ✅ All source code
  ├── ✅ Updated branding
  ├── ✅ Environment template
  ├── ✅ Setup checklist
  └── ✅ Git repository
```

## 📖 Step-by-Step Process

### 1. Clone
```bash
npm run clone startupnation
```

### 2. Setup Supabase
- Create project at supabase.com
- Run `supabase-template-schema.sql`
- Add credentials to `.env.local`

### 3. Setup Auth
- Create Google OAuth app
- Generate NextAuth secret
- Add credentials to `.env.local`

### 4. Customize
- Replace logos in `/public/logos/`
- Edit `src/config/brand.config.js`
- Adapt `src/data/worldsConfig.js`

### 5. Test
```bash
npm install
npm run dev
```

### 6. Deploy
- Push to GitHub
- Deploy to Vercel
- Add production env vars

## 🎯 What Each App Needs

### Database (Supabase)
- One project per app
- Run template schema
- Add app-specific tables
- Upload content

### Authentication (Google OAuth)
- One OAuth app per app
- Unique client ID/secret
- Correct redirect URIs

### Payments (Stripe)
- One account per app (or shared)
- Unique products/prices
- Webhook endpoints

## 💡 Pro Tips

1. **Start with StartupNation** - Best documented example
2. **Test locally first** - Don't rush to production
3. **Keep Habitat as template** - Don't modify directly
4. **Use test mode** - For Stripe during development
5. **Read QUICK-START first** - Then dive into details

## 🆘 Common Issues

**"Module not found" errors**
→ Run `npm install` in the new project

**"Supabase connection failed"**
→ Check `.env.local` has correct SUPABASE_URL and keys

**"Google OAuth not working"**
→ Verify redirect URI exactly matches OAuth settings

**"Images not loading"**
→ Add Supabase hostname to `next.config.js`

## 📞 Need Help?

1. Check **CLONING-GUIDE.md** for detailed walkthrough
2. See **STARTUPNATION-CONFIG.md** for example
3. Review error messages carefully
4. Verify `.env.local` credentials

## 🌟 Success Criteria

Your clone is ready when:
- ✅ App runs locally without errors
- ✅ Can register/login with Google
- ✅ Logos display correctly
- ✅ Colors match your brand
- ✅ Can view and complete units
- ✅ Progress tracking works
- ✅ Admin CMS accessible

## 🚀 Next Steps After Cloning

1. Create 10-20 units of content
2. Build out lessons
3. Test on mobile devices
4. Deploy to Vercel
5. Set up Stripe products
6. Launch beta with test users
7. Gather feedback
8. Iterate and improve
9. Public launch! 🎉

## 📁 Key Files Reference

```
habitat/
├── scripts/
│   └── clone-app.js              ← Cloning script
├── src/
│   ├── config/
│   │   └── brand.config.js       ← Brand settings
│   └── data/
│       └── worldsConfig.js       ← Content structure
├── supabase-template-schema.sql  ← Database schema
├── .env.template                 ← Environment vars
├── CLONING-GUIDE.md             ← Full guide
├── QUICK-START-CLONING.md       ← Express guide
└── README-CLONING.md            ← This file
```

## 🎓 Learning Path

### First Time Cloner
1. Read this file (5 min)
2. Read QUICK-START-CLONING.md (10 min)
3. Clone StartupNation (30 min)
4. Customize and test (2-4 hours)

### Experienced Cloner
1. Run `npm run clone <appname>`
2. Follow SETUP-CHECKLIST.md
3. Launch in < 1 day

## 📊 System Features

- **Automated:** 80% of setup is automated
- **Independent:** Each app has separate DB, auth, payments
- **Scalable:** Clone unlimited apps
- **Maintainable:** Update Habitat, apply to clones
- **Documented:** Every step explained

---

## Ready to Clone?

```bash
npm run clone startupnation
```

Then open the generated `SETUP-CHECKLIST.md` and follow along!

**Questions?** Read [CLONING-GUIDE.md](./CLONING-GUIDE.md) for complete details.

**Good luck! 🚀**
