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
	import { browser } from '$app/environment'
	import { afterNavigate, replaceState } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import { missionCatalog } from '$lib/features/blog/config'
	import { translate } from '$lib/i18n'
	import type { CategorySummary, BlogPost } from '$lib/types/content'
	import { onMount } from 'svelte'

	import ArchiveEntryColumn from './components/ArchiveEntryColumn.svelte'
	import ArchivePreviewRail from './components/ArchivePreviewRail.svelte'

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

	let requestedCategory = $state<string | null>(null)
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

	let selectedSlug = $state<string | null>(null)
	const selectedPost = $derived.by(
		() => filteredPosts.find((post) => post.slug === selectedSlug) ?? null
	)
	const Content = $derived.by(() => {
		if (!selectedPost) {
			return null
		}

		return modules[selectedPost.path]?.default ?? null
	})

	function buildArchiveHref(
		nextCategory: string | null = requestedCategory,
		nextPost: string | null = selectedSlug
	) {
		const params = new URLSearchParams(
			[
				nextCategory ? ['category', nextCategory] : null,
				nextPost ? ['post', nextPost] : null
			].filter((entry): entry is [string, string] => entry !== null)
		)
		const query = params.toString()
		return query ? `${resolve('/blog/archive')}?${query}` : resolve('/blog/archive')
	}

	$effect(() => {
		if (selectedSlug && !filteredPosts.some((post) => post.slug === selectedSlug)) {
			if (browser) {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				replaceState(buildArchiveHref(requestedCategory, null), page.state)
			}

			selectedSlug = null
		}
	})

	function selectPost(slug: string) {
		if (browser) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			replaceState(buildArchiveHref(requestedCategory, slug), page.state)
		}

		selectedSlug = slug
	}

	function selectCategory(slug: string | null) {
		if (!browser) {
			requestedCategory = slug
			selectedSlug = null
			return
		}

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(buildArchiveHref(slug, null), page.state)
		requestedCategory = slug
		selectedSlug = null
	}

	function syncRequestedCategory() {
		if (!browser) {
			requestedCategory = null
			selectedSlug = null
			return
		}

		const url = new URL(window.location.href)
		requestedCategory = url.searchParams.get('category')
		selectedSlug = url.searchParams.get('post')
	}

	onMount(() => {
		syncRequestedCategory()

		const handlePopState = () => {
			syncRequestedCategory()
		}

		window.addEventListener('popstate', handlePopState)

		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	})

	afterNavigate(() => {
		syncRequestedCategory()
	})
</script>

<section class="archive-screen archive-screen-rebuilt">
	<section class="archive-layout archive-layout-rebuilt">
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

		<ArchivePreviewRail post={selectedPost} {Content} />
	</section>
</section>
