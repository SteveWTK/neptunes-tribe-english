# NGO Partnership Features - Technical Planning Guide

## Overview
This document outlines the technical requirements and implementation strategies for two major features supporting NGO partnerships and user-generated environmental observations.

---

## Feature 1: Location Tagging on Eco-Map

### What You Want
Allow users to tag geographic locations for their observation entries (photos, notes) which will appear on the existing eco-map alongside their learning progress.

### Current State Analysis
Your eco-map uses:
- **Library**: `react-simple-maps` (lines 7-11 in EcoMapProgressOceanZones.js)
- **Data Source**: World Atlas TopoJSON from CDN
- **Current Features**:
  - Country/region highlighting for completed units
  - Ocean zones
  - Weekly theme overlays
  - Click-to-navigate to units by region

### Implementation Options

#### Option A: Add Markers to Existing Map (Recommended ⭐)
**Best for**: Starting quickly, seamless integration with existing map

**What you need:**
1. **react-simple-maps Marker component** (already available in your library)
   ```javascript
   import { Marker } from "react-simple-maps";
   ```

2. **Database schema for observations:**
   ```sql
   CREATE TABLE user_observations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     title TEXT NOT NULL,
     description TEXT,
     latitude DECIMAL(10, 8) NOT NULL,  -- e.g., -23.550520
     longitude DECIMAL(11, 8) NOT NULL, -- e.g., -46.633308
     location_name TEXT,                 -- e.g., "São Paulo, Brazil"
     species_identified TEXT,            -- from AI identification
     photo_url TEXT,
     ngo_challenge_id UUID REFERENCES ngo_challenges(id),
     visibility TEXT DEFAULT 'public',   -- public, school, private
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Location picker component:**
   - Use browser's Geolocation API (free, built-in)
   - Or integrate Mapbox/Google Maps autocomplete for manual location entry

4. **Implementation steps:**
   ```javascript
   // In EcoMapProgressOceanZones.js, add:
   import { Marker } from "react-simple-maps";

   // Fetch user observations
   const [userObservations, setUserObservations] = useState([]);

   // Render markers
   {userObservations.map((obs) => (
     <Marker
       key={obs.id}
       coordinates={[obs.longitude, obs.latitude]}
       onClick={() => openObservationDetail(obs)}
     >
       <circle r={6} fill="#22c55e" stroke="#fff" strokeWidth={2} />
       {/* Custom icon based on observation type */}
     </Marker>
   ))}
   ```

**Pros:**
- ✅ Seamless integration with existing map
- ✅ No additional mapping library needed
- ✅ Consistent UX with current eco-map
- ✅ Minimal learning curve

**Cons:**
- ⚠️ Less detailed than dedicated mapping solutions
- ⚠️ Limited street-level detail (world atlas is country-level)

---

#### Option B: Embed Interactive Map for Location Picking
**Best for**: More detailed location selection, street-level accuracy

**Options:**

**B1. Leaflet.js (Open Source, FREE) ⭐ Recommended**
- **Cost**: FREE
- **Features**: Street maps, satellite view, marker clustering, drawing tools
- **Data source**: OpenStreetMap (free)
- **Bundle size**: ~40KB (lightweight)
- **Implementation**:
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

**B2. Mapbox GL JS (Freemium)**
- **Cost**: FREE tier: 50,000 map loads/month
- **Features**: Beautiful maps, 3D terrain, satellite imagery, geocoding
- **Best if**: You want professional styling, satellite view
- **Setup**: Need Mapbox account + API token
  ```bash
  npm install mapbox-gl react-map-gl
  ```

**B3. Google Maps (Paid, but familiar)**
- **Cost**: $200/month free credit, then $7 per 1,000 requests
- **Features**: Street view, places API, detailed POI data
- **Best if**: You need Google Places integration, street view
- **Setup**: Need Google Cloud account + API key

---

### Recommended Hybrid Approach ⭐⭐⭐

**For the smoothest implementation:**

1. **Display observations on eco-map** (Option A)
   - Shows observations on the global eco-map students already know
   - Maintains consistency with learning progress visualization
   - Good for "where are observations happening globally"

2. **Use Leaflet for location picking** (Option B1)
   - Separate component for creating/editing observations
   - Allows precise location selection
   - Shows street-level context for student observations
   - Can use reverse geocoding to get location names

3. **Implementation flow:**
   ```
   Create Observation →
   Open Leaflet map →
   Student clicks location →
   Gets lat/lng + location name →
   Saves to database →
   Shows as marker on eco-map
   ```

### Geolocation Tools You'll Need

**1. Browser Geolocation API (FREE, built-in)**
```javascript
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  // Use these coordinates
});
```
- **Pros**: Free, works on mobile
- **Cons**: Requires user permission, accuracy varies

**2. Reverse Geocoding (Get location name from coordinates)**
- **Nominatim (FREE)**: OpenStreetMap's geocoding service
  ```javascript
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
    .then(res => res.json())
    .then(data => {
      // data.display_name = "São Paulo, Brazil"
    });
  ```
- **Rate limit**: 1 request/second (free tier)
- **Best for**: Low-volume, educational projects

**3. Forward Geocoding (Search for locations)**
- Same services provide search: "Parque Ibirapuera" → coordinates
- Useful for manual location entry

---

## Feature 2: AI Species Identification

### What You Want
When students upload photos of animals/plants, automatically identify the species (or suggest most likely matches).

### Available Solutions

#### Option A: OpenAI Vision API (You already have this!) ⭐ Recommended

**Since you already have OpenAI integrated:**

**Implementation:**
```javascript
// /api/species-identification/route.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { imageUrl } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // Latest vision model
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a biodiversity expert. Analyze this image and identify the species.

            Provide your response in JSON format:
            {
              "species_name": "Scientific name (Common name)",
              "confidence": "high/medium/low",
              "family": "Taxonomic family",
              "habitat": "Natural habitat description",
              "conservation_status": "IUCN status if known",
              "fun_fact": "One educational fact about this species",
              "educational_note": "Why this species is ecologically important"
            }

            If you cannot identify with confidence, provide your best 2-3 guesses with explanations.`
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

**Pricing:**
- GPT-4o: **$2.50 per million input tokens**, $10 per million output tokens
- Image: ~765 tokens (high detail), ~85 tokens (low detail)
- **Cost per image**: ~$0.002 - $0.005 (less than half a cent!)
- Very affordable for educational use

**Pros:**
- ✅ Already integrated in your project
- ✅ Very accurate for common species
- ✅ Provides educational context automatically
- ✅ Can explain "why" it identified that species
- ✅ Handles edge cases gracefully (unclear images)
- ✅ Multilingual (can respond in Portuguese, Spanish, etc.)

**Cons:**
- ⚠️ May be less accurate for rare/endemic species
- ⚠️ Not specialized in biodiversity (but very capable)

---

#### Option B: Specialized Biodiversity APIs

**B1. iNaturalist API (FREE for non-commercial)**
- **Service**: Community science platform with 150M+ observations
- **API**: Computer vision model specifically trained on wildlife
- **Cost**: FREE for educational/non-commercial
- **Accuracy**: Very high for photographed species
- **Setup**:
  ```bash
  # Upload image to your server first, then:
  curl -X POST https://api.inaturalist.org/v1/computervision/score_image \
    -F "image=@photo.jpg"
  ```
- **Response**: Top 10 species suggestions with confidence scores
- **Pros**:
  - ✅ Specialized in wildlife
  - ✅ FREE for your use case
  - ✅ Community-verified data
  - ✅ Global coverage
- **Cons**:
  - ⚠️ Requires separate image upload
  - ⚠️ Less educational context than GPT-4
  - ⚠️ API can be slower

**B2. Google Cloud Vision API**
- **Features**: Label detection, web entities, similar images
- **Cost**: $1.50 per 1,000 images (first 1,000/month free)
- **Accuracy**: Good for common species, less detailed than specialized tools
- **Best for**: General object detection + species ID combined

**B3. Pl@ntNet API (Plants only, FREE)**
- **Specialization**: Plants only, 20,000+ species
- **Cost**: FREE for educational use
- **Accuracy**: Excellent for plants
- **API**: https://my.plantnet.org/
- **Best for**: If focusing on plant identification

---

### Recommended Hybrid Approach for Species ID ⭐⭐⭐

**Use both OpenAI + iNaturalist for best results:**

```javascript
// Step 1: Quick identification with OpenAI (provides educational context)
const openAIResult = await identifyWithOpenAI(imageUrl);

