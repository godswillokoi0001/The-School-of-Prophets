-- TSOP admin platform: schema, RLS, helpers.
-- Roles: owner > admin > moderator > viewer. All public writes go through the
-- server (service role); anon policies deny everything.

create extension if not exists "pgcrypto";

-- ============ profiles table ============

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'viewer' check (role in ('owner','admin','moderator','viewer')),
  status text not null default 'active' check (status in ('active','inactive')),
  invited_by uuid references auth.users(id),
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ helpers ============

create or replace function public.current_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_owner() returns boolean
language sql stable as $$ select public.current_role() = 'owner' $$;

create or replace function public.is_admin() returns boolean
language sql stable as $$ select public.current_role() in ('owner','admin') $$;

create or replace function public.can_moderate() returns boolean
language sql stable as $$ select public.current_role() in ('owner','admin','moderator') $$;

create or replace function public.is_staff() returns boolean
language sql stable as $$ select public.current_role() is not null $$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============ profiles security policies ============

alter table public.profiles enable row level security;
drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_owner());
drop policy if exists profiles_owner_all on public.profiles;
create policy profiles_owner_all on public.profiles for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id),
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create policy audit_read_staff on public.audit_log for select to authenticated
  using (public.can_moderate());
create policy audit_insert_staff on public.audit_log for insert to authenticated
  with check (public.is_staff());

-- ============ series / teachings ============

create table public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  cover_url text,
  cover_alt text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teachings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  series_id uuid references public.series(id) on delete set null,
  part_number integer,
  date_taught date,
  speaker text not null default 'Prophet Lawrence Iwara',
  summary text not null default '',
  body text not null default '',
  cover_url text,
  cover_alt text not null default '',
  scripture text[] not null default '{}',
  youtube_url text,
  audio_url text,
  pdf_url text,
  links jsonb not null default '[]',
  tags text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  publish_at timestamptz,
  seo_title text,
  seo_description text,
  share_image_url text,
  view_count integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teaching_links (
  id uuid primary key default gen_random_uuid(),
  teaching_id uuid not null references public.teachings(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  filename text not null,
  mime text not null,
  size integer not null default 0,
  width integer,
  height integer,
  alt text not null default '',
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.slug_redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null unique,
  to_path text not null,
  created_at timestamptz not null default now()
);

-- ============ events ============

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Africa/Lagos',
  format text not null default 'online' check (format in ('online','onsite','hybrid')),
  location text not null default '',
  join_url text not null default '',
  cover_url text,
  cover_alt text not null default '',
  registration_required boolean not null default false,
  capacity integer,
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  recurrence text check (recurrence in ('none','weekly','monthly','yearly')),
  featured boolean not null default false,
  recap text not null default '',
  recap_video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_exceptions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  occurrence_date date not null,
  action text not null check (action in ('cancel','reschedule')),
  new_starts_at timestamptz,
  note text not null default ''
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  whatsapp text not null default '',
  created_at timestamptz not null default now()
);

-- ============ schedule ============

create table public.schedule_sessions (
  id uuid primary key default gen_random_uuid(),
  day integer not null check (day between 0 and 6),
  title text not null,
  type text not null default 'Teaching' check (type in ('Teaching','Bible Study','Prayer','Convergence','Worship','Other')),
  start_time text not null,
  end_time text,
  description text not null default '',
  join_url text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.schedule_sessions(id) on delete cascade,
  occurrence_date date not null,
  action text not null check (action in ('cancel','reschedule')),
  new_start_time text,
  note text not null default ''
);

-- ============ forms / inbox ============

create table public.form_definitions (
  id uuid primary key default gen_random_uuid(),
  type text not null unique,
  label text not null,
  schema jsonb not null default '{}',
  is_private boolean not null default false,
  notify boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  status text not null default 'new' check (status in ('new','seen','in_progress','replied','approved','declined','archived','spam','prayed','answered')),
  payload jsonb not null default '{}',
  private boolean not null default false,
  assignee uuid references auth.users(id),
  tags text[] not null default '{}',
  is_spam boolean not null default false,
  deleted_at timestamptz,
  source text not null default 'web',
  ip text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index submissions_type_status on public.submissions (type, status, deleted_at, created_at desc);

create table public.submission_notes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  author uuid references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.submission_history (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  actor uuid references auth.users(id),
  field text not null,
  from_value text,
  to_value text,
  created_at timestamptz not null default now()
);

-- ============ booking ============

create table public.call_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  duration_minutes integer not null default 30,
  buffer_minutes integer not null default 0,
  active boolean not null default true,
  mode text not null default 'phone' check (mode in ('phone','whatsapp','meet','in_person')),
  approval_required boolean not null default false,
  sort_order integer not null default 0
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday integer not null check (weekday between 0 and 6),
  start_time text not null,
  end_time text not null,
  slot_minutes integer not null default 30,
  call_type_id uuid references public.call_types(id) on delete cascade,
  active boolean not null default true
);

