-- Run this in the Supabase SQL editor to set up the profiles table

create table if not exists profiles (
  token       uuid primary key,
  selected_ids text[]      not null default '{}',
  custom_cards jsonb       not null default '[]',
  benefit_checks jsonb     not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Allow anonymous reads and writes (token is the secret — whoever knows it can access it)
alter table profiles enable row level security;

create policy "Anyone can read a profile by token"
  on profiles for select
  using (true);

create policy "Anyone can upsert a profile by token"
  on profiles for insert
  with check (true);

create policy "Anyone can update a profile by token"
  on profiles for update
  using (true);
