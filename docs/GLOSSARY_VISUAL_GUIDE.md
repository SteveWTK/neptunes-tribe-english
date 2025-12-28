# Glossary Feature - Visual Guide

## How It Looks to Users

### 1. Before Interaction (Desktop)

```
Normal text flows here, and when a user hovers over a
                                  ︙︙︙︙︙︙︙
glossary term like "ecosystem", they see a subtle dotted
                    ︙︙︙︙︙︙︙︙︙︙
underline indicating it's clickable.
```

The underline is teal-colored (`rgb(13 148 136)`) and uses a dotted style.

### 2. On Click - Tooltip Appears

```
┌─────────────────────────────────────┐
│ ecosystem                         ✕ │  ← Term + Close button
│ ecossistema                         │  ← Translation
├─────────────────────────────────────┤
│ Notes:                              │
│ A biological community of           │
│ interacting organisms and their     │
│ physical environment.               │
├─────────────────────────────────────┤
│ [📌 Save for Practice            ] │  ← Action button
└─────────────────────────────────────┘
```

**Tooltip Features**:
- White background with teal border
- Drop shadow for depth
- Responsive positioning (adjusts if near screen edge)
- Click outside to close

### 3. After Saving

```
┌─────────────────────────────────────┐
│ ecosystem                         ✕ │
│ ecossistema                         │
├─────────────────────────────────────┤
│ Notes:                              │
│ A biological community of           │
│ interacting organisms and their     │
│ physical environment.               │
├─────────────────────────────────────┤
│ [✓ Saved to Practice List       ] │  ← Green, disabled
└─────────────────────────────────────┘
```

Toast notification appears:
```
┌─────────────────────────────────────┐
│ ✓ "ecosystem" saved to your         │
│   practice list!                    │
│   You can practice it later in      │
│   vocabulary games                  │
└─────────────────────────────────────┘
```

## Where It Appears

### Full Text View

When user clicks "Show Full Text":

```
┌──────────────────────────────────────────┐
│  [Show Gap Fill]  [Translation ▼]       │
├──────────────────────────────────────────┤
│                                          │
│  The rainforest ecosystem is home to    │
│            ︙︙︙︙︙︙︙︙︙︙                    │
│  incredible biodiversity. Many          │
│            ︙︙︙︙︙︙︙︙︙︙︙︙                    │
│  endangered species live here...        │
│  ︙︙︙︙︙︙︙︙︙︙ ︙︙︙︙︙︙︙                        │
│                                          │
└──────────────────────────────────────────┘
```

### Gap Fill View

Text between gaps also has glossary terms:

```
┌──────────────────────────────────────────┐
│  [Show Full Text]  [Translation ▼]      │
├──────────────────────────────────────────┤
│                                          │
│  The rainforest ecosystem is home to    │
│            ︙︙︙︙︙︙︙︙︙︙                    │
│  incredible [Select ▼]. Many species    │
│                                          │
│  live in this [Select ▼] and depend     │
│  on forest conservation.                │
│         ︙︙︙︙︙︙ ︙︙︙︙︙︙︙︙︙︙︙︙                  │
│                                          │
└──────────────────────────────────────────┘
```

## Multi-word Phrase Example

When you have both "climate" and "climate change" in glossary:

```
Text: "Climate change is affecting our planet."
       ︙︙︙︙︙︙︙︙︙︙︙︙︙︙
       ↑ "climate change" matched as complete phrase
       ↑ NOT split into "climate" + "change"
```

The system prioritizes longer phrases over individual words.

## Different States

### 1. Unsaved Term (Default)
```
┌─────────────────────────────────────┐
│ [📌 Save for Practice            ] │  Blue/Primary color
└─────────────────────────────────────┘
     Cursor: pointer, hover effect
```

### 2. Saving (Loading)
```
┌─────────────────────────────────────┐
│ [   Saving...                    ] │  Slightly dimmed
└─────────────────────────────────────┘
     Cursor: default, no hover
```

### 3. Already Saved
```
┌─────────────────────────────────────┐
│ [✓ Saved to Practice List        ] │  Green background
└─────────────────────────────────────┘
     Cursor: default, disabled
```

## Difficulty Level Filtering

### Beginner User Sees:
```
Text with these terms underlined:
- habitat
- pollution
- conservation
(Only Beginner level terms)
```

### Intermediate User Sees:
```
Text with these terms underlined:
- habitat (Beginner)
- pollution (Beginner)
- conservation (Beginner)
- biodiversity (Intermediate)
- deforestation (Intermediate)
- sustainable (Intermediate)
```

