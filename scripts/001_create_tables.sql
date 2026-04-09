-- World Vision International Website Database Schema

-- Countries table
create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text not null,
  flag_url text,
  description text,
  overview text,
  key_results text[],
  focus_areas text[],
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- News/Articles table
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  image_url text,
  category text,
  author text,
  published_at timestamptz default now(),
  featured boolean default false,
  country_id uuid references countries(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resources/Publications table
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category text not null,
  file_url text,
  cover_image_url text,
  published_at timestamptz default now(),
  download_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email subscriptions table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz default now(),
  active boolean default true
);

-- Enable Row Level Security
alter table countries enable row level security;
alter table news enable row level security;
alter table resources enable row level security;
alter table subscriptions enable row level security;

-- Public read access policies
create policy "public_read_countries" on countries for select using (true);
create policy "public_read_news" on news for select using (true);
create policy "public_read_resources" on resources for select using (true);

-- Admin write access for countries
create policy "admin_all_countries" on countries for all using (
  (select (raw_user_meta_data->>'is_admin')::boolean from auth.users where id = auth.uid())
);

-- Admin write access for news
create policy "admin_all_news" on news for all using (
  (select (raw_user_meta_data->>'is_admin')::boolean from auth.users where id = auth.uid())
);

-- Admin write access for resources
create policy "admin_all_resources" on resources for all using (
  (select (raw_user_meta_data->>'is_admin')::boolean from auth.users where id = auth.uid())
);

-- Anyone can subscribe
create policy "public_insert_subscriptions" on subscriptions for insert with check (true);
create policy "admin_read_subscriptions" on subscriptions for select using (
  (select (raw_user_meta_data->>'is_admin')::boolean from auth.users where id = auth.uid())
);
