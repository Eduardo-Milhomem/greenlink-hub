-- Script to fix permissions for has_role function
-- Execute this in the Supabase SQL Editor

-- First, check current permissions
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_catalog.pg_get_function_arguments(p.oid) as arguments,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type,
  pg_catalog.array_to_string(p.proacl, ',') as permissions
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' 
  AND p.proname IN ('has_role', 'is_staff')
ORDER BY p.proname;

-- Check if authenticated role has EXECUTE permission
-- If the permissions column doesn't show 'authenticated=X' or is null, we need to grant it

-- Grant EXECUTE permission on has_role function to authenticated role
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Grant EXECUTE permission on is_staff function to authenticated role
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated;

-- Also check and fix ownership if needed
-- The function should be owned by postgres or a user with sufficient privileges
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_catalog.pg_get_userbyid(p.proowner) as owner
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' 
  AND p.proname IN ('has_role', 'is_staff');

-- If owner is not postgres or a superuser, consider changing it:
-- ALTER FUNCTION public.has_role(UUID, public.app_role) OWNER TO postgres;
-- ALTER FUNCTION public.is_staff(UUID) OWNER TO postgres;

-- Verify the grants were applied
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_catalog.pg_get_function_arguments(p.oid) as arguments,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type,
  pg_catalog.array_to_string(p.proacl, ',') as permissions
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' 
  AND p.proname IN ('has_role', 'is_staff')
ORDER BY p.proname;