create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  all_day boolean not null default true,
  start_time text,
  end_time text,
  reason text not null default ''
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  call_type_id uuid not null references public.call_types(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  name text not null,
  email text not null,
  whatsapp text not null default '',
  topic text not null default '',
  notes text not null default '',
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','no_show')),
  cancel_reason text not null default '',
  admin_notes text not null default '',
  timezone text not null default 'Africa/Lagos',
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index bookings_no_double on public.bookings (starts_at) where status in ('pending','confirmed');

-- ============ newsletter / broadcasts ============

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  source text not null default 'site',
  consent_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  segment text not null default 'all' check (segment in ('all','waitlist','applicants','registrants','manual')),
  manual_emails text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','scheduled','sent','failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  stats jsonb not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ============ notifications ============

create table public.notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default true,
  sound_enabled boolean not null default true,
  telegram_enabled boolean not null default false,
  whatsapp_enabled boolean not null default false,
  digest text not null default 'none' check (digest in ('none','daily','weekly')),
  quiet_start integer,
  quiet_end integer,
  types jsonb not null default '{}'
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

create table public.notification_log (
  id bigint generated always as identity primary key,
  channel text not null,
  target text not null,
  subject text not null,
  body text not null default '',
  status text not null default 'pending' check (status in ('pending','sent','failed','retrying')),
  error text not null default '',
  attempts integer not null default 0,
  related_type text,
  related_id text,
  created_at timestamptz not null default now()
);

-- ============ site settings ============

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link text not null default '',
  variant text not null default 'default' check (variant in ('default','emergency')),
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_label text not null default '',
  bio text not null default '',
  photo_url text,
  sort_order integer not null default 0,
  visible boolean not null default true
);

create table public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  url text not null,
  alt text not null default '',
  caption text not null default '',
  sort_order integer not null default 0
);

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  subject text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

create table public.teaching_views (
  teaching_id uuid primary key references public.teachings(id) on delete cascade,
  views integer not null default 0
);

-- ============ RLS: public reads of published content only ============

-- public (anon) read of published/active rows only; staff read everything
do $$ declare t text;
begin
  foreach t in array array['series','teachings','events','schedule_sessions','faqs','team_members','gallery_albums','gallery_images','announcements','site_settings','form_definitions','call_types','tags','slug_redirects','teaching_views']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists public_read on public.%I', t);
    execute format('drop policy if exists staff_read on public.%I', t);
    execute format('create policy public_read on public.%I for select using (true)', t);
  end loop;
end $$;

create policy anon_published_series on public.series for select using (status = 'published');
create policy anon_published_teachings on public.teachings for select using (status = 'published');
create policy anon_published_events on public.events for select using (status = 'published');
create policy anon_active_sessions on public.schedule_sessions for select using (active = true);
create policy anon_active_faqs on public.faqs for select using (active = true);
create policy anon_visible_team on public.team_members for select using (visible = true);
create policy anon_active_announcements on public.announcements for select using (active = true);

create policy published_series on public.series for select to authenticated
  using (public.is_staff());
create policy published_teachings on public.teachings for select to authenticated
  using (public.is_staff());
create policy published_events on public.events for select to authenticated
  using (public.is_staff());
create policy active_sessions on public.schedule_sessions for select to authenticated
  using (public.is_staff());
create policy active_faqs on public.faqs for select to authenticated
  using (public.is_staff());
create policy visible_team on public.team_members for select to authenticated
  using (public.is_staff());
create policy active_announcements on public.announcements for select to authenticated
  using (public.is_staff());

-- staff full control of content tables
do $$ declare t text;
begin
  foreach t in array array['series','teachings','teaching_links','media','tags','events','event_exceptions','event_registrations','schedule_sessions','schedule_exceptions','call_types','availability_rules','availability_exceptions','faqs','team_members','gallery_albums','gallery_images','announcements','site_settings','email_templates','slug_redirects','teaching_views','form_definitions','broadcasts','subscribers','bookings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists staff_write on public.%I', t);
    execute format('create policy staff_write on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- inbox: moderator sees non-private; prayer/private restricted to owner/admin/moderator; delete admin only
alter table public.submissions enable row level security;
create policy inbox_read on public.submissions for select to authenticated
  using (public.can_moderate() and (not private or public.can_moderate()));
create policy inbox_insert_staff on public.submissions for insert to authenticated with check (public.is_staff());
create policy inbox_update_mod on public.submissions for update to authenticated
  using (public.can_moderate()) with check (public.can_moderate());
create policy inbox_delete_admin on public.submissions for delete to authenticated
  using (public.is_admin());

alter table public.submission_notes enable row level security;
create policy notes_mod on public.submission_notes for all to authenticated
  using (public.can_moderate()) with check (public.can_moderate());
alter table public.submission_history enable row level security;
create policy history_mod on public.submission_history for all to authenticated
  using (public.can_moderate()) with check (public.can_moderate());

alter table public.notification_settings enable row level security;
create policy notif_self on public.notification_settings for all to authenticated
  using (user_id = auth.uid() or public.is_owner()) with check (user_id = auth.uid() or public.is_owner());
alter table public.push_subscriptions enable row level security;
create policy push_self on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid() or public.is_owner()) with check (user_id = auth.uid() or public.is_owner());
alter table public.notification_log enable row level security;
create policy notif_log_staff on public.notification_log for all to authenticated
  using (public.can_moderate()) with check (public.can_moderate());

-- no anon access anywhere (default deny; no anon policies created)

-- ============ triggers ============

do $$ declare t text;
begin
  foreach t in array array['series','teachings','events','schedule_sessions','submissions','bookings','email_templates']
  loop
    execute format('create trigger trg_touch before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- audit trigger for submissions status changes is handled by the app layer.

-- ============ auto-provision profiles on auth user creation ============

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when (select count(*) from public.profiles) = 0 then 'owner' else 'admin' end,
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any pre-existing auth users as owner/active
insert into public.profiles (id, email, full_name, role, status)
select id, email, coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 'owner', 'active'
from auth.users
on conflict (id) do update set role = 'owner', status = 'active';
