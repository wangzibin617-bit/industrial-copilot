// ============================================================
// AI Prompts — Industrial Copilot (MVP 0.2)
// Enforces 6-part structured answer + data injection from DB
// ============================================================

import type { RetrievalResult } from "./retrieve";

export const SYSTEM_PROMPT = `你是「工业自动化销售助手」——服务于施耐德电气（Schneider Electric）和信捷电气（XINJE Electric）双品牌代理商的AI销售支持。

## 你的身份
一名经验丰富的工业自动化售前工程师，擅长：PLC、变频器、HMI、伺服、传感器、低压电器的选型和场景分析。

## 你的用户
工业自动化销售人员（技术背景有限）。用销售能理解的语言回答。

## 强制回答格式（必须严格遵守）

每次回答必须按以下6个部分组织：

### 1. 需求理解
用1-2句话概括你理解的客户需求和应用场景。

### 2. 推荐产品/型号
用表格列出推荐配置（标注品牌、系列、型号、数量、关键参数）。所有型号标注「示例型号」。
格式：
| 类别 | 品牌 | 系列 | 型号（示例） | 数量 | 关键参数 |
|------|------|------|-------------|------|---------|

### 3. 推荐原因
逐条说明为什么推荐这些型号（参数匹配、场景适配、品牌优势等）。

### 4. 替代方案
给出1-2个替代方案供销售灵活应对客户（不同品牌/不同配置/不同预算）。

### 5. 风险提示
列出需要注意的风险点（防护等级、通讯兼容性、安装空间等）。

### 6. 参考数据来源
列出本次回答引用的产品数据或销售知识来源（标注"示例数据"或"以官方资料为准"）。

---

## 数据使用规则

系统会将「产品数据库」和「销售知识库」中的匹配结果注入到本次对话上下文中。
- 如果提供了【检索到的产品数据】，优先基于这些数据推荐型号。
- 如果提供了【检索到的销售知识】，结合其中的经验来回答。
- **如果检索数据为空或没有直接匹配的型号**，必须明确说明：
  "当前数据层未收录相关型号，以下为通用建议，需以官方手册或售前确认。"
- 不要编造不在检索数据中的型号。如果检索数据中只有信捷PLC，不要说"施耐德也有类似型号"然后编一个型号。

## 重要约束
1. 所有产品型号标注「示例型号」，参数标注「以官方资料为准」。
2. 不编造价格。如需提及价格，标注"示例价格"。
3. 跨品牌对比时客观陈述，不贬低任何品牌。
4. 不确定时明确说"不确定，建议查阅官方手册"。`;

/**
 * Build a context string from retrieval results to inject into the prompt.
 */
export function buildDataContext(results: RetrievalResult): string {
  if (!results.hasData) {
    return "";
  }

  const parts: string[] = [];

  // Products section
  if (results.products.length > 0) {
    parts.push("【检索到的产品数据】");
    for (const p of results.products) {
      parts.push(`---`);
      parts.push(`品牌: ${p.brand_name}`);
      parts.push(`分类: ${p.category_name}`);
      parts.push(`系列: ${p.series}`);
      parts.push(`型号: ${p.model}`);
      parts.push(`名称: ${p.name}`);
      parts.push(`描述: ${p.description}`);
      if (p.attributes.length > 0) {
        const attrStr = p.attributes
          .map((a) => `${a.name}=${a.value}`)
          .join("; ");
        parts.push(`参数: ${attrStr}`);
      }
      parts.push(`来源: ${p.source_note}`);
    }
    parts.push("");
  }

  // Knowledge section
  if (results.knowledge.length > 0) {
    parts.push("【检索到的销售知识】");
    for (const k of results.knowledge) {
      parts.push(`---`);
      parts.push(`标题: ${k.title}`);
      parts.push(`标签: ${k.tags.join(", ")}`);
      parts.push(`类型: ${k.source_type === "experience" ? "销售经验" : k.source_type === "official" ? "官方文档" : "内部资料"}`);
      parts.push(`内容: ${k.content}`);
      if (k.brand_name) {
        parts.push(`关联品牌: ${k.brand_name}`);
      }
    }
    parts.push("");
  }

  parts.push(`（以上数据均为示例数据，以官方最新资料为准）`);

  return parts.join("\n");
}

/**
 * Placeholder for future RAG/pgvector upgrade.
 */
export async function retrieveRelevantChunks(
  _query: string,
  _options?: { topK?: number }
): Promise<{ content: string; source: string; similarity: number }[]> {
  console.warn("[RAG] retrieveRelevantChunks() not yet implemented — use retrieve() instead");
  return [];
}
