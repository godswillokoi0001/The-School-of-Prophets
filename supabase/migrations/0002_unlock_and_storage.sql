-- ================================================================
-- 1. CREATE STORAGE BUCKET FOR MEDIA UPLOADS
-- ================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- Storage object policies for media bucket
drop policy if exists "Media Public Select" on storage.objects;
create policy "Media Public Select" on storage.objects for select using (bucket_id = 'media');

drop policy if exists "Media Public Insert" on storage.objects;
create policy "Media Public Insert" on storage.objects for insert with check (bucket_id = 'media');

drop policy if exists "Media Public Update" on storage.objects;
create policy "Media Public Update" on storage.objects for update using (bucket_id = 'media');

drop policy if exists "Media Public Delete" on storage.objects;
create policy "Media Public Delete" on storage.objects for delete using (bucket_id = 'media');

-- ================================================================
-- 2. UNLOCK ALL TABLES (Full access for public forms & admin)
-- ================================================================
do $$ declare t text;
begin
  foreach t in array array[
    'profiles', 'audit_log', 'series', 'teachings', 'teaching_links', 'tags',
    'media', 'events', 'event_exceptions', 'event_registrations',
    'schedule_sessions', 'schedule_exceptions', 'call_types',
    'availability_rules', 'availability_exceptions', 'submissions',
    'submission_notes', 'submission_history', 'notification_settings',
    'subscribers', 'broadcasts', 'bookings', 'faqs', 'team_members',
    'gallery_albums', 'gallery_images', 'site_settings', 'announcements',
    'email_templates', 'teaching_views', 'slug_redirects', 'form_definitions'
  ]
  loop
    -- Check if table exists before applying policies
    if exists (select from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists %I_all on public.%I', t, t);
      execute format('create policy %I_all on public.%I for all using (true) with check (true)', t, t);
    end if;
  end loop;
end $$;

-- ================================================================
-- 3. SEED DEFAULT EMAIL TEMPLATES
-- ================================================================
insert into public.email_templates (key, label, subject, body)
values
  ('confirmation', 'Submission confirmation', 'Thank you for reaching out — The School of Prophets', 'Hello {{name}},\n\nThank you for reaching out to The School of Prophets. We have received your {{type}} and a member of the team will respond soon.\n\nBlessings,\nThe School of Prophets'),
  ('booking_confirmed', 'Call confirmed', 'Your call is confirmed — The School of Prophets', 'Hello {{name}},\n\nYour call has been confirmed for {{time}} (WAT).\n\nJoin link: {{link}}\n\nBlessings,\nThe School of Prophets'),
  ('booking_cancelled', 'Call cancelled', 'Update regarding your booking — The School of Prophets', 'Hello {{name}},\n\nYour call scheduled for {{time}} has been cancelled.\n\nReason: {{reason}}\n\nYou can book a new time here: {{link}}\n\nThe School of Prophets'),
  ('acceptance', 'Enrolment accepted', 'Welcome to The School of Prophets — Application Accepted', 'Hello {{name}},\n\nWe are joyful to inform you that your enrolment application has been accepted! Please check your portal for orientation details.\n\nThe School of Prophets'),
  ('decline', 'Enrolment declined', 'Update regarding your application — The School of Prophets', 'Hello {{name}},\n\nThank you for your interest in The School of Prophets. After prayerful review, we are unable to offer you a seat for this intake.\n\nGrace and peace,\nThe School of Prophets'),
  ('waitlist_open', 'Waitlist notification', 'Applications are now open — The School of Prophets', 'Hello {{name}},\n\nApplications have just opened for the upcoming intake! As you joined our waitlist, you have priority access:\n\n{{link}}\n\nThe School of Prophets')
on conflict (key) do update set
  label = excluded.label,
  subject = excluded.subject,
  body = excluded.body;

-- ================================================================
-- 4. SEED INITIAL SITE SETTINGS & CALL TYPES
-- ================================================================
insert into public.site_settings (key, value)
values
  ('enrolment', '{"status": "open", "academicYear": "2026/2027", "deadline": ""}'::jsonb),
  ('homepage', '{"heroText": "", "heroImageUrl": "", "showSchedule": true, "showTeachings": true}'::jsonb)
on conflict (key) do nothing;

insert into public.call_types (name, slug, description, duration_minutes, buffer_minutes, mode, approval_required, active, sort_order)
values
  ('Pastoral & Prophetic Counsel', 'counsel', 'One-on-one ministry session for spiritual guidance and prayer.', 30, 15, 'google_meet', false, true, 1),
  ('Enrolment Inquiry', 'inquiry', 'Discuss the training program, curriculum, and admissions with our team.', 20, 10, 'google_meet', false, true, 2)
on conflict (slug) do nothing;
