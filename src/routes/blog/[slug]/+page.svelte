<script lang="ts">
	import SubpageScreen from '$lib/components/layout/SubpageScreen.svelte'
	import BlogPostPage from '$lib/features/blog/BlogPostPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	let { data } = $props()
</script>

<SeoHead
	title={data.post.title}
	description={data.post.description}
	pathname={data.post.permalink}
	type="article"
/>

<SubpageScreen>
	<BlogPostPage {data} />
</SubpageScreen>
