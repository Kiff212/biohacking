-- 1. Create the whitelist table
create table if not exists admin_whitelist (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table admin_whitelist enable row level security;

-- 3. Policy: Users can strictly read ONLY their own record (to check if they are admin)
create policy "Users can check own admin status"
  on admin_whitelist
  for select
  using ( auth.uid() = user_id );

-- 4. Insert the specific User ID as the first Admin
insert into admin_whitelist (user_id)
values ('ec9c19f0-edf8-4caf-b4af-f09c9fa916f5')
on conflict (user_id) do nothing;

----------- SECURING THE PRODUCTS TABLE -----------

-- 5. Drop the old "Authenticated users" policy if it exists
drop policy if exists "Authenticated users can modify products" on affiliate_products;

-- 6. Create the restricted policy
create policy "Only admins can modify products"
  on affiliate_products
  for all
  using ( 
    auth.uid() in (select user_id from admin_whitelist) 
  );
