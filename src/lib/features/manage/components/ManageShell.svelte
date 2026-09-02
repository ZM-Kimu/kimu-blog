<script lang="ts">
	import type { Snippet } from 'svelte'
	import { page } from '$app/state'
	import ManageContentNav from './ManageContentNav.svelte'

	let { children }: { children: Snippet } = $props()
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="manage-shell">
	{#if page.url.pathname.startsWith('/manage')}
		<ManageContentNav />
	{/if}
	{#key page.url.pathname}
		<div class="manage-shell-content">{@render children()}</div>
	{/key}
</div>

<style>
	.manage-shell {
		display: grid;
		gap: 1rem;
		align-content: start;
		width: 100%;
		height: 100%;
		min-height: 0;
	}

	.manage-shell-content {
		min-height: 0;
		animation: manage-content-enter var(--motion-manage-content-enter-duration)
			var(--motion-shared-easing-standard) both;
	}

	@keyframes manage-content-enter {
		from {
			opacity: 0;
			transform: translateY(var(--motion-manage-content-enter-offset-y));
		}
	}
</style>