// Step 2: Validate with iNaturalist (specialized accuracy)
const iNatResults = await identifyWithINaturalist(imageFile);

// Step 3: Combine results
const finalResult = {
  primary_identification: openAIResult.species_name,
  confidence: openAIResult.confidence,
  educational_content: openAIResult.educational_note,
  alternative_suggestions: iNatResults.slice(0, 3), // Top 3 from iNat
  fun_fact: openAIResult.fun_fact,
  conservation_status: openAIResult.conservation_status
};
```

**Why this works:**
- OpenAI provides rich educational context in any language
- iNaturalist validates with specialized biodiversity knowledge
- Students get both accurate ID + learning content
- Fallback if one service fails
- Cost: Still under $0.01 per identification

---

## Complete Implementation Architecture

### Database Schema

```sql
-- NGO Challenges table
CREATE TABLE ngo_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  required_observations INTEGER,
  target_species TEXT[],      -- Array of species names
  target_regions TEXT[],       -- Array of region codes
  points_reward INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NGO Organizations table
CREATE TABLE ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  contact_email TEXT,
  active BOOLEAN DEFAULT true
);

-- User Observations table
CREATE TABLE user_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ngo_challenge_id UUID REFERENCES ngo_challenges(id),

  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  region_code TEXT,           -- e.g., "BR" for Brazil

  -- Observation content
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT NOT NULL,
  observation_date DATE DEFAULT CURRENT_DATE,

  -- AI Identification
  ai_species_primary TEXT,
  ai_species_alternatives JSONB,  -- Array of alternative suggestions
  ai_confidence TEXT,             -- high/medium/low
  ai_educational_note TEXT,

  -- User verification
  user_confirmed_species TEXT,    -- If student corrects AI
  verified_by_expert BOOLEAN DEFAULT false,
  expert_notes TEXT,

  -- Visibility & engagement
  visibility TEXT DEFAULT 'public', -- public, school, private
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Observation comments (community engagement)
CREATE TABLE observation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID REFERENCES user_observations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Observation likes
CREATE TABLE observation_likes (
  observation_id UUID REFERENCES user_observations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (observation_id, user_id)
);
```

### API Endpoints Needed

```
POST   /api/observations/create          - Create new observation
GET    /api/observations/user/:userId    - Get user's observations
GET    /api/observations/feed            - Public feed of observations
GET    /api/observations/:id             - Single observation details
PUT    /api/observations/:id             - Update observation
DELETE /api/observations/:id             - Delete observation

