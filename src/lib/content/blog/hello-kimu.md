---
title: 'Hello Kimu'
description: 'Kimu Blog 脚手架的第一篇示例文章，用来验证 mdsvex、schema 校验与 prerender 流程。'
date: '2026-03-23'
updated: '2026-03-23'
tags: ['sveltekit', 'cloudflare', 'scaffold']
category: '工程'
draft: false
cover: '/images/og-default.svg'
slug: 'hello-kimu'
featured: true
author: 'Kimu Team'
---

## 这篇文章存在的意义

它不是内容本身，而是用来证明这套脚手架已经具备下面 3 个基础能力：

1. frontmatter 会走 schema 校验
2. 文章详情页通过 `entries()` 参与 prerender
3. 内容模块通过 `import.meta.glob(...)` 被统一收集

## 当前已经具备的页面

- 首页
- 文章列表页
- 文章详情页
- 标签页
- About 页
- RSS / Sitemap

## 下一步应该做什么

接下来更值得做的是：

- 把视觉系统继续细化
- 把搜索与评论模块补上
- 接入 Cloudflare Pages 正式发布流
