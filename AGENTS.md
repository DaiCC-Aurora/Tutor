<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git 分支工作流

本项目使用以下分支，请严格遵守：

## 分支说明

1. **master** - 生产部署分支，用于 Vercel 上的部署
   - **严禁直接编辑或提交到 master 分支**
   - 只能通过经过测试的 PR 合并

2. **develop** - 本地开发主分支
   - 日常功能开发在此分支进行
   - 必须经过充分测试后才能推送到远程
   - 通过测试后才可以 push 到远程 develop 分支

3. **android** - Android 支持专用分支
   - 用于开发 Android 平台相关功能
   - 独立于主开发流程

## 工作流程

- 新功能从 `develop` 分支创建特性分支
- 完成测试后合并回 `develop` 分支
- 准备发布时从 `develop` 创建 PR 合并到 `master`
- Android 相关功能在 `android` 分支上独立开发
