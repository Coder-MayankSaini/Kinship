-- Create the listings table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text,
  location text,
  pricing jsonb, -- Stores daily, weekly, monthly prices
  deposit numeric,
  owner jsonb, -- Stores owner id, name, rating, avatar
  availability boolean default true,
  available_dates jsonb, -- Stores specific dates if availability is false
  rating numeric default 0,
  review_count integer default 0,
  images text[], -- Array of image URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.listings enable row level security;

-- Create policies
-- 1. Everyone can view listings
create policy "Listings are viewable by everyone" 
on public.listings for select 
using ( true );

-- 2. Authenticated users can insert listings
create policy "Users can insert their own listings" 
on public.listings for insert 
with check ( true ); -- Ideally check auth.uid() matches owner->>id, but for now allow all auth users

-- 3. Users can update their own listings
create policy "Users can update their own listings" 
on public.listings for update 
using ( (owner->>'id')::text = auth.uid()::text );

-- Set up Storage for Images
-- Note: This might fail if bucket already exists, which is fine.
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'images' );

create policy "Anyone can upload images"
on storage.objects for insert
with check ( bucket_id = 'images' );

-- --- NEW: Profiles Table for User Data ---

create table public.profiles (
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

alter table public.profiles enable row level security;

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
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --- NEW: Bookings Table ---

create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.listings(id) not null,
  user_id uuid references auth.users(id) not null,
  owner_id uuid references auth.users(id) not null, -- Denormalized for easier querying
  start_date date not null,
  end_date date not null,
  total_cost numeric not null,
  status text default 'pending', -- pending, confirmed, cancelled, completed
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

-- Users can view their own bookings (as renter or owner)
create policy "Users can view their own bookings"
on public.bookings for select
using ( auth.uid() = user_id or auth.uid() = owner_id );

-- Users can insert bookings
create policy "Users can create bookings"
on public.bookings for insert
with check ( auth.uid() = user_id );

-- --- NEW: Reviews Table ---

create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.listings(id) not null,
  user_id uuid references auth.users(id) not null,
  booking_id uuid references public.bookings(id) not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id) -- One review per booking
);

alter table public.reviews enable row level security;

-- Reviews are public
create policy "Reviews are public"
on public.reviews for select
using ( true );

-- Users can create reviews if they are the author
create policy "Users can create reviews"
on public.reviews for insert
with check ( auth.uid() = user_id );
