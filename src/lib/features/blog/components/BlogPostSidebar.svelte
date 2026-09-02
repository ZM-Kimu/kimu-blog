<script lang="ts">
	import { browser } from '$app/environment'
	import { resolve } from '$app/paths'
	import type { AppLocale } from '$lib/i18n/config'
	import { msToSeconds } from '$lib/motion/tokens'
	import type { BlogPost, BlogSeriesNavigation } from '$lib/types/content'
	import { formatDate } from '$lib/utils/date'
	import { onDestroy, tick, untrack } from 'svelte'

	import { waitForMotion } from '../post-motion'
	import TagChip from './TagChip.svelte'

	type AsideMotionLibraries = {
		gsap: typeof import('gsap').gsap
		Flip: {
			getState: (...args: unknown[]) => unknown
			from: (...args: unknown[]) => { kill?: () => void }
		}
	}

	let {
		post,
		seriesNavigation,
		transitionKey,
		locale,
		metadataTitle,
		categoryLabel,
		descriptionLabel,
		publishedAtLabel,
		updatedAtLabel,
		seriesLabel,
		newerLabel,
		olderLabel,
		uncategorizedLabel,
		textOutDurationMs,
		textInDurationMs,
		layoutDurationMs,
		tagCollapsedScaleX,
		reducedMotion,
		motionEnabled,
		onSelectPost
	}: {
		post: BlogPost
		seriesNavigation: BlogSeriesNavigation | null
		transitionKey: string
		locale?: AppLocale
		metadataTitle: string
		categoryLabel: string
		descriptionLabel: string
		publishedAtLabel: string
		updatedAtLabel: string
		seriesLabel: string
		newerLabel: string
		olderLabel: string
		uncategorizedLabel: string
		textOutDurationMs: number
		textInDurationMs: number
		layoutDurationMs: number
		tagCollapsedScaleX: number
		reducedMotion: boolean
		motionEnabled: boolean
		onSelectPost: (post: BlogPost, event: MouseEvent) => void
	} = $props()

	let root: HTMLElement | null = $state(null)
	let valuesPhase: 'idle' | 'out' | 'in' = $state('idle')
	let renderedTransitionKey = $state(untrack(() => transitionKey))
	let pendingFlipState: unknown = null
	let motionLibraries: AsideMotionLibraries | null = null
	let activeFlip: { kill?: () => void } | null = null
	let activeTagTweens: Array<{ kill?: () => void }> = []
	let phaseTimer: ReturnType<typeof setTimeout> | null = null
	let motionRequest = 0

	function clearPhaseTimer() {
		if (phaseTimer === null) {
			return
		}

		clearTimeout(phaseTimer)
		phaseTimer = null
	}

	function clearTagTweens() {
		activeTagTweens.forEach((tween) => tween.kill?.())
		activeTagTweens = []
		if (root && motionLibraries) {
			motionLibraries.gsap.set(root.querySelectorAll('[data-post-aside-tag]'), {
				clearProps: 'opacity,transform'
			})
		}
	}

	function getFlipTargets() {
		if (!root) {
			return []
		}

		return Array.from(root.querySelectorAll<HTMLElement>('[data-post-aside-flip]'))
	}

	async function loadMotionLibraries() {
		if (!browser || reducedMotion || !motionEnabled || motionLibraries) {
			return
		}

		const [gsapModule, flipModule] = await Promise.all([
			import('gsap'),
			// @ts-expect-error GSAP publishes a Windows-hostile Flip.d.ts casing pair.
			import('gsap/Flip.js')
		])
		const { gsap } = gsapModule
		const { Flip } = flipModule as { Flip: AsideMotionLibraries['Flip'] }
		gsap.registerPlugin(Flip)
		motionLibraries = { gsap, Flip }
	}

	export async function beginSwapOut() {
		if (!motionEnabled) {
			return true
		}

		const request = ++motionRequest
		clearPhaseTimer()
		valuesPhase = 'out'
		await waitForMotion(textOutDurationMs)
		return request === motionRequest
	}

	export function cancelSwap() {
		motionRequest += 1
		clearPhaseTimer()
		activeFlip?.kill?.()
		activeFlip = null
		clearTagTweens()
		pendingFlipState = null
		valuesPhase = 'idle'
	}

	$effect(() => {
		void loadMotionLibraries()
	})

	$effect.pre(() => {
		const nextTransitionKey = transitionKey
		if (nextTransitionKey === renderedTransitionKey || !motionLibraries) {
			return
		}

		const targets = getFlipTargets()
		pendingFlipState = targets.length ? motionLibraries.Flip.getState(targets) : null
	})

	$effect(() => {
		const nextTransitionKey = transitionKey
		if (nextTransitionKey === renderedTransitionKey) {
			return
		}

		renderedTransitionKey = nextTransitionKey
		if (!motionEnabled) {
			cancelSwap()
			return
		}

		motionRequest += 1
		clearPhaseTimer()

		void tick().then(() => {
			valuesPhase = 'in'
			activeFlip?.kill?.()
			activeFlip = null
			clearTagTweens()

			if (pendingFlipState && motionLibraries && !reducedMotion) {
				const { gsap, Flip } = motionLibraries
				activeFlip = Flip.from(pendingFlipState, {
					targets: getFlipTargets(),
					duration: msToSeconds(layoutDurationMs),
					ease: 'power3.inOut',
					simple: true,
					nested: true,
					absoluteOnLeave: true,
					onEnter: (elements: Element[]) => {
						const tags = elements.filter((element) => element.matches('[data-post-aside-tag]'))
						if (!tags.length) {
							return
						}

						activeTagTweens.push(
							gsap.fromTo(
								tags,
								{ opacity: 0, scaleX: tagCollapsedScaleX, transformOrigin: 'left center' },
								{
									opacity: 1,
									scaleX: 1,
									duration: msToSeconds(layoutDurationMs),
									ease: 'power3.inOut'
								}
							)
						)
					},
					onLeave: (elements: Element[]) => {
						const tags = elements.filter((element) => element.matches('[data-post-aside-tag]'))
						if (!tags.length) {
							return
						}

						activeTagTweens.push(
							gsap.to(tags, {
								opacity: 0,
								scaleX: tagCollapsedScaleX,
								transformOrigin: 'left center',
								duration: msToSeconds(layoutDurationMs),
								ease: 'power3.inOut'
							})
						)
					}
				})
			}
			pendingFlipState = null

			phaseTimer = setTimeout(() => {
				phaseTimer = null
				valuesPhase = 'idle'
			}, textInDurationMs)
		})
	})

	onDestroy(() => {
		clearPhaseTimer()
		activeFlip?.kill?.()
		clearTagTweens()
	})
