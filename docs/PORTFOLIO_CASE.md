# Industrial Copilot — AI 产品经理作品集案例

> **案例类型**：ToB AI SaaS 产品（0→1 MVP）
> **产品经理角色**：全栈 AI PM — 从业务调研、产品设计到技术实现、上线验证
> **周期**：MVP 0→1 和 0.2 合计约 2 周

---

## 1. 背景

### 行业背景

中国工业自动化市场有大量**多品牌代理商**——一个代理商同时代理施耐德电气、信捷电气、汇川等多个品牌。代理商内部，**销售人员**负责对接客户需求，**售前工程师**负责选型和出方案，两者之间存在严重的效率瓶颈。

### 业务问题

| 问题 | 影响 | 量化 |
|------|------|------|
| 选型依赖售前 | 销售不懂技术，100% 依赖售前出方案 | 售前日处理 5-8 个需求，排期 1-2 天 |
| 需求传递失真 | 销售口头描述"客户要做水泵控制"，售前需追问 3 轮 | 沟通损耗 30-60 分钟/需求 |
| 知识无法复用 | 老销售离职带走经验，新人 3 个月才能独立接单 | 人员流动即知识清零 |
| 跨品牌对比困难 | 不同品牌选型手册格式不同，Excel 对比全靠手工 | 单次对比耗时 30-60 分钟 |

### 为什么是 AI 产品

工业自动化选型是一个**规则密集 + 知识密集**的领域：
- 产品参数有明确边界（功率、I/O、通讯协议可结构化）
- 销售知识可沉淀（选型指南、对比话术、场景方案）
- 大语言模型擅长理解自然语言需求并匹配结构化数据

这使 AI 成为"**销售自助选型 + 售前效率工具**"的天然方案。

---

## 2. 产品目标

### MVP 核心目标

让一个不懂技术的工业销售在 5 分钟内完成：
1. 用自然语言描述客户需求
2. AI 基于真实产品数据库推荐型号
3. AI 输出结构化回答（含参数、替代方案、风险提示）
4. 对话自动保存，可回溯复用

### 成功指标（已达成）

| 指标 | 目标 | MVP 实测 |
|------|------|---------|
| AI 单次问答 | < 30 秒 | ✅ 流式响应，5-15 秒 |
| 回答引用产品数据 | 型号和参数来自 DB | ✅ TM221CE40R 精确到 I/O 参数 |
| 对话持久化 | 100% 保存 | ✅ conversations + messages 服务端自动存储 |
| 产品库可浏览 | 品牌/分类筛选 | ✅ /products 页面可用 |

---

## 3. 目标用户

### MVP 阶段（单用户）

**工业销售 / 客户经理**（如：张伟，32 岁，5 年工业自动化销售经验）
- 日常：对接客户需求 → 翻选型手册 → 问售前 → 等回复 → 报价
- 痛点：不懂 PLC 型号差异，选型依赖售前，等方案太久
- 使用 AI 的场景：客户微信发需求 → 打开 Copilot 输入 → 5 分钟拿到推荐型号 → 即刻回复客户

### 后续扩展（已设计，未开发）

详见 [DESIGN_V1.md](../DESIGN_V1.md) — 含销售总监、售前工程师、采购、知识库管理员等 5 类组织角色。

---

## 4. MVP 范围决策

### 做了（MVP 0→1 + 0.2）

| 决策 | 理由 |
|------|------|
| 只做单用户 | 先验证 AI 选型价值，再扩展多角色协作 |
| SQL ILIKE 检索，不用 pgvector | 20 条产品数据用向量检索是过度设计；ILIKE 够用且易调试 |
| 产品数据用英文 | 避免中文字符在不同编码层间损坏（实际遇到并修复了此问题） |
| 服务端持久化对话 | 客户端存储不可靠；API route 在 `onFinish` 回调写入，确保消息不丢失 |
| Bearer Token + Cookie 双认证 | Cookie 支持浏览器流程，Bearer 支持 API 客户端和测试 |

