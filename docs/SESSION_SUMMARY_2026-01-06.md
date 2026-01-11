# Development Session Summary - January 6, 2026

## Session Overview
**Date**: January 6, 2026
**Project**: Habitat English - Neptune's Tribe
**Focus**: Glossary bug fixes + NGO features planning

---

## Work Completed This Session

### 1. Glossary Feature Bug Fixes ✅

#### Issue 1: Portuguese Translation Showing as Object
**Problem**: When users saved words from glossary tooltips, the vocabulary page displayed:
```
Português: {"pt":"Desmatamento","es":"Deforestación","fr":"Déboisement"}
```

**Solution**: Modified [src/components/TextWithGlossary.js](../src/components/TextWithGlossary.js) to extract only Portuguese translation before saving:
```javascript
const handleSave = async (term, translation) => {
  if (onSaveWord) {
    const portugueseTranslation = typeof translation === 'object'
      ? translation.pt
      : translation;
    await onSaveWord({
      en: term,
      pt: portugueseTranslation,
    });
  }
};
```

**Status**: ✅ FIXED - Portuguese translations now display correctly

---

#### Issue 2: Tooltip Positioning in Modal Context
**Problem**: Glossary tooltips appeared several lines below clicked words when inside UnitModal (lesson flow), but positioned correctly on regular unit pages.

**Root Cause**:
- Tooltip used `fixed` positioning
- UnitModal uses CSS transforms (Framer Motion scale animations)
- CSS spec: transformed elements become containing blocks for fixed descendants
- This broke viewport-relative positioning, adding incorrect scroll offsets

**Solution**: Refactored [src/components/GlossaryTooltip.js](../src/components/GlossaryTooltip.js):
1. Implemented React Portals to render tooltip to `document.body`
2. Removed scroll offset calculations (line 40: `top = triggerRect.bottom + 8`)
3. Used viewport coordinates directly from `getBoundingClientRect()`

**Key Changes**:
```javascript
import { createPortal } from "react-dom";

// Tooltip content as variable
const tooltipContent = isOpen && mounted ? (
  <div className="fixed z-[9999]" style={{ top, left }}>
    {/* tooltip content */}
  </div>
) : null;

// Render with portal to document.body
return (
  <>
    <span ref={triggerRef}>{children}</span>
    {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
  </>
);
```

**Status**: ✅ FIXED - Tooltips now position correctly in both regular pages and modals

---

### 2. NGO Features Research & Planning ✅

Created comprehensive planning document: [docs/NGO_FEATURES_PLANNING.md](../docs/NGO_FEATURES_PLANNING.md)

**Features Researched**:
1. **Location Tagging on Eco-Map**
2. **AI Species Identification from Photos**

**Key Findings**:

#### Location Tagging
**Recommended Solution**:
- Use existing `react-simple-maps` library (already installed)
- Add `Marker` component for observation points
- Integrate **Leaflet.js** (FREE) for location picker UI
- Use browser Geolocation API (FREE, built-in)
- Nominatim for reverse geocoding (FREE)

**Cost**: $0 (all free tools)

#### AI Species Identification
**Recommended Solution**:
- Primary: **OpenAI GPT-4o Vision** (already integrated from FieldTalk)
  - Cost: ~$0.002 per identification
  - Provides educational context automatically
  - Multilingual support
- Validation: **iNaturalist API** (FREE for educational use)
  - 150M+ verified observations
  - Specialized biodiversity accuracy

**Cost**: ~$5/month for 1,000 students (~$0.005 per identification)

**Total Monthly Cost Estimate**:
- 1,000 students: ~$5/month
- 10,000 students: ~$50/month

---

## Files Modified This Session

### Modified Files (3)
1. **[src/components/TextWithGlossary.js](../src/components/TextWithGlossary.js)**
   - Lines 20-32: Extract Portuguese translation from object
   - Prepares for multi-language expansion

