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
