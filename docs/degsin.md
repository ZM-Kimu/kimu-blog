# 一、整体架构

```text
作者写文章
  ↓
GitHub 仓库（代码 + Markdown/mdsvex 内容）
  ↓
Cloudflare Pages 自动构建部署
  ↓
SvelteKit + @sveltejs/adapter-cloudflare 输出站点
  ↓
Cloudflare CDN 分发到用户
  ↓
自定义域名访问（正式域名）
```

这个项目可以继续理解成 3 层：

1. **内容层**：文章源文件、图片、元数据
2. **前端层**：SvelteKit + 你们自己做的强交互页面
3. **部署层**：Cloudflare Pages + 域名 + CDN

这版和 Astro 方案最大的区别不是“目录名变了”，而是**SvelteKit 成为主框架**。内容系统只是接入其中；页面路由、数据加载、交互逻辑、渲染策略都由 SvelteKit 主导。

这版要明确一条总原则：

- **内容页默认 prerender**
- **整站采用 route-based app shell**
- **站内导航目标是 SPA-like：URL 会变化，但默认不整页刷新**
- **强交互页按需保留 SSR / CSR**
- **不要把整站做成纯 SPA**
- **首屏 boot loading overlay 属于主 UI 进入时间线的一部分，而不是主体可交互后才补上的遮罩**

---

# 二、推荐技术栈

默认组合建议定成这一版：

- **前端框架**：SvelteKit
- **内容格式**：Markdown / mdsvex
- **初始化方式**：`create-cloudflare`（C3）优先
- **SvelteKit 适配器**：`@sveltejs/adapter-cloudflare`
- **代码托管**：GitHub
- **部署平台**：Cloudflare Pages
- **域名 / DNS**：Cloudflare
- **评论系统**：giscus（可选）
- **站内搜索**：Pagefind（可选）
- **统计**：Cloudflare Web Analytics（可选）

当前阶段直接拍板：

- **平台基线选 Cloudflare Pages**
- **主站体验按 route-based app shell 实现**
- **不因为强交互就切整站 SPA**
- **保留未来迁移到 Workers 的空间，但第一版不以 Workers-first 为前提**

这里不选 `adapter-static`，原因很直接：

- 你们要做的是**动画型强交互 UI**
- 第一版虽然以内容页 prerender 为主，但后面很可能需要部分服务端能力
- `adapter-cloudflare` 可以同时保留 SSG、SSR、API route 的空间

初始化也建议从 `npx sv create` 改成 **C3 优先**：

- Cloudflare 当前对 Pages + SvelteKit 的推荐起手式就是 `create-cloudflare`
- 它会顺手把 Wrangler 和 `@sveltejs/adapter-cloudflare` 配好
- 内容能力再通过 `npx sv add mdsvex` 补上

---

# 三、设计原则

这一版项目结构建议按下面 5 条来约束：

## 1. 内容页优先静态化

适合 prerender 的页面：

- 首页主界面（`/`）
- 分类界面（`/blog`）
- 完整归档页（`/blog/archive`）
- 文章详情页
- 标签页
- About
- Sitemap / robots

这里要补一个当前已经实现的事实：

- 首页虽然是**强交互主界面**，但仍然走内容站语境下的静态优先路线
- 首页不是传统博客文章流，而是独立的 `screen-home` 入口场景
- 非首页公开内容路由统一进入 shared subpage app shell
- 主导航与一级入口切换以 **client-side navigation** 为目标体验

## 2. 强交互只放在需要的地方

例如这些页面可以保留更多客户端交互：

- 搜索页
- 首页动画模块
- 特殊专题页

不要为了交互方便把根布局直接改成 `ssr = false`，那样会把整站推成空壳 SPA。

这里要把“SPA”说准确：

- 你们要的是 **SPA-like 体验**
- 不是把整个仓库改造成 **纯 SPA 架构**
- 允许路径变化，但默认站内切换应由 SvelteKit router 接管，不出现浏览器整页重刷感

## 3. 内容读取走“构建期导入 + server-only 辅助模块”

这一条很重要：

- 不要把方案写成“运行时用 `fs` 扫 Markdown”
- 推荐用 `import.meta.glob(...)` 批量导入内容模块
- 推荐在 `$lib/server/content` 里集中写内容收集与整理逻辑
- 页面通过 `+page.server.ts` 或 `+layout.server.ts` 组装数据

