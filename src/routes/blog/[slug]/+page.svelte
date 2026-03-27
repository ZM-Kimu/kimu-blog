<script lang="ts">
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

<BlogPostPage {data} />
