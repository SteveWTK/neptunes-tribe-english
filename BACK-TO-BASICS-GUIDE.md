# Back to Basics: Implementation Guide

This guide shows you **step-by-step** how to implement three common patterns that you can reuse throughout the application.

---

## Feature 1: Conditional Rendering Based on User Type or Level

### Use Case
Hide or show UI elements based on the user's `user_type` (e.g., "individual", "school") or `current_level` (e.g., "Beginner", "Intermediate").

### Example Implementation
**File:** [src/components/MultiGapFillExerciseNew.js](src/components/MultiGapFillExerciseNew.js)

We hid the "Show Full Text" button from school users while keeping it visible for individual learners.

### Step-by-Step Implementation

#### Step 1: Add Required Imports
```javascript
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
```

#### Step 2: Add State Variables
```javascript
// Inside your component function
const { user } = useAuth();
const [userType, setUserType] = useState(null);
const [currentLevel, setCurrentLevel] = useState(null);
```

#### Step 3: Fetch User Data from Supabase
```javascript
useEffect(() => {
  async function fetchUserData() {
    if (!user?.id && !user?.userId) return;

    try {
      const supabaseClient = createClient();
      const userId = user.userId || user.id;

      const { data, error } = await supabaseClient
        .from("users")
        .select("user_type, current_level")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }

      setUserType(data?.user_type || "individual");
      setCurrentLevel(data?.current_level || "Beginner");
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    }
  }

  fetchUserData();
}, [user]);
```

#### Step 4: Apply Conditional Rendering
Wrap any element in a condition using the `&&` operator:

```javascript
{/* Show button ONLY if userType is NOT "school" */}
{userType !== "school" && (
  <button onClick={handleClick}>
    Show Full Text
  </button>
)}
```

### Common Patterns

**Hide from school users:**
```javascript
{userType !== "school" && <YourComponent />}
```

**Show ONLY to school users:**
```javascript
{userType === "school" && <YourComponent />}
```

**Show only to Beginner level:**
```javascript
{currentLevel === "Beginner" && <YourComponent />}
```

**Show to Intermediate OR Advanced:**
```javascript
{(currentLevel === "Intermediate" || currentLevel === "Advanced") && (
  <YourComponent />
)}
```

**Show to individual users at Advanced level:**
```javascript
{userType === "individual" && currentLevel === "Advanced" && (
  <YourComponent />
)}
```

### Where This Was Implemented
- **Lines 834-843** in [MultiGapFillExerciseNew.js:834-843](src/components/MultiGapFillExerciseNew.js#L834-L843)

---

## Feature 2: Limiting User Interactions with a Counter

### Use Case
Limit how many times a user can perform an action (e.g., play audio, request hints, retry a puzzle) before requiring them to submit or complete a step.

### Example Implementation
**File:** [src/components/MultiGapFillExerciseNew.js](src/components/MultiGapFillExerciseNew.js)

We limited audio playback to 3 plays before submission, then reset the counter when they submit.

### Step-by-Step Implementation

#### Step 1: Add State Variables
```javascript
const [audioPlayCount, setAudioPlayCount] = useState(0);
const maxAudioPlays = 3;
```

#### Step 2: Check Counter Before Allowing Action
```javascript
function handleAudioToggle() {
  // Check if limit reached (only enforce when not submitted)
  if (!isSubmitted && audioPlayCount >= maxAudioPlays && !isPlaying) {
    alert(`You've reached the maximum of ${maxAudioPlays} plays. Submit your answers to play again.`);
    return; // Exit early, don't allow play
  }

  // ... rest of your existing audio logic ...

  // If starting playback (not pausing)
  if (!isPlaying) {
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);

        // Increment counter ONLY when not submitted
        if (!isSubmitted) {
          setAudioPlayCount(prev => prev + 1);
        }
      })
      .catch((err) => {
        console.error("Audio playback failed:", err);
      });
  }
}
```

#### Step 3: Reset Counter After Submission
```javascript
function handleSubmit() {
  // ... your existing submit logic ...

  setIsSubmitted(true);

  // Reset the counter so they get 3 more plays if they restart
  setAudioPlayCount(0);
}
```

#### Step 4: Show Remaining Count to User (Optional)
```javascript
{!isSubmitted && audioPlayCount > 0 && (
  <span className="text-xs text-gray-500">
    ({audioPlayCount}/{maxAudioPlays})
  </span>
)}
```

### Common Patterns

**Limit to 5 hints:**
```javascript
const [hintCount, setHintCount] = useState(0);
const maxHints = 5;

