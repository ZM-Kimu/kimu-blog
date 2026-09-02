## 0. 项目定位

- 本仓库是基于 **SvelteKit + mdsvex + Cloudflare Pages** 的内容优先、动画驱动、强交互博客/站点。
- Agent 应维护 route-based app shell、SPA-like navigation、视觉识别、内容工作流与静态优先部署模型。

## 1. 基本原则

- 优先级：体验与视觉质量 > 内容工作流稳定 > 页面可读可访问 > 构建通过 > 新功能。
- 需求不完整时，选择最符合现有架构的最小可组合方案。
- 避免无故重写稳定架构、切换包管理器、引入重型依赖或复制相似组件。

## 2. 架构边界

- 结构级、页面级、动效级修改前，先阅读 `docs/`、`package.json` 和相关 `src/routes/`、`src/lib/`。
- `/manage` 是唯一允许依赖 Pages Functions / Workers / runtime server logic 的路由域。
- 公开页面保持 static-first，避免 Node-only runtime API、磁盘写入、常驻服务或服务端强依赖。
- `robots.txt`、favicon、manifest、固定根路径资源放在 `static/`。

## 3. 路由与内容

- 固定路由：`/` 首页，`/blog` 分类/索引，`/blog/archive` 归档，`/blog/[slug]` 文章详情。
- 站内导航默认使用 SvelteKit client routing；外链、下载或必要刷新场景除外。
- 404/error 页面继续服从 shared subpage app shell；`__debug` 仅用于 local/preview。
- frontmatter 必须经过 schema 校验；新增或修改字段时同步更新 schema。
- 产品层可见文本必须走 i18n；Markdown 正文与 frontmatter 内容数据不强制双语。
- 缺失翻译在 dev/CI 必须失败；production 仅允许回退 `zh-CN`。

## 4. 动效与交互

- 动效必须尊重 `prefers-reduced-motion`。
- 首屏 boot 仅用于首次进入；常规路由切换使用 `exit -> entry -> idle`。
- 新增 duration/delay/easing/offset/blur/scale/stagger 先进入 `src/lib/motion/tokens.ts`。
- boot 资源等待使用独立 `data-site-boot-assets`，不混入 boot 主状态。
- 可视装饰对象默认 non-draggable / non-selectable；仅为表单、正文、代码、链接、按钮和显式白名单恢复能力。

## 5. 风格与代码标准

- 组件保持小而可组合，优先复用既有 pattern。
- TypeScript 类型明确，避免 `any`、隐式结构和未处理的 nullable state。
- 样式避免全局副作用、magic number 和 `!important`；视觉参数优先使用 token。
- UI 兼顾 desktop/mobile、keyboard navigation、focus state、语义化 HTML 与基础可访问性。
- 代码、变量、文件名、配置项使用 English；用户可见文案通过 i18n 输出。

## 6. 验证

- 优先使用 `package.json` 中已有 scripts。
- 视觉、几何、动效回归需通过 Playwright / MCP / browser / manual check 验证；工具不可用时明确说明未验证。

## 7. 临时最高指示

- 请遵从临时最高指南的指示，与已有指示重复时 override
- 快速开发与问题确认。
- 对于用户请求的修改，仅需对用户提出的疑问进行调查与确认，无需做完整测试与格式化测试。
- 如果已确认用户提出的指示已修改完毕，则可快速结束本次对话。