### 刻意不做

| 不做 | 原因 |
|------|------|
| 多层角色系统 | 单用户阶段无协作场景，RBAC 是过度设计 |
| pgvector 向量检索 | 数据量小（20 产品 + 10 知识），ILIKE 效果已满足 |
| 方案导出 Word | 先验证选型准确率，方案能力是 V1.1 |
| 价格/报价引擎 | 代理商进价敏感，MVP 只做选型不做定价 |
| 微信小程序 | PC Web 先跑通闭环 |

---

## 5. 核心流程

### 用户完整使用路径

```
注册/登录 → /chat
  │
  ├─ 输入自然语言需求
  │   "客户要做一条小型包装产线，预算有限，
  │    需要 PLC、HMI 和变频器，优先信捷，对比施耐德"
  │
  ├─ AI 检索 products + sales_knowledge
  │   ├─ extractKeywords: ["包装产线","PLC","HMI","变频器","信捷","施耐德"]
  │   ├─ SQL ILIKE → 匹配到 XC3-24R-E, VH6-7R5G-3B, TH765-M 等产品
  │   └─ SQL ILIKE → 匹配到 "Small Packaging Line Standard Configuration" 等知识
  │
  ├─ DeepSeek 流式生成回答
  │   ├─ 需求理解 → 推荐产品表格 → 推荐原因 → 替代方案 → 风险提示 → 来源标注
  │   └─ 型号参数来自 product_attributes 表（40 I/O, Modbus RTU/TCP 等）
  │
  └─ 对话自动保存 → /history 可回溯
```

### 数据流

```
User Input → extractKeywords() → Supabase ILIKE Query
  → products (+ brand, category, attributes)
  → sales_knowledge (+ tags, brand)
  → buildDataContext() → inject as system message
  → DeepSeek streamText() → AI SDK useChat → UI render
  → onFinish → saveMessage(assistant) → Supabase messages
```

---

## 6. 数据设计

### 数据库 ER（MVP 阶段）

```
brands ───┐
          ├── products ─── product_attributes
categories┘       │
                  │ (keyword ILIKE search)
                  ▼
            AI Chat Context

sales_knowledge ── (keyword ILIKE search) ── AI Chat Context

users ─── conversations ─── messages
```

### 数据表层级

| 层级 | 表 | 数据性质 |
|------|-----|---------|
| 基础数据 | brands, product_categories | 平台预置，所有用户共享 |
| 业务数据 | products, product_attributes | 平台 seed + 组织可自建 |
| 知识数据 | sales_knowledge | 销售经验和选型指南 |
| 对话数据 | conversations, messages | 用户生成，按 user_id 隔离 (RLS) |

### 数据可追溯

每条业务数据包含 `source_type` 和 `source_note` 字段：
- `source_type`: `platform`（平台预置）/ `internal`（内部资料）/ `experience`（销售经验）
- `source_note`: 如 "Example model - parameters subject to official Schneider catalog"

---

## 7. AI 能力设计

### System Prompt 工程

核心设计原则：
1. **角色定义**：工业自动化售前工程师，服务双品牌代理商
2. **输出约束**：强制 6 段式格式（需求理解/推荐产品/原因/替代方案/风险/来源）
3. **幻觉防护**：只基于检索数据推荐型号，无匹配时明确声明，不编造参数
4. **角色感知**：根据用户角色调整语言风格（销售用非技术语言）

### 检索策略选择

| 方案 | 适用阶段 | 为什么 |
|------|---------|--------|
| SQL ILIKE | MVP（当前） | 数据量小，实现简单，延迟低（<50ms） |
| pgvector 余弦检索 | V3.0（后续） | 数据量 >1000 条文档时，语义检索优于关键词 |
| 混合检索 | V3.0+ | ILIKE + 向量 + 重排序，效果最优 |

