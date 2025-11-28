# Word Snake Game Onboarding

## Overview

The Word Snake game now includes an intelligent first-time user onboarding that automatically appears the first time a user plays the game. The onboarding:

- **Detects device type** (mobile vs desktop) and shows appropriate controls
- **Adapts to difficulty level** (Easy vs Hard mode)
- **Shows only once** per difficulty level (stored in localStorage)
- **Beautiful animated UI** with step-by-step guidance

## How It Works

### Automatic Detection

When a user starts a Word Snake lesson for the first time, the system:

1. Checks `localStorage` for `wordSnakeOnboarding_{difficulty}_completed`
2. If not found, displays the onboarding modal
3. User goes through 4 interactive steps
4. On completion, sets localStorage flag
5. Future visits skip onboarding

### Device-Aware Instructions

The onboarding automatically detects the user's device:

**Desktop Users See:**
- Arrow key controls (↑ ↓ ← →)
- Keyboard layout visualization
- WASD alternative mention
- Backspace key for erasing (Hard mode)

**Mobile Users See:**
- Swipe gesture instructions
- Touch-friendly UI elements
- Visual swipe direction indicators
- On-screen eraser buttons (Hard mode)

### Difficulty-Specific Content

#### Easy Mode Tutorial
1. **Welcome** - Objective and goals
2. **Controls** - Device-appropriate movement instructions
3. **Gameplay** - Collect letters in order
4. **Ready** - Quick recap

#### Hard Mode Tutorial
1. **Welcome** - Objective and goals
2. **Controls** - Device-appropriate movement instructions
3. **Advanced** - Distractor letters and eraser mechanics
4. **Ready** - Quick recap with pro tips

## Components

### WordSnakeOnboarding.js
Location: `src/components/onboarding/WordSnakeOnboarding.js`

**Props:**
- `difficulty` - "easy" or "hard"
- `onComplete` - Callback when user finishes or skips
- `show` - Boolean to control visibility

**Features:**
- 4-step modal with progress bar
- Animated transitions (Framer Motion)
- Skip functionality
- Back/Next navigation
- Gradient UI matching game theme
- Lucide icons for visual clarity

### Integration Points

#### WordSnakeLesson.js (Easy Mode)
```javascript
// Checks localStorage on mount
useEffect(() => {
  const hasSeenOnboarding = localStorage.getItem(
    `wordSnakeOnboarding_${difficulty}_completed`
  );
  if (!hasSeenOnboarding) {
    setShowOnboarding(true);
  }
}, [difficulty]);

// Renders onboarding before game
{showOnboarding && (
  <WordSnakeOnboarding
    difficulty={difficulty}
    onComplete={() => setShowOnboarding(false)}
    show={showOnboarding}
  />
)}
```

#### WordSnakeLessonHarder.js (Hard Mode)
```javascript
// Same pattern, but hardcoded to "hard" mode
{showOnboarding && (
  <WordSnakeOnboarding
    difficulty="hard"
    onComplete={() => setShowOnboarding(false)}
    show={showOnboarding}
  />
)}
```

## User Flow

### First-Time User
1. Student opens a lesson with Word Snake step
2. Onboarding modal appears automatically
3. Student sees 4 tutorial steps with:
   - Game objective
   - Control instructions (device-specific)
   - Gameplay mechanics (difficulty-specific)
   - Quick recap
4. Student clicks "Start Playing!"
5. localStorage flag set
6. Game begins

### Returning User
1. Student opens another Word Snake lesson
2. localStorage flag exists
3. No onboarding shown
4. Game starts immediately

### Switching Difficulties
- Easy mode completion → localStorage: `wordSnakeOnboarding_easy_completed`
- Hard mode completion → localStorage: `wordSnakeOnboarding_hard_completed`
- If user plays Easy first, they'll still see onboarding for Hard later
- Each difficulty has its own tutorial

## Customization

### Adding New Steps

Edit `WordSnakeOnboarding.js` and add to the `steps` array:

```javascript
{
  title: "Your Step Title",
  icon: YourLucideIcon,
  content: (
    <div className="space-y-4">
      {/* Your content JSX */}
    </div>
  ),
}
```

