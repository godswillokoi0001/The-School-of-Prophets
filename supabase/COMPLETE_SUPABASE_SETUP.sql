-- ================================================================
-- THE SCHOOL OF PROPHETS — COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- ================================================================
-- Run this script once in your Supabase Dashboard:
-- SQL Editor -> New query -> Paste and click "Run"
--
-- This script safely enables:
-- 1. Password activation & staff account setup for invitation links
-- 2. Media storage bucket & public access policies
-- 3. Row Level Security policies for public forms and admin operations
-- 4. Default liturgical email templates & settings
-- ================================================================

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Staff Invitation & Password Activation RPC
-- This allows invited teammates to set their password via the invitation link
-- and have their account confirmed and activated immediately.
CREATE OR REPLACE FUNCTION public.accept_staff_invite(
  target_email text,
  target_password text,
  target_full_name text,
  target_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  clean_email text;
  uid uuid;
  hashed_pw text;
BEGIN
  clean_email := lower(trim(target_email));
  
  IF length(target_password) < 8 THEN
    RETURN json_build_object('ok', false, 'error', 'Password must be at least 8 characters long.');
  END IF;

  hashed_pw := crypt(target_password, gen_salt('bf'));

  -- Find existing auth user
  SELECT id INTO uid FROM auth.users WHERE email = clean_email;

  IF uid IS NULL THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      clean_email,
      hashed_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object('full_name', target_full_name)::jsonb,
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = hashed_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = json_build_object('full_name', target_full_name)::jsonb,
        updated_at = now()
    WHERE id = uid;
  END IF;

  -- Ensure profile row exists and is active with proper role
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (uid, clean_email, target_full_name, target_role, 'active')
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      status = 'active';

  RETURN json_build_object('ok', true, 'userId', uid);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text, text, text, text) TO service_role;

-- 3. Create 'media' Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- Storage Object Policies for media bucket
DROP POLICY IF EXISTS "Media Public Select" ON storage.objects;
CREATE POLICY "Media Public Select" ON storage.objects FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Media Public Insert" ON storage.objects;
CREATE POLICY "Media Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Media Public Update" ON storage.objects;
CREATE POLICY "Media Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Media Public Delete" ON storage.objects;
CREATE POLICY "Media Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'media');

-- 4. Enable Row Level Security & Access Policies for Tables
DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'audit_log', 'series', 'teachings', 'teaching_links', 'tags',
    'media', 'events', 'event_exceptions', 'event_registrations',
    'schedule_sessions', 'schedule_exceptions', 'call_types',
    'availability_rules', 'availability_exceptions', 'submissions',
    'submission_notes', 'submission_history', 'notification_settings',
    'subscribers', 'broadcasts', 'bookings', 'faqs', 'team_members',
    'gallery_albums', 'gallery_images', 'site_settings', 'announcements',
    'email_templates', 'teaching_views', 'slug_redirects', 'form_definitions'
  ]
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I_all ON public.%I', t, t);
      EXECUTE format('CREATE POLICY %I_all ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
    END IF;
  END LOOP;
END $$;

-- ================================================================
-- BETA TESTER FEEDBACK (mirrors migrations/0004_beta_feedback.sql)
-- Run this block after setup, or run the migration file instead.
-- ================================================================

INSERT INTO public.form_definitions (type, label, schema, is_private, notify)
VALUES (
  'beta_feedback',
  'Beta tester feedback',
  '{"steps":4,"requires":["name","email"],"screenshots":"private","consent":["public_named","public_anonymous","private"]}'::jsonb,
  true,
  true
)
ON CONFLICT (type) DO UPDATE SET label = EXCLUDED.label, schema = EXCLUDED.schema, is_private = true, notify = true;

ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_status_check
  CHECK (status IN ('new','seen','triaged','in_progress','fixed','wont_fix','replied','approved','declined','archived','spam','prayed','answered'));

CREATE INDEX IF NOT EXISTS submissions_beta_email
  ON public.submissions ((payload->>'email')) WHERE type = 'beta_feedback';

INSERT INTO public.site_settings (key, value)
VALUES ('beta_feedback', '{"status":"open"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.email_templates (key, label, subject, body)
VALUES
  ('beta_confirmation', 'Beta review thank-you', 'Thank you for reviewing the site — The School of Prophets',
   'Hello {{name}},

Thank you for taking the time to test the site and tell us the truth about it. Your review is now with the team, and every one is read.

Here is what you sent us, for your own records:
{{summary}}

If we fixed something you found, we will write again.

With gratitude,
The School of Prophets'),
  ('beta_fixed', 'Beta issue fixed', 'We fixed what you found — The School of Prophets',
   'Hello {{name}},

A short note to say thank you again. We have worked on what you reported in your beta review.

If it still is not right, reply to this email and tell us. That is exactly what this beta is for.

With gratitude,
The School of Prophets')
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, subject = EXCLUDED.subject, body = EXCLUDED.body;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('beta-screenshots', 'beta-screenshots', false, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "Beta screenshots staff read" ON storage.objects;
CREATE POLICY "Beta screenshots staff read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'beta-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.status = 'active' AND p.role IN ('owner','admin','moderator')
    )
  );

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.status = 'active'
      AND p.role IN ('owner','admin','moderator','viewer')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_beta_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.status = 'active'
      AND p.role IN ('owner','admin','moderator')
  );
$$;

-- Close the hole the unlock loop above opens on submissions: the public may
-- insert a form, only staff may read responses.
DROP POLICY IF EXISTS submissions_all ON public.submissions;
DROP POLICY IF EXISTS submissions_public_insert ON public.submissions;
DROP POLICY IF EXISTS submissions_staff_read ON public.submissions;
DROP POLICY IF EXISTS submissions_staff_update ON public.submissions;
DROP POLICY IF EXISTS submissions_admin_delete ON public.submissions;

CREATE POLICY submissions_public_insert ON public.submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY submissions_staff_read ON public.submissions
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY submissions_staff_update ON public.submissions
  FOR UPDATE TO authenticated USING (public.is_beta_staff()) WITH CHECK (public.is_beta_staff());
CREATE POLICY submissions_admin_delete ON public.submissions
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.status = 'active' AND p.role IN ('owner','admin')
  ));