### Advanced User Sees:
```
Text with ALL terms underlined:
- (All Beginner terms)
- (All Intermediate terms)
- climate change (Advanced)
- renewable energy (Advanced)
```

### Terms Marked 'all':
```
Always visible to everyone, regardless of level
```

## Mobile Experience

On mobile devices (touch screens):

1. **No hover state** (no dotted underline until after click)
2. **Tap to open** tooltip
3. **Tap outside** to close
4. **Tooltip repositions** to stay on screen

## Color Scheme

- **Glossary underline**: Teal (`rgb(13 148 136)`)
- **Tooltip border**: Teal (`border-teal-200`)
- **Tooltip background**: White/Dark mode adaptive
- **Save button**: Primary blue (unsaved), Green (saved)
- **Notes section**: Light gray background

## Accessibility

- **Keyboard navigation**: Tab to term, Enter to open
- **Screen readers**: Terms announced with "clickable"
- **Focus visible**: Outline on keyboard focus
- **Color contrast**: WCAG AA compliant
- **Close button**: Labeled "Close tooltip"

## Examples in Context

### Example 1: Simple Term

**Text**: "The ocean contains diverse marine life."
          ︙︙︙︙︙

**Click "ocean"**:
```
┌─────────────────────────────────────┐
│ ocean                             ✕ │
│ oceano                              │
├─────────────────────────────────────┤
│ Notes:                              │
│ A large body of salt water.         │
├─────────────────────────────────────┤
│ [📌 Save for Practice            ] │
└─────────────────────────────────────┘
```

### Example 2: Multi-word Phrase

**Text**: "Climate change affects weather patterns."
          ︙︙︙︙︙︙︙︙︙︙︙︙︙︙

**Click "climate change"**:
```
┌─────────────────────────────────────┐
│ climate change                    ✕ │
│ mudança climática                   │
├─────────────────────────────────────┤
│ Notes:                              │
│ Long-term shifts in global          │
│ temperatures and weather patterns.  │
├─────────────────────────────────────┤
│ [📌 Save for Practice            ] │
└─────────────────────────────────────┘
```

### Example 3: Term with Multiple Translations

**Text**: "Biodiversity is crucial for ecosystems."
          ︙︙︙︙︙︙︙︙︙︙︙︙

**Click "biodiversity"** (with language selector set to Portuguese):
```
┌─────────────────────────────────────┐
│ biodiversity                      ✕ │
│ biodiversidade                      │
├─────────────────────────────────────┤
│ Notes:                              │
│ The variety of plant and animal     │
│ life in a particular habitat.       │
├─────────────────────────────────────┤
│ [📌 Save for Practice            ] │
└─────────────────────────────────────┘
```

If language selector changed to Spanish:
```
┌─────────────────────────────────────┐
│ biodiversity                      ✕ │
│ biodiversidad                       │  ← Spanish translation
├─────────────────────────────────────┤
│ Notes:                              │
│ The variety of plant and animal     │
│ life in a particular habitat.       │
├─────────────────────────────────────┤
│ [📌 Save for Practice            ] │
└─────────────────────────────────────┘
```

## Positioning Examples

### Normal Position (Below Term)
```
Text with glossary ecosystem here
              ︙︙︙︙︙︙︙︙︙︙
              ┌─────────────┐
              │ ecosystem ✕ │
              │ ecossistema │
              └─────────────┘
```

### Near Bottom Edge (Above Term)
```
              ┌─────────────┐
              │ ecosystem ✕ │
              │ ecossistema │
              └─────────────┘
Text with glossary ecosystem here
              ︙︙︙︙︙︙︙︙︙︙
─────────────────────────────────── (bottom of viewport)
```

### Near Right Edge (Adjusted Left)
```
              This text contains ecosystem
                          ┌─────────────┐
                          │ ecosystem ✕ │
                          │ ecossistema │
                          └─────────────┘
                                          │ (right edge)
```

## Animation

Tooltip appears with subtle animation:
- **Fade in**: 0-100% opacity
- **Scale**: 95% → 100%
- **Duration**: 200ms
- **Easing**: Ease-out

## Summary

The glossary feature provides a seamless, elegant way for users to:
1. Discover glossary terms while reading (hover for hint)
2. Learn translations by clicking terms
3. Read contextual notes for better understanding
4. Save interesting words for later practice
5. Build their personal vocabulary list

All without leaving the reading experience!
