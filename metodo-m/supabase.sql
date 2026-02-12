-- Create table for tracking user progress
create table user_progress (
  user_id uuid references auth.users not null,
  lesson_slug text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, lesson_slug)
);

-- Create table for affiliate/surprise items
create table affiliate_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  url text not null,
  category text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table user_progress enable row level security;
alter table affiliate_items enable row level security;

-- Policies for user_progress
-- Users can view their own progress
create policy "Users can view their own progress"
  on user_progress for select
  using (auth.uid() = user_id);

-- Users can insert their own progress
create policy "Users can insert their own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

-- Users can delete their own progress (unmark as complete)
create policy "Users can delete their own progress"
  on user_progress for delete
  using (auth.uid() = user_id);

-- Policies for affiliate_items
-- Everyone (authenticated) can view items, but UI logic handles the lock
-- Ideally, we could check progress in a policy, but for simplicity/performance we let the frontend check constraints
-- or use a secure database function. For now, we allow authenticated users to read.
create policy "Authenticated users can view items"
  on affiliate_items for select
  to authenticated
  using (true);

-- Only service role/admins can manage items (no public policy for insert/update/delete)

-- Seed some example data
insert into affiliate_items (name, url, category, description) values
('Óculos Bloqueador de Luz Azul', 'https://amazon.com.br/exemplo-oculos', 'Sono', 'Bloqueia 98% da luz azul. Essencial para melatonina.'),
('Magnésio Treonato', 'https://amazon.com.br/exemplo-magnesio', 'Suplemento', 'A única forma que atravessa a barreira hematoencefálica.'),
('Oura Ring 3', 'https://ouraring.com', 'Tech', 'O melhor rastreador de sono do mercado.');
