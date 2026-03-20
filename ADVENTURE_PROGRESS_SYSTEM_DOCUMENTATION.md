# Adventure-Based Progress System - Implementation Documentation

## Overview

This document provides a comprehensive guide to the new adventure-based progress system implemented in Habitat. The system allows users to save one endangered species per adventure by completing lessons, with each lesson moving the species up one IUCN conservation status level.

---

## Database Changes

### New Tables Created

#### 1. `completed_species`
Stores all species that users have successfully saved by completing adventures.

**Columns:**
- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID, FK → users) - User who saved the species
- `species_avatar_id` (UUID, FK → species_avatars) - The species that was saved
- `adventure_id` (TEXT) - Adventure where species was saved (e.g., 'rainforests')
- `world_id` (TEXT) - World/biome (e.g., 'forests')
- `final_iucn_status` (TEXT) - Always 'LC' (Least Concern) when saved
- `lessons_completed` (INTEGER) - Always 5
- `points_earned` (INTEGER) - Points earned from completing the adventure
- `completed_at` (TIMESTAMPTZ) - When the species was saved
- `created_at` (TIMESTAMPTZ) - Record creation time

**Unique Constraint:** `(user_id, species_avatar_id, adventure_id)` - Prevents saving the same species twice in the same adventure

#### 2. Modified `user_species_journey` Table
Added columns to track adventure-specific progress:

**New Columns:**
- `current_adventure_id` (TEXT) - Current adventure the user is on
- `current_world_id` (TEXT) - Current world/biome
- `lessons_completed_in_adventure` (INTEGER) - Number of lessons completed (0-5)
- `adventure_started_at` (TIMESTAMPTZ) - When adventure began

### Views Created

#### `user_progress_summary`
Aggregates user progress data for easy querying.

**Returns:**
- `user_id` - User identifier
- `total_species_saved` - Count of completed species
- `total_points_from_saved_species` - Total points from saved species
- `current_journey_points` - Points in current journey
- `current_iucn_status` - Current IUCN status
- `current_adventure_id` - Current adventure
- `current_world_id` - Current world
- `lessons_completed_in_adventure` - Lessons completed in current adventure
- `current_species_id` - ID of species being saved
- `current_species_name` - Name of current species
- `current_species_image` - Image URL of current species

### Updated IUCN Thresholds

The system now uses 5 IUCN levels (down from 7):
1. **CR** (Critically Endangered) → **EN** (Endangered) - 1 point required
2. **EN** (Endangered) → **VU** (Vulnerable) - 2 points required
3. **VU** (Vulnerable) → **NT** (Near Threatened) - 3 points required
4. **NT** (Near Threatened) → **LC** (Least Concern) - 4 points required

Each lesson completion = 1 point, so completing 5 lessons moves through all 5 levels.

---

## New Components Created

### 1. IUCNProgressBar (`src/components/progress/IUCNProgressBar.js`)

**Purpose:** Reusable component to display IUCN conservation status progress.

**Key Features:**
- Shows progress through 5 IUCN levels (CR → EN → VU → NT → LC)
- Displays species information (name, scientific name, image)
- Shows lessons completed and progress to next level
- Three size variants: 'sm', 'md', 'lg'
- Animated transitions
- Tooltips on hover

**Props:**
- `currentStatus` (string) - Current IUCN status code (CR, EN, VU, NT, LC)
- `startingStatus` (string) - Starting IUCN status (default: CR)
- `lessonsCompleted` (number) - Number of lessons completed (0-5)
- `totalLessons` (number) - Total lessons in adventure (default: 5)
- `speciesInfo` (object) - `{name, scientificName, imageUrl}`
- `nextLevelName` (string) - Name of next IUCN level
- `showLabels` (boolean) - Show status labels below bar (default: true)
- `animated` (boolean) - Enable animations (default: true)
- `size` (string) - Size variant: 'sm', 'md', 'lg' (default: 'md')
- `className` (string) - Additional CSS classes

