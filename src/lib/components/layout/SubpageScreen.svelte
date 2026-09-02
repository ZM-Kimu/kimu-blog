<script lang="ts">
	import { getPublicLayoutContext } from '$lib/layout/public-layout'

	let { children, containedScroll = false } = $props<{
		children: () => unknown
		containedScroll?: boolean
	}>()

	const { getMode } = getPublicLayoutContext()
	const isPortraitLayout = $derived(getMode() === 'portrait')
</script>

{#if isPortraitLayout}
	<section
		class:portrait-subpage-screen-contained={containedScroll}
		class="portrait-subpage-screen"
	>
		<div
			class:portrait-subpage-screen-content-contained={containedScroll}
			class="portrait-subpage-screen-content"
		>
			{@render children()}
		</div>
	</section>
{:else}
	<section class:subpage-screen-contained={containedScroll} class="subpage-screen">
		<div class="subpage-screen-viewport">
			<div class:subpage-screen-content-contained={containedScroll} class="subpage-screen-content">
				{@render children()}
			</div>
		</div>
	</section>
{/if}

<style>
	.subpage-screen {
		--home-shell-padding: clamp(0.78rem, 1.25vw, 1.05rem);
		--home-topbar-height: 5.2rem;
		--subpage-stage-gap: clamp(1.2rem, 2vw, 1.8rem);
		--subpage-stage-top-offset: calc(var(--home-topbar-height) + var(--subpage-stage-gap));
		--subpage-stage-available-height: calc(
			100dvh - var(--subpage-stage-top-offset) - var(--subpage-stage-gap)
		);

		position: relative;
		min-height: 100dvh;
	}

	.subpage-screen-viewport {
		position: relative;
		z-index: 1;
		padding: var(--subpage-stage-top-offset) var(--home-shell-padding) var(--subpage-stage-gap);
	}

	.subpage-screen-contained {
		height: 100dvh;
		min-height: 0;
		overflow: hidden;
	}

	.subpage-screen-contained .subpage-screen-viewport {
		height: 100dvh;
		overflow: hidden;
	}

	.subpage-screen-content {
		width: min(1460px, calc(100vw - (var(--home-shell-padding) * 2)));
		margin: 0 auto;
		display: grid;
		gap: 1rem;
	}

	.subpage-screen-content-contained {
		height: var(--subpage-stage-available-height);
		padding: 0.75rem 1.6rem 2.8rem;
		overflow: hidden auto;
		overscroll-behavior: contain;
		scrollbar-gutter: stable;
	}

	.portrait-subpage-screen {
		width: 100%;
	}

	.portrait-subpage-screen-content {
		width: min(100%, 42rem);
		margin: 0 auto;
		display: grid;
		gap: 1.15rem;
		padding: 0.05rem 0 0.75rem;
	}

	.portrait-subpage-screen-contained {
		height: 100dvh;
		overflow: hidden;
	}

	.portrait-subpage-screen-content-contained {
		max-height: 100dvh;
		padding: 0.45rem 1rem 2rem;
		overflow: hidden auto;
		overscroll-behavior: contain;
	}

	@media (width <= 760px) {
		.subpage-screen-viewport {
			padding: calc(var(--home-topbar-height) + 1.6rem) var(--home-shell-padding) 1rem;
		}
	}
</style>
