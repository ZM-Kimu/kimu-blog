<script lang="ts">
	import './home.css';
	import HomeScreen from '$lib/components/home/HomeScreen.svelte';
	import SeoHead from '$lib/components/ui/SeoHead.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	description="Kimu Blog 的主界面。以 game home screen 的方式组织个人信息、动态和内容入口。"
/>

<HomeScreen data={data} />
