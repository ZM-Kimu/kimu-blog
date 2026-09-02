type CancelableMotion = {
	finished: Promise<void>
	cancel: (restore?: boolean) => void
}

type TextRowPhase = 'in' | 'out'

const TEXT_ROW_SELECTOR = [
	'.post-reader-head h1',
	'.post-reader-head p',
	'.post-reader-prose h1',
	'.post-reader-prose h2',
	'.post-reader-prose h3',
	'.post-reader-prose h4',
	'.post-reader-prose h5',
	'.post-reader-prose h6',
	'.post-reader-prose p',
	'.post-reader-prose li',
	'.post-reader-prose blockquote',
	'.post-reader-prose tr',
	'.post-reader-prose figcaption'
].join(',')
const TEXT_ROW_EXCLUDED_SELECTOR = [
	'pre',
	'code',
	'kbd',
	'samp',
	'img',
	'picture',
	'video',
	'audio',
	'canvas',
	'svg',
	'iframe',
	'script',
	'style',
	'[aria-hidden="true"]',
	'[data-no-text-scan]'
].join(',')

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

function createResolvedPromise() {
	return Promise.resolve()
}

export function waitForMotion(durationMs: number) {
	if (durationMs <= 1) {
		return createResolvedPromise()
	}

	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, durationMs)
	})
}

export function animateScrollTop(
	node: HTMLElement | null,
	targetScrollTop: number,
	durationMs: number,
	easePower = 3
): CancelableMotion {
	if (!node) {
		return { finished: createResolvedPromise(), cancel: () => undefined }
	}

	const maxScrollTop = Math.max(node.scrollHeight - node.clientHeight, 0)
	const target = clamp(targetScrollTop, 0, maxScrollTop)
	const start = node.scrollTop
	const distance = target - start

	if (durationMs <= 1 || Math.abs(distance) < 1) {
		node.scrollTop = target
		return { finished: createResolvedPromise(), cancel: () => undefined }
	}

	let frameId = 0
	let settled = false
	let resolveFinished: () => void = () => undefined
	const startedAt = performance.now()
	const finished = new Promise<void>((resolve) => {
		resolveFinished = () => resolve()
	})

	const settle = () => {
		if (settled) {
			return
		}

		settled = true
		resolveFinished()
	}

	const update = (now: number) => {
		const progress = clamp((now - startedAt) / durationMs, 0, 1)
		const easedProgress = 1 - Math.pow(1 - progress, easePower)
		node.scrollTop = start + distance * easedProgress

		if (progress >= 1) {
			node.scrollTop = target
			settle()
			return
		}

		frameId = requestAnimationFrame(update)
	}

	frameId = requestAnimationFrame(update)

	return {
		finished,
		cancel: () => {
			cancelAnimationFrame(frameId)
			settle()
		}
	}
}

function collectTextRows(host: HTMLElement) {
	const rows = new Set<HTMLElement>()
	const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT)
	let current = walker.nextNode()

	while (current) {
		const textNode = current as Text
		const parent = textNode.parentElement

		if (textNode.nodeValue?.trim() && parent && !parent.closest(TEXT_ROW_EXCLUDED_SELECTOR)) {
			const row = parent.closest<HTMLElement>(TEXT_ROW_SELECTOR)
			if (row && host.contains(row)) {
				rows.add(row)
			}
		}

		current = walker.nextNode()
	}

	return Array.from(rows).sort(
		(first, second) => first.getBoundingClientRect().top - second.getBoundingClientRect().top
	)
}

export function animatePostTextRows(
	host: HTMLElement | null,
	phase: TextRowPhase,
	durationMs: number,
	staggerRatio: number,
	easing: string
): CancelableMotion {
	if (!host || durationMs <= 1) {
		return { finished: createResolvedPromise(), cancel: () => undefined }
	}

	const rows = collectTextRows(host)
	if (!rows.length) {
		return { finished: createResolvedPromise(), cancel: () => undefined }
	}

	const rowTops = rows.map((row) => row.getBoundingClientRect().top)
	const firstTop = Math.min(...rowTops)
	const lastTop = Math.max(...rowTops)
	const verticalRange = Math.max(lastTop - firstTop, 1)
	const staggerWindowMs = durationMs * clamp(staggerRatio, 0, 0.9)
	const rowDurationMs = Math.max(durationMs - staggerWindowMs, 1)
	const animations = rows.map((row, index) => {
		const verticalProgress = clamp((rowTops[index] - firstTop) / verticalRange, 0, 1)
		return row.animate(
			phase === 'in' ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
			{
				duration: rowDurationMs,
				delay: verticalProgress * staggerWindowMs,
				easing,
				fill: 'both'
			}
		)
	})

	let settled = false
	let resolveFinished: () => void = () => undefined
	const finished = new Promise<void>((resolve) => {
		resolveFinished = resolve
	})
	const settle = () => {
		if (settled) {
			return
		}

		settled = true
		resolveFinished()
	}
	const restore = () => animations.forEach((animation) => animation.cancel())

	void Promise.all(
		animations.map((animation) =>
			animation.finished.then(
				() => undefined,
				() => undefined
			)
		)
	).then(() => {
		if (phase === 'in') {
			restore()
		}
		settle()
	})

	return {
		finished,
		cancel: (shouldRestore = true) => {
			if (shouldRestore) {
				restore()
			}
			settle()
		}
	}
}
