<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import BlogArchivePage from '$lib/features/blog/BlogArchivePage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	let { data } = $props()
</script>

<SeoHead
	title="完整归档"
	description="按分类与年份浏览 Kimu Blog 的全部文章记录。"
	pathname="/blog/archive"
/>

<SubpageScreen>
	<BlogArchivePage {data} />
</SubpageScreen>
