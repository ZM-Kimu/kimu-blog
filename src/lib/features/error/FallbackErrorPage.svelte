<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import '$lib/features/home/styles/topbar/base.css'
	import '$lib/features/home/styles/topbar/subpage.css'
	import HomeTopbarSubpage from '$lib/features/home/topbar/HomeTopbarSubpage.svelte'
	import TopbarReopenButton from '$lib/features/home/topbar/TopbarReopenButton.svelte'
	import { getNavigationContext } from '$lib/navigation/context'
	import type { HomeTopbarAction } from '$lib/features/home/topbar/home-topbar.types'

	let {
		status,
		message
	}: {
		status: number
		message: string
	} = $props()

	const { navigationManager } = getNavigationContext()
	const topbarState = $derived(navigationManager.pageState.topbar)
	const topbarCollapsed = $derived(navigationManager.topbarCollapsed)
	const expandAriaLabel = $derived(
		navigationManager.locale === 'en-US' ? 'Expand top bar' : '展开 topbar'
	)

	const isNotFound = $derived(status === 404)
	const isServerFault = $derived(status >= 500)
	const usesCompactHeadline = $derived(isNotFound || isServerFault)
	const eyebrow = $derived(isNotFound ? 'Route Lost' : 'Unhandled Fault')
	const headline = $derived(
		isNotFound
			? '未找到页面~ (´・ω・`)'
			: isServerFault
				? '系统故障 (´；ω；`)'
				: '系统信号中断，页面未能完成装载。'
	)
	const detailMessage = $derived(
		message?.trim() || (isNotFound ? '请求的页面不存在。' : '发生了未知错误。')
	)
	const visualSrc = $derived(
		isServerFault ? '/images/arona_embarrassed.png' : '/images/Popup_Image_Arona.png'
	)
	const visualAlt = $derived(
		isServerFault
			? 'Arona 表情插画，用于 500 错误页展示。'
			: 'Arona 的弹窗插画，用于错误页的引导展示。'
	)

	async function handleBack() {
		await navigationManager.goBack(topbarState.back)
	}

	async function handleAction(action: HomeTopbarAction) {
		switch (action.key) {
			case 'language':
				await navigationManager.toggleLocale()
				break
			case 'collapse':
				navigationManager.toggleTopbarCollapsed()
				break
			case 'home':
				await goto(resolve('/'))
				break
		}
	}
</script>

