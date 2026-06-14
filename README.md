# Industrial Copilot

**AI 工业销售助手** — 面向工业自动化代理商的智能选型、技术问答与方案推荐系统。

---

## 项目定位

Industrial Copilot 是一个可真实运行的 ToB AI SaaS 产品（MVP 阶段），服务于**工业自动化多品牌代理商**（如同时代理施耐德电气和信捷电气的经销商）。

核心价值：让不懂技术的销售能用自然语言完成产品选型、跨品牌对比和技术问答，让 AI 基于**真实产品数据库**和**销售经验知识库**生成结构化回答，替代传统"翻选型手册 → 问售前 → 等回复"的低效流程。

---

## 已完成功能

### MVP 0→1：AI 对话闭环

| 功能 | 说明 | 状态 |
|------|------|:--:|
| 用户认证 | 邮箱注册/登录（Supabase Auth） | ✅ |
| AI 对话 | 自然语言工业自动化问答，流式输出（DeepSeek + AI SDK） | ✅ |
| 结构回答 | 6 段式格式：需求理解 → 推荐产品 → 原因 → 替代方案 → 风险 → 来源 | ✅ |
| 对话记录 | 自动保存 conversations + messages 到 Supabase（服务端持久化） | ✅ |
| 历史查看 | /history 页面浏览和回放历史对话 | ✅ |

### MVP 0.2：真实业务数据层

| 功能 | 说明 | 状态 |
|------|------|:--:|
| 品牌数据 | 施耐德电气 + 信捷电气 | ✅ |
| 产品数据 | 20 条产品（PLC/HMI/VFD/Servo/Low Voltage，含规格属性） | ✅ |
| 销售知识 | 10 条（包装产线/设备选型/输送线/温控/改造/对比话术等） | ✅ |
| 关键词检索 | 基于 SQL ILIKE 从 products + sales_knowledge 检索匹配数据 | ✅ |
| 数据注入 | 检索结果注入 DeepSeek prompt，AI 引用具体型号和参数回答 | ✅ |
| 产品库页面 | /products 只读浏览，支持品牌/分类筛选和关键词搜索 | ✅ |

---

## 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 15 (App Router) | React Server Components + API Routes |
| 语言 | TypeScript | 全栈类型安全 |
| 样式 | Tailwind CSS v4 + shadcn/ui | 组件化 UI，支持 dark mode |
| 认证 | Supabase Auth | email/password，RLS 数据隔离 |
| 数据库 | Supabase (PostgreSQL) | 业务数据 + 向量检索预留 |
| AI 模型 | DeepSeek Chat API | 流式输出，temperature=0.5 |
| AI 框架 | Vercel AI SDK (`useChat` + `streamText`) | 客户端/服务端流式 AI |
| AI 兼容层 | @ai-sdk/openai | DeepSeek 的 OpenAI 兼容接口 |

---

## 数据库表结构（当前 7 张表）

| 表名 | 用途 | 行数 |
|------|------|:--:|
| `brands` | 品牌定义（施耐德、信捷） | 2 |
| `product_categories` | 产品分类层级（PLC/HMI/VFD/Servo/LV + 子类） | 8 |
| `products` | 产品型号数据（含 series/model/description/source_note） | 20 |
| `product_attributes` | EAV 规格参数（I/O点数、功率、通讯协议等） | 16 |
| `sales_knowledge` | 销售经验知识库（选型指南、对比话术、场景方案） | 10 |
| `conversations` | 对话会话记录 | 按使用增长 |
| `messages` | 对话消息（user/assistant） | 按使用增长 |

每条业务数据均标注 `source_type` 和 `source_note`（示例数据/以官方资料为准），确保可追溯。

---

## AI 数据检索与回答流程

