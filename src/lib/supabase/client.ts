// ============================================================
// Supabase Browser Client — for Client Components
// ============================================================

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "❌ 缺少 Supabase 环境变量。\n" +
        "请复制 .env.example 为 .env.local 并填入你的 Supabase 项目信息。\n" +
        "获取地址: Supabase Dashboard → Project Settings → API\n" +
        "  - NEXT_PUBLIC_SUPABASE_URL\n" +
        "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