这样做的原因是：

- 本地开发没问题的 `fs` 方案，在 Cloudflare Pages / Workers 目标下不一定稳
- `import.meta.glob(...)` 更符合 Vite / SvelteKit 的构建方式
- 内容页如果 prerender，最终数据会在构建阶段被烘进 HTML

同时再补一条已经确认的约束：

- **动态文章页不要只写“支持 prerender”**
- **`/blog/[slug]` 要明确实现 `entries()` 或等价的 prerender 入口策略**
- **这一条按必做项处理，不再作为可选优化**

## 4. server-only 边界提前切清楚

建议把这些逻辑都放进 `$lib/server`：

- 内容读取
- sitemap 生成辅助
- 私有环境变量读取
- 未来的 webhook / token / 后台集成

不要把这些逻辑和 UI 组件混在一起。

## 5. 第一版继续单仓库

第一版先不要拆 `blog-web` / `blog-content` 双仓库。

原因：

- 内容和前端一起构建最简单
- Pages 的 Git 集成、PR preview、自动部署都天然适合单仓库
- 现在拆仓只会增加同步成本

---

# 四、仓库划分

第一版建议用 **单仓库**，目录结构定成这样：

```text
blog-site/
├─ src/
│  ├─ lib/
│  │  ├─ components/
│  │  │  ├─ layout/
│  │  │  └─ ui/
│  │  ├─ features/
│  │  │  ├─ blog/
│  │  │  ├─ tags/
│  │  │  ├─ search/
│  │  │  ├─ seo/
│  │  │  └─ comments/
│  │  ├─ content/
│  │  │  ├─ blog/
│  │  │  └─ pages/
│  │  ├─ server/
│  │  │  ├─ content/
│  │  │  └─ sitemap/
│  │  ├─ utils/
│  │  ├─ constants/
│  │  ├─ stores/
│  │  └─ types/
│  ├─ routes/
│  ├─ app.html
│  ├─ error.html
│  └─ app.d.ts
├─ static/
│  ├─ images/
│  ├─ icons/
│  └─ robots.txt
├─ scripts/
├─ tests/
├─ docs/
├─ .github/
│  └─ workflows/
├─ package.json
├─ svelte.config.js
├─ vite.config.ts
├─ tsconfig.json
├─ wrangler.jsonc
├─ _redirects
├─ _headers
└─ README.md
```

这里最关键的不是层级多，而是边界清晰：

- **`src/routes/`**：只负责路由和页面装配
- **`src/lib/content/`**：只放原始内容
- **`src/lib/server/`**：只放服务端辅助逻辑
- **`src/lib/features/`**：承接博客、搜索、标签、SEO 这些业务模块
- **`static/`**：只放必须保留原始文件名的资源
- **`_redirects` / `_headers`**：放项目根目录，和 `wrangler.jsonc` 同级

以后内容量非常大了，再考虑拆双仓库：

- `blog-web`：SvelteKit 前端
- `blog-content`：纯内容仓库

但第一版先不要动这个复杂度。

---

# 五、文章内容结构

每篇文章一个文件，继续用 **Markdown frontmatter + mdsvex**。

推荐放在：

```text
src/lib/content/blog/
```

## 示例

```md
---
title: '文章标题'
description: '文章摘要'
date: '2026-03-23'
updated: '2026-03-23'
tags: ['frontend', 'blog']
category: '技术'
draft: false
cover: '/images/posts/example-cover.jpg'
slug: 'my-first-post'
featured: false
---

这里是正文。

你也可以插入 Svelte 组件。
```

## 建议保留字段

最少这些：

- `title`
- `description`
- `date`
- `updated`
- `tags`
- `draft`
- `cover`
- `slug`

可以扩展这些：

- `author`
- `series`
- `toc`
- `readingTime`
- `canonical`
- `featured`

## Frontmatter 校验

Frontmatter 不只是一组约定字段，这一版建议把它当成**必须校验的内容 schema**。

建议做法：

- 在 `src/lib/content/` 或 `src/lib/server/content/` 定义统一 schema
- 用 schema 校验每篇文章的 frontmatter
- 构建期就拦截缺字段、字段类型错误、无效日期、空 slug、重复 slug