<section class="error-screen">
	<div class="error-screen__room" aria-hidden="true"></div>
	<div class="error-screen__light error-screen__light--left" aria-hidden="true"></div>
	<div class="error-screen__light error-screen__light--right" aria-hidden="true"></div>

	<div class="error-screen__topbar">
		<div class:home-topbar-stage--collapsed={topbarCollapsed} class="home-topbar-stage">
			<HomeTopbarSubpage
				metrics={topbarState.metrics}
				actions={topbarState.actions}
				title={topbarState.title}
				motionLocked={false}
				onBack={handleBack}
				onAction={handleAction}
			/>

			{#if topbarCollapsed}
				<TopbarReopenButton
					ariaLabel={expandAriaLabel}
					onActivate={() => navigationManager.toggleTopbarCollapsed(false)}
				/>
			{/if}
		</div>
	</div>

	<div class="error-screen__body">
		<div class="error-screen__visual" aria-label="Fallback illustration">
			<img src={visualSrc} alt={visualAlt} loading="eager" decoding="async" />
		</div>

		<article class="error-screen__copy">
			<p class="eyebrow">{eyebrow}</p>
			<h1 class:error-screen__title--compact={usesCompactHeadline}>{headline}</h1>
			<p class="error-screen__message">{detailMessage}</p>
		</article>
	</div>
</section>

<style>
	.error-screen {
		--home-shell-padding: clamp(0.78rem, 1.25vw, 1.05rem);
		--home-topbar-height: 5.2rem;
		--home-topbar-gap: 0.85rem;
		--home-resource-gap: 0.65rem;
		--error-stage-gap: clamp(1.2rem, 2vw, 1.8rem);

		position: relative;
		display: grid;
		gap: 0;
		width: 100%;
		height: 100dvh;
		min-height: 100dvh;
		align-items: start;
		overflow: hidden;
		box-shadow: inset 0 0 0 1px rgba(31, 92, 153, 0.12);
		background:
			radial-gradient(circle at top left, rgba(114, 220, 255, 0.18), transparent 28%),
			radial-gradient(circle at 86% 16%, rgba(79, 120, 255, 0.12), transparent 24%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 24%),
			linear-gradient(180deg, #f4fbff 0%, #dff0ff 48%, #d6e7f8 100%);
	}

	.error-screen::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.06) 34%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 30%);
	}

	.error-screen__room,
	.error-screen__light {
		position: absolute;
		pointer-events: none;
		z-index: 0;
	}

	.error-screen__room {
		inset: 0;
		background:
			linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.04) 0%,
				rgba(187, 228, 249, 0.08) 46%,
				rgba(123, 197, 236, 0.16) 100%
			),
			repeating-linear-gradient(
				90deg,
				rgba(255, 255, 255, 0.3) 0,
				rgba(255, 255, 255, 0.3) 1px,
				transparent 1px,
				transparent 12%
			),
			repeating-linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.16) 0,
				rgba(255, 255, 255, 0.16) 1px,
				transparent 1px,
				transparent 13%
			);
		opacity: 0.6;
	}

	.error-screen__light {
		border-radius: 999px;
		filter: blur(14px);
		opacity: 0.75;
	}

	.error-screen__light--left {
		left: 20%;
		top: 12%;
		width: 26%;
		height: 24%;
		background: radial-gradient(circle, rgba(139, 225, 255, 0.78), transparent 70%);
	}

	.error-screen__light--right {
		right: 8%;
		top: 18%;
		width: 24%;
		height: 18%;
		background: radial-gradient(circle, rgba(108, 153, 255, 0.3), transparent 72%);
	}

	.error-screen__topbar {
		position: absolute;
		inset: 0 0 auto 0;
		width: 100%;
		min-height: 0;
		overflow: visible;
		z-index: 2;
	}

	.error-screen__body {
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 100%;
		box-sizing: border-box;
		padding: calc(var(--home-topbar-height) + var(--error-stage-gap)) var(--home-shell-padding)
			var(--error-stage-gap);
		position: relative;
		z-index: 1;
	}

	.error-screen__copy {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		justify-items: center;
		width: min(100%, 42rem);
		text-align: center;
		padding: 0 1rem;
	}

	.error-screen__copy h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.25rem, 5.2vw, 4.2rem);
		line-height: 0.94;
		letter-spacing: -0.06em;
		max-width: 12ch;
	}

	.error-screen__title--compact {
		font-size: clamp(0.9rem, 2.08vw, 1.68rem);
		letter-spacing: -0.04em;
		max-width: none;
		white-space: nowrap;
	}

	.error-screen__message {
		margin: 0;
		font-size: 0.88rem;
		line-height: 1.6;
		color: var(--ink-faint);
		font-family: var(--font-sans);
		max-width: 42ch;
		overflow-wrap: anywhere;
	}

	.error-screen__visual {
		position: relative;
		display: grid;
		place-items: center;
		justify-items: center;
		width: 100%;
		min-height: 25rem;
		padding: 0.5rem 1rem 0;
		isolation: isolate;
	}

	.error-screen__visual::before {
		content: '';
		position: absolute;
		right: -2rem;
		top: -3rem;
		width: 16rem;
		height: 16rem;
		border-radius: 999px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.7), transparent 72%);
	}

	.error-screen__visual::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 0.5rem;
		width: min(28rem, calc(100% - 4rem));
		height: 5rem;
		border-radius: 999px;
		background: radial-gradient(ellipse at center, rgba(79, 120, 255, 0.26), transparent 72%);
		transform: translateX(-50%);
	}

	.error-screen__visual img {
		position: relative;
		z-index: 1;
		width: min(75%, 21rem);
		max-height: 24rem;
		object-fit: contain;
		filter: drop-shadow(0 28px 42px rgba(49, 103, 168, 0.22));
	}

	@media (max-width: 1040px) {
		.error-screen__visual {
			min-height: 24rem;
		}
	}

	@media (max-width: 760px) {
		.error-screen__room,
		.error-screen__light {
			display: none;
		}

		.error-screen__body {
			padding: calc(var(--home-topbar-height) + 1.8rem) var(--home-shell-padding) 1.2rem;
		}
	}
</style>
