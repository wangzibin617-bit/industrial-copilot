// ============================================================
// /products — Read-only product browser (brand + category filter)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Factory,
  ArrowLeft,
  Loader2,
  Search,
  X,
  ChevronRight,
  Cpu,
  Monitor,
  Gauge,
  Cog,
  Zap,
} from "lucide-react";

interface Product {
  id: string;
  series: string;
  model: string;
  name: string;
  description: string;
  source_note: string;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  plc: <Cpu className="w-4 h-4" />,
  hmi: <Monitor className="w-4 h-4" />,
  vfd: <Gauge className="w-4 h-4" />,
  servo: <Cog className="w-4 h-4" />,
  "low-voltage": <Zap className="w-4 h-4" />,
};

export default function ProductsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [supabase, router]);

  // Load brands + categories
  useEffect(() => {
    async function loadMeta() {
      try {
        const [{ data: brandData }, { data: catData }] = await Promise.all([
          supabase.from("brands").select("id, name, slug"),
          supabase
            .from("product_categories")
            .select("id, name, slug")
            .is("parent_id", null),
        ]);
        setBrands(brandData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error("Failed to load meta:", err);
      }
    }
    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load products (with filters)
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from("products")
          .select(
            `id, series, model, name, description, source_note,
             brand:brands(name, slug),
             category:product_categories(name, slug)`
          )
          .eq("is_active", true)
          .order("brand_id", { ascending: true })
          .order("series", { ascending: true });

        if (brandFilter) {
          query = query.eq("brand_id", brandFilter);
        }
        if (categoryFilter) {
          query = query.eq("category_id", categoryFilter);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(
            `model.ilike.%${q}%,name.ilike.%${q}%,series.ilike.%${q}%,description.ilike.%${q}%`
          );
        }

        const { data, error } = await query.limit(50);
        if (error) throw error;
        // Supabase join returns nested objects as arrays; map to flat shape
        const mapped: Product[] = ((data as any[]) || []).map((p: any) => ({
          id: p.id,
          series: p.series,
          model: p.model,
          name: p.name,
          description: p.description,
          source_note: p.source_note,
          brand: Array.isArray(p.brand) ? p.brand[0] ?? null : (p.brand || null),
          category: Array.isArray(p.category) ? p.category[0] ?? null : (p.category || null),
        }));
        setProducts(mapped);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "加载失败";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandFilter, categoryFilter, searchQuery]);

  function clearFilters() {
    setBrandFilter(null);
    setCategoryFilter(null);
    setSearchQuery("");
  }

  const hasFilters = brandFilter || categoryFilter || searchQuery;
  const matched = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.series.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/chat")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Factory className="w-5 h-5 text-primary" />
            <h1 className="font-semibold">产品库</h1>
            <span className="text-xs text-muted-foreground">
              （示例数据，以官方手册为准）
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索型号、系列或关键词..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Brand + Category pills */}
          <div className="flex flex-wrap gap-2">
            {/* Brand filter */}
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() =>
                  setBrandFilter(brandFilter === b.id ? null : b.id)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  brandFilter === b.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {b.name}
              </button>
            ))}

            <span className="text-border mx-1">|</span>

            {/* Category filter */}
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  setCategoryFilter(
                    categoryFilter === c.id ? null : c.id
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {CATEGORY_ICONS[c.slug] || null}
                {c.name}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
                清除
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => setError(null)}>
              重试
            </Button>
          </div>
        ) : matched.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {hasFilters
                ? "没有匹配的产品，试试调整筛选条件"
                : "产品库暂无数据，请先执行 seed 脚本"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              共 {matched.length} 个产品
            </p>
            <div className="grid gap-2">
              {matched.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {p.brand && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              p.brand.slug === "schneider"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {p.brand.name}
                          </span>
                        )}
                        {p.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {p.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm">
                        {p.model}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.name} · {p.series} 系列
                      </p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {p.source_note}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
