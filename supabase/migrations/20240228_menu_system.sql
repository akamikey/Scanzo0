-- Create Menu Categories Table
create table if not exists menu_categories (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references owners(id) on delete cascade not null,
  name text not null,
  display_order int default 0,
  created_at timestamp with time zone default now()
);

-- Create Menu Items Table
create table if not exists menu_items (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references owners(id) on delete cascade not null,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2),
  image_url text,
  available boolean default true,
  is_popular boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table menu_categories enable row level security;
alter table menu_items enable row level security;

-- Policies for Categories
create policy "Owners can manage their categories"
  on menu_categories for all
  using (auth.uid() = owner_id);

create policy "Public can view categories"
  on menu_categories for select
  using (true);

-- Policies for Items
create policy "Owners can manage their items"
  on menu_items for all
  using (auth.uid() = owner_id);

create policy "Public can view items"
  on menu_items for select
  using (true);
