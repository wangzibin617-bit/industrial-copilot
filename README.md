# Industrial Copilot

**AI 工业销售助手** — 面向工业自动化代理商的智能选型与方案助手。

### 当前 MVP 功能（V0.1）

| 功能 | 说明 | 状态 |
|------|------|------|
| 🤖 AI 对话 | 自然语言工业自动化问答（选型/对比/技术咨询） | ✅ |
| 📦 产品推荐 | 结构化输出推荐型号、理由、替代方案、风险提示 | ✅ |
| 💬 对话记录 | 自动保存 conversations + messages 到 Supabase | ✅ |
| 📋 历史查看 | `/history` 页面浏览和回放历史对话 | ✅ |
| 🔐 用户认证 | 邮箱注册/登录（Supabase Auth） | ✅ |

### 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 + shadcn/ui |
| 认证 | Supabase Auth (email/password) |
| 数据库 | Supabase (PostgreSQL) |
| AI | DeepSeek Chat API (via @ai-sdk/openai) |
| 流式 | Vercel AI SDK (`useChat` + `streamText`) |

### 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（见下方）
cp .env.example .env.local
# 编辑 .env.local 填入真实值

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
open http://localhost:3456
```

### 环境变量配置

#### Supabase

1. 创建 [Supabase](https://supabase.com) 项目
2. **SQL Editor** → 执行 `supabase/migrations/001_create_tables.sql`
3. **Authentication → Settings → Email** → 关闭 "Enable email confirmations"（开发阶段）
4. **Settings → API** → 复制以下值：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

#### DeepSeek

1. 注册 [DeepSeek Platform](https://platform.deepseek.com)
2. **API Keys** → 创建 Key → 复制到 `DEEPSEEK_API_KEY`

#### .env.local 示例

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
NEXT_PUBLIC_APP_URL=http://localhost:3456
```

### 已验证闭环

```
注册 → 登录 → /chat 提问 → DeepSeek 流式回复 → 
conversations + messages 写入 Supabase → /history 可查看

测试日期: 2026-06-11
验证方式: API 端到端测试 (PowerShell)
  ✅ 用户注册/登录
  ✅ AI 流式问答 (7420 chars)
  ✅ conversations 表写入
  ✅ messages 表写入 (user + assistant)
```

### 项目结构

```
src/
├── app/
│   ├── login/page.tsx         # 登录/注册
│   ├── chat/page.tsx          # 核心 AI 对话 (useChat)
│   ├── history/page.tsx       # 历史对话列表
│   └── api/ai/chat/route.ts   # DeepSeek 流式 API 端点
├── components/
│   ├── chat/                  # ChatMessage, ChatInput, EmptyState
│   └── ui/                    # shadcn/ui 组件
├── lib/
│   ├── supabase/              # client, server, admin
│   └── ai/                    # deepseek client, system prompt
└── middleware.ts              # Auth 保护
```

### 后续路线

参见 [DESIGN_V1.md](DESIGN_V1.md) — 完整产品设计文档（含组织角色、RBAC、审批流、RAG 知识库等企业级功能设计）。