POST   /api/observations/:id/like        - Like an observation
POST   /api/observations/:id/comment     - Comment on observation
GET    /api/observations/:id/comments    - Get comments

POST   /api/species-identification       - AI species identification
POST   /api/location/geocode             - Get location name from coords
POST   /api/location/reverse-geocode     - Search location by name

GET    /api/ngo-challenges/active        - Get active NGO challenges
GET    /api/ngo-challenges/:id/progress  - User's progress in challenge
POST   /api/ngo-challenges/:id/submit    - Submit observation to challenge
```

### Component Structure

```
src/
├── components/
│   ├── observations/
│   │   ├── ObservationCard.js           - Display single observation
│   │   ├── ObservationFeed.js           - Public feed/gallery
│   │   ├── ObservationMap.js            - Map showing all observations
│   │   ├── CreateObservation.js         - Upload form
│   │   ├── LocationPicker.js            - Leaflet map for location
│   │   ├── SpeciesIdentifier.js         - AI identification UI
│   │   └── ObservationDetail.js         - Full observation view
│   │
│   ├── ngo-challenges/
│   │   ├── ChallengeCard.js             - Display NGO challenge
│   │   ├── ChallengeProgress.js         - User's progress tracker
│   │   └── ChallengeLeaderboard.js      - Top contributors
│   │
│   └── eco-map/
│       └── EcoMapWithObservations.js    - Enhanced eco-map
│
└── app/
    └── (site)/
        ├── observations/
        │   ├── page.js                  - Public observation feed
        │   ├── create/page.js           - Create observation
        │   └── [id]/page.js             - View single observation
        │
        ├── ngo-challenges/
        │   ├── page.js                  - List all challenges
        │   └── [id]/page.js             - Challenge detail + submit
        │
        └── profile/
            └── observations/page.js     - User's observation history
