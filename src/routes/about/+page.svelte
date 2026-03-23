<script lang="ts">
	import SeoHead from '$lib/components/ui/SeoHead.svelte';
</script>

<SeoHead title="关于项目" description="Kimu Blog 当前脚手架与开发方向说明。" pathname="/about" />

<section class="page-intro">
	<p class="eyebrow">About</p>
	<h1>项目说明</h1>
	<p>
		这个仓库当前承载的是一套内容优先、强交互友好、面向 Cloudflare Pages 的 SvelteKit 博客脚手架。
	</p>
</section>

<section class="content-prose">
	<h2>当前已经落地的内容</h2>
	<ul>
		<li>Pages 适配器与构建输出目录</li>
		<li>mdsvex 内容接入</li>
		<li>frontmatter schema 校验</li>
		<li>文章详情页 `entries()` + prerender 策略</li>
		<li>基础首页、文章页、标签页、RSS、Sitemap</li>
	</ul>

	<h2>下一阶段</h2>
	<p>接下来可以继续补视觉系统、交互动效、搜索、评论、统计和 CI/CD 工作流。</p>
</section>
