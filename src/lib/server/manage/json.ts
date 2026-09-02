const printWidth = 100
const tabWidth = 2

function serializePrimitive(value: unknown) {
	return JSON.stringify(value) ?? 'null'
}

function formatJson(value: unknown, depth: number, prefixWidth: number): string {
	if (Array.isArray(value)) {
		if (value.length === 0) return '[]'

		const compactItems = value.map((item) =>
			item === null || typeof item !== 'object' ? serializePrimitive(item) : null
		)
		if (compactItems.every((item): item is string => item !== null)) {
			const compact = `[${compactItems.join(', ')}]`
			if (prefixWidth + compact.length <= printWidth) return compact
		}

		const indent = '\t'.repeat(depth + 1)
		return `[\n${value
			.map((item) => `${indent}${formatJson(item, depth + 1, (depth + 1) * tabWidth)}`)
			.join(',\n')}\n${'\t'.repeat(depth)}]`
	}

	if (value !== null && typeof value === 'object') {
		const entries = Object.entries(value).filter(([, item]) => item !== undefined)
		if (entries.length === 0) return '{}'

		const indent = '\t'.repeat(depth + 1)
		return `{\n${entries
			.map(([key, item]) => {
				const serializedKey = JSON.stringify(key)
				const childPrefixWidth = (depth + 1) * tabWidth + serializedKey.length + 2
				return `${indent}${serializedKey}: ${formatJson(item, depth + 1, childPrefixWidth)}`
			})
			.join(',\n')}\n${'\t'.repeat(depth)}}`
	}

	return serializePrimitive(value)
}

export function serializeManagedJson(value: unknown) {
	return `${formatJson(value, 0, 0)}\n`
}