function showHint() {
  if (hintCount >= maxHints) {
    alert("No more hints available!");
    return;
  }
  setHintCount(prev => prev + 1);
  // ... show hint logic ...
}
```

**Limit retry button to 2 uses:**
```javascript
const [retryCount, setRetryCount] = useState(0);
const maxRetries = 2;

function handleRetry() {
  if (retryCount >= maxRetries) {
    alert("Maximum retries reached. Please move on.");
    return;
  }
  setRetryCount(prev => prev + 1);
  // ... retry logic ...
}
```

### Where This Was Implemented
- **Lines 45-47** (state): [MultiGapFillExerciseNew.js:45-47](src/components/MultiGapFillExerciseNew.js#L45-L47)
- **Lines 692-734** (counter logic): [MultiGapFillExerciseNew.js:692-734](src/components/MultiGapFillExerciseNew.js#L692-L734)
- **Line 455** (reset): [MultiGapFillExerciseNew.js:455](src/components/MultiGapFillExerciseNew.js#L455)
- **Lines 851-855** (display): [MultiGapFillExerciseNew.js:851-855](src/components/MultiGapFillExerciseNew.js#L851-L855)

---

## Feature 3: Adding Hover Tooltips

### Use Case
Show informative tooltips when users hover over buttons, icons, or interactive elements to provide guidance or instructions.

### Example Implementation
**File:** [src/components/MultiGapFillExerciseNew.js](src/components/MultiGapFillExerciseNew.js)

We added a tooltip to the audio button informing users they can only play it 3 times.

### Step-by-Step Implementation

#### Step 1: Add State Variable
```javascript
const [showAudioTooltip, setShowAudioTooltip] = useState(false);
```

#### Step 2: Wrap Your Button in a Container with Hover Handlers
```javascript
<div
  className="relative"
  onMouseEnter={() => setShowAudioTooltip(true)}
  onMouseLeave={() => setShowAudioTooltip(false)}
>
  {/* Tooltip appears here */}
  {/* Button appears here */}
</div>
```

#### Step 3: Create the Tooltip
```javascript
{showAudioTooltip && !isSubmitted && (
  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-50">
    <div className="text-center">
      <p className="font-semibold mb-1">🎧 Audio Playback Limit</p>
      <p>You can play this audio maximum <strong>3</strong> times before submitting.</p>
      <p className="mt-1 text-yellow-300">Listen carefully!</p>
      <p className="text-gray-300 mt-1">Plays remaining: <strong>{maxAudioPlays - audioPlayCount}</strong></p>
    </div>

    {/* Tooltip arrow pointing down */}
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
      <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
    </div>
  </div>
)}
```

#### Step 4: Add Your Button Inside the Same Container
```javascript
<button onClick={handleAudioToggle}>
  Play Audio
</button>
```

### Complete Example
```javascript
const [showTooltip, setShowTooltip] = useState(false);

