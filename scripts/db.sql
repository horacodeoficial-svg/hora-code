create extension if not exists "pgcrypto";

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_name text,
  email text,
  phone text,
  business_name text,
  short_description text,
  services jsonb,
  primary_color text,
  logo_url text,
  hero_image_url text,
  plan text,
  publish_option text,
  status text default 'new',
  price numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists texts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  headline text,
  subheadline text,
  about text,
  services jsonb,
  cta1 text,
  cta2 text,
  footer text,
  generated_at timestamptz default now()
);

create table if not exists layouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  html_content text,
  assets jsonb,
  palette jsonb,
  generated_at timestamptz default now()
);
