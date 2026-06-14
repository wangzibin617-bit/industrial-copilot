// ============================================================
// /solutions/new — Create a solution plan via AI
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Factory,
  Loader2,
  Sparkles,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const INDUSTRIES = [
  "包装", "食品饮料", "水处理", "暖通空调", "输送与物流",
  "机床配套", "纺织", "塑料与橡胶", "制药", "其他",
];

const BUDGETS = ["经济型（控制成本优先）", "标准型（性价比平衡）", "高端型（品质优先）"];
const BRANDS = ["无偏好", "优先施耐德", "优先信捷", "施耐德+信捷混合"];

export default function NewSolutionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    industry: "",
    scenario: "",
    budget: "",
    brand: "",
    extra: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.scenario.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch("/api/ai/solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIndustry: form.industry,
          customerScenario: form.scenario,
          budgetPreference: form.budget,
          brandPreference: form.brand,
          extraRequirements: form.extra,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function copyMarkdown() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = result.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/solutions")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Factory className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">生成方案</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                客户需求信息
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                填写客户需求，AI 将基于产品数据库和销售知识生成方案。
              </p>

              {/* Industry */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">客户行业</label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setForm({ ...form, industry: form.industry === ind ? "" : ind })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        form.industry === ind
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">
                  应用场景 <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={form.scenario}
                  onChange={(e) => setForm({ ...form, scenario: e.target.value })}
                  placeholder="例：小型包装产线，含3台传送带和1台封口机。现场环境有粉尘，需要PLC控制整线联动，配触摸屏监控。"
                  rows={3}
                  className="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              {/* Budget + Brand row */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">预算偏好</label>
                  <div className="space-y-1.5">
                    {BUDGETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm({ ...form, budget: form.budget === b ? "" : b })}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          form.budget === b ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">品牌偏好</label>
                  <div className="space-y-1.5">
                    {BRANDS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm({ ...form, brand: form.brand === b ? "" : b })}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          form.brand === b ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extra */}
              <div>
                <label className="block text-sm font-medium mb-1.5">补充需求</label>
                <textarea
                  value={form.extra}
                  onChange={(e) => setForm({ ...form, extra: e.target.value })}
                  placeholder="任何额外信息：特殊环境要求、客户关注点、已确定的型号等..."
                  rows={2}
                  className="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading || !form.scenario.trim()}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 正在生成方案...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> 生成方案</>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              AI 基于产品数据库和销售知识生成方案初稿。所有型号为示例，以官方手册为准。
            </p>
          </form>
        ) : (
          /* Result view */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                方案已生成
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyMarkdown}>
                  <ClipboardCheck className="w-4 h-4" />
                  {copied ? "已复制" : "复制 Markdown"}
                </Button>
                <Button size="sm" onClick={() => router.push(`/solutions/${result.id}`)}>
                  查看详情
                </Button>
              </div>
            </div>
            <div className="bg-card border rounded-xl p-6">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-muted [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5 [&_h3]:text-base">
                  <ReactMarkdown>{result.content}</ReactMarkdown>
                </div>
              </ScrollArea>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setResult(null); setError(null); }}>
                新建方案
              </Button>
              <Button onClick={() => router.push("/solutions")}>
                查看所有方案
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
