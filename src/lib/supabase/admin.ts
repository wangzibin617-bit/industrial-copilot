// ============================================================
// Supabase Admin Client — for privileged operations (Service Role)
// ============================================================

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "❌ 缺少 Supabase Service Role Key。\n" +
        "请在 .env.local 中设置 SUPABASE_SERVICE_ROLE_KEY。"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