这一条现在直接按最佳实践写死：

- **frontmatter 可以加**
- **而且应该加 schema 校验**
- **不要只靠人工约定**

## 内容加载策略

这版建议把内容读取方式也写死：

- 用 `import.meta.glob(...)` 批量导入文章
- 在 `src/lib/server/content/` 里做统一整理
- 列表页、标签页、归档页从 server load 读取整理后的数据
- 详情页按 `slug` 找对应文章模块
- 对 `src/routes/blog/[slug]/` 明确提供 `entries()`
- 本地 Markdown 全量已知时，文章详情页按 `prerender = true` 处理
- 如果未来接外部 CMS 或构建时拿不到完整 slug，再改成 `prerender = 'auto'`

建议不要在文档里预设“运行时读文件系统”的路线。

---

# 六、页面结构

第一版页面结构已经从“博客列表首页”演进成“**主界面 + 分类界面 + 完整归档 + 档案详情**”的组合，这里按当前实现整理。

## 必要页面

- 首页主界面：`src/routes/+page.svelte`
- 首页数据：`src/routes/+page.server.ts`
- 分类界面：`src/routes/blog/+page.svelte`
- 分类界面数据：`src/routes/blog/+page.server.ts`
- 完整归档页：`src/routes/blog/archive/+page.svelte`
- 完整归档数据：`src/routes/blog/archive/+page.server.ts`
- 文章详情页：`src/routes/blog/[slug]/+page.svelte`
- 文章详情数据：`src/routes/blog/[slug]/+page.server.ts`
- 标签页：`src/routes/tags/[tag]/+page.svelte`
- 标签页数据：`src/routes/tags/[tag]/+page.server.ts`
- 动态占位页：`src/routes/updates/+page.svelte`
- 收藏占位页：`src/routes/favorites/+page.svelte`
- About 页：`src/routes/about/+page.svelte`
- 404 / 路由错误页：`src/routes/+error.svelte`
- 兜底错误页：`src/error.html`
- manage 调试沙盒：`src/routes/__debug/manage/+page.svelte`

## 可选页面

- 搜索页：`src/routes/search/+page.svelte`
- 友情链接页：`src/routes/links/+page.svelte`
- Sitemap：`src/routes/sitemap.xml/+server.ts`

## 当前布局约束

- 首页在 `src/routes/+layout.svelte` 中走特殊分支，不复用全局 Header / Dock / Footer
- 首页使用 `screen-home` 的独立结构，而不是普通 `shell + section` 页面
- 首屏会先进入 boot loading overlay，再推进到 staged / entering / ready 的主 UI 时间线
- 当 **`aspect-ratio < 1.45`** 或 **`max-width: 900px`** 时，首页退化成精简版布局
- 非首页公开内容路由统一走 shared subpage app shell，用于分类页、归档页、详情页、标签页和 About
- 站内导航默认由 SvelteKit client router 接管：**PATH 变化，但不整页刷新**

## 渲染策略

建议你们现在就定死这套策略：

- **内容页**：默认 `prerender = true`
- **强交互页**：按需保留默认 SSR，必要时再局部放宽到 CSR
- **纯内容且完全不需要 JS 的页面**：可以考虑 `csr = false`
- **根布局**：不要写 `ssr = false`
- **文章详情页**：显式维护 `entries()`，不要只依赖 crawler 发现
- **主站导航体验**：优先实现成 route-based app shell 的 SPA-like 切换

对于你们现在这种“本地内容源 + 强交互前端”的博客项目，最佳实践就是：

- **文章详情页静态生成**
- **交互组件在客户端水合**
- **动态 slug 通过 `entries()` 明确告诉构建器**
- **PATH 变化由 SvelteKit client router 接管，不以整页刷新为正常体验**

## 服务端接口约束

如果以后在 Pages 上加服务端接口：

- 写成 SvelteKit 的 `+server.ts`
- 不要额外依赖项目根目录 `/functions`
- `/manage` 是唯一允许依赖 runtime function / Pages Functions 的路由域
- `manage` 之外的公开页面和公开 API，不把 Function 当成数据层
- `manage` 之外的 server load 只允许做本地内容装配；第三方数据优先改成浏览器直连或构建期产物
- `/__debug/manage` 虽然复用 manage 组件，但它是公开调试沙盒，禁止接 `/api/manage/*` 或任何外部数据源

