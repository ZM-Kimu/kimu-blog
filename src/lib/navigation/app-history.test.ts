import assert from 'node:assert/strict'
import { test } from 'node:test'

import { AppHistoryTracker } from './app-history.ts'

test('getPreviousPathDelta skips matching historical paths', () => {
	const tracker = new AppHistoryTracker()

	tracker.seed('1', '/blog')
	tracker.sync('2', '/tags/engineering')
	tracker.sync('3', '/tags/design')
	tracker.sync('4', '/tags/svelte')

	assert.equal(
		tracker.getPreviousPathDelta('/tags/svelte', {
			skipPathname: (pathname) => pathname.startsWith('/tags/')
		}),
		-3
	)
})

test('replace-style post sync keeps the previous non-post entry', () => {
	const tracker = new AppHistoryTracker()

	tracker.seed('1', '/blog/archive')
	tracker.sync('2', '/blog/hello-kimu')
	tracker.sync('2', '/blog/archive-fake-engineering-01')

	assert.equal(tracker.getPreviousPathDelta('/blog/archive-fake-engineering-01'), -1)
})

test('post back policy skips contiguous post entries', () => {
	const tracker = new AppHistoryTracker()

	tracker.seed('1', '/blog')
	tracker.sync('2', '/blog/hello-kimu')
	tracker.sync('3', '/blog/archive-fake-engineering-01')

	assert.equal(
		tracker.getPreviousPathDelta('/blog/archive-fake-engineering-01', {
			skipPathname: (pathname) => pathname.startsWith('/blog/')
		}),
		-2
	)
})
