-- --- Bookings Table ---
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.listings(id) not null,
  user_id uuid references auth.users(id) not null,
  owner_id uuid references auth.users(id) not null,
  start_date date not null,
  end_date date not null,
  total_cost numeric not null,
  status text default 'pending',
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

-- Policies for Bookings
-- Note: If policies already exist, these might error. You can ignore "policy already exists" errors.
create policy "Users can view their own bookings"
on public.bookings for select
using ( auth.uid() = user_id or auth.uid() = owner_id );

create policy "Users can create bookings"
on public.bookings for insert
with check ( auth.uid() = user_id );

-- --- Reviews Table ---
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.listings(id) not null,
  user_id uuid references auth.users(id) not null,
  booking_id uuid references public.bookings(id) not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id)
);

alter table public.reviews enable row level security;

-- Policies for Reviews
create policy "Reviews are public"
on public.reviews for select
using ( true );

create policy "Users can create reviews"
on public.reviews for insert
with check ( auth.uid() = user_id );
