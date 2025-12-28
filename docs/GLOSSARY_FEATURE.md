# Glossary Feature Documentation

## Overview

The glossary feature provides inline translations and notes for English words and phrases across all texts in Habitat English. When users encounter a glossary term while reading, they can click on it to see:
- Translation in Brazilian Portuguese (with support for Spanish and French)
- Additional notes and explanations
- A "Save for Practice" button to add words to their personal vocabulary list

## Features

### User Experience
- **Hover Preview**: Desktop users see a dotted underline when hovering over glossary terms
- **Click to View**: Clicking a term opens an elegant tooltip with translation and notes
- **Save for Practice**: Users can save glossary terms to their personal vocabulary list for later practice
- **Level-Based Filtering**: Glossary terms are filtered based on user difficulty level (Beginner, Intermediate, Advanced)
- **Multi-word Support**: The system handles both single words (e.g., "habitat") and phrases (e.g., "climate change")
- **Language Support**: Currently showing Brazilian Portuguese, expandable to Spanish and French

### Integration
The glossary feature is automatically integrated into:
- **Full Text View**: When users click "Show Full Text" in units
- **Gap Fill View**: Words in the text surrounding the gaps also show glossary tooltips
- **Unit Modals**: When units are opened in lesson flows (Activity Flows)

## Database Schema

### Glossary Table

```sql
create table public.glossary (
  id serial not null,
  term text not null unique,
  translation_pt text not null,
  translation_es text null,
  translation_fr text null,
  notes text null,
  difficulty_level text null default 'all',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint glossary_pkey primary key (id)
);
```

### Fields:
- **term**: The English word or phrase (case-insensitive matching)
- **translation_pt**: Brazilian Portuguese translation (required)
- **translation_es**: Spanish translation (optional, for future expansion)
- **translation_fr**: French translation (optional, for future expansion)
- **notes**: Additional explanations, usage notes, or context
- **difficulty_level**: One of: 'Beginner', 'Intermediate', 'Advanced', or 'all'
  - 'all': Shows at all levels
  - 'Beginner': Shows for Beginner users only
  - 'Intermediate': Shows for Beginner and Intermediate users
  - 'Advanced': Shows for all users (Beginner, Intermediate, Advanced)

## How to Add Glossary Terms

### Option 1: Direct SQL Insert (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run an INSERT statement:

```sql
INSERT INTO public.glossary (term, translation_pt, translation_es, translation_fr, notes, difficulty_level)
VALUES (
  'ecosystem',
  'ecossistema',
  'ecosistema',
  'écosystème',
  'A biological community of interacting organisms and their physical environment.',
  'Beginner'
);
```

### Option 2: Bulk Import via CSV

1. Prepare a CSV file with columns: term, translation_pt, translation_es, translation_fr, notes, difficulty_level
2. In Supabase Dashboard, go to Table Editor > glossary
3. Click "Insert" > "Import data from CSV"
4. Upload your CSV file

### Option 3: Using Supabase Table Editor

1. Open Supabase Dashboard
2. Go to Table Editor > glossary
3. Click "+ Insert row"
4. Fill in the fields
5. Click "Save"

## Adding Translations

### For New Languages

To add support for a new language (e.g., Thai):

1. **Update the database schema**:
```sql
ALTER TABLE public.glossary ADD COLUMN translation_th text null;
```

2. **Update the GlossaryTooltip component** to accept the new language in the selectedLanguage prop

3. **Add the language to the translation selector** in MultiGapFillExerciseNew.js

## Managing Difficulty Levels

The difficulty_level field controls which users see which terms:

- **'all'** or **NULL**: Visible to all users regardless of level
- **'Beginner'**: Only shown to Beginner users
- **'Intermediate'**: Shown to Beginner and Intermediate users
- **'Advanced'**: Shown to all users (including Beginner and Intermediate)

The logic ensures that:
- Beginner users see all terms at their level
- As users progress, they continue to see terms from previous levels plus new ones
- Advanced users see all glossary terms

## Best Practices

