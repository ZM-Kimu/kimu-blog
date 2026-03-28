# Kimu Blog 架构与开发计划书

## 1. 文档目标

这份文档以当前仓库实现为准，收束 Kimu Blog 第一阶段的架构状态、页面职责和后续开发重点。

## 2. 当前项目定位

Kimu Blog 当前不是传统“博客列表首页 + 文章详情页”的模板站，而是一个：

- **内容优先** 的 SvelteKit 内容站
- **游戏 UI / command center** 取向的交互型个人站
- **Cloudflare Pages** 静态优先部署项目
- **route-based app shell + SPA-like navigation** 的单壳体验站
- **单仓库** 内容与前端协同项目

## 3. 当前架构基线

### 前端层

- 框架：SvelteKit
- 内容：Markdown / mdsvex
- 适配器：`@sveltejs/adapter-cloudflare`
- 当前首页：独立 `screen-home` 主界面
- 其他公开内容页：统一进入 shared subpage app shell
- 导航体验：PATH 会变化，但默认不整页刷新

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

### Runtime 边界

- 当前仓库把 **Pages Functions / Worker runtime** 视为受限资源
- `/manage` 是唯一允许依赖 runtime function 的路由域
- `manage` 之外的公开页面与公开 API，不把 Cloudflare Function 当成数据层
- `manage` 之外的 `+layout.server.ts` / `+page.server.ts` 仅用于本地内容装配、i18n、frontmatter 聚合等 build-safe 逻辑
- `manage` 之外如果需要第三方数据，优先改成：
  - 构建期静态化
  - 仓库内内容索引
  - 浏览器端直接请求

## 4. 当前页面与路由职责

### 已实现页面

- `/`：首页主界面，game home screen / command center
- `/blog`：分类界面，承担 mission board 角色
- `/blog/archive`：完整归档页，承担全部文章的效率浏览
- `/blog/[slug]`：文章详情页，采用 dossier / 档案页结构
- `/tags/[tag]`：标签筛选页
- `/about`：站点说明 / profile dossier
- `/updates`：动态占位页
- `/favorites`：收藏占位页
- `/sitemap.xml`
- `+error.svelte`

### 当前布局规则

- 首页不复用全局 Header / Dock / Footer
- 非首页公开内容页统一走 shared subpage app shell
- 首页宽屏下保持固定比例的 screen layout
- 当 **`aspect-ratio < 1.45`** 或 **`max-width: 900px`** 时，首页退化成精简版布局
- 主站按 route-based app shell 运作，站内切换由 SvelteKit router 接管

## 5. 第一阶段已完成范围

- 基础仓库配置
- mdsvex 接入
- frontmatter schema
- server-only 内容 loader
- 首页主界面
- 分类界面
- 完整归档页
- 文章详情页
- 标签页
- About 页
- 动态 / 收藏占位页
- Sitemap 基础输出

## 6. 下一阶段开发重点

### Phase A: 风格细化

- 继续提升首页视觉精度
- 把 `/blog` 分类界面做成和首页同等级的 game UI
- 把 `/blog/[slug]` 档案页继续从“能用”推进到“视觉定稿”
- 统一次级页面的风格语言，避免回退成普通功能页

### Phase B: 内容体验增强

- 代码高亮
- TOC
- 上一篇 / 下一篇
- Back to top
- 更完整的封面和元数据展示

### Phase C: 模块补完

- 搜索
- 评论
- 统计
- 真实的动态 / 收藏数据

## 7. 质量门槛

第一阶段所有开发都要满足：

- 可以本地运行
- 可以生产构建
- frontmatter 有 schema 校验
- 动态内容路由有明确的 prerender 入口
- 首页与内容页都具备明确的视觉语言
- 页面在移动端可读可用

## 8. 风险与约束

- 目标是 **SPA-like navigation**，不是把整站改成纯 SPA
- 不在客户端直接混用 server-only 模块
- 不预设运行时文件系统扫描
- 不在第一阶段引入 CMS、数据库、登录系统
- 不让次级页面退化成普通工具型 HTML 页

## 9. 当前结论

当前仓库已经完成了第一轮从“内容脚手架”到“game UI 风格内容站”的过渡，但视觉系统仍处于持续细化阶段。

接下来的重点不是继续扩页面数量，而是：

- 把分类页和详情页的设计质量追上首页
- 把 placeholder 数据逐步替换成真实内容
- 在不破坏当前路由和内容架构的前提下继续强化视觉与交互表现