**Usage Example:**
```jsx
<IUCNProgressBar
  currentStatus="EN"
  lessonsCompleted={2}
  totalLessons={5}
  speciesInfo={{
    name: "Amazon River Dolphin",
    scientificName: "Inia geoffrensis",
    imageUrl: "/images/dolphin.jpg"
  }}
  size="lg"
/>
```

### 2. SpeciesSelectionModal (`src/components/species/SpeciesSelectionModal.js`)

**Purpose:** Modal for selecting a species to save at the start of each adventure.

**Key Features:**
- Displays 2-3 species options in a beautiful grid
- Shows species image, name, scientific name, description
- Current IUCN status badge
- Explains the mission and progress system
- Responsive design (works on mobile and desktop)

**Props:**
- `isOpen` (boolean) - Whether modal is open
- `onClose` (function) - Close handler
- `onSelect` (function) - Selection handler `(speciesId, adventureId, worldId)`
- `species` (array) - Array of species options
- `adventureName` (string) - Name of the adventure
- `adventureId` (string) - ID of the adventure
- `worldId` (string) - ID of the world/biome
- `worldName` (string) - Name of the world/biome

**Species Object Structure:**
```javascript
{
  id: "uuid",
  common_name: "Amazon River Dolphin",
  scientific_name: "Inia geoffrensis",
  avatar_image_url: "/images/dolphin.jpg",
  iucn_status: "CR",
  description: "Pink dolphins of the Amazon River",
  habitat: "Rivers"
}
```

### 3. SavedSpeciesCollection (`src/components/species/SavedSpeciesCollection.js`)

**Purpose:** Displays all species the user has saved through completing adventures.

**Key Features:**
- Two view modes: compact (dashboard) and full (dedicated page)
- Shows species image, name, adventure, and completion date
- Trophy badges on saved species
- Statistics (total species saved, points earned)
- Empty state with call-to-action

**Props:**
- `userId` (string, optional) - For viewing other users' collections
- `compact` (boolean) - Compact view for dashboard (default: false)
- `limit` (number) - Limit number of species shown
- `onSpeciesClick` (function, optional) - Click handler for species

**Usage Example:**
```jsx
// Compact view for dashboard
<SavedSpeciesCollection compact={true} limit={10} />

// Full view for dedicated page
<SavedSpeciesCollection />
```

---

## API Endpoints Created

### 1. POST `/api/adventures/start`

**Purpose:** Start a new adventure by selecting a species to save.

**Request Body:**
```json
{
  "speciesAvatarId": "uuid",
  "adventureId": "rainforests",
  "worldId": "forests"
}
```

**Response:**
```json
{
  "success": true,
  "journey": {
    // Updated journey object
  },
  "message": "Adventure started! You're now saving the Amazon River Dolphin."
}
```

**Behavior:**
- If user has no journey, creates a new one
- If user has existing journey, updates it for the new adventure
- Sets `current_iucn_status` to "CR"
- Resets `lessons_completed_in_adventure` to 0
- Records `adventure_started_at` timestamp

### 2. POST `/api/lessons/complete`

**Purpose:** Mark a lesson as complete and increment IUCN progress.

**Request Body:**
```json
{
  "lessonId": "uuid",
  "adventureId": "rainforests",
  "worldId": "forests"
}
```

**Response:**
```json
{
  "success": true,
  "journey": {
    // Updated journey object
  },
  "progressUpdate": {
    "previousStatus": "CR",
    "newStatus": "EN",
    "lessonsCompleted": 1,
    "totalLessons": 5,
    "isAdventureComplete": false
  },
  "message": "Great job! The Amazon River Dolphin is now Endangered!"
}
```

**When Adventure Completes (5 lessons):**
```json
{
  "success": true,
  "journey": {
    // Updated journey object with LC status
  },
  "progressUpdate": {
    "previousStatus": "NT",
    "newStatus": "LC",
    "lessonsCompleted": 5,
    "totalLessons": 5,
    "isAdventureComplete": true
  },
  "message": "🎉 Congratulations! You've saved the Amazon River Dolphin!",
  "speciesSaved": {
    "id": "uuid",
    "name": "Amazon River Dolphin",
    "scientificName": "Inia geoffrensis",
    "imageUrl": "/images/dolphin.jpg"
  }
}
```