2. **[src/components/GlossaryTooltip.js](../src/components/GlossaryTooltip.js)**
   - Line 4: Added `createPortal` import
   - Lines 20-28: Added mounted state tracking
   - Lines 30-60: Fixed positioning calculation (removed scroll offsets)
   - Lines 110-181: Refactored to use portal rendering

3. **[src/app/(site)/vocabulary/page.js](../src/app/(site)/vocabulary/page.js)**
   - Line 352: Added fallback for object-type Portuguese values
   - Handles both old (object) and new (string) data formats

### Created Files (2)
1. **[docs/GLOSSARY_BUG_FIXES_2.md](../docs/GLOSSARY_BUG_FIXES_2.md)**
   - Technical documentation of both bug fixes
   - Testing recommendations
   - Migration notes

2. **[docs/NGO_FEATURES_PLANNING.md](../docs/NGO_FEATURES_PLANNING.md)**
   - Complete technical planning guide
   - Database schemas
   - API specifications
   - Component architecture
   - Cost analysis
   - 4-phase implementation roadmap

---

## Current Project State

### Working Features ✅
- ✅ Glossary tooltips with translation (Portuguese, Spanish, French)
- ✅ Save to personal vocabulary from tooltips
- ✅ Save to personal vocabulary from Memory Match game
- ✅ Vocabulary page displays all saved words correctly
- ✅ Tooltips position correctly in both regular pages and modals
- ✅ OpenAI integration (from FieldTalk project)
- ✅ Supabase database with RLS policies
- ✅ NextAuth authentication
- ✅ Interactive eco-map with `react-simple-maps`

### Database Schema
Current tables relevant to NGO features:
- `users` - User accounts (UUID primary keys)
- `personal_vocabulary` - Saved words (UUID for user_id, lesson_id)
- `glossary` - Eco-terminology with translations
- `units` - Learning units (integer IDs, linked to regions)
- `lessons` - Activity flows
- `completed_units` - Progress tracking

**Note**: Unit IDs are integers, but lesson_id in personal_vocabulary expects UUID. This was causing the "175" error that we fixed by setting `lessonId: null` for glossary saves.

### Tech Stack
- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth
- **AI**: OpenAI API (GPT-4o)
- **Maps**: react-simple-maps (world atlas)
- **Animations**: Framer Motion
- **Storage**: Supabase Storage (images, audio)

---

## NGO Features - Detailed Planning

### Proposed Architecture

#### Database Schema (New Tables Needed)

```sql
-- NGO Organizations
CREATE TABLE ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  contact_email TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NGO Challenges
CREATE TABLE ngo_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  required_observations INTEGER,
  target_species TEXT[],
  target_regions TEXT[],
  points_reward INTEGER,
  badge_icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Observations (Core feature)
CREATE TABLE user_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ngo_challenge_id UUID REFERENCES ngo_challenges(id),

  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  region_code TEXT,

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT NOT NULL,
  observation_date DATE DEFAULT CURRENT_DATE,

  -- AI Identification
  ai_species_primary TEXT,
  ai_species_alternatives JSONB,
  ai_confidence TEXT,
  ai_educational_note TEXT,

  -- User verification
  user_confirmed_species TEXT,
  verified_by_expert BOOLEAN DEFAULT false,
  expert_notes TEXT,

  -- Visibility
  visibility TEXT DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Observation engagement
CREATE TABLE observation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID REFERENCES user_observations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE observation_likes (
  observation_id UUID REFERENCES user_observations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (observation_id, user_id)
);
```

#### API Endpoints to Build

```
Observations:
POST   /api/observations/create
GET    /api/observations/user/:userId
GET    /api/observations/feed
GET    /api/observations/:id
PUT    /api/observations/:id
DELETE /api/observations/:id
POST   /api/observations/:id/like
POST   /api/observations/:id/comment
GET    /api/observations/:id/comments

Species Identification:
POST   /api/species-identification
POST   /api/species-identification/validate

Location Services:
POST   /api/location/geocode
POST   /api/location/reverse-geocode

NGO Challenges:
GET    /api/ngo-challenges/active
GET    /api/ngo-challenges/:id
GET    /api/ngo-challenges/:id/progress
POST   /api/ngo-challenges/:id/submit
GET    /api/ngo-challenges/:id/leaderboard
```

