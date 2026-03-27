<script lang="ts">
	import '$lib/features/home/styles/index.css';
	import HomePage from '$lib/features/home/HomePage.svelte';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	description="Kimu Blog 的主界面。以 game home screen 的方式组织个人信息、动态和内容入口。"
/>

<HomePage data={data} />