**Behavior:**
- Validates lesson belongs to current adventure
- Increments `lessons_completed_in_adventure`
- Moves species up one IUCN level (CR → EN → VU → NT → LC)
- Adds 1 point to `total_points`
- When 5 lessons complete, saves species to `completed_species` table

### 3. GET `/api/species/completed`

**Purpose:** Fetch all species saved by the current user.

**Response:**
```json
{
  "success": true,
  "completedSpecies": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "species_avatar_id": "uuid",
      "adventure_id": "rainforests",
      "world_id": "forests",
      "final_iucn_status": "LC",
      "lessons_completed": 5,
      "points_earned": 5,
      "completed_at": "2026-03-19T10:30:00Z",
      "species_avatar": {
        "id": "uuid",
        "common_name": "Amazon River Dolphin",
        "scientific_name": "Inia geoffrensis",
        "avatar_image_url": "/images/dolphin.jpg"
      }
    }
  ],
  "stats": {
    "totalSpeciesSaved": 3,
    "totalPoints": 15
  }
}
```

---

## Integration Points

### Lesson Completion Flow

**File:** `src/app/(site)/lesson/[id]/page.js`

**Changes Made:**
1. Added imports:
   ```javascript
   import IUCNProgressBar from "@/components/progress/IUCNProgressBar";
   import { toast } from "sonner";
   ```

2. Added state:
   ```javascript
   const [journey, setJourney] = useState(null);
   const [progressUpdate, setProgressUpdate] = useState(null);
   const [loadingProgress, setLoadingProgress] = useState(false);
   ```

3. Added journey fetching useEffect:
   ```javascript
   useEffect(() => {
     const fetchJourney = async () => {
       if (!user) return;
       const response = await fetch("/api/user/journey");
       if (response.ok) {
         const data = await response.json();
         setJourney(data.journey);
       }
     };
     fetchJourney();
   }, [user]);
   ```

4. Added lesson completion handler:
   ```javascript
   const handleLessonCompletion = async () => {
     // Calls /api/lessons/complete
     // Updates journey and progressUpdate state
     // Shows success toast
   };
   ```

5. Added useEffect to trigger completion:
   ```javascript
   useEffect(() => {
     if (currentStepData?.type === "completion" && journey && !progressUpdate) {
       handleLessonCompletion();
     }
   }, [currentStep, lesson, journey]);
   ```

6. Added IUCN Progress Bar to completion step:
   ```jsx
   {journey && journey.current_adventure_id && (
     <div className="max-w-2xl mx-auto mb-6">
       <IUCNProgressBar
         currentStatus={progressUpdate?.newStatus || journey.current_iucn_status}
         lessonsCompleted={progressUpdate?.lessonsCompleted || journey.lessons_completed_in_adventure}
         totalLessons={5}
         speciesInfo={{
           name: journey.species_avatar?.common_name,
           scientificName: journey.species_avatar?.scientific_name,
           imageUrl: journey.species_avatar?.avatar_image_url,
         }}
         size="lg"
       />
     </div>
   )}
   ```

### Dashboard Updates

**File:** `src/app/(site)/dashboard/page.js`

**Changes Made:**
1. Added import:
   ```javascript
   import SavedSpeciesCollection from "@/components/species/SavedSpeciesCollection";
   ```

2. Replaced Recent Observations section with Saved Species:
   ```jsx
   {/* 7. Saved Species Collection */}
   <SavedSpeciesCollection compact={true} limit={10} />
   ```

3. Commented out:
   - Recent Observations section
   - Wildlife Map Preview section
   - "New Observation" quick action link
   - Observations-related data fetching in useEffect

**Note:** All commented code is preserved with `/* COMMENTED OUT: ... - To be reintroduced later */` markers for easy restoration.

---

