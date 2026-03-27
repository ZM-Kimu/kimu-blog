<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<section class="profile-screen">
	<section class="panel dossier-hero">
		<div class="dossier-hero__top">
			<p class="eyebrow">Profile Dossier</p>
			<a class="button-secondary dossier-hero__back" href={resolve('/')}>返回主界面</a>
		</div>

		<div class="dossier-hero__header">
			<div>
				<h1>关于这个站点</h1>
				<p class="post-description">
					Kimu Blog 被设计成一个游戏主界面式的个人站：内容是核心，界面组织方式则参考 mission board
					与 dossier UI。
				</p>
			</div>
		</div>
	</section>

	<div class="profile-grid">
		<section class="panel dossier-side__panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Loaded Systems</p>
					<h2>当前能力</h2>
				</div>
			</div>
			<ul class="system-list">
				<li>Cloudflare Pages 构建与分发</li>
				<li>mdsvex 内容接入</li>
				<li>frontmatter schema 校验</li>
				<li>`entries()` + prerender 详情页生成</li>
				<li>游戏 UI 风格页面骨架</li>
			</ul>
		</section>

		<section class="panel dossier-side__panel">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Next Missions</p>
					<h2>下一步</h2>
				</div>
			</div>
			<ul class="system-list">
				<li>替换 placeholder 资产</li>
				<li>补动态数据和更细的个人资料字段</li>
				<li>完善 archive / favorites / updates 的真实内容</li>
				<li>补搜索、评论、统计</li>
			</ul>
		</section>
	</div>
</section>
