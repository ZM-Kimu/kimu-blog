<script lang="ts">
	import { page } from '$app/state'
	import ScrollChrome from '$lib/components/ui/ScrollChrome.svelte'
	import { translate } from '$lib/i18n'
	import type { BlogPost } from '$lib/types/content'
	import { untrack } from 'svelte'
	import PostCard from './components/PostCard.svelte'
	import TagChip from './components/TagChip.svelte'

	type TagSummary = {
		slug: string
		name: string
	}

	type TagPostListPanel = {
		key: string
		tagSlug: string
		posts: BlogPost[]
		phase: 'current' | 'outgoing'
		entryMode: 'initial' | 'switch'
	}

	let {
		data
	}: {
		data: {
			tag: { slug: string; count: number }
			posts: BlogPost[]
			allTags: TagSummary[]
		}
	} = $props()
	const messages = $derived(page.data.i18n?.messages)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	let panelSequence = 0
	let renderedTagSlug = $state<string | null>(null)
	let postListPanels = $state<TagPostListPanel[]>([])
	const renderedPostListPanels = $derived.by(() =>
		postListPanels.length
			? postListPanels
			: [
					{
						key: `${data.tag.slug}:0`,
						tagSlug: data.tag.slug,
						posts: data.posts,
						phase: 'current' as const,
						entryMode: 'initial' as const
					}
				]
	)

	$effect(() => {
		const nextTagSlug = data.tag.slug

		if (renderedTagSlug === null) {
			renderedTagSlug = nextTagSlug
			postListPanels = [
				{
					key: `${nextTagSlug}:${panelSequence}`,
					tagSlug: nextTagSlug,
					posts: data.posts,
					phase: 'current',
					entryMode: 'initial'
				}
			]
			return
		}

		if (nextTagSlug === renderedTagSlug) {
			postListPanels = untrack(() =>
				postListPanels.map((panel) =>
					panel.phase === 'current' ? { ...panel, posts: data.posts } : panel
				)
			)
			return
		}

		const outgoingPanels = untrack(() =>
			postListPanels.map((panel) =>
				panel.phase === 'current' ? { ...panel, phase: 'outgoing' as const } : panel
			)
		)

		postListPanels = [
			...outgoingPanels,
			{
				key: `${nextTagSlug}:${++panelSequence}`,
				tagSlug: nextTagSlug,
				posts: data.posts,
				phase: 'current',
				entryMode: 'switch'
			}
		]
		renderedTagSlug = nextTagSlug
	})

	function removePostListPanel(key: string) {
		postListPanels = postListPanels.filter((panel) => panel.key !== key)
	}

	function handlePostListAnimationEnd(event: AnimationEvent, panel: TagPostListPanel) {
		if (panel.phase !== 'outgoing') {
			return
		}

		const target = event.target
		if (!(target instanceof HTMLElement) || !target.classList.contains('tag-posts-scroll')) {
			return
		}

		removePostListPanel(panel.key)
	}
</script>

<section class="tag-screen">
	<section class="panel content-intro tag-content-intro">
		<p>{t('blog.tag.introDescription', { count: data.tag.count })}</p>

		<ScrollChrome axis="x" class="tag-filter-scroll" viewportClass="tag-filter-viewport">
			<div class="tag-filter-list" aria-label={t('blog.post.tagsTitle')}>
				{#each data.allTags as tag (tag.slug)}
					<TagChip
						href={`/tags/${tag.slug}`}
						label={tag.name}
						active={tag.slug === data.tag.slug}
					/>
				{/each}
			</div>
		</ScrollChrome>
	</section>

	<div class="tag-posts-stack">
		{#each renderedPostListPanels as panel (panel.key)}
			<div
				class:tag-posts-panel-current={panel.phase === 'current'}
				class:tag-posts-panel-outgoing={panel.phase === 'outgoing'}
				class:tag-posts-panel-switch={panel.entryMode === 'switch'}
				class="tag-posts-panel"
				aria-hidden={panel.phase === 'outgoing'}
				inert={panel.phase === 'outgoing'}
				onanimationend={(event) => handlePostListAnimationEnd(event, panel)}
			>
				<ScrollChrome class="tag-posts-scroll" viewportClass="tag-posts-viewport">
					<div class="post-grid tag-post-grid">
						{#each panel.posts as post (post.slug)}
							<PostCard {post} compact showStatus={false} showCategoryMeta={false} />
						{/each}
					</div>
				</ScrollChrome>
			</div>
		{/each}
	</div>
</section>