## Lesson-Adventure Linking System

Lessons are linked to adventures via the **`theme_tags`** system:

1. **In Supabase `lessons` table:**
   - Each lesson has a `theme_tags` column (array)
   - Example: `["rainforests", "mammals"]`

2. **In `worldsConfig.js`:**
   - Each adventure has a `themeTag` property
   - Example: `themeTag: "rainforests"`

3. **Fetching lessons for an adventure:**
   ```javascript
   const { data: lessons } = await supabase
     .from("lessons")
     .select("*")
     .contains("theme_tags", [adventure.themeTag]);
   ```

**This system allows:**
- Flexible lesson-adventure mapping
- Lessons can belong to multiple adventures
- Easy addition of new adventures without database schema changes

---

## User Journey Flow

### Starting an Adventure

1. User visits `/worlds/forests` (or any world page)
2. Clicks on an adventure (e.g., "Rain Forests")
3. **SpeciesSelectionModal** opens showing 2-3 species options
4. User selects a species
5. Call to `/api/adventures/start` creates/updates journey
6. User redirected to adventure page with lessons

### Completing Lessons

1. User completes a lesson (reaches completion step)
2. `handleLessonCompletion()` called automatically
3. Call to `/api/lessons/complete`:
   - Increments `lessons_completed_in_adventure`
   - Moves species up one IUCN level
   - Returns progress update
4. **IUCNProgressBar** shows updated progress
5. Success toast notification

### Saving a Species (Adventure Complete)

1. User completes 5th lesson in adventure
2. `/api/lessons/complete` response includes:
   - `isAdventureComplete: true`
   - `speciesSaved` object
3. Species added to `completed_species` table
4. Special celebration toast: "🎉 Species Saved!"
5. User can view saved species in dashboard
6. User ready to start next adventure

---

## Next Steps for Full Integration

### 1. World/Adventure Page Integration

**File to modify:** `src/app/(site)/worlds/[worldId]/page.js`

**What to add:**
- Import `SpeciesSelectionModal`
- State for modal open/close
- Fetch species for adventure from Supabase
- Open modal when user clicks "Start Adventure"
- Handle species selection and call `/api/adventures/start`

**Example Implementation:**
```javascript
const [showSpeciesModal, setShowSpeciesModal] = useState(false);
const [selectedAdventure, setSelectedAdventure] = useState(null);
const [adventureSpecies, setAdventureSpecies] = useState([]);

const handleAdventureClick = async (adventure) => {
  setSelectedAdventure(adventure);

  // Fetch species for this adventure
  const { data } = await supabase
    .from("species_avatars")
    .select("*")
    .eq("habitat_type", adventure.ecosystemType)
    .limit(3);

  setAdventureSpecies(data);
  setShowSpeciesModal(true);
};

const handleSpeciesSelect = async (speciesId, adventureId, worldId) => {
  const response = await fetch("/api/adventures/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ speciesAvatarId: speciesId, adventureId, worldId }),
  });

  if (response.ok) {
    setShowSpeciesModal(false);
    router.push(`/worlds/${worldId}/${adventureId}`);
  }
};

return (
  <>
    {/* Adventure cards with click handlers */}

    <SpeciesSelectionModal
      isOpen={showSpeciesModal}
      onClose={() => setShowSpeciesModal(false)}
      onSelect={handleSpeciesSelect}
      species={adventureSpecies}
      adventureName={selectedAdventure?.name}
      adventureId={selectedAdventure?.id}
      worldId={worldId}
      worldName={worldConfig.name}
    />
  </>
);
```

### 2. Top Naturalists Leaderboard Update

**File to modify:** `src/app/api/leaderboard/naturalists/route.js`

**Current ranking:** Based on `total_points` from observations

