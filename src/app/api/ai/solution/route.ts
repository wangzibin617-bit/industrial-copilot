// ============================================================
// /api/ai/solution — Generate a solution plan (non-streaming)
// ============================================================

import { generateText } from "ai";
import { getModel } from "@/lib/ai/deepseek";
import { retrieve } from "@/lib/ai/retrieve";
import { buildDataContext } from "@/lib/ai/prompts";
import { getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const maxDuration = 90;

const RequestSchema = z.object({
  customerIndustry: z.string().optional().default(""),
  customerScenario: z.string().min(1, "Scenario is required"),
  budgetPreference: z.string().optional().default(""),
  brandPreference: z.string().optional().default(""),
  extraRequirements: z.string().optional().default(""),
});

const SOLUTION_SYSTEM_PROMPT = `你是「工业自动化方案撰写专家」——服务于施耐德电气和信捷电气双品牌代理商的AI售前工程师。

## 任务
根据用户提供的客户需求信息，生成一份专业的工业自动化解决方案。

## 强制输出格式

### 1. 客户需求理解
用 2-3 句话概括客户的应用场景和核心需求。

### 2. 推荐配置
用表格列出推荐的产品配置：
| 序号 | 类别 | 品牌 | 系列 | 型号（示例） | 数量 | 关键参数 | 选型理由 |

### 3. 推荐理由
逐条说明为什么推荐这个配置方案（技术匹配、品牌优势、预算考虑等）。

### 4. 替代方案
给出 1-2 个替代方案供销售灵活选择：
- 方案A（优先推荐）：...
- 方案B（预算优化/品牌替代）：...

### 5. 风险提示与注意事项
列出需要注意的技术风险和现场安装注意事项。

### 6. 下一步销售动作
告诉销售下一步应该做什么：
- 跟客户确认什么？
- 需要售前审核什么？
- 采购需要确认什么？

### 7. 参考数据来源
列出方案中引用的产品数据和知识来源。

## 约束
1. 只推荐检索数据中存在的型号。无匹配数据时明确声明。
2. 所有型号标注「示例型号」。
3. 不编造价格。如需提及标注「示例价格」。
4. 方案末尾标注「本方案为AI生成初稿，请售前工程师审核确认后使用」。
5. 用销售能理解的语言撰写，避免过于专业的术语。`;

async function authenticate(req: Request) {
  const cookieUser = await getCurrentUser();
  if (cookieUser) return cookieUser;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const supabaseAdmin = createAdminClient();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
      if (!error && user) return user;
    } catch { /* invalid */ }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { customerIndustry, customerScenario, budgetPreference, brandPreference, extraRequirements } = parsed.data;

    // ── Retrieve matching products & knowledge ──
    const searchQuery = [customerIndustry, customerScenario, brandPreference, extraRequirements].filter(Boolean).join(" ");
    let dataContext = "";
    let referencedProductIds: string[] = [];
    try {
      const results = await retrieve(searchQuery);
      dataContext = buildDataContext(results);
      referencedProductIds = results.products.map((p) => p.id);
    } catch (err) {
      console.error("[Solution] Retrieval failed:", err);
    }

    // ── Build user prompt ──
    const userPrompt = `请为以下客户需求生成工业自动化解决方案：

**客户行业**：${customerIndustry || "未指定"}
**应用场景**：${customerScenario}
**预算偏好**：${budgetPreference || "未指定"}
**品牌偏好**：${brandPreference || "无偏好，施耐德和信捷均可"}
**补充需求**：${extraRequirements || "无"}

${dataContext ? `\n以下是系统中匹配到的产品数据和销售知识，请优先基于这些数据推荐配置：\n${dataContext}` : "\n注意：当前数据层未收录相关型号，请给出通用建议并标注需以官方手册为准。"}`;

    // ── Generate solution ──
    const result = await generateText({
      model: getModel("deepseek-chat"),
      system: SOLUTION_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.4,
      maxTokens: 4096,
    });

    const content = result.text;

    // ── Save to DB ──
    const title = `${customerIndustry || "方案"} - ${customerScenario.slice(0, 40)}${customerScenario.length > 40 ? "..." : ""}`;
    const supabaseAdmin = createAdminClient();
    const { data: saved, error: saveErr } = await supabaseAdmin
      .from("solution_plans")
      .insert({
        user_id: user.id,
        title,
        customer_industry: customerIndustry || null,
        customer_scenario: customerScenario,
        budget_preference: budgetPreference || null,
        brand_preference: brandPreference || null,
        extra_requirements: extraRequirements || null,
        generated_content: content,
        referenced_products: referencedProductIds,
        status: "draft",
      })
      .select("id")
      .single();

    if (saveErr) {
      console.error("[Solution] Save failed:", saveErr);
      return new Response(JSON.stringify({ error: "Failed to save solution", content }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ id: saved.id, content }), { headers: { "Content-Type": "application/json" } });
  } catch (error: unknown) {
    console.error("[Solution] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
