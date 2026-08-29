type AppHistoryEntry = {
	id: string
	pathname: string
}

type PreviousPathOptions = {
	skipPathname?: (pathname: string) => boolean
}

export class AppHistoryTracker {
	#entries: AppHistoryEntry[] = []
	#cursor = -1

	seed(entryId: string | null, pathname: string) {
		if (entryId === null) {
			return
		}

		this.#entries = [{ id: entryId, pathname }]
		this.#cursor = 0
	}

	sync(entryId: string | null, pathname: string) {
		if (entryId === null) {
			return
		}

		const existingIndex = this.#entries.findIndex((entry) => entry.id === entryId)
		if (existingIndex >= 0) {
			this.#cursor = existingIndex
			this.#entries[existingIndex] = {
				id: entryId,
				pathname
			}
			return
		}

		const nextEntries = this.#entries.slice(0, this.#cursor + 1)
		nextEntries.push({ id: entryId, pathname })
		this.#entries = nextEntries
		this.#cursor = nextEntries.length - 1
	}

	getPreviousPathDelta(currentPathname: string, options: PreviousPathOptions = {}) {
		if (this.#cursor <= 0) {
			return null
		}

		for (let index = this.#cursor - 1; index >= 0; index -= 1) {
			const entry = this.#entries[index]
			if (entry.pathname === currentPathname || options.skipPathname?.(entry.pathname)) {
				continue
			}

			return index - this.#cursor
		}

		return null
	}
}
