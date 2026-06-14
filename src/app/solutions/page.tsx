// ============================================================
// /solutions — List all saved solution plans
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Factory,
  ArrowLeft,
  Plus,
  FileText,
  Trash2,
  Loader2,
  Calendar,
  ChevronRight,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";

interface SolutionPlan {
  id: string;
  title: string;
  customer_industry: string | null;
  customer_scenario: string;
  status: string;
  created_at: string;
}

export default function SolutionsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [solutions, setSolutions] = useState<SolutionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    }
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    loadSolutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSolutions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("solution_plans")
        .select("id, title, customer_industry, customer_scenario, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSolutions(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSolution(id: string) {
    await supabase.from("solution_plans").delete().eq("id", id);
    setSolutions((prev) => prev.filter((s) => s.id !== id));
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    draft: { label: "草稿", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
    confirmed: { label: "已确认", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    archived: { label: "已归档", color: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Factory className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">方案中心</h1>
          </div>
          <Button size="sm" onClick={() => router.push("/solutions/new")}>
            <Plus className="w-4 h-4" />
            新建方案
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={loadSolutions}>重试</Button>
          </div>
        ) : solutions.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">暂无方案</h2>
            <p className="text-sm text-muted-foreground mb-6">
              使用 AI 根据客户需求生成销售方案
            </p>
            <Button onClick={() => router.push("/solutions/new")}>
              <Sparkles className="w-4 h-4" />
              生成第一个方案
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {solutions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/solutions/${s.id}`)}
              >
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{s.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{formatDate(s.created_at)}</span>
                    {s.customer_industry && (
                      <span className="text-xs text-muted-foreground">· {s.customer_industry}</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusLabel[s.status]?.color || ""}`}>
                      {statusLabel[s.status]?.label || s.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSolution(s.id); }}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
