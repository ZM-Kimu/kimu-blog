<script lang="ts">
	let { children } = $props<{
		children: () => unknown
	}>()
</script>

<section class="subpage-screen">
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
		--subpage-stage-gap: clamp(1.2rem, 2vw, 1.8rem);

		position: relative;
		min-height: 100dvh;
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

	@media (max-width: 760px) {
		.subpage-screen__viewport {
			padding: calc(var(--home-topbar-height) + 1.6rem) var(--home-shell-padding) 1rem;
		}
	}
</style>
