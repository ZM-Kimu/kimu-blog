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