</script>

<aside
	bind:this={root}
	class:post-aside-values-out={valuesPhase === 'out'}
	class:post-aside-values-in={valuesPhase === 'in'}
	class="post-aside"
>
	<section
		class="post-aside-section post-aside-info"
		data-flip-id="post-aside-info"
		data-post-aside-flip
	>
		<div class="post-aside-heading">
			<h2>{metadataTitle}</h2>
		</div>

		<div class="post-aside-info-content" data-flip-id="post-aside-content" data-post-aside-flip>
			<dl class="post-aside-facts" data-flip-id="post-aside-facts" data-post-aside-flip>
				<div class="post-aside-fact" data-flip-id="post-aside-category" data-post-aside-flip>
					<dt>{categoryLabel}</dt>
					<dd><span class="post-aside-value">{post.category ?? uncategorizedLabel}</span></dd>
				</div>
				<div
					class="post-aside-fact post-aside-fact-description"
					data-flip-id="post-aside-description"
					data-post-aside-flip
				>
					<dt>{descriptionLabel}</dt>
					<dd><span class="post-aside-value">{post.description}</span></dd>
				</div>
				<div class="post-aside-fact" data-flip-id="post-aside-published" data-post-aside-flip>
					<dt>{publishedAtLabel}</dt>
					<dd><span class="post-aside-value">{formatDate(post.date, locale)}</span></dd>
				</div>
				<div class="post-aside-fact" data-flip-id="post-aside-updated" data-post-aside-flip>
					<dt>{updatedAtLabel}</dt>
					<dd><span class="post-aside-value">{formatDate(post.updated, locale)}</span></dd>
				</div>
				{#if seriesNavigation}
					<div class="post-aside-fact" data-flip-id="post-aside-series" data-post-aside-flip>
						<dt>{seriesLabel}</dt>
						<dd><span class="post-aside-value">{seriesNavigation.series.name}</span></dd>
					</div>
				{/if}
			</dl>

			{#if seriesNavigation && (seriesNavigation.newer || seriesNavigation.older)}
				<nav class="post-aside-series-nav" aria-label={seriesNavigation.series.name}>
					{#if seriesNavigation.newer}
						<a
							href={resolve(seriesNavigation.newer.permalink)}
							onclick={(event) => onSelectPost(seriesNavigation.newer!, event)}
						>
							<span>{newerLabel}</span><strong>{seriesNavigation.newer.title}</strong>
						</a>
					{/if}
					{#if seriesNavigation.older}
						<a
							href={resolve(seriesNavigation.older.permalink)}
							onclick={(event) => onSelectPost(seriesNavigation.older!, event)}
						>
							<span>{olderLabel}</span><strong>{seriesNavigation.older.title}</strong>
						</a>
					{/if}
				</nav>
			{/if}

			<div class="post-aside-tag-block" data-flip-id="post-aside-tag-block" data-post-aside-flip>
				<div class="post-aside-tags" data-flip-id="post-aside-tags" data-post-aside-flip>
					{#each post.tags as tag, index (post.tagSlugs[index])}
						<div
							class="post-aside-tag-shell"
							data-flip-id={`post-aside-tag-${post.tagSlugs[index]}`}
							data-post-aside-tag
							data-post-aside-flip
						>
							<TagChip href={`/tags/${post.tagSlugs[index]}`} label={tag} />
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
</aside>
