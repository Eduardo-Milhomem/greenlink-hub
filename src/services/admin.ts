import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

export type AdminUser = {
  id: string;
  email?: string;
  fullName?: string;
  roles: AppRole[];
  createdAt?: string;
};

export const adminService = {
  listUsers: async (): Promise<AdminUser[]> => {
    const [{ data: profiles, error: profileError }, { data: roles, error: roleError }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    if (profileError) throw profileError;
    if (roleError) throw roleError;

    const rolesByUser = new Map<string, AppRole[]>();
    for (const r of roles ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    }

    return (profiles ?? []).map((p: ProfileRow) => ({
      id: p.id,
      email: p.email ?? undefined,
      fullName: p.full_name ?? undefined,
      roles: rolesByUser.get(p.id) ?? [],
      createdAt: p.created_at,
    }));
  },

  addRole: async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    if (error) throw error;
  },

  removeRole: async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) throw error;
  },
};