return (
  <div
    className="relative"
    onMouseEnter={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
  >
    {/* Tooltip */}
    {showTooltip && (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
        This is helpful information!
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    )}

    {/* Button */}
    <button>Hover over me</button>
  </div>
);
```

### Tooltip Positioning Options

**Above the button (default):**
```javascript
className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2"
```

**Below the button:**
```javascript
className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2"
```

**To the right:**
```javascript
className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2"
```

**To the left:**
```javascript
className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2"
```

### Where This Was Implemented
- **Line 51** (state): [MultiGapFillExerciseNew.js:51](src/components/MultiGapFillExerciseNew.js#L51)
- **Lines 788-857** (full implementation): [MultiGapFillExerciseNew.js:788-857](src/components/MultiGapFillExerciseNew.js#L788-L857)

---

## Quick Reference: Copy-Paste Templates

### Conditional Rendering Template
```javascript
// 1. Add imports at top of file
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

// 2. Add state in component
const { user } = useAuth();
const [userType, setUserType] = useState(null);

// 3. Fetch data
useEffect(() => {
  async function fetchUserData() {
    if (!user?.id && !user?.userId) return;
    const supabaseClient = createClient();
    const userId = user.userId || user.id;
    const { data } = await supabaseClient
      .from("users")
      .select("user_type")
      .eq("id", userId)
      .single();
    setUserType(data?.user_type || "individual");
  }
  fetchUserData();
}, [user]);

// 4. Use in JSX
{userType !== "school" && <YourComponent />}
```

### Interaction Counter Template
```javascript
// 1. Add state
const [actionCount, setActionCount] = useState(0);
const maxActions = 3;

// 2. In your handler function
function handleAction() {
  if (actionCount >= maxActions) {
    alert("Limit reached!");
    return;
  }
  setActionCount(prev => prev + 1);
  // ... do the action ...
}

// 3. Reset when needed
function handleReset() {
  setActionCount(0);
}

// 4. Display count
<span>({actionCount}/{maxActions})</span>
```

### Hover Tooltip Template
```javascript
// 1. Add state
const [showTooltip, setShowTooltip] = useState(false);

// 2. Wrap your element
<div
  className="relative"
  onMouseEnter={() => setShowTooltip(true)}
  onMouseLeave={() => setShowTooltip(false)}
>
  {showTooltip && (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
      Your tooltip text here
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div className="border-8 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )}
  <button>Your Button</button>
</div>
```

---

## Testing Your Implementation

### Test Conditional Rendering
1. Log in as a user with `user_type = "school"` in Supabase
2. Navigate to the component - button should be hidden
3. Change user to `user_type = "individual"` in Supabase
4. Refresh - button should now appear

### Test Interaction Counter
1. Click the action button 3 times (or your max limit)
2. Try clicking again - should see alert/blocking message
3. Submit or reset - counter should reset
4. Should be able to perform action 3 more times

### Test Hover Tooltip
1. Hover your mouse over the button
2. Tooltip should appear above/beside the button
3. Move mouse away - tooltip should disappear
4. Tooltip should not interfere with clicking the button

---

## Common Pitfalls & Solutions

### Pitfall 1: State Not Updating
**Problem:** You changed user_type in Supabase but UI doesn't update.

**Solution:** The `useEffect` only runs once. You need to refresh the page or add a refresh button that re-fetches the data.

### Pitfall 2: Tooltip Doesn't Appear
**Problem:** Tooltip is behind other elements or cut off.

**Solution:** Make sure the parent container has `className="relative"` and tooltip has `z-50` or higher z-index.

### Pitfall 3: Counter Doesn't Reset
**Problem:** Counter keeps blocking action even after submission.

**Solution:** Make sure you call `setActionCount(0)` in your submit/reset handler.

### Pitfall 4: Condition Always Shows/Hides
**Problem:** Element always appears or never appears regardless of user type.

**Solution:**
- Check that `userType` state is being set correctly (add `console.log(userType)`)
- Verify the comparison matches your database values exactly (case-sensitive!)
- Make sure the useEffect is running (check for user authentication)

---

## Summary

You now have three reusable patterns:

1. **Conditional Rendering**: Show/hide elements based on user properties
   - Pattern: `{condition && <Component />}`

2. **Interaction Counter**: Limit how many times users can do something
   - Pattern: Check count → Increment on action → Reset when needed

3. **Hover Tooltip**: Provide contextual help on hover
   - Pattern: State + onMouseEnter/Leave + absolute positioned div

Copy the templates above and adapt them to your specific use cases throughout the application!
