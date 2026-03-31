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
- 样式质量门槛：严格 `stylelint`
- 文案质量门槛：严格 i18n parity + 裸文案门禁
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
- `__debug/manage` 复用 manage 组件，但只允许使用本地 mock 数据，不接 `/api/manage/*` 或第三方服务
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
- `/__debug/manage`：manage 单页样式沙盒，仅用于本地 / preview 调试
- `/sitemap.xml`
- `+error.svelte`

### 当前布局规则

- 首页不复用全局 Header / Dock / Footer
- 非首页公开内容页统一走 shared subpage app shell，错误页也归到这一类
- 站点首屏通过 boot loading overlay 协调首次进入，时间线按 `boot -> entry -> idle` 理解
- 常规页面切换统一按 `exit -> entry -> idle` 协调内容、背景与壳体，不复用 boot 时间线
- 当前 boot 的资源等待通过独立的 `data-site-boot-assets` 协调，不再把资源门控混进 boot 主状态
- `/manage` 及其子路由不参与公开站点 boot 协调，当前实现直接跳过公共 boot 时间线
- 首页宽屏下保持固定比例的 screen layout
- 公开站点布局按页面朝向切换：**landscape 使用 large layout / desktop app-shell**，**portrait 使用 mobile 文档流布局**
- `landscape` 公开布局不再按宽度断点做元素重排，只保留尺寸级收缩与极短高度保护
- 主站按 route-based app shell 运作，站内切换由 SvelteKit router 接管
- 站内可视物件默认不可选中、不可拖动；仅输入控件与显式白名单元素恢复能力

### 当前运行时壳体

- 根布局 `src/routes/+layout.svelte` 是公开站点的统一协调层，负责 boot、客户端路由切换、背景舞台与共享 topbar 的挂载
- `NavigationStateManager` 负责公开站点的切换状态、背景场景、topbar 折叠状态、语言切换、cursor mode、背景动画偏好与 app 内历史游标
- `BackgroundStage` 是常驻背景舞台，不再把背景直接散落到各页面组件内
- `PublicTopbarManager` 是共享 shell 管理器；topbar 作为公共壳体存在，不属于单页动画本体

### 当前样式规范基线

- `npm run lint` 当前包含 `prettier + eslint + stylelint`
- `npm run lint:css` / `npm run lint:css:fix` 已成为仓库默认样式命令
- `npm run gen:motion-css` / `npm run validate:motion-css` 已成为动画 token 单一源的生成与校验命令
- `npm run validate:i18n` 已进入门禁链，负责校验 messages 对等和产品层裸文案
- CSS lint 覆盖 `src/**/*.{css,svelte}`
- 选择器类名统一为纯 `kebab-case`
- vendor prefix 已从仓库样式中移除
- 颜色函数、媒体查询、`@import` 等写法按现代 CSS 语法收敛
- 全站动画参数统一收口在 `src/lib/motion/tokens.ts`；布局、组件、GSAP 时间线与 CSS 只允许消费 token，不再直接落新的动画裸值

### 当前 i18n 约束

- 当前只支持 `zh-CN` 与 `en-US`
- locale 通过 `cookie + Accept-Language` 解析，并由根布局同步 `<html lang>`
- 产品层用户可见文本必须全部走 `src/lib/i18n/messages/*`
- 覆盖范围包括：公开站点、错误页、manage UI、SEO/head、a11y label、按钮、空态、placeholder、调试页产品文案
- 内容层边界保持不变：Markdown 正文、frontmatter `title/description/tags`、文章摘要、标签名暂不要求双语
- 缺失翻译在开发与 CI 中直接失败；生产环境只允许回退默认语言 `zh-CN`，不向用户展示 key

### 当前页面切换语法

- 常规页面切换的页面内容状态只按 `exit -> entry -> idle` 理解
- 背景切换与页面内容切换已解耦：页面内容进入不再默认等待背景或 topbar 动画收尾
- 宽屏 desktop 当前已经存在 source-aware 的内容进入变体：
  - `subpage -> home` 使用首页内容的独立 route-enter
  - `home -> public subpage` 使用子页内容的独立 route-enter
- 纵向 portrait 页面使用独立文档流壳体与更轻的页面进入语法，不再复用 desktop app-shell choreography
- 公开站点当前使用 3 个背景 scene：
  - `home-spine`
  - `subpage-room`
  - `neutral-default`
- 错误页当前显式并入 `subpage-room` 与 `subpage` 壳体，不再单列独立背景理念
- `topbar` 是 shell animation，不计入单页动画套数；它允许 `main <-> subpage` 形态切换，但不应作为页面进入的阻塞门槛

### 当前背景动画实现

- 首页背景已拆成 `home base scene + spine overlay` 两层语义
- `home base scene` 负责首页背景的即时识别，`spine overlay` 只做增强，不再承担首页识别的唯一职责
- `spine overlay` 采用持久 host，普通 desktop 切页不再反复创建 / 销毁 Pixi viewer
- 当前 `spine overlay` 支持 `live / paused-visible / hidden` 三态，用于在背景切换中保留过渡、避免切页性能回退
- 公开路由在桌面端允许预热隐藏的 spine host，以降低从子页首次回首页时的初始化开销

### 当前错误页语义

- 错误页继续归到 `subpage` 体系，而不是独立第三类页面
- 错误页背景使用 `subpage-room`
- 错误页 topbar 标题统一固定为 `错误`
- 错误页内容进入使用元素级 `opacity + translateY` 渐入；topbar 保持固定，不跟随错误页内容位移
- 错误页返回遵循 `history-first + fallback` 规则：优先回退 app 内历史，无法回退时再走显式 fallback

## 5. 第一阶段已完成范围

- 基础仓库配置
- mdsvex 接入
- frontmatter schema
- server-only 内容 loader
- 首页主界面
- 首屏 boot loading overlay
- 分类界面
- 完整归档页
- 文章详情页
- 标签页
- About 页
- 动态 / 收藏占位页
- `__debug/manage` 本地调试沙盒
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
- `npm run lint` 通过
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
