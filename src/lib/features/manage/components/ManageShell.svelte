<script lang="ts">
	import type { ManageSessionResponse } from '$lib/features/manage/types'
	import type { InternalHref } from '$lib/navigation/types'
	import type { Snippet } from 'svelte'

	let {
		children
	}: {
		children: Snippet
		session: ManageSessionResponse
		postsHref?: InternalHref | `#${string}`
		backHref?: InternalHref | `#${string}`
	} = $props()
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="manage-shell">
	{@render children()}
</div>

<style>
	.manage-shell {
		display: grid;
		gap: 1rem;
		width: 100%;
	}
</style>
