<script lang="ts">
	import { getPublicLayoutContext } from '$lib/layout/public-layout'

	let { children } = $props<{
		children: () => unknown
	}>()

	const { getMode } = getPublicLayoutContext()
	const isPortraitLayout = $derived(getMode() === 'portrait')
</script>

{#if isPortraitLayout}
	<section class="portrait-subpage-screen">
		<div class="portrait-subpage-screen-content">
			{@render children()}
		</div>
	</section>
{:else}
	<section class="subpage-screen">
		<div class="subpage-screen-viewport">
			<div class="subpage-screen-content">
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

		position: relative;
		min-height: 100dvh;
	}

	.subpage-screen-viewport {
		position: relative;
		z-index: 1;
		padding: calc(var(--home-topbar-height) + var(--subpage-stage-gap)) var(--home-shell-padding)
			var(--subpage-stage-gap);
	}

	.subpage-screen-content {
		width: min(1460px, calc(100vw - (var(--home-shell-padding) * 2)));
		margin: 0 auto;
		display: grid;
		gap: 1rem;
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

	@media (width <= 760px) {
		.subpage-screen-viewport {
			padding: calc(var(--home-topbar-height) + 1.6rem) var(--home-shell-padding) 1rem;
		}
	}
</style>
