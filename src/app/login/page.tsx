// ============================================================
// /login — Email/Password login with Supabase Auth
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Factory,
  Zap,
  ShieldCheck,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`,
          },
        });

        if (error) throw error;

        setMessage(
          "✅ 注册成功！请检查邮箱并点击确认链接（如未收到请检查垃圾邮件），然后返回此页登录。"
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/chat");
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "未知错误，请重试。";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2.5 bg-primary rounded-xl">
            <Factory className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Industrial Copilot
          </h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-sm">
          AI 工业销售助手 — 施耐德 & 信捷产品选型 · 技术问答 · 方案推荐
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm">
        <div className="bg-card border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-1">
            {isSignUp ? "创建账号" : "登录"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {isSignUp ? "注册一个新账号开始使用" : "使用邮箱和密码登录"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                placeholder="sales@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
              >
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isSignUp ? "注册" : "登录"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? "已有账号？去登录" : "没有账号？去注册"}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: "AI选型" },
            { icon: ShieldCheck, label: "技术问答" },
            { icon: Factory, label: "方案推荐" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Environment Warning */}
        <div className="mt-6 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
          <strong>⚠️ 环境要求：</strong>
          请确保已配置 <code>.env.local</code> 文件中的 Supabase 和 DeepSeek
          环境变量。详见 <code>.env.example</code>。
        </div>
      </div>
    </div>
  );
}
