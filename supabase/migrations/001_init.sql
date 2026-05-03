-- Enable RLS
create table if not exists expenses (
  id            uuid primary key default gen_random_uuid(),
  month_key     text not null,          -- e.g. '2026-04'
  date          text not null,          -- e.g. '2026-04-12'
  desc          text not null,
  cat           text not null,
  eur           numeric(10,2) not null,
  recurring_id  text,                   -- e.g. 'r1', null for one-off
  created_at    timestamptz default now()
);

create table if not exists archive (
  id            uuid primary key default gen_random_uuid(),
  month_key     text not null,
  date          text not null,
  desc          text not null,
  cat           text not null,
  eur           numeric(10,2) not null,
  recurring_id  text,
  created_at    timestamptz default now()
);

-- Row-level security: only authenticated users can access their own data.
-- Since this is a single-user app we simply require auth.
alter table expenses enable row level security;
alter table archive  enable row level security;

create policy "auth users only - expenses"
  on expenses for all
  using (auth.role() = 'authenticated');

create policy "auth users only - archive"
  on archive for all
  using (auth.role() = 'authenticated');
