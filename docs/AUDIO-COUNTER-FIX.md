# Audio Counter Fix: Count Only When Audio Ends

## Problem

When users clicked "Play", paused the audio, then clicked "Play" again, the counter would increment each time - even if they were listening to the same audio playthrough. This meant:

- User plays audio → Counter: 1/3
- User pauses at 5 seconds
- User plays again from 5 seconds → Counter: 2/3 ❌ (incorrectly counted as new play)

## Solution

We moved the counter increment from the **play start** to the **audio ended** event. Now:

- User plays audio → Counter: 0/3
- User pauses at 5 seconds → Counter: 0/3
- User plays again from 5 seconds → Counter: 0/3
- User lets audio finish → Counter: 1/3 ✅ (correctly counted as complete play)

---

## What Changed

### File: [src/components/MultiGapFillExerciseNew.js](src/components/MultiGapFillExerciseNew.js)

### **BEFORE** (Lines 710-738):

```javascript
if (!audioRef.current) {
  audioRef.current = new Audio(unitData.audio);

  audioRef.current.addEventListener("ended", () => {
    setIsPlaying(false);
    // Only set playing state here
  });
}

if (isPlaying) {
  audioRef.current.pause();
  setIsPlaying(false);
} else {
  setIsLoading(true);
  audioRef.current
    .play()
    .then(() => {
      setIsPlaying(true);
      // ❌ WRONG: Increment counter here (when play starts)
      if (!isSubmitted) {
        setAudioPlayCount((prev) => prev + 1);
      }
    })
    .catch((err) => {
      console.error("Audio playback failed:", err);
    })
    .finally(() => {
      setIsLoading(false);
    });
}
```

**Problem:** Counter increments in `.then()` when play starts, so every pause/resume increases the count.

---

### **AFTER** (Lines 710-742):

```javascript
if (!audioRef.current) {
  audioRef.current = new Audio(unitData.audio);

  // FEATURE 2: Increment play count when audio finishes (not when it starts)
  audioRef.current.addEventListener("ended", () => {
    setIsPlaying(false);

    // ✅ CORRECT: Only count as a "play" if user listened all the way to the end
    if (!isSubmitted) {
      setAudioPlayCount((prev) => prev + 1);
    }
  });
}

if (isPlaying) {
  audioRef.current.pause();
  setIsPlaying(false);
} else {
  setIsLoading(true);
  audioRef.current
    .play()
    .then(() => {
      setIsPlaying(true);
      // REMOVED: Don't increment here - only count when audio ends
    })
    .catch((err) => {
      console.error("Audio playback failed:", err);
    })
    .finally(() => {
      setIsLoading(false);
    });
}
```

**Solution:** Counter increments in `"ended"` event listener, so it only counts when audio finishes completely.

---

## Key Learning: Audio Events

### Audio Element Events

The HTML5 Audio API provides several useful events:

| Event | When It Fires | Use Case |
|-------|---------------|----------|
| `play` | When playback starts | Show play button → pause button |
| `pause` | When playback pauses | Show pause button → play button |
| `ended` | When audio reaches the end | Track complete listens, auto-advance |
| `timeupdate` | Continuously during playback | Show progress bar, track position |
| `loadstart` | When loading begins | Show loading spinner |
| `canplay` | When enough data is loaded | Hide loading spinner |
| `error` | When loading/playback fails | Show error message |

### Why We Used `"ended"`

The `"ended"` event **only fires once** when the audio reaches its natural end. It does NOT fire when:
- User pauses the audio
- User stops the audio manually
- User seeks to a different position
- Component unmounts

This makes it perfect for tracking "complete listens" because it guarantees the user heard the entire audio file.

---

## How to Apply This Pattern

### Pattern: Track Complete Actions (Not Start Actions)

Use this pattern whenever you want to limit how many times a user can **complete** an action, not just **start** it.

**Examples:**

### Example 1: Video Play Limit
```javascript
const [videoWatchCount, setVideoWatchCount] = useState(0);
const maxWatches = 2;

// Setup video element
if (!videoRef.current) {
  videoRef.current = document.createElement('video');

  // Count only when video ends
  videoRef.current.addEventListener("ended", () => {
    setVideoWatchCount(prev => prev + 1);
  });
}
```

### Example 2: Animation Complete Count
```javascript
const [animationCompleteCount, setAnimationCompleteCount] = useState(0);
const maxAnimations = 3;

// Count only when animation finishes
element.addEventListener("animationend", () => {
  setAnimationCompleteCount(prev => prev + 1);
});
```

### Example 3: Form Submission Attempts
```javascript
const [submitAttempts, setSubmitAttempts] = useState(0);
const maxAttempts = 3;

function handleSubmit(e) {
  e.preventDefault();

  // Check limit BEFORE attempting
  if (submitAttempts >= maxAttempts) {
    alert("Maximum attempts reached");
    return;
  }

  // Only increment AFTER successful submission
  submitForm().then(() => {
    setSubmitAttempts(prev => prev + 1); // ✅ Count on success
  });
}
```

---

## Testing the Fix

### Test Case 1: Pause and Resume
1. Click play audio button
2. Let it play for 2-3 seconds
3. Click pause
4. Counter should still show: **0/3** ✅
5. Click play again
6. Counter should still show: **0/3** ✅
7. Let audio finish completely
8. Counter should now show: **1/3** ✅

### Test Case 2: Multiple Complete Plays
1. Play audio to completion → Counter: **1/3** ✅
2. Play audio to completion → Counter: **2/3** ✅
3. Play audio to completion → Counter: **3/3** ✅
4. Try to play again → Alert: "You've reached the maximum" ✅

### Test Case 3: Pause Before End
1. Play audio, pause before it ends
2. Resume and let it finish → Counter: **1/3** ✅ (counts as 1, not 2)

### Test Case 4: Reset After Submit
1. Play to end 3 times → Counter: **3/3**
2. Submit answers
3. Counter resets to: **0/3** ✅
4. Can play 3 more complete times

---

## Updated Tooltip Text

The tooltip now clarifies the behavior:

**Old:**
> You can play this audio maximum 3 times before submitting. Listen carefully!

**New:**
> You can listen to the audio 3 times (to the end) before submitting. Listen carefully! You can pause anytime.

This makes it clear:
- ✅ Counter only increments at the end
- ✅ Pausing is allowed unlimited times
- ✅ Only complete listens count toward the limit

---

## Code Location

**File:** [src/components/MultiGapFillExerciseNew.js](src/components/MultiGapFillExerciseNew.js)

**Changes:**
- **Lines 713-721**: Moved counter increment to `"ended"` event
- **Lines 732-733**: Removed counter increment from `.then()`
- **Lines 805-816**: Updated tooltip text to clarify behavior

---

## Key Takeaway

When limiting user interactions:

❌ **Don't count when action STARTS**
```javascript
button.onClick(() => {
  setCount(prev => prev + 1); // ❌ Counts every click
  doAction();
});
```

✅ **Count when action COMPLETES**
```javascript
button.onClick(() => {
  doAction().then(() => {
    setCount(prev => prev + 1); // ✅ Counts only successful completions
  });
});
```

Or for media:
```javascript
audioElement.addEventListener("ended", () => {
  setCount(prev => prev + 1); // ✅ Counts only full listens
});
```

This ensures users aren't penalized for pausing, errors, or incomplete actions!
