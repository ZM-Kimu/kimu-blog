<!-- eslint-disable svelte/valid-prop-names-in-kit-pages -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';

	let { error, status } = $props();
</script>

<SeoHead title={`错误 ${status}`} description="页面发生错误。" />

<section class="panel mission-intro">
	<p class="eyebrow">System Error</p>
	<h1>{status}</h1>
	<p>{error?.message ?? '发生了未知错误。'}</p>
	<p><a class="button-primary" href={resolve('/')}>返回主界面</a></p>
</section>
