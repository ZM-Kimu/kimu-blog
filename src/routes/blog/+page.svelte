<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import BlogMissionPage from '$lib/features/blog/BlogMissionPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	let { data } = $props()
</script>

<SeoHead
	title="分类界面"
	description="以 mission board 的方式浏览 Kimu Blog 的内容分类与最近记录。"
	pathname="/blog"
/>

<SubpageScreen>
	<BlogMissionPage {data} />
</SubpageScreen>
