-- ============================================================
-- Spanjehuizen — Supabase migration
-- Run this in the Supabase SQL editor (Project → SQL Editor)
-- ============================================================

-- ── properties ────────────────────────────────────────────────
create table if not exists properties (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  title         text not null,
  area          text not null default '',
  asking_price  numeric,
  status        text not null default 'New',
  notes         text,
  contact_name  text,
  agency        text,
  url           text,
  viewed_date   date,
  latitude      double precision,
  longitude     double precision,
  address_label text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table properties enable row level security;

-- Each user can only see / modify their own rows
create policy "properties: owner all" on properties
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── property_photos ───────────────────────────────────────────
create table if not exists property_photos (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid references properties on delete cascade not null,
  user_id       uuid references auth.users not null,
  storage_path  text not null,
  created_at    timestamptz default now()
);

alter table property_photos enable row level security;

create policy "property_photos: owner all" on property_photos
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on properties;
create trigger set_updated_at
  before update on properties
  for each row execute function update_updated_at();

-- ============================================================
-- Storage bucket
-- Run this separately, or create the bucket via the dashboard:
--   Bucket name : property-photos
--   Public      : false
-- ============================================================

-- Storage RLS (insert in Storage → Policies section, or via SQL):
-- Policy name  : "storage: owner all"
-- Table        : storage.objects
-- Definition   :
--   bucket_id = 'property-photos'
--   AND auth.uid()::text = (storage.foldername(name))[1]
--
-- Photos are stored at path: {user_id}/{property_id}/{filename}