```
用户提问
  │
  ▼
extractKeywords()  ← 提取中文/英文关键词，过滤停用词
  │
  ▼
retrieve()  ← SQL ILIKE 检索
  ├── products 表: model, name, series, description 字段匹配
  └── sales_knowledge 表: title, content 字段匹配
  │
  ▼
buildDataContext()  ← 构建结构化上下文文本
  │
  ▼
streamText()  ← DeepSeek 流式生成
  │  system: SYSTEM_PROMPT（6段式格式 + 工业知识约束）
  │  messages: [检索数据上下文, ...对话历史]
  │  onFinish: 服务端自动保存 assistant message → Supabase
  │
  ▼
用户收到流式回答（含型号、参数、替代方案、来源标注）
```

### 已验证的数据引用效果

提问："What is Schneider TM221CE40R PLC specs?"

AI 回答引用 seed 数据中的精确参数：
- `I/O点数=40（24输入/16输出）` ← 来自 `product_attributes`
- `通讯协议=Modbus RTU/TCP` ← 来自 `product_attributes`
- `供电电压=AC 100-240V` ← 来自 `product_attributes`
- 替代方案推荐 `XD3-32R-E (XINJE)` ← 来自 `products`

---

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 和 DeepSeek 真实值

# 3. 启动开发服务器
npm run dev
# → http://localhost:3456
```

### 环境变量

| 变量 | 来源 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | service_role key |
| `DEEPSEEK_API_KEY` | platform.deepseek.com → API Keys | DeepSeek API Key |
| `DEEPSEEK_BASE_URL` | 默认 `https://api.deepseek.com` | API 地址 |
| `NEXT_PUBLIC_APP_URL` | 本地 `http://localhost:3456` | 应用地址 |

### Supabase Migration 执行顺序

在 Supabase SQL Editor 中依次执行：
1. `supabase/migrations/001_create_tables.sql` — conversations + messages
2. `supabase/migrations/002_business_data.sql` — 5 张业务数据表
3. `supabase/migrations/003_seed_data.sql` — Seed 数据（品牌/分类/产品/属性/销售知识）

> **注意**：Supabase Authentication → Settings → Email → 开发阶段关闭 "Enable email confirmations"

---

## 测试问题示例

在 /chat 中尝试以下问题验证数据检索效果：

```
1. "客户要做一条小型包装产线，预算有限，需要 PLC、HMI 和变频器，
    优先考虑信捷，也希望对比施耐德方案。"

2. "施耐德 M221 TM221CE40R 的 I/O 点数和通讯协议是什么？"

3. "风机负载 5.5kW，推荐变频器型号，施耐德和信捷都对比一下。"

4. "老设备改造，继电器控制柜想改成 PLC 控制，有什么建议？"

5. "PLC 选型时 I/O 点数怎么估算？"
```

---

## 当前边界与后续路线

### MVP 已做
- ✅ 单用户 AI 对话
- ✅ 基于数据库的产品检索
- ✅ 结构化 6 段式回答
- ✅ 对话记录持久化
- ✅ 产品库只读浏览

### MVP 刻意不做
- ❌ 角色系统 / RBAC / 审批流
- ❌ pgvector 向量检索（当前用 SQL ILIKE）
- ❌ 文档知识库 RAG
- ❌ 方案导出 Word
- ❌ 微信小程序
- ❌ 采购/总监/后台管理

### 后续路线（详见 DESIGN_V1.md）
| 版本 | 核心能力 | 关键功能 |
|------|---------|---------|
| V1.1 | 组织协作 | 多角色（销售/售前/总监）、审批流 |
| V1.2 | 采购协同 | 采购反馈、货期校验 |
| V2.0 | 微信小程序 | 移动端选型、拍照识产品 |
| V3.0 | RAG 知识库 | pgvector 向量检索、文档自动解析 |

---

> **产品设计文档**：[DESIGN_V1.md](DESIGN_V1.md) — 完整 PRD + 系统架构 + 用户画像 + 数据库设计 + AI 能力设计 + Sprint 计划
