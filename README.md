# Industrial Copilot

**AI 工业销售助手** — 面向工业自动化多品牌代理商的智能选型、技术问答与方案生成系统。

> 🚀 一个真实的 ToB AI SaaS 产品 MVP，从 0 到 1 完整闭环。

---

## 在线演示

> 部署后在此填入 Vercel 线上地址

🔗 **Live Demo**: *（待部署）*

![screenshot-chat](docs/screenshots/chat.png) *（截图占位 — 待补充）*

---

## 项目简介

Industrial Copilot 服务于**工业自动化代理商**（同时代理施耐德电气和信捷电气的经销商），解决销售团队三大核心痛点：

| 痛点 | 传统方式 | AI 替代 |
|------|---------|--------|
| 选型依赖售前 | 翻选型手册 → 问售前 → 等 1-2 天 | 自然语言输入 → 5 分钟出推荐 |
| 知识无法复用 | 老销售离职带走经验 | 对话记录 + 产品库 + 销售知识库永久留存 |
| 方案输出慢 | Word 模板手工填写，2-4 小时 | AI 生成初稿，30 分钟审核确认 |

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) + TypeScript |
| 样式 | Tailwind CSS v4 + shadcn/ui (dark mode) |
| 认证 | Supabase Auth (email/password) + RLS |
| 数据库 | Supabase (PostgreSQL) |
| AI 模型 | DeepSeek Chat API |
| AI 框架 | Vercel AI SDK (`useChat` + `streamText` + `generateText`) |

---

## 功能清单

### MVP 0.1 — AI 对话闭环

- [x] 邮箱注册/登录
- [x] AI 流式对话（工业自动化选型、技术问答）
- [x] 6 段式结构化回答
- [x] 对话自动保存（conversations + messages）
- [x] 历史对话记录查看

### MVP 0.2 — 真实业务数据层

- [x] 品牌数据（施耐德电气 + 信捷电气）
- [x] 产品数据库（20 条产品，5 大品类，EAV 规格参数）
- [x] 销售知识库（10 条选型指南、对比话术、场景方案）
- [x] 关键词检索（SQL ILIKE 匹配，无需向量库）
- [x] 数据注入 AI Prompt（引用具体型号和参数）
- [x] 产品库浏览页（品牌/分类筛选 + 搜索）

### MVP 0.3 — 方案生成

- [x] 方案生成表单（行业/场景/预算/品牌偏好）
- [x] AI 7 段式方案（需求理解 → 配置 → 理由 → 替代 → 风险 → 下一步 → 来源）
- [x] 方案保存到 solution_plans 表
- [x] 方案列表与详情查看
- [x] Markdown 一键复制

---

## 数据库表结构

| 表名 | 用途 | MVP 阶段 |
|------|------|:--:|
| `conversations` | 对话会话 | 0.1 |
| `messages` | 对话消息 | 0.1 |
| `brands` | 品牌定义 | 0.2 |
| `product_categories` | 产品分类层级 | 0.2 |
| `products` | 产品型号数据 | 0.2 |
| `product_attributes` | EAV 规格参数 | 0.2 |
| `sales_knowledge` | 销售经验知识 | 0.2 |
| `solution_plans` | AI 生成方案 | 0.3 |

---

## Supabase Migration

在 Supabase SQL Editor 中**按顺序**执行：

```
1. supabase/migrations/001_create_tables.sql      — 对话表
2. supabase/migrations/002_business_data.sql      — 业务数据表
3. supabase/migrations/003_seed_data.sql          — Seed 数据
4. supabase/migrations/004_solution_plans.sql     — 方案表
```

---

## 环境变量

```bash
# .env.local (从 .env.example 复制并填入真实值)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
NEXT_PUBLIC_APP_URL=http://localhost:3456
```

### 获取方式

| 变量 | 来源 |
|------|------|
| `SUPABASE_URL` / `ANON_KEY` / `SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `DEEPSEEK_API_KEY` | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) |

---

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入真实 Supabase 和 DeepSeek 值

# 3. Supabase 配置
# - 执行所有 migration SQL
# - Authentication → Settings → Email → 关闭 "Enable email confirmations" (开发阶段)
# - Authentication → URL Configuration → Site URL: http://localhost:3456

# 4. 启动
npm run dev
# → http://localhost:3456
```

---

## 项目阶段

| 阶段 | 主题 | 状态 |
|------|------|:--:|
| MVP 0.1 | AI 对话闭环（流式问答 + 对话记录） | ✅ |
| MVP 0.2 | 真实业务数据层（产品库 + 知识库 + 数据检索） | ✅ |
| MVP 0.3 | 方案生成（AI 7 段式方案 + 保存 + 复制） | ✅ |
| V1.1 | 组织协作（多角色：销售/售前/总监、审批流） | 📋 |
| V1.2 | 采购协同（货期反馈、成本校验） | 📋 |
| V2.0 | 微信小程序（移动端选型、拍照识产品） | 📋 |
| V3.0 | RAG 向量知识库（pgvector、文档自动解析） | 📋 |

> 完整产品设计文档：[DESIGN_V1.md](DESIGN_V1.md)  
> 作品集案例：[docs/PORTFOLIO_CASE.md](docs/PORTFOLIO_CASE.md)

---

## 后续路线

- **RAG 向量库**：将产品手册 PDF 自动解析 → 分块 → pgvector embedding → 语义检索
- **真实产品资料导入**：施耐德/信捷官方选型手册的结构化导入工具
- **微信小程序**：移动端 AI 对话 + 拍照识产品
- **组织协作**：销售 ↔ 售前 ↔ 总监的审批工作流
- **方案导出**：Word/PDF 格式导出

---

## License

MIT