对于 SvelteKit on Pages，这条边界最好在设计阶段就讲明白。

---

# 七、前端模块清单

建议按这几层拆：

## 通用布局模块

- `src/lib/components/layout/Header.svelte`
- `src/lib/components/layout/Footer.svelte`
- `src/lib/components/layout/Nav.svelte`
- `src/lib/components/ThemeToggle.svelte`
- `src/lib/components/SeoHead.svelte`

## 内容展示模块

- `src/lib/components/PostCard.svelte`
- `src/lib/components/PostMeta.svelte`
- `src/lib/components/PostCover.svelte`
- `src/lib/components/PostContent.svelte`
- `src/lib/components/Toc.svelte`
- `src/lib/components/PrevNextNav.svelte`
- `src/lib/components/Pagination.svelte`
- `src/lib/components/TagChip.svelte`

## 强交互模块

- `src/lib/components/SearchBox.svelte`
- `src/lib/components/TagFilter.svelte`
- `src/lib/components/BackToTop.svelte`
- `src/lib/components/CodeBlock.svelte`
- `src/lib/components/RelatedPosts.svelte`

## 服务端内容模块

- `src/lib/server/content/blog.ts`
- `src/lib/server/content/tags.ts`
- `src/lib/server/content/archive.ts`
- `src/lib/server/sitemap/index.ts`

通用原则：

- UI 放 `components`
- 业务整理逻辑放 `features`
- server-only 内容逻辑放 `$lib/server`

不要把所有东西都堆进 `components/`。

---

# 八、内容与媒体策略

这部分结论不变，但建议比原版写得更细。

## 第一版建议

- **文章正文**：放 GitHub 仓库
- **文章配图 / 封面**：先放 GitHub 仓库
- **`robots.txt` / favicon / manifest**：放 `static/`
- **`_redirects` / `_headers`**：放项目根目录
- **可复用 UI 资源**：优先通过 `src` 中的 `import` 引入

这里要补一条 SvelteKit / Vite 视角的规则：

- `static/` 适合放**必须保留文件名**的资源
- 普通图片、图标、插画，优先 `import`
- 这样更利于缓存和构建产物管理

## 第二版再升级

如果以后图片量很大、历史资源很多、封面和图库都开始膨胀，再拆到 **Cloudflare R2**。

第一版先别急着上 R2，先把内容流和构建流跑顺。

---

# 九、部署流程

建议部署链路定成这样：

```text
本地开发（npm run dev）
  ↓
推送到 GitHub
  ↓
Cloudflare Pages 拉取仓库并构建
  ↓
@sveltejs/adapter-cloudflare 生成 Pages 可部署输出
  ↓
Preview / Production 部署
  ↓
绑定正式域名
  ↓
把 production 的 *.pages.dev 重定向到正式域名
```

## 分支建议

- `main`：正式环境
- `dev`：开发环境（可选）
- 其他分支：预览环境

## Pages 配置建议

Git 集成部署时，建议写死这几个参数：

- **Framework preset**：`SvelteKit`
- **Build command**：`npm run build`
- **Build output directory**：`.svelte-kit/cloudflare`

## Compatibility flag 说明

这里不要在文档里无条件写死某个 runtime flag。

更稳的说法是：

- 默认先按 SvelteKit + Pages preset 跑通
- 如果依赖链需要 Node.js API 或 `AsyncLocalStorage`
- 再根据当时的 Cloudflare 文档和构建报错，补 `nodejs_compat` 或 `nodejs_als`

也就是说，**输出目录是必填约束，compatibility flag 是按依赖栈决定的约束**。

## Preview 约束

还要补两条经常被漏掉的工程事实：

- PR 和分支会自动生成 preview URL
- Preview 默认是公开可访问的

如果审稿内容不想外露，再给 preview 站加 Cloudflare Access。

## 正式域名规范化

正式域名接入后，建议把 production 的 `*.pages.dev` 做 301 到正式域名，避免重复内容同时挂两套域名。

这里优先建议用 **Bulk Redirects**，不要只依赖 `_redirects`。

---

# 十、域名与环境变量

## 域名层

