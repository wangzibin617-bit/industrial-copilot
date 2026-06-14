# Deployment Guide — Industrial Copilot

> Vercel + Supabase 生产部署指南

---

## 前置条件

- [ ] Supabase 项目已创建，migration 已执行
- [ ] DeepSeek API Key 已获取
- [ ] 代码已推送到 GitHub

---

## 1. Vercel 部署

### 1.1 导入项目

1. 打开 [vercel.com](https://vercel.com) → **Add New → Project**
2. 选择 Industrial Copilot 的 GitHub 仓库
3. Framework 自动识别为 **Next.js**
4. 无需修改 Build Settings

### 1.2 配置环境变量

在 Vercel 项目设置 → **Environment Variables** 中添加：

| Name | Value | 说明 |
|------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xxx` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_xxx` | Supabase service_role key |
| `DEEPSEEK_API_KEY` | `sk-xxx` | DeepSeek API Key |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | DeepSeek API 地址 |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | 部署后的域名 |

> ⚠️ 所有变量值从 `.env.local` 复制，确保是**真实值**而非 placeholder。

### 1.3 部署

1. 点击 **Deploy**
2. 等待构建完成
3. 记录分配的域名（如 `industrial-copilot.vercel.app`）

---

## 2. Supabase 配置更新

### 2.1 Auth Redirect URLs

部署后需要更新 Supabase 的认证回调地址：

1. Supabase Dashboard → **Authentication → URL Configuration**
2. **Site URL** 改为：`https://your-app.vercel.app`
3. **Redirect URLs** 添加：
   - `https://your-app.vercel.app/chat`
   - `https://your-app.vercel.app/**`

### 2.2 关闭邮箱确认（可选，开发阶段）

Supabase Dashboard → **Authentication → Settings → Email**：
- 关闭 **Enable email confirmations**
- 生产环境建议开启并配置 SMTP

---

## 3. 验证清单

部署完成后逐项检查：

- [ ] 首页访问正常（自动跳转 /login）
- [ ] 邮箱注册成功
- [ ] 登录后跳转 /chat
- [ ] AI 对话流式输出正常
- [ ] /products 产品库数据展示
- [ ] /solutions/new 方案生成
- [ ] /solutions 方案列表
- [ ] /history 对话历史
- [ ] 对话和方案持久化（刷新后数据仍在）

---

## 4. 常见问题

### DeepSeek API 报错

检查 Vercel 环境变量中 `DEEPSEEK_API_KEY` 是否正确。确认 DeepSeek 账户余额充足。

### Supabase 连接失败

检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。确认 Supabase 项目未暂停（免费层项目 7 天无活动会自动暂停，需在 Dashboard 手动恢复）。

### 401 Unauthorized

检查 Supabase Auth Redirect URLs 是否包含 Vercel 线上域名。

### 数据库表不存在

确认已在 Supabase SQL Editor 中按顺序执行所有 migration 文件（`supabase/migrations/001-004`）。

---

## 5. 自定义域名（可选）

1. Vercel 项目 → **Settings → Domains**
2. 添加自定义域名
3. DNS 配置 CNAME 指向 `cname.vercel-dns.com`
4. 更新 Supabase Auth Redirect URLs 包含新域名

---

> 部署问题排查：查看 Vercel 项目 → Deployments → 点击具体部署 → Runtime Logs
