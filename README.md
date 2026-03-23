# Kimu Blog

Kimu Blog 是一套面向 Cloudflare Pages 的 SvelteKit 内容站脚手架。

当前脚手架已经落下这些基础能力：

- SvelteKit + `@sveltejs/adapter-cloudflare`
- Markdown / mdsvex 内容系统
- frontmatter schema 校验
- `entries()` + prerender 的文章详情页策略
- 首页、博客列表、文章详情、标签页、About 页骨架
- RSS / Sitemap 基础输出

## 开发

```sh
npm install
npm run gen
npm run dev
```

局域网调试：

```sh
npm run dev:host
```

离线 / Pages 行为本地调试：

```sh
npm run preview:offline
```

说明：

- `npm run dev` 适合日常开发，速度最快。
- `npm run preview:offline` 会先构建，再用 `wrangler pages dev` 在本地模拟 Pages，更接近线上行为。

## 校验

```sh
npm run ci
npm run check
npm run lint
npm run build
```

## 部署

当前默认目标是 **Cloudflare Pages**。

构建产物目录：

```sh
.svelte-kit/cloudflare
```

## 关键目录

```text
src/lib/content/blog/      # 文章内容
src/lib/content/schema.ts  # frontmatter schema
src/lib/server/content/    # server-only 内容加载
src/routes/blog/           # 博客页面路由
docs/                      # 架构与开发计划书与设计稿
docs/degsin.md             # 设计方案基线文档
```

## 参考文档

正式计划书见：

- `docs/architecture-development-plan.md`

## GitHub Actions

仓库当前只保留一条 CI workflow：

- `.github/workflows/ci.yml`

当前建议分工：

- **Cloudflare Pages Git integration** 负责构建与部署
- **GitHub Actions CI** 负责 `gen / check / lint / build`

触发方式：

- `pull_request` 自动跑 CI
- push 到 `main` / `dev` 自动跑 CI
