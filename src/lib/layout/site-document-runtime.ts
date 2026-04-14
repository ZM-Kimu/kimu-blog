export function preventDocumentDragStart(event: DragEvent) {
	const target = event.target
	if (!(target instanceof Element)) {
		return
	}

	if (target.closest('[data-allow-drag]')) {
		return
	}

	event.preventDefault()
}
