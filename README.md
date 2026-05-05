# AI Tutor

一个支持 Android 手表端的 AI 辅导网站，使用多模态 AI 模型分析图片并回答问题。

## 功能特性

- 📱 **响应式设计** - 完美适配 Web、移动端和 Android 手表
- 🖼️ **图片上传** - 支持图片选择、预览
- 💬 **对话界面** - 类似聊天的交互体验，支持多轮对话
- 🤖 **AI 图像分析** - 基于 ModelScope 的多模态 AI 模型
- 🔒 **安全配置** - API key 在服务端处理，不暴露给客户端
- 🚀 **Vercel 部署** - 一键部署到 Vercel

## 技术栈

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Vercel

## 快速开始

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 到 `.env.local`：
```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 ModelScope API 密钥：
```bash
AI_BASE_URL=https://api-inference.modelscope.cn/v1
AI_API_KEY=ms-xxx-xxx-xxx
AI_MODEL=Qwen/Qwen2.5-VL-72B-Instruct
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 使用方法

1. 点击上传图片区域，选择一张图片
2. 在底部输入框输入关于图片的问题
3. AI 会分析图片并回答你的问题

## 部署到 Vercel

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 项目结构

```
tutor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # AI API 路由（服务端）
│   │   ├── page.tsx              # 主页面
│   │   ├── layout.tsx            # 根布局
│   │   └── globals.css           # 全局样式
│   ├── components/
│   │   ├── ImageUploader.tsx     # 图片上传组件
│   │   ├── ChatInput.tsx         # 聊天输入框
│   │   └── MessageList.tsx       # 消息列表
│   └── lib/
│       └── api.ts                # API 客户端
├── .env.example                  # 环境变量模板
├── .env.local                    # 本地环境变量
├── vercel.json                   # Vercel 部署配置
└── DEPLOYMENT.md                 # 部署指南
```

## API 配置说明

本项目使用 ModelScope 的 OpenAI 兼容 API：

- `AI_BASE_URL`: API 基础地址
- `AI_API_KEY`: 你的 API 密钥（在服务端使用）
- `AI_MODEL`: 要使用的模型名称

API 密钥通过 Next.js 服务端路由处理，不会暴露给浏览器。

## 许可证

MIT