### Changing Colors

The onboarding uses gradient colors from your theme:
- Primary gradient: `from-emerald-500 to-cyan-500`
- Background: `bg-white dark:bg-gray-800`
- All colors follow your dark mode settings

### Disabling Onboarding

To temporarily disable for testing:

```javascript
// In WordSnakeLesson.js or WordSnakeLessonHarder.js
// Comment out or remove:
// setShowOnboarding(true);
```

Or clear localStorage in browser console:
```javascript
localStorage.removeItem('wordSnakeOnboarding_easy_completed');
localStorage.removeItem('wordSnakeOnboarding_hard_completed');
```

## Technical Details

### localStorage Keys
- Easy mode: `wordSnakeOnboarding_easy_completed` → "true"
- Hard mode: `wordSnakeOnboarding_hard_completed` → "true"

### Device Detection
```javascript
const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
```

### Dependencies
- React (hooks: useState, useEffect)
- Framer Motion (animations)
- Lucide React (icons)
- Tailwind CSS (styling)

## Testing

### Test Onboarding Display
1. Clear localStorage: `localStorage.clear()`
2. Navigate to a lesson with Word Snake
3. Onboarding should appear

### Test Device Detection
1. Open DevTools
2. Toggle device toolbar (mobile view)
3. Refresh page
4. Should see swipe instructions instead of keyboard

### Test Difficulty Modes
1. Create two lessons: one Easy, one Hard
2. Complete Easy onboarding
3. Navigate to Hard lesson
4. Should see different onboarding with eraser instructions

### Test Skip Functionality
1. Click "Skip Tutorial" at any step
2. Should set localStorage and close modal
3. Refresh page - onboarding shouldn't appear

## Benefits

### For Users
- ✅ Clear instructions before frustration sets in
- ✅ Device-appropriate controls shown
- ✅ Difficulty-specific mechanics explained
- ✅ Only shown once (not annoying)
- ✅ Can skip if already familiar

### For Educators
- ✅ Reduces support questions about "how to play"
- ✅ Students start playing correctly from the beginning
- ✅ Better engagement (users understand the game)
- ✅ Automatic - no setup required

### For Developers
- ✅ Reusable component pattern
- ✅ Easy to customize
- ✅ localStorage persistence
- ✅ Fully responsive
- ✅ Follows existing design system

## Future Enhancements

Possible additions:
- [ ] Video demonstrations of gameplay
- [ ] Interactive practice round with overlay hints
- [ ] Hint system during actual gameplay for first few words
- [ ] Settings to "Show tutorial again" from game menu
- [ ] Analytics to track which steps users skip
- [ ] A/B testing different tutorial copy
- [ ] Multilingual support (Portuguese translation)

## Troubleshooting

### Onboarding doesn't appear
- Check browser console for errors
- Verify localStorage isn't blocked
- Check that `difficulty` prop is "easy" or "hard"
- Ensure component is imported correctly

### Wrong instructions shown (mobile vs desktop)
- Check viewport width (should be < 768px for mobile)
- Test on actual device, not just DevTools
- Verify user agent string detection

### Onboarding appears every time
- Check localStorage in DevTools → Application → Local Storage
- Verify key format: `wordSnakeOnboarding_{difficulty}_completed`
- Check for JavaScript errors preventing completion

### Styling issues
- Verify Tailwind classes are compiling
- Check dark mode is working elsewhere
- Ensure Framer Motion is installed
- Check for CSS conflicts

---

## Quick Reference

**File Locations:**
- Onboarding Component: `src/components/onboarding/WordSnakeOnboarding.js`
- Easy Mode Integration: `src/components/WordSnakeLesson.js`
- Hard Mode Integration: `src/components/WordSnakeLessonHarder.js`

**localStorage Keys:**
- `wordSnakeOnboarding_easy_completed`
- `wordSnakeOnboarding_hard_completed`

**Props:**
```typescript
{
  difficulty: "easy" | "hard",
  onComplete: () => void,
  show: boolean
}
```

---

Created to solve the common user issue: "I don't know what to do" when first seeing the Word Snake game. Now every user gets a perfect introduction! 🎮🐍