- 主站：`yourdomain.com`
- 可选：`www` 跳转到主域
- SSL：Cloudflare 自动处理
- DNS：继续在 Cloudflare 控制台配置

## Pages 层

- Production：正式域名
- Preview：Cloudflare 预览域名

## 环境变量拆分

建议直接分成两类写进设计文档。

### 公开变量

- `PUBLIC_SITE_URL`
- `PUBLIC_SITE_NAME`
- `PUBLIC_GISCUS_REPO`
- `PUBLIC_GISCUS_CATEGORY`
- `PUBLIC_ANALYTICS_ID`

### 私有变量

以后如果接这些内容，不要加 `PUBLIC_`：

- API token
- webhook secret
- 第三方私钥
- 后台接口凭证

这些变量只允许在 server-only 模块、`+page.server.ts`、`+server.ts`、hooks 中使用。

---

# 十一、SEO 与可访问性清单

这部分目标不变，但实现方式改成 **Svelte/SvelteKit 的 `<svelte:head>` + `app.html` 模板**。

## 必做

- 每篇文章唯一 `title`
- 每篇文章 `description`
- `canonical`
- Open Graph
- Twitter Card
- sitemap
- `robots.txt`
- 语义化 heading 结构
- 图片 `alt`
- `slug` 永久稳定
- `src/app.html` 里的 `<html lang="zh-CN">`

## 推荐

- 自动目录
- 代码块复制
- 页面性能优化
- 封面图统一尺寸
- 自定义 404 / 错误体验

这里最容易漏的是 `lang`：

- 默认模板语言是英文
- 如果站点是中文，应该显式改成 `zh-CN`
- 如果未来做多语言，再考虑动态设置

---

# 十二、内容工作流

你们平时写文章，建议固定成这一套：

## 写作流程

1. 在 `src/lib/content/blog/` 新建 `.md` 或 `.svx` 文件
2. 填 frontmatter
3. 写正文
4. `npm run dev` 本地预览
5. 提交到 GitHub
6. Cloudflare Pages 自动发布

## 审稿流程（多人）

- 作者写稿
- 发 PR
- 看 Pages preview
- 审阅
- 合并到 `main`
- 自动上线

如果以后接 Pagefind，建议让它在站点构建完成后再生成索引，因为它本身就是读最终静态 HTML 来产出搜索包的。

---

# 十三、权限与维护建议

## GitHub

- 开启 2FA
- 重要分支加保护
- PR review 后再合并
- 仓库公开 / 私有按内容策略决定

## Cloudflare

- Pages 权限只给必要的人
- 域名权限尽量少人持有
- DNS 与项目部署权限分开
- 预览站如果涉及内部审稿，可加 Access

## 备份

- 定期导出仓库
- 原图做离线备份
- Cloudflare 域名 / Pages 配置留档

---

# 十四、第一版 MVP 清单

如果想尽快上线，第一版现在应该以这组页面与能力为准：

- 首页主界面（game home screen / command center）
- 分类界面（`/blog`）
- 完整归档页（`/blog/archive`）
- 文章详情页（dossier）
- 标签页
- About
- 动态 / 收藏占位页
- Markdown / mdsvex 内容系统
- Frontmatter schema 校验
- SEO 基础
- Sitemap
- Cloudflare Pages 部署
- 自定义域名接入
- `pages.dev` → 正式域名重定向
- 首页双方案响应式：宽屏完整界面，窄比例精简界面
- 内容页 prerender

**先别做**：

- 后台 CMS
- 登录系统
- 数据库
- 复杂推荐算法
- 权限系统
- 全站纯 SPA 化

最后这一条还是要强调：

你们做强交互没问题，但最佳路线仍然是**route-based app shell + SPA-like navigation + 内容页 prerender**，不是整站空壳。

---

# 十五、推荐的最终落地版本

收成一句完整配置就是：