```

---

## Image Upload Strategy

Since you'll be uploading photos, you need storage:

### Option 1: Supabase Storage (Recommended ⭐)
You're already using Supabase, so this is seamless:

```javascript
// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('observations')
  .upload(`${userId}/${Date.now()}.jpg`, file);

const publicUrl = supabase.storage
  .from('observations')
  .getPublicUrl(data.path);
```

**Pricing:**
- FREE: 1GB storage + 2GB bandwidth/month
- Paid: $0.021/GB storage, $0.09/GB bandwidth
- **Very affordable** for image hosting

### Option 2: Cloudinary (Image optimization built-in)
- **FREE**: 25GB storage, 25GB bandwidth/month
- Auto image optimization, resizing, CDN
- Best for: If you need automatic thumbnails, watermarks

---

## Implementation Roadmap

### Phase 1: MVP (Minimum Viable Product)
**Goal**: Students can upload observations with location

1. ✅ Database schema (observations table)
2. ✅ Image upload to Supabase Storage
3. ✅ Create observation form (title, description, photo)
4. ✅ Location picker using browser geolocation
5. ✅ Display observations on user profile
6. ✅ Basic OpenAI species identification

**Timeline**: 2-3 weeks

### Phase 2: Map Integration
**Goal**: Visualize observations on eco-map

1. ✅ Add markers to EcoMapProgressOceanZones
2. ✅ Observation detail popup on marker click
3. ✅ Filter by species, date, user
4. ✅ Leaflet map for precise location picking

**Timeline**: 1-2 weeks

### Phase 3: NGO Challenges
**Goal**: Structured challenges with NGO partnerships

1. ✅ NGO challenges database + admin interface
2. ✅ Challenge cards on dashboard
3. ✅ Submit observations to challenges
4. ✅ Progress tracking & leaderboard
5. ✅ Points/badges for completion

**Timeline**: 2-3 weeks

### Phase 4: Community Features
**Goal**: Students engage with each other's observations

1. ✅ Public observation feed
2. ✅ Likes & comments
3. ✅ Featured observations
4. ✅ Expert verification system (teachers/NGO staff)

**Timeline**: 2 weeks

---

## Cost Estimation

For **1,000 active students** making observations:

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI Vision (species ID) | 2,000 IDs/month | ~$4/month |
| iNaturalist API | Unlimited | FREE |
| Supabase Storage | 5GB images | ~$1/month |
| Leaflet/OpenStreetMap | Unlimited | FREE |
| Reverse Geocoding | 2,000 requests | FREE (Nominatim) |
| **Total** | | **~$5/month** |

Even at 10,000 students: **~$50/month**

Very affordable! 🎉

---

## Quick Start Checklist

To get started immediately:

- [ ] Install Leaflet: `npm install leaflet react-leaflet`
- [ ] Create observations database table (SQL above)
- [ ] Set up Supabase Storage bucket for images
- [ ] Create `/api/species-identification/route.js` with OpenAI
- [ ] Build basic observation upload form
- [ ] Test with a few sample observations

---

## Questions for Planning

1. **NGO Partnership Scope**:
   - How many NGOs initially? (affects challenge management UI)
   - Will NGOs manage challenges themselves? (admin interface needed)

2. **Moderation**:
   - Should observations be pre-moderated before public display?
   - Teacher review required for school accounts?

3. **Privacy**:
   - Can students see each other's observations?
   - School-only visibility option needed?
   - Age-appropriate content filtering?

4. **Gamification**:
   - Points for observation uploads?
   - Badges for species variety, location diversity?
   - Link to existing XP system?

5. **Educational Integration**:
   - Link observations to specific units/lessons?
   - Required observations for lesson completion?
   - Teacher-assigned observation homework?

---

## Next Steps

Want me to:
1. Create a detailed implementation plan for Phase 1?
2. Build a prototype of the location picker component?
3. Set up the database schema with migrations?
4. Create the species identification API endpoint?
5. Design the observation card/feed components?

Let me know which aspect you'd like to dive into first! 🌱
