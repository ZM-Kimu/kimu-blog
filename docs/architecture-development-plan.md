# Kimu Blog 架构与开发计划书

## 1. 文档目标

这份文档把 [degsin.md](h:\personal\KimuBlog\docs\degsin.md) 中的设计方案收束成一份可以直接执行的架构与开发计划书，用来指导第一阶段脚手架、MVP 和上线准备。

## 2. 项目定位

Kimu Blog 是一个：

- **内容优先** 的博客 / 内容站
- **强交互友好** 的 SvelteKit 前端项目
- **部署在 Cloudflare Pages** 的静态优先应用
- **保留未来迁移到 Workers** 空间的单仓库项目

## 3. 架构基线

### 前端层

- 框架：SvelteKit
- 内容：Markdown / mdsvex
- 适配器：`@sveltejs/adapter-cloudflare`
- 交互策略：内容页 prerender，交互组件客户端水合

### 内容层

- 文章目录：`src/lib/content/blog/`
- frontmatter：统一 schema 校验
- 内容索引：`import.meta.glob(...)`
- 动态详情页：`entries()` + prerender

### 部署层

- 构建：`npm run build`
- 输出：`.svelte-kit/cloudflare`
- 平台：Cloudflare Pages
- 域名：Cloudflare DNS

## 4. 第一阶段脚手架范围

当前脚手架需要覆盖这些交付物：

- 基础仓库配置
- mdsvex 接入
- frontmatter schema
- server-only 内容 loader
- 首页
- 文章列表页
- 文章详情页
- 标签页
- About 页
- RSS / Sitemap 基础输出

## 5. 仓库结构

```text
src/
├─ lib/
│  ├─ components/
│  ├─ content/
│  ├─ server/
│  ├─ constants/
│  ├─ utils/
│  └─ types/
├─ routes/
└─ app.html
docs/
docs/degsin.md
```

## 6. 开发阶段

### Phase 0: 项目基线

目标：

- 初始化 SvelteKit + Pages 项目
- 接入 mdsvex
- 补全基础目录
- 明确构建输出与本地开发命令

出口条件：

- 能 `npm run dev`
- 能 `npm run build`

### Phase 1: 内容系统

目标：

- 定义 frontmatter schema
- 建立 server-only 内容收集器
- 校验 slug 唯一性和字段完整性
- 接上 `entries()` + prerender

出口条件：

- 能用一篇示例文章跑通文章详情页

### Phase 2: 基础页面

目标：

- 首页
- 文章列表页
- 标签页
- About 页
- 404 / 错误页

出口条件：

- 全部基础路由可访问
- 页面具备基础响应式布局

### Phase 3: 发布能力

目标：

- RSS
- Sitemap
- robots
- Preview / Production 配置

出口条件：

- Pages 可以接入正式发布

### Phase 4: 增强模块

目标：

- 搜索
- 评论
- 统计
- 动效与视觉系统迭代

## 7. 当前脚手架任务分解

### 已完成

- 设计文档定稿
- 项目模板生成
- 计划书建立
- 基础路由与内容系统骨架

### 下一批任务

- 丰富首页和文章页的视觉系统
- 补代码高亮与目录组件
- 增加分页、上一篇 / 下一篇
- 接入搜索与评论

## 8. 质量门槛

第一阶段所有开发都要满足：

- 可以本地运行
- 可以生产构建
- frontmatter 有 schema 校验
- 动态内容路由有明确的 prerender 入口
- 页面在移动端可读可用

## 9. 风险与约束

- 不为了“强交互”把整站改成纯 SPA
- 不在客户端直接混用 server-only 模块
- 不预设运行时文件系统扫描
- 不在第一阶段引入 CMS、数据库、登录系统

## 10. 当前结论

就当前目标而言，这套方案已经可以作为 **第一阶段正式开发计划** 使用：

- 平台继续选 Pages
- 内容继续选 mdsvex
- frontmatter 必须校验
- 详情页必须实现 `entries()` + prerender
- 后续功能在这个脚手架上渐进叠加
