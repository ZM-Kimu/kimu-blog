import {
	backGradient,
	backGradientVector,
	backShellPath,
	profileGradient,
	profileGradientVector
} from './home-topbar.constants'
import type {
	ElementBox,
	HomeTopbarRefs,
	MorphOverlay,
	StripProxy,
	ToolIconTransitionOverlay,
	TitleGhost,
	TopbarMode
} from './home-topbar.types'

export function getHostElement(host: HTMLElement | null, refs: HomeTopbarRefs) {
	return host ?? refs.motionLayer?.parentElement ?? refs.topbarRoot?.parentElement ?? null
}

export function measureToHost(
	host: HTMLElement | null,
	refs: HomeTopbarRefs,
	node: Element
): ElementBox {
	const hostElement = getHostElement(host, refs)
	if (!hostElement) {
		return { left: 0, top: 0, width: 0, height: 0 }
	}

	const hostRect = hostElement.getBoundingClientRect()
	const rect = node.getBoundingClientRect()

	return {
		left: rect.left - hostRect.left,
		top: rect.top - hostRect.top,
		width: rect.width,
		height: rect.height
	}
}

export function setBox(node: HTMLElement, box: ElementBox) {
	node.style.left = `${box.left}px`
	node.style.top = `${box.top}px`
	node.style.width = `${box.width}px`
	node.style.height = `${box.height}px`
}

export function getSharedTargets(refs: HomeTopbarRefs) {
	if (!refs.topbarRoot) {
		return []
	}

	return Array.from(refs.topbarRoot.querySelectorAll<HTMLElement>('[data-flip-id]'))
}

export function clearMotionLayer(refs: HomeTopbarRefs) {
	refs.motionLayer?.replaceChildren()
}

export function createStripGhost(
	container: HTMLElement | null,
	box: ElementBox,
	className = 'home-topbar home-topbar-subpage home-topbar-strip-proxy'
): StripProxy | null {
	if (!container) {
		return null
	}

	const wrapper = document.createElement('div')
	wrapper.className = className
	wrapper.setAttribute('aria-hidden', 'true')
	setBox(wrapper, box)

	const shell = document.createElement('div')
	shell.className = 'home-topbar-strip-shell'
	wrapper.appendChild(shell)
	container.appendChild(wrapper)

	return { wrapper, shell }
}

export function createTitleGhost(
	refs: HomeTopbarRefs,
	box: ElementBox,
	title: string
): TitleGhost | null {
	if (!refs.motionLayer) {
		return null
	}

	const wrapper = document.createElement('div')
	wrapper.className = 'home-topbar-motion-title'
	setBox(wrapper, box)

	const label = document.createElement('span')
	label.textContent = title
	wrapper.appendChild(label)
	refs.motionLayer.appendChild(wrapper)

	return { wrapper }
}

export function createMorphOverlay({
	refs,
	fromMode,
	box,
	profileShellPath,
	authorName,
	infoLabel
}: {
	refs: HomeTopbarRefs
	fromMode: TopbarMode
	box: ElementBox
	profileShellPath: string
	authorName: string
	infoLabel: string
}): MorphOverlay | null {
	if (!refs.motionLayer) {
		return null
	}

	const wrapper = document.createElement('div')
	wrapper.className = 'home-topbar-morph'
	setBox(wrapper, box)

	const svgNamespace = 'http://www.w3.org/2000/svg'
	const svg = document.createElementNS(svgNamespace, 'svg')
	svg.setAttribute('viewBox', '0 0 320 100')
	svg.setAttribute('preserveAspectRatio', 'none')

	const defs = document.createElementNS(svgNamespace, 'defs')
	const gradient = document.createElementNS(svgNamespace, 'linearGradient')
	const gradientId = `home-topbar-motion-gradient-${Math.random().toString(36).slice(2)}`
	const gradientSource = fromMode === 'main' ? profileGradient : backGradient
	const gradientVectorSource = fromMode === 'main' ? profileGradientVector : backGradientVector

	gradient.setAttribute('id', gradientId)
	gradient.setAttribute('x1', gradientVectorSource.x1)
	gradient.setAttribute('y1', gradientVectorSource.y1)
	gradient.setAttribute('x2', gradientVectorSource.x2)
	gradient.setAttribute('y2', gradientVectorSource.y2)

	const startStop = document.createElementNS(svgNamespace, 'stop')
	startStop.setAttribute('offset', '0%')
	startStop.setAttribute('stop-color', gradientSource.startColor)
	startStop.setAttribute('stop-opacity', `${gradientSource.startOpacity}`)

	const endStop = document.createElementNS(svgNamespace, 'stop')
	endStop.setAttribute('offset', '100%')
	endStop.setAttribute('stop-color', gradientSource.endColor)
	endStop.setAttribute('stop-opacity', `${gradientSource.endOpacity}`)

	gradient.appendChild(startStop)
	gradient.appendChild(endStop)
	defs.appendChild(gradient)

	const path = document.createElementNS(svgNamespace, 'path')
	path.setAttribute('d', fromMode === 'main' ? profileShellPath : backShellPath)
	path.setAttribute('fill', `url(#${gradientId})`)

	svg.appendChild(defs)
	svg.appendChild(path)

	const text = document.createElement('div')
	text.className = 'home-topbar-morph-text'

	const avatar = document.createElement('span')
	avatar.className = 'home-topbar-morph-avatar'

	const avatarImage = document.createElement('img')
	avatarImage.src = '/profile.png'
	avatarImage.alt = ''
	avatarImage.draggable = false
	avatarImage.decoding = 'async'
	avatar.appendChild(avatarImage)

	const copy = document.createElement('div')
	copy.className = 'home-topbar-morph-copy'

	const copyValue = document.createElement('span')
	copyValue.textContent = authorName

	const copyLabel = document.createElement('small')
	copyLabel.textContent = infoLabel

	copy.appendChild(copyValue)
	copy.appendChild(copyLabel)
	text.appendChild(avatar)
	text.appendChild(copy)

	const glyph = document.createElement('span')
	glyph.className = 'home-topbar-morph-glyph'
	glyph.setAttribute('aria-hidden', 'true')

	wrapper.appendChild(svg)
	wrapper.appendChild(text)
	wrapper.appendChild(glyph)
	refs.motionLayer.appendChild(wrapper)

	return { wrapper, gradient, path, startStop, endStop, text, glyph }
}

export function createToolIconTransitionOverlay(
	button: HTMLElement,
	sourceIcon: HTMLElement,
	targetIcon: HTMLElement
): ToolIconTransitionOverlay {
	const wrapper = document.createElement('span')
	wrapper.className = 'home-topbar-motion-tool-icon'
	wrapper.setAttribute('aria-hidden', 'true')

	const sourceClone = sourceIcon.cloneNode(true) as HTMLSpanElement
	sourceClone.classList.add('home-topbar-motion-tool-icon-icon')

	const targetClone = targetIcon.cloneNode(true) as HTMLSpanElement
	targetClone.classList.add('home-topbar-motion-tool-icon-icon')

	wrapper.appendChild(sourceClone)
	wrapper.appendChild(targetClone)
	button.appendChild(wrapper)

	return {
		wrapper,
		sourceIcon: sourceClone,
		targetIcon: targetClone
	}
}
