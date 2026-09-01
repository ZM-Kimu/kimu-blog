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
	{@render children()}
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
</style>
