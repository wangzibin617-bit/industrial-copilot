// ============================================================
// Simple keyword-based product & knowledge retrieval
// No pgvector — uses SQL ILIKE matching
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";

export interface RetrievedProduct {
  id: string;
  brand_name: string;
  category_name: string;
  series: string;
  model: string;
  name: string;
  description: string;
  source_note: string;
  attributes: { group: string; name: string; value: string }[];
}

export interface RetrievedKnowledge {
  id: string;
  title: string;
  content: string;
  tags: string[];
  brand_name: string | null;
  source_type: string;
}

export interface RetrievalResult {
  products: RetrievedProduct[];
  knowledge: RetrievedKnowledge[];
  hasData: boolean;
}

/**
 * Extract Chinese/English keywords from user message.
 * Splits on common delimiters, removes short words and stop words.
 */
function extractKeywords(message: string): string[] {
  const stopWords = new Set([
    "我", "你", "的", "了", "是", "在", "有", "和", "要", "一个",
    "需要", "推荐", "什么", "哪个", "如何", "怎么", "为什么",
    "可以", "这个", "那个", "吗", "呢", "吧", "啊", "请",
    "帮", "给", "让", "用", "做", "说", "看", "想",
    "the", "a", "an", "is", "are", "for",
  ]);

  const words: string[] = [];
  // Split on common delimiters and punctuation
  const segments = message
    .replace(/[，,。！？、；：""''（）\s]+/g, " ")
    .split(" ")
    .filter(Boolean);

  for (const seg of segments) {
    const trimmed = seg.trim();
    if (trimmed.length >= 2 && !stopWords.has(trimmed)) {
      words.push(trimmed);
    }
    // Also add 3-char substrings for Chinese matching
    if (trimmed.length >= 3 && !stopWords.has(trimmed)) {
      words.push(trimmed);
    }
  }

  // Deduplicate
  return [...new Set(words)].slice(0, 15);
}

/**
 * Retrieve relevant products and knowledge for a user query.
 * Uses keyword + ILIKE matching on Supabase.
 */
export async function retrieve(
  query: string
): Promise<RetrievalResult> {
  const supabase = createAdminClient();
  const keywords = extractKeywords(query);

  if (keywords.length === 0) {
    return { products: [], knowledge: [], hasData: false };
  }

  // ── Search products ──
  const productConditions = keywords
    .map((kw) => `model.ilike.%${kw}%,name.ilike.%${kw}%,description.ilike.%${kw}%,series.ilike.%${kw}%`)
    .join(",");

  let products: RetrievedProduct[] = [];
  try {
    const { data: prodData, error: prodErr } = await supabase
      .from("products")
      .select(
        `id, series, model, name, description, source_note,
         brand:brands(name), category:product_categories(name)`
      )
      .or(
        keywords.map((kw) => `model.ilike.%${kw}%`).join(",") +
          "," +
          keywords.map((kw) => `name.ilike.%${kw}%`).join(",") +
          "," +
          keywords.map((kw) => `series.ilike.%${kw}%`).join(",")
      )
      .eq("is_active", true)
      .limit(10);

    if (!prodErr && prodData) {
      // Fetch attributes for matched products
      const productIds = prodData.map((p: any) => p.id);
      const { data: attrData } = await supabase
        .from("product_attributes")
        .select("product_id, attr_group, attr_name, attr_value")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });

      const attrMap = new Map<string, any[]>();
      (attrData || []).forEach((a: any) => {
        if (!attrMap.has(a.product_id)) attrMap.set(a.product_id, []);
        attrMap.get(a.product_id)!.push({
          group: a.attr_group,
          name: a.attr_name,
          value: a.attr_value,
        });
      });

      products = prodData.map((p: any) => ({
        id: p.id,
        brand_name: p.brand?.name || "未知品牌",
        category_name: p.category?.name || "未知分类",
        series: p.series,
        model: p.model,
        name: p.name,
        description: p.description || "",
        source_note: p.source_note || "",
        attributes: attrMap.get(p.id) || [],
      }));
    }
  } catch (err) {
    console.error("[retrieve] Product search error:", err);
  }

  // ── Search sales_knowledge ──
  let knowledge: RetrievedKnowledge[] = [];
  try {
    const { data: knData, error: knErr } = await supabase
      .from("sales_knowledge")
      .select(`id, title, content, category_tags, source_type, brand:brands(name)`)
      .or(
        keywords.map((kw) => `title.ilike.%${kw}%`).join(",") +
          "," +
          keywords.map((kw) => `content.ilike.%${kw}%`).join(",")
      )
      .limit(5);

    if (!knErr && knData) {
      knowledge = knData.map((k: any) => ({
        id: k.id,
        title: k.title,
        content: k.content,
        tags: k.category_tags || [],
        brand_name: k.brand?.name || null,
        source_type: k.source_type,
      }));
    }
  } catch (err) {
    console.error("[retrieve] Knowledge search error:", err);
  }

  const hasData = products.length > 0 || knowledge.length > 0;

  if (hasData) {
    console.log(
      `[retrieve] Query: "${query.slice(0, 60)}..." → ${products.length} products, ${knowledge.length} knowledge items`
    );
  } else {
    console.log(
      `[retrieve] Query: "${query.slice(0, 60)}..." → no matches`
    );
  }

  return { products, knowledge, hasData };
}
