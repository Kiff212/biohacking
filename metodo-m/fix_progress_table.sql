-- Drop the table to start fresh (WARNING: DELETES DATA, BUT THIS IS DEV)
drop table if exists user_progress;

-- Re-create with correct constraint
create table user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  lesson_slug text not null,
  completed boolean default false,
  completed_at timestamp with time zone default now(),
  -- Named unique constraint for ON CONFLICT
  constraint user_progress_unique_entry unique (user_id, lesson_slug)
);

-- Enable RLS
alter table user_progress enable row level security;

-- Policies
create policy "Users can view own progress" 
  on user_progress for select 
  using (auth.uid() = user_id);

create policy "Users can insert/update own progress" 
  on user_progress for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own progress" 
  on user_progress for update 
  using (auth.uid() = user_id);

-- Explicitly handle upsert conflict policy if needed (but standard RLS usually covers it)
