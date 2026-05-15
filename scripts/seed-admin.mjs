import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_RESET_PASSWORD = (process.env.ADMIN_RESET_PASSWORD || "").toLowerCase() === "true";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = (data?.users || []).find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  return user || null;
}

async function main() {
  const existing = await findUserByEmail(ADMIN_EMAIL);

  let user = existing;
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: ADMIN_NAME ? { full_name: ADMIN_NAME } : undefined,
    });
    if (error) throw error;
    user = data.user;
  } else if (ADMIN_RESET_PASSWORD) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      user_metadata: ADMIN_NAME ? { full_name: ADMIN_NAME } : undefined,
    });
    if (error) throw error;
  }

  if (!user) throw new Error("Unable to resolve admin user");

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        full_name: ADMIN_NAME || user.user_metadata?.full_name || user.email,
      },
      { onConflict: "id" },
    );
  if (profileError) throw profileError;

  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
  if (roleError) throw roleError;

  process.stdout.write(`Admin ready: ${ADMIN_EMAIL} (${user.id})\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

