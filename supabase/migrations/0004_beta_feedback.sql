-- ================================================================
-- Beta tester feedback (invited members reviewing the new site)
--
-- Reuses the public forms pipeline: one form_definition, rows in
-- public.submissions with type = 'beta_feedback'. No parallel tables.
-- Adds three workflow states, a private screenshots bucket, and closes
-- the submissions read hole that let anonymous clients select rows.
-- ================================================================

-- 1. FORM DEFINITION ------------------------------------------------
insert into public.form_definitions (type, label, schema, is_private, notify)
values (
  'beta_feedback',
  'Beta tester feedback',
  '{"steps":4,"requires":["name","email"],"screenshots":"private","consent":["public_named","public_anonymous","private"]}'::jsonb,
  true,
  true
)
on conflict (type) do update set
  label = excluded.label,
  schema = excluded.schema,
  is_private = true,
  notify = true;

-- 2. WORKFLOW STATES ------------------------------------------------
alter table public.submissions drop constraint if exists submissions_status_check;
alter table public.submissions add constraint submissions_status_check
  check (status in (
    'new','seen','triaged','in_progress','fixed','wont_fix',
    'replied','approved','declined','archived','spam','prayed','answered'
  ));

create index if not exists submissions_beta_email
  on public.submissions ((payload->>'email'))
  where type = 'beta_feedback';

create index if not exists submissions_beta_story
  on public.submissions ((payload->>'story'))
  where type = 'beta_feedback';

-- 3. DEFAULT SETTINGS -----------------------------------------------
insert into public.site_settings (key, value)
values ('beta_feedback', '{"status":"open"}'::jsonb)
on conflict (key) do nothing;

-- 4. EMAIL TEMPLATES (editable in Admin → Settings → Email templates) --
insert into public.email_templates (key, label, subject, body)
values
  (
    'beta_confirmation',
    'Beta review thank-you',
    'Thank you for reviewing the site — The School of Prophets',
    'Hello {{name}},

Thank you for taking the time to test the site and tell us the truth about it. Your review is now with the team, and every one is read.

Here is what you sent us, for your own records:
{{summary}}

If we fixed something you found, we will write again.

With gratitude,
The School of Prophets'
  ),
  (
    'beta_fixed',
    'Beta issue fixed',
    'We fixed what you found — The School of Prophets',
    'Hello {{name}},

A short note to say thank you again. We have worked on what you reported in your beta review.

If it still is not right, reply to this email and tell us. That is exactly what this beta is for.

With gratitude,
The School of Prophets'
  )
on conflict (key) do update set
  label = excluded.label,
  subject = excluded.subject,
  body = excluded.body;

-- 5. PRIVATE SCREENSHOT BUCKET --------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'beta-screenshots',
  'beta-screenshots',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Beta screenshots staff read" on storage.objects;
create policy "Beta screenshots staff read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'beta-screenshots'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'
        and p.role in ('owner', 'admin', 'moderator')
    )
  );

-- 6. TIGHTEN SUBMISSIONS RLS ----------------------------------------
-- The earlier migration opened every table to everyone. That is wrong for
-- form responses: anonymous visitors must be able to INSERT a form, never
-- to SELECT what others sent.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'
      and p.role in ('owner', 'admin', 'moderator', 'viewer')
  )
$$;

create or replace function public.is_beta_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'
      and p.role in ('owner', 'admin', 'moderator')
  )
$$;

drop policy if exists submissions_all on public.submissions;
drop policy if exists submissions_public_insert on public.submissions;
drop policy if exists submissions_staff_read on public.submissions;
drop policy if exists submissions_staff_update on public.submissions;
drop policy if exists submissions_admin_delete on public.submissions;

create policy submissions_public_insert on public.submissions
  for insert to anon, authenticated
  with check (true);

create policy submissions_staff_read on public.submissions
  for select to authenticated
  using (public.is_staff());

create policy submissions_staff_update on public.submissions
  for update to authenticated
  using (public.is_beta_staff())
  with check (public.is_beta_staff());

create policy submissions_admin_delete on public.submissions
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'
        and p.role in ('owner', 'admin')
    )
  );

-- Viewers may read the words and ratings; email, phone and WhatsApp are masked
-- for that role in the dashboard (BetaSubmissionDetail). Moderation roles see
-- the contact details because they are the ones who reply.
