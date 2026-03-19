-- 1. REVIEWS TABLE (Stores feedback from QR codes)
create table if not exists public.reviews (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.owners(id) on delete cascade not null,
    rating int not null check (rating >= 1 and rating <= 5),
    comment text,
    customer_name text default 'Anonymous',
    platform text default 'Direct', -- 'Direct', 'Google', etc.
    created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

-- Allow PUBLIC to INSERT reviews (Anonymous feedback from QR code)
create policy "Public can submit reviews"
on public.reviews for insert
with check (true);

-- Allow OWNERS to VIEW their own reviews
create policy "Owners can view own reviews"
on public.reviews for select
using (auth.uid() = owner_id);


-- 2. SUBSCRIPTIONS TABLE (Tracks payment status)
create table if not exists public.subscriptions (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.owners(id) on delete cascade not null,
    plan_name text,
    amount_paid numeric(10,2),
    active boolean default false,
    payment_id text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone default now()
);

alter table public.subscriptions enable row level security;

-- Only System/Service Role should write to this usually, but for now allow owners to read
create policy "Owners can view own subscription"
on public.subscriptions for select
using (auth.uid() = owner_id);


-- 3. AI CHATS TABLE (Stores history for the AI Assistant)
create table if not exists public.ai_chats (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    role text not null, -- 'user' or 'model'
    content text not null,
    created_at timestamp with time zone default now()
);

alter table public.ai_chats enable row level security;

create policy "Users manage own chats"
on public.ai_chats for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
