<script module lang="ts">
	import type { Component } from 'svelte'

	type BlogContentModule = {
		default: Component<Record<string, never>>
	}

	const modules = import.meta.glob('/src/lib/content/blog/*.{md,svx}', {
		eager: true
	}) as Record<string, BlogContentModule>
</script>

<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { page } from '$app/state'
	import { createArchiveBrowserState } from '$lib/features/blog/archive-browser.svelte'
	import { missionCatalog } from '$lib/features/blog/config'
	import { getBlogCategoryMessageKey } from '$lib/content/blog-categories'
	import { translate } from '$lib/i18n'
	import type { CategorySummary, BlogPost } from '$lib/types/content'
	import { onMount } from 'svelte'

	import ArchiveEntryColumn from './components/ArchiveEntryColumn.svelte'
	import ArchiveReaderRail from './components/ArchiveReaderRail.svelte'

	type ArchiveSelectionSourceRect = {
		left: number
		top: number
		width: number
		height: number
	}

	let {
		data
	}: {
		data: {
			posts: BlogPost[]
			categories: CategorySummary[]
			totalPosts: number
		}
	} = $props()

	const messages = $derived(page.data.i18n?.messages)
	const locale = $derived(page.data.i18n?.locale)
	const t = (key: string, params?: Record<string, string | number>) =>
		translate(messages, key, params)

	const archiveBrowser = createArchiveBrowserState()
	const requestedCategory = $derived(archiveBrowser.requestedCategory)
	const selectedSlug = $derived(archiveBrowser.selectedSlug)
	function resolveMission(slug: string | null) {
		return slug ? (missionCatalog.find((entry) => entry.slug === slug) ?? null) : null
	}

	function filterPostsByCategory(slug: string | null) {
		const mission = resolveMission(slug)
		return mission ? data.posts.filter((post) => post.category === mission.category) : data.posts
	}

	const filteredPosts = $derived.by(() => filterPostsByCategory(requestedCategory))
	const archiveFilterMissions = missionCatalog.filter(
		(
			entry
		): entry is (typeof missionCatalog)[number] & {
			category: NonNullable<typeof entry.category>
		} => entry.category !== null
	)
	const categoryOptions = $derived.by(() =>
		archiveFilterMissions.map((mission) => ({
			slug: mission.slug,
			title: t(getBlogCategoryMessageKey(mission.category)),
			count: data.categories.find((entry) => entry.slug === mission.category)?.count ?? 0
		}))
	)
	const selectedPost = $derived.by(
		() => filteredPosts.find((post) => post.slug === selectedSlug) ?? null
	)
	const Content = $derived.by(() => {
		if (!selectedPost) {
			return null
		}

		return modules[selectedPost.path]?.default ?? null
	})

	let readerSelectionSourceRect = $state<ArchiveSelectionSourceRect | null>(null)

	$effect(() => {
		archiveBrowser.ensureValidSelection(filteredPosts, {
			autoSelectFirst: requestedCategory !== null
		})
	})

	function selectPost(slug: string, sourceRect: ArchiveSelectionSourceRect | null) {
		readerSelectionSourceRect = sourceRect
		archiveBrowser.selectPost(slug)
	}

	function selectCategory(slug: string | null) {
		readerSelectionSourceRect = null
		archiveBrowser.selectCategory(slug, filterPostsByCategory(slug)[0]?.slug ?? null)
	}

	function syncArchiveFromLocation() {
		readerSelectionSourceRect = null
		archiveBrowser.syncFromLocation()
	}

	onMount(() => {
		syncArchiveFromLocation()

		const handlePopState = () => {
			syncArchiveFromLocation()
		}

		window.addEventListener('popstate', handlePopState)

		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	})

	afterNavigate(() => {
		syncArchiveFromLocation()
	})
</script>

<section class="archive-screen">
	<section class="archive-layout">
		<ArchiveEntryColumn
			totalPosts={data.totalPosts}
			{categoryOptions}
			{requestedCategory}
			{filteredPosts}
			{selectedSlug}
			{locale}
			allLabel={t('common.all')}
			sectionLabel={t('blog.archive.introTitle')}
			getCategoryLabel={(category) => t(getBlogCategoryMessageKey(category))}
			emptyLabel={t('blog.archive.emptyDate')}
			onSelectCategory={selectCategory}
			onSelectPost={selectPost}
		/>

		<ArchiveReaderRail
			post={selectedPost}
			{Content}
			selectionSourceRect={readerSelectionSourceRect}
		/>
	</section>
</section>
