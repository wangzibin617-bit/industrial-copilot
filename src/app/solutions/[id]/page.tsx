// ============================================================
// /solutions/[id] — View solution plan detail + copy Markdown
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Factory,
  FileText,
  ClipboardCheck,
  Loader2,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SolutionPlan {
  id: string;
  title: string;
  customer_industry: string | null;
  customer_scenario: string;
  budget_preference: string | null;
  brand_preference: string | null;
  extra_requirements: string | null;
  generated_content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function SolutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [solution, setSolution] = useState<SolutionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    }
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("solution_plans")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setSolution(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Not found");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, supabase]);

  async function copyMarkdown() {
    if (!solution) return;
    try {
      await navigator.clipboard.writeText(solution.generated_content);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = solution.generated_content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function deleteSolution() {
    if (!solution) return;
    await supabase.from("solution_plans").delete().eq("id", solution.id);
    router.push("/solutions");
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("zh-CN");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || "Solution not found"}</p>
        <Button variant="outline" onClick={() => router.push("/solutions")}>
          返回列表
        </Button>
      </div>
    );
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
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => router.push("/solutions")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Factory className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate">{solution.title}</h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(solution.created_at)}</span>
                <span className={`px-1.5 py-0.5 rounded ${statusLabel[solution.status]?.color || ""}`}>
                  {statusLabel[solution.status]?.label || solution.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyMarkdown}>
              <ClipboardCheck className="w-4 h-4" />
              {copied ? "已复制" : "复制 MD"}
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={deleteSolution}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Metadata */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
          {solution.customer_industry && (
            <span className="px-2 py-1 rounded bg-muted">行业：{solution.customer_industry}</span>
          )}
          {solution.budget_preference && (
            <span className="px-2 py-1 rounded bg-muted">预算：{solution.budget_preference}</span>
          )}
          {solution.brand_preference && (
            <span className="px-2 py-1 rounded bg-muted">品牌：{solution.brand_preference}</span>
          )}
          <span className="px-2 py-1 rounded bg-muted">场景：{solution.customer_scenario}</span>
        </div>
        {solution.extra_requirements && (
          <p className="text-xs text-muted-foreground mb-4">补充：{solution.extra_requirements}</p>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-card border rounded-xl p-6">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-muted [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_h3]:text-base [&_h2]:text-lg">
              <ReactMarkdown>{solution.generated_content}</ReactMarkdown>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