### Term Selection
1. **Prioritize key vocabulary**: Focus on eco-related terms that appear frequently across texts
2. **Include multi-word expressions**: Add common phrases like "climate change", "renewable energy"
3. **Consider context**: Add notes to clarify usage when a word has multiple meanings

### Writing Notes
1. Keep notes concise and clear
2. Focus on usage and context relevant to eco-topics
3. Use simple English in notes to aid comprehension
4. Include examples when helpful

### Difficulty Assignment
1. **Beginner**: Common, everyday eco-vocabulary
2. **Intermediate**: More specific scientific or technical terms
3. **Advanced**: Specialized terminology, complex concepts
4. **'all'**: Universal terms needed at all levels

### Multi-word Phrases
- The system automatically handles phrase priority (longer phrases matched first)
- Example: If you have "climate" and "climate change" in the glossary, "climate change" will be matched first
- This prevents "climate" from being highlighted within "climate change"

## File Structure

```
src/
├── components/
│   ├── GlossaryTooltip.js          # Tooltip component for glossary terms
│   ├── TextWithGlossary.js         # Wrapper component that parses text
│   └── MultiGapFillExerciseNew.js  # Main unit component (updated with glossary)
├── lib/
│   └── glossaryUtils.js            # Utility functions for parsing and filtering
supabase/
└── migrations/
    ├── create_glossary_table.sql   # Table creation migration
    └── sample_glossary_data.sql    # Sample data for testing
```

## Technical Details

### Text Parsing Algorithm

The `parseTextWithGlossary` function in `lib/glossaryUtils.js`:
1. Sorts glossary terms by length (longest first)
2. Creates a regex pattern matching all terms with word boundaries
3. Splits the text while preserving matched terms
4. Returns an array of segments (text or glossary)

### Word Boundary Matching

The system uses `\b` (word boundary) in regex to ensure:
- "habitat" matches "habitat" in "The habitat is..."
- "habitat" does NOT match within "inhabitable"
- "climate change" matches as a complete phrase

### Performance Considerations

- Glossary terms are fetched once when the component mounts
- Terms are filtered client-side by difficulty level
- Text parsing happens on-demand using React's useMemo for optimization

## Troubleshooting

### Terms Not Showing Up

1. **Check the database**: Verify the term exists in the glossary table
2. **Check difficulty level**: Ensure the user's level allows viewing the term
3. **Check spelling**: Term matching is case-insensitive but spelling must be exact
4. **Check word boundaries**: Make sure the term appears as a complete word/phrase

### Tooltips Not Opening

1. **Check browser console**: Look for JavaScript errors
2. **Verify Sonner is installed**: The feature uses the sonner library for toasts
3. **Check z-index conflicts**: Ensure no other elements are covering the tooltip

### Save Button Not Working

1. **Check authentication**: User must be logged in
2. **Verify API endpoint**: Ensure `/api/vocabulary/personal` is functioning
3. **Check browser console**: Look for network errors

## Future Enhancements

Potential improvements to consider:
- Admin interface for managing glossary terms
- Bulk import/export functionality
- Usage analytics (which terms users click most)
- User-submitted translations or notes
- Audio pronunciations
- Integration with AI for automatic term suggestions
- Context-aware translations based on sentence structure

## Migration Steps

To deploy this feature to production:

1. **Run database migrations**:
```bash
# Apply the glossary table schema
psql -h your-db-host -U postgres -d your-db -f supabase/migrations/create_glossary_table.sql

# Optionally add sample data
psql -h your-db-host -U postgres -d your-db -f supabase/migrations/sample_glossary_data.sql
```

2. **Install dependencies** (if not already installed):
```bash
npm install sonner canvas-confetti
```

3. **Deploy code changes**: Push the updated components to your hosting platform

4. **Populate glossary**: Add your eco-related terms to the glossary table

5. **Test**: Verify the feature works in development before deploying to production

## Support

For questions or issues with the glossary feature, please refer to:
- This documentation
- The inline code comments in the component files
- The Supabase documentation for database operations
