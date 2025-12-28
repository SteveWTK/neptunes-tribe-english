-- Create glossary table for inline word/phrase translations and notes
create table public.glossary (
  id serial not null,
  term text not null unique, -- The English word or phrase (case-insensitive matching)
  translation_pt text not null, -- Brazilian Portuguese translation
  translation_es text null, -- Spanish translation (for future expansion)
  translation_fr text null, -- French translation (for future expansion)
  notes text null, -- Additional notes or explanations
  difficulty_level text null default 'all', -- 'Beginner', 'Intermediate', 'Advanced', or 'all'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint glossary_pkey primary key (id)
) tablespace pg_default;

-- Create index for faster term lookups
create index idx_glossary_term on public.glossary (lower(term));

-- Create index for difficulty level filtering
create index idx_glossary_difficulty on public.glossary (difficulty_level);

-- Add comment to table
comment on table public.glossary is 'Global glossary for inline translations and notes across all texts';

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_glossary_updated_at
  before update on public.glossary
  for each row
  execute function update_updated_at_column();