- **前端**：SvelteKit
- **适配器**：`@sveltejs/adapter-cloudflare`
- **初始化**：`create-cloudflare`（C3）
- **文章**：GitHub 仓库里的 Markdown / mdsvex
- **Frontmatter**：必填字段 + schema 校验
- **内容加载**：构建期批量导入 + `$lib/server` 内容辅助函数
- **首页形态**：`/` 为 game-like command center
- **一级内容入口**：`/blog` 为分类界面，不再承担传统文章流职责
- **完整浏览入口**：`/blog/archive`
- **详情页生成**：`/blog/[slug]` 明确使用 `entries()` + prerender 策略
- **导航体验**：站内 path 变化由 SvelteKit router 接管，默认不整页刷新
- **图片**：先放仓库；固定命名资源放 `static/`，可复用资源优先 `import`
- **部署**：Cloudflare Pages
- **Pages 配置**：`Framework preset = SvelteKit`，输出目录 `.svelte-kit/cloudflare`
- **域名**：Cloudflare DNS
- **域名规范化**：`*.pages.dev` 重定向到正式域名
- **评论**：giscus（后加）
- **搜索**：Pagefind（后加）
- **统计**：Cloudflare Web Analytics（后加）

这个组合的核心优点是：

**SvelteKit 负责强交互前端和 route-based app shell；GitHub 负责内容源；Cloudflare Pages 负责构建、部署和分发；内容页默认 prerender，站内导航保持 SPA-like，交互页保留 SSR / CSR 扩展空间。**

---

# 十六、项目启动清单

照这个顺序开工最顺：

1. 确定主框架：**SvelteKit**
2. 初始化项目：`npm create cloudflare@latest -- my-svelte-app --framework=svelte --platform=pages`
3. 确认项目已使用 `@sveltejs/adapter-cloudflare`
4. 加 mdsvex：`npx sv add mdsvex`
5. 建立 `src/lib/content/blog/`
6. 建立 `src/lib/server/content/`
7. 定 frontmatter 字段
8. 给 frontmatter 加 schema 校验
9. 写文章收集逻辑（推荐 `import.meta.glob(...)`）
10. 做全局布局：`src/routes/+layout.svelte`
11. 调整 `src/app.html` 的 `lang`
12. 做首页主界面：`src/routes/+page.svelte`
13. 做分类界面：`src/routes/blog/+page.svelte` + `+page.server.ts`
14. 做完整归档：`src/routes/blog/archive/+page.svelte` + `+page.server.ts`
15. 做文章详情：`src/routes/blog/[slug]/+page.svelte` + `+page.server.ts`
16. 给文章详情页实现 `entries()`
17. 给内容页接上 prerender 策略
18. 接上动态 / 收藏占位页
19. 配 SEO / sitemap / robots
20. 接 Cloudflare Pages：`Framework preset = SvelteKit`
21. 设置 Build command：`npm run build`
22. 设置 Build output directory：`.svelte-kit/cloudflare`
23. 如依赖链需要，再补对应 compatibility flag
24. 绑正式域名
25. 把 production 的 `*.pages.dev` 重定向到正式域名
26. 上线第一篇文章

这一版和旧文档相比，真正的关键升级点只有五个：

- 初始化优先 C3
- 项目结构补上 `$lib/server` 和 `features`
- frontmatter 从“约定”升级为“schema 校验”
- 内容加载改成 `import.meta.glob(...)` 路线
- 动态文章页明确 `entries()` + prerender 生成策略
- Pages 配置写死输出目录 `.svelte-kit/cloudflare`
- 正式域名上线后处理 `pages.dev` 规范化

---

# 十七、参考资料

- SvelteKit Project Structure: https://svelte.dev/docs/kit/project-structure
- SvelteKit Page Options: https://svelte.dev/docs/kit/page-options
- SvelteKit Server-only Modules: https://svelte.dev/docs/kit/server-only-modules
- SvelteKit Accessibility: https://svelte.dev/docs/kit/accessibility
- SvelteKit Loading Data: https://svelte.dev/docs/kit/load
- SvelteKit Adapter Cloudflare: https://svelte.dev/docs/kit/adapter-cloudflare
- Vite Glob Import: https://vite.dev/guide/features.html#glob-import
- Cloudflare Pages SvelteKit Guide: https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/
- Cloudflare Pages Redirects: https://developers.cloudflare.com/pages/configuration/redirects/
- Cloudflare Pages Preview Deployments: https://developers.cloudflare.com/pages/configuration/preview-deployments/
- Cloudflare Pages Routing and `_routes.json`: https://developers.cloudflare.com/pages/functions/routing/
- Cloudflare Pages Redirecting `*.pages.dev` to a Custom Domain: https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/
- Cloudflare Workers Node.js Compatibility: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
