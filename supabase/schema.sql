create extension if not exists "pgcrypto";

create table if not exists public.postcards (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  front_drawing jsonb not null default '[]'::jsonb,
  back_drawing jsonb not null default '[]'::jsonb,
  text_content text not null default '',
  text_style jsonb not null default '{"align":"left","size":18}'::jsonb,
  x double precision not null,
  y double precision not null,
  rotation double precision not null,
  created_at timestamptz not null default now(),
  download_count int not null default 0
);

create or replace function public.increment_download_count(card_id uuid)
returns void
language sql
security definer
as $$
  update public.postcards
  set download_count = download_count + 1
  where id = card_id;
$$;

alter table public.postcards enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where tablename = 'postcards'
      and policyname = 'Public can read postcards'
  ) then
    create policy "Public can read postcards"
      on public.postcards
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where tablename = 'postcards'
      and policyname = 'Public can insert postcards'
  ) then
    create policy "Public can insert postcards"
      on public.postcards
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where tablename = 'postcards'
      and policyname = 'Public can update download count'
  ) then
    create policy "Public can update download count"
      on public.postcards
      for update
      to anon
      using (true)
      with check (true);
  end if;
end
$$;

alter publication supabase_realtime add table public.postcards;