#### Components to Build

```
src/components/
├── observations/
│   ├── ObservationCard.js
│   ├── ObservationFeed.js
│   ├── ObservationMap.js
│   ├── CreateObservation.js
│   ├── LocationPicker.js
│   ├── SpeciesIdentifier.js
│   └── ObservationDetail.js
├── ngo-challenges/
│   ├── ChallengeCard.js
│   ├── ChallengeProgress.js
│   └── ChallengeLeaderboard.js
└── eco-map/
    └── EcoMapWithObservations.js

src/app/(site)/
├── observations/
│   ├── page.js
│   ├── create/page.js
│   └── [id]/page.js
├── ngo-challenges/
│   ├── page.js
│   └── [id]/page.js
└── profile/
    └── observations/page.js
```

### Implementation Phases

#### Phase 1: MVP Observations (2-3 weeks)
**Goal**: Students can upload observations with photos and location

Tasks:
- [ ] Create database migrations (observations tables)
- [ ] Set up Supabase Storage bucket for observation photos
- [ ] Build observation upload form
- [ ] Implement browser geolocation
- [ ] Basic OpenAI species identification
- [ ] Display observations on user profile

**Deliverable**: Students can create and view their own observations

#### Phase 2: Map Integration (1-2 weeks)
**Goal**: Visualize observations on eco-map

Tasks:
- [ ] Install Leaflet: `npm install leaflet react-leaflet`
- [ ] Create LocationPicker component
- [ ] Add Marker support to EcoMapProgressOceanZones
- [ ] Observation detail popups on map
- [ ] Filter observations by species, date, region

**Deliverable**: Interactive map showing all observations

#### Phase 3: NGO Challenges (2-3 weeks)
**Goal**: Structured challenges with NGO partnerships

Tasks:
- [ ] NGO and challenges database tables
- [ ] Admin interface for NGO challenge management
- [ ] Challenge cards on dashboard
- [ ] Submit observations to challenges
- [ ] Progress tracking & points system
- [ ] Leaderboards

**Deliverable**: Students can participate in NGO challenges

#### Phase 4: Community Features (2 weeks)
**Goal**: Social engagement

Tasks:
- [ ] Public observation feed
- [ ] Likes & comments system
- [ ] Featured observations
- [ ] Expert verification workflow
- [ ] Moderation tools

**Deliverable**: Full community observation platform

---

## Technical Details for Implementation

### Location Tagging - Recommended Stack

**Display on Eco-Map**: Use existing `react-simple-maps`
```javascript
import { Marker } from "react-simple-maps";

{observations.map((obs) => (
  <Marker
    key={obs.id}
    coordinates={[obs.longitude, obs.latitude]}
    onClick={() => openObservationDetail(obs)}
  >
    <circle r={6} fill="#22c55e" stroke="#fff" strokeWidth={2} />
  </Marker>
))}
```

**Location Picker**: Use Leaflet.js
```bash
npm install leaflet react-leaflet
```

```javascript
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  return (
    <MapContainer center={[-15.7942, -47.8822]} zoom={4}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}
```

**Auto-detect Location**: Browser Geolocation API
```javascript
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  // Use coordinates
});
```

**Reverse Geocoding**: Nominatim (FREE)
```javascript
const getLocationName = async (lat, lng) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  const data = await response.json();
  return data.display_name; // "São Paulo, Brazil"
};
```

### AI Species Identification - Code Example

**OpenAI Vision API** (you already have the API key):