### 防幻觉机制（已实现）

| 层级 | 机制 | 状态 |
|------|------|:--:|
| Prompt 约束 | System Prompt 明确"只基于检索数据推荐" | ✅ |
| 数据注入 | 实际 DB 数据作为上下文，AI 被约束在此范围内 | ✅ |
| 来源标注 | 每条 seed 数据有 source_note，AI 回答需引用 | ✅ |
| 空数据兜底 | 无匹配时 AI 声明"数据层未收录，需查阅官方手册" | ✅ |

---

## 8. 已验证结果

### 测试环境

- **AI 模型**：DeepSeek Chat API
- **测试方式**：PowerShell 端到端 API 测试 + 人工提取流式内容验证
- **数据规模**：2 品牌 / 8 分类 / 20 产品 / 16 属性 / 10 销售知识

### 测试案例

**输入**："What is Schneider TM221CE40R PLC specs? I/O count and protocols."

**AI 回答提取**：

```
需求理解：您想了解施耐德 M221 系列 TM221CE40R 型号 PLC 的规格

推荐产品：
| 类别 | 品牌 | 系列 | 型号 | 关键参数 |
|------|------|------|------|---------|
| 紧凑型PLC | Schneider Electric | M221 | TM221CE40R | I/O=40(24入16出)；继电器输出；Modbus RTU/TCP；AC 100-240V |

推荐原因：
- I/O 点数充足：40 点适合中型包装线
- 通讯能力强：支持 Modbus RTU/TCP

替代方案：
| 类别 | 品牌 | 系列 | 型号 | 关键参数 |
|------|------|------|------|---------|
| 紧凑型PLC | XINJE Electric | XD3 | XD3-32R-E | 32 I/O；Modbus RTU/TCP |
```

**验证结论**：
- ✅ 型号 TM221CE40R 精确匹配 seed 数据
- ✅ I/O 参数 (40, 24入16出) 来自 product_attributes
- ✅ Modbus RTU/TCP 来自 product_attributes
- ✅ 替代方案 XD3-32R-E 来自 products（信捷产品线）
- ✅ 回答标明 "示例型号"、"以官方资料为准"

---

## 9. 技术实现亮点

| 实现点 | 说明 |
|--------|------|
| Vercel AI SDK 流式 | `useChat` + `streamText` 实现 SSE 流式输出，用户即时看到回答 |
| 服务端持久化 | `streamText` 的 `onFinish` 回调在服务端写入 messages，不依赖客户端 |
| 双认证模式 | Cookie（浏览器）+ Bearer Token（API/测试），`authenticate()` 统一处理 |
| EAV 属性模型 | `product_attributes` 用 EAV 模式存储，灵活适配不同品类参数差异 |
| 关键词提取 | `extractKeywords()` 中文分词 + 停用词过滤，免外部 NLP 库 |
| 客户端 UUID 预生成 | `crypto.randomUUID()` + `flushSync` 确保 conversationId 在请求前就绪 |

---

## 10. 下一步规划

### 短期（V1.1）
- 组织协作：销售 ↔ 售前协同选型流程
- 方案生成：AI 基于确认型号生成 Word 方案文档
- 审批流：大项目方案需总监审批

### 中期（V1.2–V2.0）
- 采购角色接入：货期反馈、成本区间
- 微信小程序：移动端选型
- pgvector 知识库：文档上传 → 自动分块 → 语义检索

### 长期（V3.0+）
- 多品牌扩展：汇川、西门子、ABB
- 垂直行业模板：包装/水处理/暖通/机床
- 数据分析：选型热点、销售效率看板

---

> **相关文档**：
> - [README.md](../README.md) — 项目使用说明
> - [DESIGN_V1.md](../DESIGN_V1.md) — 完整产品设计文档（PRD + 架构 + 数据库 + Sprint）

---

*案例编写：AI Product Manager · 2026-06*
