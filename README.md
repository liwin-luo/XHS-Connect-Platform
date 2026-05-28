# XHS Connect Platform

小红书商家-博主智能对接平台的后端服务和产品介绍页。

## 架构

```
Chrome Extension  →  API (Next.js on Vercel)  →  Vercel Postgres
                         ↓
                    LLM Provider (DeepSeek / OpenAI)
```

## 快速部署到 Vercel

1. **Fork 或克隆本项目到 GitHub**

2. **在 Vercel 导入项目**
   - New Project → 选择本仓库
   - Framework Preset: Next.js（自动检测）
   - 部署

3. **创建 Vercel Postgres 数据库**
   - Storage → Create Database → Postgres
   - 免费 Hobby 计划：256MB 存储
   - 创建后环境变量自动注入

4. **配置 LLM 环境变量**
   - Settings → Environment Variables
   - 添加 `LLM_PROVIDER=deepseek`
   - 添加 `DEEPSEEK_API_KEY=sk-xxx`

5. **初始化数据库表**
   ```bash
   npm run db:push
   ```

6. **重新部署** → 完成！

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 填写 POSTGRES_URL 和 LLM API Key

# 同步数据库
npm run db:push

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

## API 使用

### 获取 API Key

```bash
curl -X POST https://your-site.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'
```

### 调用 API

```bash
curl https://your-site.vercel.app/api/wishlist \
  -H "Authorization: Bearer xhs_xxx..."
```

### 可用端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/auth` | 注册/登录 |
| GET/POST | `/api/wishlist` | 意向清单 |
| PUT/DELETE | `/api/wishlist/[id]` | 更新/删除 |
| GET/POST/PUT/DELETE | `/api/campaigns` | 活动模板 |
| GET/POST | `/api/messages` | 沟通消息 |
| PUT/DELETE | `/api/messages/[id]` | 更新/删除消息 |
| GET/PUT | `/api/settings` | 品牌设置 |
| POST | `/api/llm/generate` | AI 生成消息 |
| POST | `/api/llm/analyze-intent` | 意图分析 |
| POST | `/api/llm/follow-up` | 生成跟进 |
| POST | `/api/kols/score` | 批量评分 |

## Chrome 插件集成

在插件设置中：
1. 后端地址填 `https://your-site.vercel.app`
2. 粘贴 API Key
3. 启用云端同步

当后端不可用时，插件自动降级到本地 `chrome.storage.local`。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **数据库**: Vercel Postgres (Neon Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **LLM**: DeepSeek / OpenAI (服务端代理)
- **部署**: Vercel (Hobby 免费计划)