```javascript
// /api/species-identification/route.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { imageUrl } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Identify this species. Respond in JSON:
            {
              "species_name": "Scientific name (Common name)",
              "confidence": "high/medium/low",
              "family": "Taxonomic family",
              "habitat": "Natural habitat",
              "conservation_status": "IUCN status",
              "fun_fact": "Educational fact",
              "educational_note": "Ecological importance"
            }`
          },
          {
            type: "image_url",
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: 500
  });

  const result = JSON.parse(response.choices[0].message.content);
  return Response.json(result);
}
```

**Enhanced with iNaturalist** (FREE validation):
```javascript
// After OpenAI identification, validate with iNaturalist
const validateWithINaturalist = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(
    'https://api.inaturalist.org/v1/computervision/score_image',
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  return data.results.slice(0, 3); // Top 3 matches
};
```

### Image Upload to Supabase Storage

```javascript
// Upload observation photo
const uploadObservationPhoto = async (file, userId) => {
  const fileName = `${userId}/${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('observations')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('observations')
    .getPublicUrl(fileName);

  return publicUrl;
};
```

---

## Questions Pending User Response

From [docs/NGO_FEATURES_PLANNING.md](../docs/NGO_FEATURES_PLANNING.md), awaiting answers:

### 1. NGO Partnership Scope
- How many NGOs initially?
- Will NGOs manage challenges themselves? (affects admin UI needs)

### 2. Moderation
- Should observations be pre-moderated before public display?
- Teacher review required for school accounts?

### 3. Privacy
- Can students see each other's observations?
- School-only visibility option needed?
- Age-appropriate content filtering?

### 4. Gamification
- Points for observation uploads?
- Badges for species variety, location diversity?
- Link to existing XP system?

### 5. Educational Integration
- Link observations to specific units/lessons?
- Required observations for lesson completion?
- Teacher-assigned observation homework?

**USER IS PREPARING ANSWERS TO THESE + MORE IDEAS**

---

## Environment Setup

### Required Environment Variables
```env
# Already configured
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# Will need for new features
NEXT_PUBLIC_LEAFLET_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
# Optional: Mapbox if choosing that over Leaflet
# NEXT_PUBLIC_MAPBOX_TOKEN=pk...
```

### Package Dependencies to Install

Already installed:
- next
- react
- react-simple-maps
- topojson-client
- supabase
- openai
- framer-motion

**Will need to install**:
```bash
npm install leaflet react-leaflet
```

Optional (if choosing Mapbox):
```bash
npm install mapbox-gl react-map-gl
```

---

## Git Status at Session End

Modified files not yet committed:
```
M  src/app/(site)/lesson/[id]/page.js
M  src/components/GlossaryTooltip.js
M  src/components/MultiGapFillExerciseNew.js
M  src/components/exercises/MemoryMatch.js
M  src/components/layout/HeaderBase.js
?? docs/GLOSSARY_BUG_FIXES.md
?? docs/GLOSSARY_BUG_FIXES_2.md
?? docs/NGO_FEATURES_PLANNING.md
?? docs/SESSION_SUMMARY_2026-01-06.md
?? supabase/migrations/create_personal_vocabulary_table.sql
```

**Recommendation**: Commit the glossary bug fixes before starting NGO feature work:
```bash
git add src/components/TextWithGlossary.js src/components/GlossaryTooltip.js src/app/(site)/vocabulary/page.js docs/GLOSSARY_BUG_FIXES_2.md
git commit -m "Fix glossary tooltip positioning in modals and Portuguese translation display

- Implement React Portal for tooltips to fix positioning in transformed containers
- Extract Portuguese translation from object when saving from glossary
- Add fallback handling for object-type Portuguese values in vocabulary page
- Update positioning calculation to use viewport coordinates directly"
```

---

## How to Resume Work After Restart

### Immediate Next Steps

1. **Read this summary** to get back up to speed
2. **Review user's answers** to the planning questions
3. **Decide on Phase 1 scope** based on user's answers
4. **Create database migration** for observations table
5. **Set up Supabase Storage** bucket for photos
6. **Build MVP**: Simple observation upload form

### Quick Start Commands

```bash
# 1. Install Leaflet (for location picker)
npm install leaflet react-leaflet

# 2. Create Supabase bucket via dashboard or:
# Go to: Supabase Dashboard > Storage > Create new bucket
# Name: "observations"
# Public: true

# 3. Create migration file
# Create: supabase/migrations/[timestamp]_create_observations_tables.sql
# Copy schema from NGO_FEATURES_PLANNING.md

# 4. Run migration (if using Supabase CLI)
supabase db push

# 5. Start building!
```

### Reference Documents

All key information is in these files:
1. **[docs/NGO_FEATURES_PLANNING.md](../docs/NGO_FEATURES_PLANNING.md)** - Complete technical plan
2. **[docs/GLOSSARY_BUG_FIXES_2.md](../docs/GLOSSARY_BUG_FIXES_2.md)** - Recent bug fix documentation
3. **This file** - Session summary and context

### Code Patterns to Follow

**API Route Pattern** (see existing routes):
```javascript
// src/app/api/observations/create/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Implementation...
}
```

**Component Pattern** (see existing components):
```javascript
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";

export default function ObservationCard({ observation }) {
  // Implementation...
}
```

---

## Important Notes & Gotchas

1. **UUID vs Integer IDs**:
   - Users table uses UUID
   - Units table uses integers
   - New observations table should use UUID for consistency
   - Be careful with foreign key types

2. **Image URLs**:
   - Store full public URLs, not just paths
   - Supabase Storage public URLs format: `https://[project].supabase.co/storage/v1/object/public/observations/...`

3. **RLS Policies**:
   - Remember to add RLS policies for new tables
   - Students should only delete their own observations
   - Public visibility respects the `visibility` field

4. **Map Coordinates**:
   - Latitude: -90 to 90 (N/S)
   - Longitude: -180 to 180 (E/W)
   - react-simple-maps uses: `[longitude, latitude]` (note the order!)
   - Leaflet uses: `[latitude, longitude]` (opposite order!)

5. **OpenAI Vision**:
   - Image must be accessible via public URL
   - Upload to Supabase Storage first, then pass URL to OpenAI
   - Model: "gpt-4o" (vision-capable)

---

## Success Metrics for NGO Features

Once implemented, measure:
- Number of observations uploaded per week
- Species diversity (unique species identified)
- Geographic coverage (countries/regions)
- Student engagement (comments, likes)
- NGO challenge completion rates
- Accuracy of AI species identification (vs expert verification)

---

## Contact & Resources

**Project Context**:
- **Target Users**: Secondary school students in Brazil (expanding globally)
- **Main Markets**: Language schools, bilingual schools, international schools, individual learners
- **USP**: 100% eco-focused English learning
- **NGO Goal**: Real-world environmental impact through education

**External Resources**:
- OpenStreetMap Nominatim: https://nominatim.org/release-docs/latest/api/Overview/
- iNaturalist API: https://api.inaturalist.org/v1/docs/
- Leaflet.js Docs: https://leafletjs.com/
- OpenAI Vision Guide: https://platform.openai.com/docs/guides/vision
- react-simple-maps: https://www.react-simple-maps.io/

---

## Final Checklist Before Implementing

- [ ] User answers to planning questions received
- [ ] Database schema finalized
- [ ] Supabase Storage bucket created
- [ ] Leaflet installed (`npm install leaflet react-leaflet`)
- [ ] OpenAI API key verified working
- [ ] Privacy/moderation strategy decided
- [ ] Phase 1 scope clearly defined
- [ ] Component structure agreed upon

---

**SESSION STATUS**: ✅ Ready to implement once user provides answers to planning questions

**NEXT SESSION**: Review user's answers, finalize Phase 1 scope, begin implementation

---

_This summary was created to preserve context after laptop restart. All technical details, code examples, and planning documents are preserved in the docs folder._

**Key Files**:
- [docs/NGO_FEATURES_PLANNING.md](../docs/NGO_FEATURES_PLANNING.md) - 📋 Complete technical plan
- [docs/GLOSSARY_BUG_FIXES_2.md](../docs/GLOSSARY_BUG_FIXES_2.md) - 🐛 Bug fix documentation
- This file - 📝 Session summary

Good luck with the implementation! The groundwork is solid, the tools are affordable, and the impact will be meaningful. 🌍🌱
