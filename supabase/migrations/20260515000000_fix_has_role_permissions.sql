-- Fix permissions for has_role function
-- This migration grants EXECUTE permission on has_role function to authenticated role

-- Grant EXECUTE permission on has_role function to authenticated role
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Grant EXECUTE permission on is_staff function to authenticated role
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated;

-- Also ensure the functions are accessible (they should already be SECURITY DEFINER)
-- The SECURITY DEFINER attribute means the function runs with the privileges of its creator
-- But we still need to grant EXECUTE permission to the roles that need to call it

-- Additionally, we should ensure the function owner has proper privileges
-- The function should be owned by a user with sufficient privileges (like postgres)
-- This ensures SECURITY DEFINER functions work correctly