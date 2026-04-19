-- ============================================================
-- OpsHub Template Editor — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Templates table
--    Stores each saved template document with its HTML content.
create table if not exists templates (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null default 'Untitled Template',
  content_html text       not null default '',
  filename    text,                         -- original .docx filename if uploaded
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row modification
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists templates_set_updated_at on templates;
create trigger templates_set_updated_at
  before update on templates
  for each row execute function set_updated_at();

-- 2. Template variables table
--    Each template has many variables (1:N).
create table if not exists template_variables (
  id          uuid        primary key default gen_random_uuid(),
  template_id uuid        not null references templates(id) on delete cascade,
  key         text        not null,
  label       text        not null default '',
  data_type   text        not null default 'Text'
                check (data_type in ('Text', 'Number', 'Date')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_template_variables_template_id
  on template_variables(template_id);

-- 3. Row Level Security (enable but allow all for now — tighten with auth later)
alter table templates         enable row level security;
alter table template_variables enable row level security;

create policy "Allow all on templates"
  on templates for all using (true) with check (true);

create policy "Allow all on template_variables"
  on template_variables for all using (true) with check (true);
