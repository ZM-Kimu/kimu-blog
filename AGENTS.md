## 0. 目的

本文件定义本仓库中编码代理（coding agents）与贡献者的工作规则。

本项目基于 **SvelteKit + mdsvex + Cloudflare Pages** 构建，是一个**内容优先、动画驱动、强交互风格** 的博客/站点。

它**不是**传统 dashboard-like、utility-first、form-heavy 的功能型 HTML 站点，而必须呈现为一个**被设计过的交互作品**：有生命力、有层次、有叙事感、有动画，并具备明确情绪表达。

## 1.2 视觉与交互身份

- 站点必须遵循**动画型设计语言**
- 站点**不能**看起来像传统“功能型 HTML 页面”“后台面板”“表格/表单 UI”或“只有方框和文字的模板博客”
- 每个重要页面都应具备**视觉节奏、动效层级、叙事式转场**
- 当前产品导航目标是 **route-based app shell + SPA-like navigation**
- 站内操作允许改变 URL，但默认体验应由 SvelteKit 客户端路由接管，而不是整页刷新
- 站点内的可视物件默认**不可拖动、不可选中**；只有输入控件与显式白名单元素恢复对应能力
- `topbar` 属于共享 shell，不属于单个 page 的视觉皮肤范围；默认不要把页面动效、背景动效和 topbar 外观耦合在一起

## 2. 不可协商的工程基线

- 前端框架：`SvelteKit`
- 内容格式：`Markdown / mdsvex`
- Adapter：`@sveltejs/adapter-cloudflare`
- 部署目标：`Cloudflare Pages`
- 构建输出：`.svelte-kit/cloudflare`
- 博客内容目录：`src/lib/content/blog/`
- frontmatter 必须做 schema 校验
- 内容加载使用 `import.meta.glob(...)`
- 博客详情路由必须提供明确的 `entries()` 或等效 prerender 方案
- 内容页默认 `prerender = true`
- 仓库样式必须通过严格 `stylelint`；覆盖 `src/**/*.{css,svelte}`
- 首页使用独立 `screen-home` 布局；公开二级内容页统一收敛到 shared subpage app shell
- 首页在 **`aspect-ratio < 1.45`** 或 **`max-width: 900px`** 时切到精简版方案
- “SPA-like 体验”不等于“纯 SPA 架构”；**不要**为了省事把根布局改成 `ssr = false`

## 3. 项目优先级

优先级顺序如下：

1. 保持预期体验与视觉质量
2. 保持架构与 SvelteKit + Pages 约束一致
3. 保持内容工作流稳定且可维护
4. 保持页面可读、响应式良好、可正常构建
5. 仅在不破坏以上原则时新增功能

## 4. 修改前必须先看

结构级或页面级修改前，先阅读 `docs/` 中的架构/设计文档，而不是自行发明新的产品方向。

## 5. 边界规则

- `src/routes/`：路由组合与页面装配
- `src/lib/content/`：原始内容文件
- `src/lib/server/`：仅服务端可用逻辑与内容聚合逻辑
- `src/lib/features/`：博客、标签、搜索、SEO、评论等功能域逻辑
- `src/lib/components/`：可复用 UI 与布局组件
- `static/`：必须保留原始文件名的静态资源
- 不要把所有逻辑都堆进组件里，也不要把仅服务端代码混入客户端 UI 模块

### 5.1 Pages Functions / Runtime 边界

- `/manage` 是当前仓库中**唯一允许依赖 runtime function / Pages Functions / Worker 端服务逻辑**的路由域
- `manage` 之外的公开路由与公开 API，**不得**依赖 Cloudflare Function 作为数据来源
- `manage` 之外允许使用 `+layout.server.ts` / `+page.server.ts` 做 **build-safe 的本地内容装配**，例如 i18n、frontmatter 聚合、文章索引计数
- `manage` 之外**不得**在 server load 或公开 `+server.ts` 中发起 GitHub、第三方服务、数据库或其他远端 API 请求
- `__debug/manage` 虽然复用 manage 组件，但它属于公开调试页，不得接入 `/api/manage/*`、第三方请求或任何 runtime function 数据源

## 6.2 Frontmatter

必填或接近必填字段通常包括：`title`、`description`、`date`、`updated`、`tags`、`draft`、`cover`、`slug`

可选字段包括：`category`、`author`、`series`、`toc`、`readingTime`、`canonical`、`featured`

## 6.3 校验与加载

- frontmatter 必须使用 schema 校验
- 对缺失字段、错误类型、非法日期、空 slug、重复 slug 快速失败
- 不要只依赖人工约定
- 使用 `import.meta.glob(...)`
- 内容收集逻辑集中在 `$lib/server/content`
- 避免运行时使用 `fs` 扫描文件系统
- 保持文章索引过程确定、可构建、对构建友好

