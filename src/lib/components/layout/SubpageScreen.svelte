<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { getNavigationContext } from '$lib/navigation/context'
	import HomeTopbarSubpage from '$lib/features/home/topbar/HomeTopbarSubpage.svelte'
	import TopbarReopenButton from '$lib/features/home/topbar/TopbarReopenButton.svelte'
	import '$lib/features/home/styles/topbar/base.css'
	import '$lib/features/home/styles/topbar/subpage.css'
	import type {
		HomeTopbarAction,
		HomeTopbarMetric
	} from '$lib/features/home/topbar/home-topbar.types'

	let { children } = $props<{
		children: () => unknown
	}>()

	const { navigationManager } = getNavigationContext()
	const topbarState = $derived(navigationManager.pageState.topbar)
	const topbarCollapsed = $derived(navigationManager.topbarCollapsed)
	const expandAriaLabel = $derived(
		navigationManager.locale === 'en-US' ? 'Expand top bar' : '展开 topbar'
	)
	const isEntering = $derived(
		navigationManager.phase === 'entering' &&
			navigationManager.pendingTarget === navigationManager.routeState.pathname
	)
	const preloadedMetrics = $derived(topbarState.metrics)
	const preloadedActions = $derived(topbarState.actions)

	function assetKey(
		kind: 'metric' | 'action',
		key: string,
		icon: HomeTopbarMetric['icon'] | HomeTopbarAction['icon']
	) {
		return `${kind}:${key}:${icon.mode}:${icon.src}:${icon.tint ?? 'none'}`
	}

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

<section
	class:subpage-screen--entering={isEntering}
	class="subpage-screen"
	style={`--site-page-enter-duration: ${navigationManager.enterDurationMs}ms;`}
>
	<div class="subpage-screen__room" aria-hidden="true"></div>
	<div class="subpage-screen__light subpage-screen__light--left" aria-hidden="true"></div>
	<div class="subpage-screen__light subpage-screen__light--right" aria-hidden="true"></div>

	<div class="subpage-screen__topbar">
		<div class:home-topbar-stage--collapsed={topbarCollapsed} class="home-topbar-stage">
			<div class="home-topbar__asset-bank" aria-hidden="true">
				{#each preloadedMetrics as metric (assetKey('metric', metric.key, metric.icon))}
					{#if metric.icon.mode === 'image'}
						<img alt="" src={metric.icon.src} loading="eager" decoding="async" />
					{:else}
						<span
							class="home-topbar__asset-bank-icon home-topbar__icon home-topbar__icon--mask"
							style={`--topbar-icon-src: url('${metric.icon.src}');${metric.icon.tint ? ` --topbar-icon-tint: ${metric.icon.tint};` : ''}`}
						></span>
					{/if}
				{/each}

				{#each preloadedActions as action (assetKey('action', action.key, action.icon))}
					{#if action.icon.mode === 'image'}
						<img alt="" src={action.icon.src} loading="eager" decoding="async" />
					{:else}
						<span
							class="home-topbar__asset-bank-icon home-topbar__icon home-topbar__icon--mask"
							style={`--topbar-icon-src: url('${action.icon.src}');${action.icon.tint ? ` --topbar-icon-tint: ${action.icon.tint};` : ''}`}
						></span>
					{/if}
				{/each}

				<span
					class="home-topbar__asset-bank-icon home-topbar__icon home-topbar__icon--mask"
					style="--topbar-icon-src: url('/icons/topbar/expand.png'); --topbar-icon-tint: #47639c;"
				></span>
			</div>

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

	<div class="subpage-screen__viewport">
		<div class="subpage-screen__content">
			{@render children()}
		</div>
	</div>
</section>

<style>
	.subpage-screen {
		--home-shell-padding: clamp(0.78rem, 1.25vw, 1.05rem);
		--home-topbar-height: 5.2rem;
		--home-topbar-gap: 0.85rem;
		--home-resource-gap: 0.65rem;
		--subpage-stage-gap: clamp(1.2rem, 2vw, 1.8rem);

		position: relative;
		min-height: 100dvh;
		background:
			radial-gradient(circle at top left, rgba(114, 220, 255, 0.18), transparent 28%),
			radial-gradient(circle at 86% 16%, rgba(79, 120, 255, 0.12), transparent 24%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 24%),
			linear-gradient(180deg, #f4fbff 0%, #dff0ff 48%, #d6e7f8 100%);
		box-shadow: inset 0 0 0 1px rgba(31, 92, 153, 0.12);
		overflow: clip;
	}

	.subpage-screen::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.06) 34%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 30%);
	}

	.subpage-screen__room,
	.subpage-screen__light {
		position: absolute;
		pointer-events: none;
		z-index: 0;
	}

	.subpage-screen__room {
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

	.subpage-screen__light {
		border-radius: 999px;
		filter: blur(14px);
		opacity: 0.75;
	}

	.subpage-screen__light--left {
		left: 20%;
		top: 12%;
		width: 26%;
		height: 24%;
		background: radial-gradient(circle, rgba(139, 225, 255, 0.78), transparent 70%);
	}

	.subpage-screen__light--right {
		right: 8%;
		top: 18%;
		width: 24%;
		height: 18%;
		background: radial-gradient(circle, rgba(108, 153, 255, 0.3), transparent 72%);
	}

	.subpage-screen__topbar {
		position: absolute;
		inset: 0 0 auto 0;
		width: 100%;
		min-height: 0;
		z-index: 2;
	}

	.subpage-screen__viewport {
		position: relative;
		z-index: 1;
		padding: calc(var(--home-topbar-height) + var(--subpage-stage-gap)) var(--home-shell-padding)
			var(--subpage-stage-gap);
	}

	.subpage-screen__content {
		width: min(1460px, calc(100vw - (var(--home-shell-padding) * 2)));
		margin: 0 auto;
		display: grid;
		gap: 1rem;
	}

	.subpage-screen--entering :global(.home-topbar-stage),
	.subpage-screen--entering .subpage-screen__content {
		animation: subpage-screen-enter var(--site-page-enter-duration, 260ms)
			cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}

	.subpage-screen--entering .subpage-screen__content {
		animation-delay: 50ms;
	}

	@media (max-width: 760px) {
		.subpage-screen__room,
		.subpage-screen__light {
			display: none;
		}

		.subpage-screen__viewport {
			padding: calc(var(--home-topbar-height) + 1.6rem) var(--home-shell-padding) 1rem;
		}
	}

	@keyframes subpage-screen-enter {
		from {
			opacity: 0;
			transform: translateY(16px);
			filter: blur(10px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}
</style>