**New ranking logic:**
```sql
SELECT
  u.id,
  u.name AS user_name,
  u.image AS user_image,
  COUNT(DISTINCT cs.id) AS species_saved,
  COALESCE(SUM(cs.points_earned), 0) AS total_points,
  usj.species_avatar_id,
  sa.common_name AS current_species,
  sa.avatar_image_url
FROM users u
LEFT JOIN completed_species cs ON cs.user_id = u.id
LEFT JOIN user_species_journey usj ON usj.user_id = u.id
LEFT JOIN species_avatars sa ON sa.id = usj.species_avatar_id
GROUP BY u.id, u.name, u.image, usj.species_avatar_id, sa.common_name, sa.avatar_image_url
ORDER BY species_saved DESC, total_points DESC
LIMIT ?;
```

**Display format:**
- **Primary metric:** Species saved (e.g., "🏆 15 Species")
- **Secondary metric:** Total points (e.g., "75 pts")
- Shows current species avatar

### 3. Species Avatar Database Setup

**Supabase `species_avatars` table should have:**
- At least 2-3 species per `habitat_type` or `ecosystem_type`
- Field mapping:
  - `habitat_type` or `ecosystem_type` → matches adventure's `ecosystemType`
  - `common_name` → displayed name
  - `scientific_name` → scientific name
  - `avatar_image_url` → species image
  - `iucn_status` → current real-world status (usually "CR")
  - `description` → brief description for modal

**Example species for Rain Forests:**
```sql
INSERT INTO species_avatars (
  common_name,
  scientific_name,
  avatar_image_url,
  iucn_status,
  habitat_type,
  description
) VALUES
  ('Amazon River Dolphin', 'Inia geoffrensis', '/images/species/dolphin.jpg', 'CR', 'rainforest', 'Pink dolphins of the Amazon River'),
  ('Jaguar', 'Panthera onca', '/images/species/jaguar.jpg', 'NT', 'rainforest', 'Powerful apex predator of South American forests'),
  ('Harpy Eagle', 'Harpia harpyja', '/images/species/eagle.jpg', 'NT', 'rainforest', 'Majestic raptor of the rainforest canopy');
```

---

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] User can start an adventure and select a species
- [ ] Journey is created/updated with adventure data
- [ ] Completing a lesson increments IUCN progress
- [ ] IUCN Progress Bar displays correctly in lesson completion
- [ ] After 5 lessons, species is saved to `completed_species`
- [ ] Saved species appears in dashboard collection
- [ ] User can start a new adventure after completing one
- [ ] Dashboard shows saved species collection
- [ ] Observations and Wildlife Map sections are commented out
- [ ] No console errors related to missing data

---

## Rollback Plan

If needed, to rollback these changes:

1. **Database:**
   ```sql
   DROP TABLE IF EXISTS completed_species CASCADE;
   DROP VIEW IF EXISTS user_progress_summary;
   ALTER TABLE user_species_journey
     DROP COLUMN IF EXISTS current_adventure_id,
     DROP COLUMN IF EXISTS current_world_id,
     DROP COLUMN IF EXISTS lessons_completed_in_adventure,
     DROP COLUMN IF EXISTS adventure_started_at;
   ```

2. **Files to revert:**
   - `src/app/(site)/lesson/[id]/page.js` - Remove IUCN progress integration
   - `src/app/(site)/dashboard/page.js` - Uncomment observations/map, remove SavedSpeciesCollection

3. **Delete new files:**
   - `src/components/progress/IUCNProgressBar.js`
   - `src/components/species/SpeciesSelectionModal.js`
   - `src/components/species/SavedSpeciesCollection.js`
   - `src/app/api/adventures/start/route.js`
   - `src/app/api/lessons/complete/route.js`
   - `src/app/api/species/completed/route.js`

---

## Support & Questions

For questions or issues with this implementation:
1. Check this documentation first
2. Review the API endpoint responses in browser DevTools
3. Check Supabase table data directly
4. Review console logs (all API calls log success/errors)

**Common Issues:**

- **"No active journey found"** → User needs to start an adventure first
- **Progress not updating** → Check `current_adventure_id` matches lesson's adventure
- **Species not appearing** → Check `species_avatars` table has species for that habitat_type

---

**Last Updated:** March 19, 2026
**Version:** 1.0.0
