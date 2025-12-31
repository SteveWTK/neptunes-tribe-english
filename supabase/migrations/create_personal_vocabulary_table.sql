-- Create personal_vocabulary table if it doesn't exist
-- This table stores user-saved vocabulary for practice

create table if not exists public.personal_vocabulary (
  id serial not null,
  user_id integer not null,
  english text not null,
  portuguese text not null,
  english_image text null,
  portuguese_image text null,
  lesson_id integer null,
  step_type text null,
  times_practiced integer default 0,
  last_practiced_at timestamp with time zone null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint personal_vocabulary_pkey primary key (id),
  constraint personal_vocabulary_user_id_fkey foreign key (user_id) references users (id) on delete cascade
) tablespace pg_default;

-- Create indexes for performance
create index if not exists idx_personal_vocabulary_user_id on public.personal_vocabulary (user_id);
create index if not exists idx_personal_vocabulary_english on public.personal_vocabulary (lower(english));

-- Add unique constraint to prevent duplicate words for same user
create unique index if not exists idx_personal_vocabulary_user_english
  on public.personal_vocabulary (user_id, lower(english));

-- Add comment
comment on table public.personal_vocabulary is 'User-saved vocabulary for personalized practice';

-- Add trigger to update updated_at timestamp
create or replace function update_personal_vocabulary_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_personal_vocabulary_updated_at on public.personal_vocabulary;
create trigger update_personal_vocabulary_updated_at
  before update on public.personal_vocabulary
  for each row
  execute function update_personal_vocabulary_updated_at();
