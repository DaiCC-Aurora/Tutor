# Supabase 部署指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 登录/注册账号
3. 点击 "New Project" 创建新项目
4. 填写项目名称、选择数据库密码（记得保存）
5. 选择合适的数据中心区域
6. 等待项目创建完成（约 2-3 分钟）

## 2. 获取连接信息

创建完成后，在 Supabase 仪表板中：

1. 点击左侧菜单的 **Settings** (齿轮图标)
2. 点击 **API**
3. 复制以下信息到 `.env.local`：
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** API Key → `SUPABASE_ANON_KEY`

⚠️ **重要提示**：
- 只使用 `anon/public` key，不要泄露 `service_role` key
- `service_role` key 拥有管理员权限，应严格保密

## 3. 运行数据库迁移

### 方法一：使用 Supabase SQL Editor（推荐）

1. 在 Supabase 仪表板点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制并粘贴 `supabase/migrations/001_create_conversations.sql` 的内容
4. 点击 **Run** 执行迁移

### 方法二：使用 Supabase CLI（可选）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到项目
supabase link --project-ref your-project-ref

# 应用迁移
supabase db push
```

## 4. 验证设置

执行以下 SQL 查询验证表已创建：

```sql
SELECT * FROM conversations LIMIT 1;
SELECT * FROM messages LIMIT 1;
```

如果没有数据返回但也不报错，说明表已正确创建。

## 5. 环境变量配置

确保 `.env.local` 包含以下变量：

```env
# AI API 配置
AI_BASE_URL=https://api-inference.modelscope.cn/v1
AI_API_KEY=your-modelscope-api-key
AI_MODEL=Qwen/Qwen3.5-397B-A17B

# Supabase 配置（必填）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. Vercel 部署配置

在 Vercel 项目中添加相同的环境变量：

1. 进入 Vercel 项目设置
2. 点击 **Environment Variables**
3. 添加：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. 点击 **Save**

## 常见问题

### Q: 迁移执行后报错 "relation already exists"
A: 说明表已存在，可以忽略或先删除旧表再重新执行。

### Q: 前端无法加载历史记录
A: 检查浏览器控制台是否有 CORS 错误，确保 RLS 策略已正确配置。

### Q: 如何查看数据库实际数据？
A: 在 Supabase 仪表板点击左侧 **Table Editor** 查看 conversations 和 messages 表。
