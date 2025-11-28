# How to Let Users View Onboarding Again

## Overview

All three onboarding systems now have a "Show Tutorial Again" feature that allows users to revisit the tutorial whenever they want, without having to clear localStorage or refresh the page.

## Implementation Strategy

Instead of using a "Don't show this again" checkbox (which adds clutter and can be confusing), we implemented **accessible help buttons** that users can click when they need assistance.

### Why This Approach?

✅ **Cleaner UX** - First-time users see a focused tutorial without checkboxes
✅ **Always Available** - Help is there when users need it, not intrusive
✅ **Discoverable** - Clear help icon (?) in a consistent location
✅ **No Decision Fatigue** - Users don't have to think about checkboxes during onboarding

## 🎮 Word Snake Game - Help Button

### Location
**Top right of game header**, next to the score display

### Implementation

**Files Modified:**
- `src/components/WordSnakeLesson.js` (Easy mode)
- `src/components/WordSnakeLessonHarder.js` (Hard mode)

**Code Added:**
```javascript
{/* Help Button - Shows tutorial again */}
<button
  onClick={() => setShowOnboarding(true)}
  className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-800/50 transition-colors"
  title="Show tutorial again"
  aria-label="Show tutorial"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
</button>
```

### How It Works

1. User clicks the **?** button in game header
2. `setShowOnboarding(true)` is called
3. `WordSnakeOnboarding` modal appears again
4. User can go through the tutorial
5. On close, game continues where it was

**Key Point:** The button **doesn't clear localStorage** - it just toggles the modal visibility. This means:
- Tutorial shows again immediately
- But won't auto-show on future visits (unless user clicks button again)

### Visual Design

The help button:
- **Cyan/teal color** - Matches the game's theme
- **Rounded pill shape** - Modern, friendly
- **Hover effect** - Clear feedback
- **Dark mode support** - Looks great in both themes
- **Positioned top-right** - Consistent with web conventions

## 👨‍🎓 Student/Educator Onboarding - Restart Button Component

### Location
**Top right of Worlds page** (can be added anywhere)

### Implementation

**New Component Created:**
`src/components/onboarding/RestartOnboardingButton.js`

**Three Variants Available:**

#### 1. Button Variant (Full styled button)
```javascript
<RestartOnboardingButton variant="button" />
// or with custom text:
<RestartOnboardingButton variant="button">
  Take the Tour Again
</RestartOnboardingButton>
```

**Appearance:**
Large gradient button with icon and text: "View Tutorial Again"

**Use Case:** Settings pages, help menus, profile pages

---

#### 2. Link Variant (Text link style)
```javascript
<RestartOnboardingButton variant="link" />
// or with custom text:
<RestartOnboardingButton variant="link">
  Need help? View the tutorial
</RestartOnboardingButton>
```

**Appearance:**
Small text link with icon, cyan color, underline on hover

**Use Case:** Footer links, inline help text, navigation menus

---

#### 3. Icon Variant (Icon button only) ⭐ **Recommended**
```javascript
<RestartOnboardingButton variant="icon" />
```

**Appearance:**
Just the refresh icon (RotateCcw), same style as Word Snake help button

**Use Case:** Headers, toolbars (like we added to Worlds page)

### How It Works

1. Component uses `useOnboarding()` hook from OnboardingProvider
2. Calls `restartOnboarding()` when clicked
3. This sets `onboardingComplete` to `false` in the provider
4. OnboardingProvider re-renders and shows the modal
5. User sees Student or Educator onboarding based on their role

**Important:** This approach:
- ✅ Respects user roles (shows correct onboarding)
- ✅ Works immediately (no page refresh needed)
- ✅ Doesn't clear database (just local state)
- ✅ Can be added anywhere in the app

### Example Placements

#### Already Implemented:
```javascript
// src/app/(site)/worlds/page.js
import RestartOnboardingButton from "@/components/onboarding/RestartOnboardingButton";

<div className="flex justify-end mb-4">
  <RestartOnboardingButton variant="icon" />
</div>
```

#### Other Suggested Locations:

**In a Settings Page:**
```javascript
<div className="space-y-4">
  <h3>Help & Support</h3>
  <RestartOnboardingButton variant="button">
    View Welcome Tutorial Again
  </RestartOnboardingButton>
</div>
```

**In a User Menu Dropdown:**
```javascript
<DropdownMenuItem>
  <RestartOnboardingButton variant="link">
    Show Tutorial
  </RestartOnboardingButton>
</DropdownMenuItem>
```

**In a Footer:**
```javascript
<footer>
  <nav>
    <RestartOnboardingButton variant="link">
      Tutorial
    </RestartOnboardingButton>
  </nav>
</footer>
```

## 🎨 Customization

### Changing Button Appearance

All variants accept a `className` prop for custom styling:

```javascript
<RestartOnboardingButton
  variant="button"
  className="w-full text-lg"  // Full width, larger text
>
  Custom Text Here
</RestartOnboardingButton>
```

### Changing Button Text

Pass children to override default text:

```javascript
<RestartOnboardingButton variant="link">
  🎓 Replay Welcome Tour
</RestartOnboardingButton>
```

### Creating Your Own Custom Button

If you want complete control:

```javascript
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

function MyCustomHelpButton() {
  const { restartOnboarding } = useOnboarding();

  return (
    <button
      onClick={restartOnboarding}
      className="your-custom-classes"
    >
      Your Custom Content
    </button>
  );
}
```

## 🔧 Technical Details

### Word Snake Onboarding

**State Management:**
```javascript
const [showOnboarding, setShowOnboarding] = useState(false);

// Check localStorage on mount
useEffect(() => {
  const hasSeenOnboarding = localStorage.getItem(
    `wordSnakeOnboarding_${difficulty}_completed`
  );
  if (!hasSeenOnboarding) {
    setShowOnboarding(true);
  }
}, [difficulty]);
```

**Restart Mechanism:**
```javascript
<button onClick={() => setShowOnboarding(true)}>
  Show Tutorial
</button>
```

Simple! Just sets local state to `true`. The `WordSnakeOnboarding` component:
- Is always in the DOM (conditional render based on `showOnboarding`)
- Responds to state change immediately
- localStorage flag is **not** cleared (so it won't auto-show on page load)

### Student/Educator Onboarding

**Provider State:**
```javascript
const [onboardingComplete, setOnboardingComplete] = useState(true);

const restartOnboarding = () => {
  setOnboardingComplete(false);
};
```

**Restart Component:**
```javascript
export default function RestartOnboardingButton({ variant }) {
  const { restartOnboarding } = useOnboarding();

  const handleClick = () => {
    restartOnboarding();
    console.log("Onboarding restarted");
  };

  return <button onClick={handleClick}>...</button>;
}
```

**Provider Re-render:**
```javascript
return (
  <OnboardingContext.Provider value={value}>
    {children}
    {!onboardingComplete && user && (
      <>
        {isEducator ? (
          <EducatorOnboarding onComplete={completeOnboarding} />
        ) : (
          <StudentOnboarding onComplete={completeOnboarding} />
        )}
      </>
    )}
  </OnboardingContext.Provider>
);
```

When `onboardingComplete` becomes `false`, the modal renders!

## 📊 Comparison with Other Approaches

### ❌ "Don't show this again" Checkbox

**Pros:**
- Users have explicit control

**Cons:**
- Clutters the UI
- Adds cognitive load during first experience
- Easy to accidentally check and lose access to tutorial
- Negative framing ("don't show")

### ❌ Settings Toggle

**Pros:**
- Centralized control

**Cons:**
- Hard to discover
- Users need to know where settings are
- Requires navigation away from current task

### ✅ Help Button (Our Approach)

**Pros:**
- Clean first-time experience
- Always discoverable (visible icon)
- Positive framing (get help when needed)
- No accidental dismissal
- In-context (where users need it)

**Cons:**
- Takes up a small amount of UI space

**Verdict:** Best balance of discoverability, usability, and clean design.

## 🧪 Testing

### Test Word Snake Help Button

1. Play a Word Snake lesson
2. Click the **?** icon in top-right
3. Tutorial should appear again
4. Close it
5. Click **?** again - should work every time

### Test Student/Educator Restart Button

1. Go to Worlds page
2. Click the **refresh icon** in top-right
3. Onboarding should appear based on your role:
   - Students → 5-step student onboarding
   - Teachers/Coordinators → 6-step educator onboarding
4. Complete or skip it
5. Click the icon again - should work every time

### Test Custom Placements

1. Add `RestartOnboardingButton` to any page
2. Click it
3. Should trigger onboarding restart

## 📝 Quick Reference

### Word Snake

**Location:** Game header (top-right)
**Trigger:** Click **?** icon
**Effect:** Shows `WordSnakeOnboarding` modal
**Files:** `WordSnakeLesson.js`, `WordSnakeLessonHarder.js`

### Student/Educator

**Component:** `RestartOnboardingButton`
**Import:** `import RestartOnboardingButton from "@/components/onboarding/RestartOnboardingButton"`
**Variants:** `button`, `link`, `icon`
**Current Placement:** Worlds page (top-right)

### Adding to New Locations

```javascript
import RestartOnboardingButton from "@/components/onboarding/RestartOnboardingButton";

// Icon only (recommended for headers/toolbars)
<RestartOnboardingButton variant="icon" />

// Full button (good for settings pages)
<RestartOnboardingButton variant="button">
  Custom Text
</RestartOnboardingButton>

// Text link (good for menus/footers)
<RestartOnboardingButton variant="link" />
```

## 🎯 Summary

**Word Snake:** Simple state toggle with help icon
**Student/Educator:** Reusable component with 3 variants
**Philosophy:** Help is always available, never intrusive
**Result:** Clean UX with accessible help when needed

---

**Pro Tip:** You can add the `RestartOnboardingButton` to ANY page in your app. Just import it and drop it in. It automatically:
- Uses the correct user role
- Shows the right onboarding
- Works with your existing provider
- Requires zero configuration

Easy to implement, easy to customize, easy to understand! 🎉
