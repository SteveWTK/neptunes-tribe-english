# Glossary Feature - Quick Start Guide

## Setup (One-time)

### 1. Run Database Migration

In your Supabase SQL Editor, run:

```sql
-- Create the glossary table
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

create index idx_glossary_term on public.glossary (lower(term));
create index idx_glossary_difficulty on public.glossary (difficulty_level);
```

### 2. Add Sample Data (Optional)

```sql
INSERT INTO public.glossary (term, translation_pt, notes, difficulty_level) VALUES
  ('ecosystem', 'ecossistema', 'A biological community of interacting organisms and their physical environment.', 'Beginner'),
  ('habitat', 'habitat', 'The natural home or environment of an animal, plant, or other organism.', 'Beginner'),
  ('climate change', 'mudança climática', 'Long-term shifts in global temperatures and weather patterns.', 'Advanced');
```

## Adding New Terms

### Simple SQL Insert

```sql
INSERT INTO public.glossary (term, translation_pt, notes, difficulty_level)
VALUES ('YOUR_TERM', 'PORTUGUESE_TRANSLATION', 'OPTIONAL_NOTES', 'Beginner');
```

### Examples

**Single word:**
```sql
INSERT INTO public.glossary (term, translation_pt, notes, difficulty_level)
VALUES ('ocean', 'oceano', 'A large body of salt water.', 'Beginner');
```

**Multi-word phrase:**
```sql
INSERT INTO public.glossary (term, translation_pt, notes, difficulty_level)
VALUES ('renewable energy', 'energia renovável', 'Energy from naturally replenishing sources.', 'Intermediate');
```

**With all translations:**
```sql
INSERT INTO public.glossary (term, translation_pt, translation_es, translation_fr, notes, difficulty_level)
VALUES (
  'biodiversity',
  'biodiversidade',
  'biodiversidad',
  'biodiversité',
  'The variety of plant and animal life in a habitat.',
  'Intermediate'
);
```

## Difficulty Levels

- **'Beginner'**: Basic vocabulary - shown only to Beginner users
- **'Intermediate'**: Moderate difficulty - shown to Beginner and Intermediate users
- **'Advanced'**: Complex terms - shown to all users
- **'all'** or **NULL**: Universal terms - shown to everyone

## How Users See It

1. **Hover (Desktop)**: Dotted teal underline appears under glossary words
2. **Click**: Elegant tooltip shows:
   - The term
   - Translation in their selected language (currently Portuguese)
   - Notes (if available)
   - "Save for Practice" button
3. **Save**: Adds word to their personal vocabulary list for later practice

## Where It Appears

The glossary feature works in:
- ✅ Full Text view (when user clicks "Show Full Text")
- ✅ Gap Fill view (text between the gaps)
- ✅ Unit Modals (when units are embedded in Activity Flows)

## Tips

1. **Start with common eco-words**: Focus on terms that appear across multiple texts
2. **Add phrases**: Include common expressions like "global warming", "food chain"
3. **Keep notes short**: 1-2 sentences explaining the term in context
4. **Use consistent translations**: Check existing entries for similar terms
5. **Test as you go**: Add a few terms, then test them in a unit to see how they look

## Testing Your Glossary Terms

1. Add a glossary term via SQL
2. Make sure the term appears in one of your unit texts
3. Open that unit in the app
4. Look for the dotted underline when hovering over the word
5. Click to see the tooltip with translation and notes

## Common Questions

**Q: Can I add the same word with different meanings?**
A: Currently, each term can only appear once. Use the notes field to clarify different meanings or contexts.

**Q: What if I want to add a term that's part of a longer phrase?**
A: Add both! The system prioritizes longer phrases, so "climate change" will be matched before "climate" alone.

**Q: How do I edit existing terms?**
A: Use the Supabase Table Editor or run an UPDATE query:
```sql
UPDATE public.glossary
SET translation_pt = 'nova tradução', notes = 'new notes'
WHERE term = 'your_term';
```

**Q: How do I delete a term?**
A:
```sql
DELETE FROM public.glossary WHERE term = 'your_term';
```

## Next Steps

1. ✅ Run the database migration
2. ✅ Add your first few glossary terms
3. ✅ Test in a unit
4. ✅ Gradually build up your glossary as you review texts
5. ✅ Consider creating a spreadsheet of common eco-vocabulary to batch-import

For more detailed information, see [GLOSSARY_FEATURE.md](./GLOSSARY_FEATURE.md)
