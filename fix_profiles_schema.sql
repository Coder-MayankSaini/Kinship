-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  first_name text,
  last_name text,
  phone text,
  location text,
  bio text,
  avatar text,
  joined_date timestamp with time zone default timezone('utc'::text, now()),
  rating numeric default 0,
  review_count integer default 0,
  items_listed integer default 0,
  items_rented integer default 0
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone" 
on public.profiles for select 
using ( true );

create policy "Users can insert their own profile" 
on public.profiles for insert 
with check ( auth.uid() = id );

create policy "Users can update own profile" 
on public.profiles for update 
using ( auth.uid() = id );

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger (drop first to avoid errors)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for existing users (optional but good)
-- This part is tricky in pure SQL without admin access, but the trigger handles new ones.
-- Existing users might need to update their profile manually or re-login if logic depends on it.
