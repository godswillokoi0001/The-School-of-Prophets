-- 0003: Staff Invite, Password Activation & Role Management Helper
-- Run this in your Supabase SQL Editor to allow staff invitation links to instantly set passwords and activate accounts.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secure function to set staff password & confirm account upon invitation acceptance
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

-- Grant execution to anon and authenticated callers
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(text, text, text, text) TO service_role;
