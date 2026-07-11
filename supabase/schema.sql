-- Zenit: eine Zeile pro Nutzer, kompletter App-Zustand als JSON.
-- Im Supabase-Dashboard unter "SQL Editor" einfügen und ausführen.

create table if not exists public.zenit_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  origin text,
  updated_at timestamptz not null default now()
);

alter table public.zenit_state enable row level security;

create policy "read own state"
  on public.zenit_state for select
  using (auth.uid() = user_id);

create policy "insert own state"
  on public.zenit_state for insert
  with check (auth.uid() = user_id);

create policy "update own state"
  on public.zenit_state for update
  using (auth.uid() = user_id);

-- Live-Sync zwischen Geräten aktivieren:
alter publication supabase_realtime add table public.zenit_state;
