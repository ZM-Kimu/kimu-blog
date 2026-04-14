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
	import { translate } from '$lib/i18n'
	import type { CategorySummary, BlogPost } from '$lib/types/content'
	import { onMount } from 'svelte'

	import ArchiveEntryColumn from './components/ArchiveEntryColumn.svelte'
	import ArchiveReaderRail from './components/ArchiveReaderRail.svelte'

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
	const activeMission = $derived.by(() =>
		requestedCategory
			? (missionCatalog.find((entry) => entry.slug === requestedCategory) ?? null)
			: null
	)
	const filteredPosts = $derived.by(() =>
		activeMission
			? data.posts.filter(
					(post) =>
						(post.categorySlug && activeMission.matches.includes(post.categorySlug)) ||
						(post.category && activeMission.matches.includes(post.category))
				)
			: data.posts
	)
	const archiveFilterMissions = missionCatalog.filter((entry) => entry.href !== '/favorites')
	const categoryOptions = $derived.by(() =>
		archiveFilterMissions.map((mission) => ({
			slug: mission.slug,
			title: t(`home.missions.${mission.id}.title`),
			count: data.categories.find((entry) => mission.matches.includes(entry.slug))?.count ?? 0
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

	$effect(() => {
		archiveBrowser.ensureValidSelection(filteredPosts)
	})

	function selectPost(slug: string) {
		archiveBrowser.selectPost(slug)
	}

	function selectCategory(slug: string | null) {
		archiveBrowser.selectCategory(slug)
	}

	onMount(() => {
		archiveBrowser.syncFromLocation()

		const handlePopState = () => {
			archiveBrowser.syncFromLocation()
		}

		window.addEventListener('popstate', handlePopState)

		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	})

	afterNavigate(() => {
		archiveBrowser.syncFromLocation()
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
			uncategorizedLabel={t('common.uncategorized')}
			emptyLabel={t('blog.archive.emptyDate')}
			onSelectCategory={selectCategory}
			onSelectPost={selectPost}
		/>

		<ArchiveReaderRail post={selectedPost} {Content} />
	</section>
</section>