## 7. 页面规则

### 7.1 第一阶段必须具备

- 首页主界面（`/`）
- 分类界面 / mission page（`/blog`）
- 完整归档页（`/blog/archive`）
- 博客详情页（`/blog/[slug]`）
- 标签页
- About 页面
- 动态 / 收藏占位页
- 404 / 错误页
- Sitemap / robots 基础能力

### 7.2 当前路由职责

- `/`：game-like command center，承担主界面角色
- `/blog`：分类界面，承担一级内容入口，不回退成传统文章流首页
- `/blog/archive`：全部文章的完整浏览入口
- `/blog/[slug]`：可直达、可分享的文章详情页
- 首页走独立 `screen-home`；公开二级内容页继续走 shared subpage app shell
- 404 / 错误页归类为公开二级内容页，继续服从 shared subpage app shell 的背景、壳体与动效语义
- 站内导航目标是 **path 会变化，但不触发整页刷新**

### 7.3 调试路由职责

- `__debug` 只用于本地 / preview 的视觉与状态调试，不承诺外部契约稳定
- `__debug/manage` 是 manage 的单页样式沙盒，只允许使用本地 mock 数据
- `__debug/error-*` 用于错误页与错误态时间线调试，不承担真实内容职责

## 8. 动画与交互规则

动画不是装饰性的事后添加，而是站点语言的一部分；代理必须把动效设计视为核心实现内容之一。

### 8.1 动效质量标准

动效应当：流畅、克制但有表现力、有层次、跨页面一致、与信息层级和焦点引导相关联。

动效不应当：随机、嘈杂、廉价、与布局意义脱节。

### 8.2 可访问性与技术建议

- 尊重 `prefers-reduced-motion`
- 对高强度动画区域提供平滑降级
- 即使是动画驱动页面，也必须满足可访问性要求
- 优先使用 Svelte 原生 transition / animation 与 CSS-first 方案
- 仅在理由充分时引入重型第三方动画依赖
- 避免引入会明显增加构建、hydrate 或维护复杂度、但收益不足的动画库
- 首屏如果使用 boot/loading overlay，它只用于**首次进入站点**时协调主 UI 进入；语义按 `boot -> entry -> idle` 理解，后续常规页面切换统一走 `exit -> entry -> idle`，不要复用 boot 时间线
- 当前实现的 boot 资源等待通过独立的 `data-site-boot-assets` 表达；不要再把资源门控混进 boot 主状态

## 10. 资源、SEO 与可访问性规则

### 10.1 资源与媒体

- 第一阶段文章正文与封面图可以保留在仓库内
- `robots.txt`、favicon、manifest 等固定文件名资源应放在 `static/`
- 可复用 UI 视觉资源在合适情况下优先使用 source import
- 在需要时保持文件名稳定

### 11.2 SEO 与可访问性

必须支持：唯一 page title、页面 description、在需要时提供 canonical、Open Graph、Twitter Card、sitemap、robots、语义化标题结构、图片 `alt`、稳定 slug、在 `src/app.html` 中设置正确文档语言。

可访问性是硬要求；动画优先，不代表可访问性可以放到最后。

## 13. 开发命令与完成标准

### 13.1 开发命令

默认使用项目已包含的命令。

当前质量命令基线至少包括：

- `npm run lint`
- `npm run lint:css`
- `npm run lint:css:fix`
- `npm run check`
- `npm run build`

如果要新增 lint、check、test、format、typecheck 等脚本，必须有明确意图并同步文档说明。

### 13.2 完成标准

只有当以下条件全部满足时，改动才算完成：

- 符合架构方向
- 保持动画型产品风格
- 没有把 UI 降级成通用功能型 HTML
- 保持内容页可构建且可读
- 尊重服务端 / 客户端边界
- 在移动端正常工作
- 能成功完成生产构建

对于 UI 工作，还需额外确认：层级清晰；动效有目的；布局有个性；交互状态存在；页面作为内容产品依然易读。

## 14. 对代理行为的期望

代理在实现或修改代码时，应当：保持现有产品方向；清晰说明结构性变更；优先采用小而可组合的模块；避免不必要的依赖波动；不要无故重写已稳定架构；不只关注原始功能，还要始终兼顾视觉与交互质量。

当需求描述不完整时，**不要**默认采用最省事的通用 HTML 方案；默认应采用：干净、可维护、适合动画表达、有表现力、与站点身份一致的方案。

## 15. 最终规则

本仓库要构建的是一个**动画驱动、强交互的内容站点**。
