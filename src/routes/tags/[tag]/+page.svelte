<script lang="ts">
	import TagPage from '$lib/features/blog/TagPage.svelte'
	import SeoHead from '$lib/components/ui/SeoHead.svelte'

	let { data } = $props()
</script>

<SeoHead
	title={`标签：${data.tag.name}`}
	description={`浏览标签 ${data.tag.name} 下的文章。`}
	pathname={`/tags/${data.tag.slug}`}
/>

<TagPage {data} />
