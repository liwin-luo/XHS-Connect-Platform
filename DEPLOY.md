# XHS Connect Platform — Vercel 部署文档

> 将后端部署到 Vercel，让 Chrome 插件通过云端同步数据。

---

## 目录

1. [前置准备](#1-前置准备)
2. [Fork/Clone 项目](#2-forkclone-项目)
3. [创建 Vercel Postgres 数据库](#3-创建-vercel-postgres-数据库)
4. [配置环境变量](#4-配置环境变量)
5. [部署到 Vercel](#5-部署到-vercel)
6. [初始化数据库表](#6-初始化数据库表)
7. [验证部署](#7-验证部署)
8. [配置 LLM（AI 消息生成）](#8-配置-llmai-消息生成)
9. [连接 Chrome 插件](#9-连接-chrome-插件)
10. [常见问题](#10-常见问题)

---

## 1. 前置准备

| 项目 | 说明 | 费用 |
|------|------|------|
| **Vercel 账号** | https://vercel.com 注册，推荐 GitHub 登录 | 免费 (Hobby) |
| **LLM API Key** | DeepSeek 或 OpenAI 的 API 密钥 | 按量付费，极便宜 |
| **Node.js** | >= 18（本地推 migration 时用） | 免费 |

---

## 2. Fork/Clone 项目

### 方案 A：GitHub → Vercel（推荐自动部署）

```bash
# 1. Fork 仓库到你自己的 GitHub
# 2. 克隆到本地（可选，用于跑 migration）
git clone https://github.com/<your-username>/xhs-connect-platform.git
cd xhs-connect-platform

# 3. 安装依赖
npm install
```

### 方案 B：直接使用本地代码部署

```bash
cd ~/hermess-workspace/xhs-connect-platform
npm install
```

---

## 3. 创建 Vercel Postgres 数据库

在 Vercel Dashboard 中创建数据库（约 2 分钟）：

```
Vercel Dashboard → Storage → Create Database → Postgres → Hobby (免费)
```

创建成功后，Vercel 会自动把连接字符串注入到环境变量 `POSTGRES_URL` 中，**不需要手动填写**。

> ⚠️ **重要**：必须在 Project 和 Database 在同一个 Vercel Team 下，环境变量才会自动注入。先建 Project（第5步），再在 Project 页面 → Storage → Connect → 选择这个数据库。

---

## 4. 配置环境变量

在 Vercel Project → Settings → Environment Variables 中添加：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `LLM_PROVIDER` | `deepseek` 或 `openai` | 否（不用 AI 可不填） |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 使用 DeepSeek 时必填 |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat` | 否 |
| `OPENAI_API_KEY` | OpenAI API Key | 使用 OpenAI 时必填 |
| `OPENAI_MODEL` | 默认 `gpt-4o-mini` | 否 |

不使用 AI 消息功能的话，LLM 环境变量都可以不填，基础功能（注册、清单、评分）正常运行。

### 本地开发用的 `.env.local`

如果需要本地跑，复制环境变量示例：

```bash
cp .env.example .env.local
```

然后填入实际值。`POSTGRES_URL` 可以从 Vercel Storage → 你的数据库 → Quickstart → `.env.local` 标签页复制。

---

## 5. 部署到 Vercel

### 方式 A：GitHub 自动部署（推荐）

```
1. Vercel Dashboard → Add New → Project
2. Import 你的 GitHub 仓库
3. Framework Preset → Next.js（自动检测）
4. Root Directory 保持 ./
5. Build Command 保持 npm run build
6. Environment Variables → 添加第4步的 LLM 变量
7. Deploy
```

### 方式 B：Vercel CLI 本地部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd ~/hermess-workspace/xhs-connect-platform
vercel --prod

# CLI 会提示设置环境变量，按提示填入
```

### 方式 C：CLI 一键（已知环境变量）

```bash
vercel --prod \
  -e LLM_PROVIDER=deepseek \
  -e DEEPSEEK_API_KEY=sk-xxxxxx \
  -e DEEPSEEK_MODEL=deepseek-chat
```

部署成功后，会输出一个域名，例如 `https://xhs-connect.vercel.app`。

---

## 6. 初始化数据库表

部署完成后，需要创建数据库表。有两种方式：

### 方式 A：Vercel CLI 远程推（推荐）

```bash
# 确保本地已安装依赖并且 POSTGRES_URL 是最新的
npm run db:push
```

这会根据 `db/schema.ts` 自动创建所有缺失的表。

### 方式 B：生成 SQL 手动执行

```bash
# 生成 migration SQL 文件
npx drizzle-kit generate

# 文件会生成到 db/migrations/ 目录下
# 在 Vercel Storage → 你的数据库 → Query 标签页中粘贴执行
```

### 方式 C：项目启动后自动创建（备选）

如果不需要精细控制，下次启动时会自动尝试创建表。推荐用方式 A，最安全。

### 验证表创建成功

登录 Vercel Dashboard → Storage → 你的数据库 → Data 标签页，应该能看到：

| 表名 | 说明 |
|------|------|
| `users` | 用户注册信息 |
| `wishlist_items` | 意向清单 |
| `campaigns` | 活动模板 |
| `messages` | 沟通消息 |
| `settings` | 用户设置 |
| `scheduled_tasks` | 定时任务 |

---

## 7. 验证部署

部署成功后，访问你的域名确认：

### 网页端

```
浏览器打开 https://你的域名.vercel.app
```

应该看到：
- 深色主题的专业落地页
- 导航栏可点击各个锚点
- 功能卡片、流程图正常渲染
- 底部注册表单可输入邮箱

### API 测试

```bash
# 1. 注册获取 API Key
curl -X POST https://你的域名.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'

# 成功返回：
# {"ok":true,"data":{"id":"u_xxx","email":"your@email.com","apiKey":"xhs_xxxxxxxx..."}}

# 2. 验证 API Key
curl https://你的域名.vercel.app/api/auth \
  -H "Authorization: Bearer xhs_xxxxxxxx..."

# 成功返回：
# {"ok":true,"data":{"id":"u_xxx","email":"your@email.com"}}
```

---

## 8. 配置 LLM（AI 消息生成）

LLM 配置是可选的。即使不配，所有基础功能（注册、清单管理、评分）都能用。

### 获取 DeepSeek API Key

```bash
# 1. 访问 https://platform.deepseek.com/
# 2. 注册 → API Keys → 创建新 Key
# 3. 充值（最低 $0.50，够用很久）
```

### 添加环境变量

在 Vercel Project → Settings → Environment Variables 添加：

| 变量 | 值 |
|------|-----|
| `LLM_PROVIDER` | `deepseek` |
| `DEEPSEEK_API_KEY` | `sk-xxxxxx`（你的 Key） |
| `DEEPSEEK_MODEL` | `deepseek-chat` |

添加后，Vercel 会自动重新部署。

### 验证 LLM

```bash
curl -X POST https://你的域名.vercel.app/api/llm/generate \
  -H "Authorization: Bearer xhs_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign": {
      "name": "新品推广",
      "brandName": "森林之晨",
      "productName": "保湿面霜",
      "sellingPoints": "神经酰胺、48小时锁水、敏感肌可用",
      "format": "图文",
      "toneStyle": "friendly"
    },
    "kols": [
      {"name": "小A种草日记", "category": "美妆"}
    ]
  }'
```

如果正常，会返回 AI 生成的个性化邀约消息。

---

## 9. 连接 Chrome 插件

部署完成后，配置插件使用你的后端：

### 步骤一：在落地页注册

浏览器打开 `https://你的域名.vercel.app` → 下滑到 **免费获取 API Key** → 输入邮箱 → 复制返回的 Key。

> ⚠️ 关闭页面后不再显示 Key，请立即保存。

### 步骤二：填写插件设置

1. Chrome 中右键 XHS Connect 图标 → **扩展程序选项**（或点击图标进入设置页）
2. 找到 **云端同步** 区域
3. **后端地址**：输入 `https://你的域名.vercel.app`（无尾部斜杠）
4. **API Key**：粘贴第1步复制的 Key
5. 点击 **测试连接** → 显示「已连接」绿色标签
6. 点击 **保存设置**

### 步骤三：验证同步

- 在插件中添加一条意向清单 → 数据自动同步到云端
- 在其他设备安装插件 → 填入同一 Key → 数据自动同步
- 未连接云端时，插件自动使用本地 `chrome.storage`，不丢数据

---

## 10. 常见问题

### Q：部署后访问是 404？

确认部署成功没有报错。Vercel 部署日志在 Dashboard → Deployments → 点击最新部署 → Functions 标签页。

### Q：数据库表没有自动创建？

手动跑 `npm run db:push`（需要本地安装依赖并有 POSTGRES_URL 环境变量）。或者在 Vercel 的 Storage → Query 中手动执行 SQL。

### Q：API 返回 401？

确认 API Key 正确，且在 `Authorization` 头中使用了 `Bearer` 前缀。如果是在注册时 Key 没保存，在网页重新注册一次即可（同一个邮箱会返回 409，换一个邮箱注册）。

### Q：LLM 返回空或超时？

1. 确认环境变量已正确设置（Vercel 添加后会自动重部署）
2. DeepSeek 国内网络可能需要代理。Vercel 默认部署在 `iad1`（美国），调用 DeepSeek 没问题
3. 检查函数超时设置：Vercel Hobby 计划 Serverless Function 最大 10s 超时，复杂的 LLM 调用可能不够。可升级到 Pro（$20/月，300s 超时）

### Q：如何更新环境变量？

Vercel Dashboard → Project → Settings → Environment Variables → 添加/修改 → 保存后自动触发重部署。

---

## 速查表

```bash
# 本地安装
npm install

# 本地开发
npm run dev          # → http://localhost:3000

# 本地推数据库表
npm run db:push

# 数据库可视化编辑
npm run db:studio    # → http://localhost:4983

# 生成 migration SQL
npx drizzle-kit generate

# 部署到 Vercel
npx vercel --prod
```

---

## 架构图

```
┌──────────────────────┐     ┌──────────────────────────┐
│  Chrome 插件           │     │  Vercel (xhs-connect)    │
│                       │     │                          │
│  ┌─────────────────┐  │     │  ┌────────────────────┐  │
│  │ content script  │──┼─────┼─▶│  API Routes        │  │
│  │ (XHS 页面注入)   │  │     │  │  /api/auth         │  │
│  └─────────────────┘  │     │  │  /api/wishlist     │  │
│                       │     │  │  /api/campaigns    │  │
│  ┌─────────────────┐  │     │  │  /api/llm/*        │  │
│  │ popup (React)   │──┼─────┼─▶│  /api/settings     │  │
│  │ 看板·清单·触达·  │  │     │  └────────┬───────────┘  │
│  │ 设置            │  │     │           │              │
│  └─────────────────┘  │     │  ┌────────▼───────────┐  │
│                       │     │  │  Drizzle ORM        │  │
│  ┌─────────────────┐  │     │  └────────┬───────────┘  │
│  │ shared/backend.ts│──┼─────┼─▶        │              │
│  │ (API 客户端)     │  │     │  ┌────────▼───────────┐  │
│  └─────────────────┘  │     │  │  Vercel Postgres     │  │
│                       │     │  │  (PostgreSQL)        │  │
│  chrome.storage.local │     │  └────────────────────┘  │
│  (离线降级)           │     │                          │
└──────────────────────┘     └──────────────────────────┘
```
