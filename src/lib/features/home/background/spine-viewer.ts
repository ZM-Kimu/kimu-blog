import { Application, Assets, Container } from 'pixi.js'
import { Spine } from '@esotericsoftware/spine-pixi-v7'
import '@esotericsoftware/spine-pixi-v7/dist/assets/atlasLoader.js'
import '@esotericsoftware/spine-pixi-v7/dist/assets/skeletonLoader.js'

type SpineAtlasConfig = {
	src: string
	data?: {
		images?: Record<string, string>
	}
}

export type SpineEntryConfig = {
	skel: string
	atlas: SpineAtlasConfig
	name?: string
	scale?: number
}

export type SpineMountOptions = {
	backgroundAlpha?: number
	fps?: number
	defaultMix?: number
	startAnimation?: string
	idleAnimation?: string
	idleTracks?: ReadonlyArray<{
		track: number
		animation: string
		alpha?: number
	}>
	scaleFactor?: number
	offsetX?: number
	offsetY?: number
	centerPivot?: boolean
	referenceWidth?: number
	referenceHeight?: number
}

const MIN_DIMENSION = 1
const FALLBACK_BG_ALPHA = 0
const MAX_RENDER_RESOLUTION = 1.25
const preparedAssets = new Map<string, Promise<void>>()

function getResolution() {
	if (typeof window === 'undefined' || !window.devicePixelRatio) {
		return 1
	}

	return Math.max(1, Math.min(window.devicePixelRatio, MAX_RENDER_RESOLUTION))
}

function ensureCanvasSize(
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
	resolution: number
) {
	const targetWidth = Math.max(Math.round(width * resolution), MIN_DIMENSION)
	const targetHeight = Math.max(Math.round(height * resolution), MIN_DIMENSION)
	canvas.width = targetWidth
	canvas.height = targetHeight
	canvas.style.width = `${Math.max(width, MIN_DIMENSION)}px`
	canvas.style.height = `${Math.max(height, MIN_DIMENSION)}px`
	return { targetWidth, targetHeight }
}

function aliasFor(src: string, type: string) {
	return `spine:${type}:${encodeURIComponent(src)}`
}

function rememberPreparedAsset(alias: string, prepare: () => Promise<void>) {
	const existing = preparedAssets.get(alias)
	if (existing) {
		return existing
	}

	const task = prepare().catch((error) => {
		preparedAssets.delete(alias)
		throw error
	})

	preparedAssets.set(alias, task)
	return task
}

async function fetchBinaryAsset(src: string) {
	const response = await fetch(src)
	if (!response.ok) {
		throw new Error(`Failed to fetch skeleton: ${response.status}`)
	}

	return new Uint8Array(await response.arrayBuffer())
}

async function fetchTextAsset(src: string, type: string) {
	const response = await fetch(src)
	if (!response.ok) {
		throw new Error(`Failed to fetch ${type}: ${response.status}`)
	}

	return response.text()
}

function prepareSkeletonAsset(alias: string, src: string) {
	return rememberPreparedAsset(alias, async () => {
		const skeletonBytes = await fetchBinaryAsset(src)

		Assets.add({
			alias,
			src,
			data: skeletonBytes
		})

		await Assets.load(alias)
	})
}

function prepareAtlasAsset(alias: string, atlas: SpineAtlasConfig) {
	return rememberPreparedAsset(alias, async () => {
		const atlasText = await fetchTextAsset(atlas.src, 'atlas')

		Assets.add({
			alias,
			src: atlas.src,
			data: {
				data: atlasText,
				images: atlas.data?.images ?? {}
			}
		})

		await Assets.load(alias)
	})
}

type RuntimeSpine = InstanceType<typeof Spine>
type IdleTrackConfig = {
	track: number
	animation: string
	alpha?: number
}

export class SpineViewer {
	canvas: HTMLCanvasElement
	app: Application
	root: Container
	main: RuntimeSpine | undefined

	_scaleFactor = 1
	_offsetX = 0
	_offsetY = 0
	_centerPivot = false
	_referenceWidth = 1920
	_referenceHeight = 1080

	constructor(
		canvas: HTMLCanvasElement,
		{
			backgroundAlpha = FALLBACK_BG_ALPHA,
			centerPivot = false,
			offsetX = 0,
			offsetY = 0,
			referenceWidth = 1920,
			referenceHeight = 1080
		}: Pick<
			SpineMountOptions,
			| 'backgroundAlpha'
			| 'centerPivot'
			| 'offsetX'
			| 'offsetY'
			| 'referenceWidth'
			| 'referenceHeight'
		> = {}
	) {
		const resolution = getResolution()
		const width = canvas.clientWidth || window.innerWidth || MIN_DIMENSION
		const height = canvas.clientHeight || window.innerHeight || MIN_DIMENSION
		const { targetWidth, targetHeight } = ensureCanvasSize(canvas, width, height, resolution)

		this.canvas = canvas
		this.app = new Application({
			view: canvas,
			width: targetWidth,
			height: targetHeight,
			resolution,
			autoDensity: true,
			backgroundAlpha,
			antialias: true
		})
		this.root = new Container()
		this.app.stage.addChild(this.root)
		this.main = undefined
		this._centerPivot = centerPivot
		this._offsetX = offsetX
		this._offsetY = offsetY
		this._referenceWidth = Math.max(referenceWidth, MIN_DIMENSION)
		this._referenceHeight = Math.max(referenceHeight, MIN_DIMENSION)
	}

	setMaxFPS(fps: number) {
		if (!Number.isFinite(fps) || fps <= 0) {
			return
		}

		const ticker = this.app?.ticker
		if (!ticker) {
			return
		}

		if (typeof ticker.maxFPS === 'number') {
			ticker.maxFPS = fps
		}
	}

	pausePlayback() {
		const app = this.app as Application & {
			stop?: () => void
		}
		const ticker = this.app?.ticker

		if (typeof app.stop === 'function') {
			app.stop()
		}

		if (ticker?.started) {
			ticker.stop()
		}
	}

	resumePlayback() {
		const app = this.app as Application & {
			start?: () => void
		}
		const ticker = this.app?.ticker

		if (typeof app.start === 'function') {
			app.start()
		}

		if (ticker && !ticker.started) {
			ticker.start()
		}
	}

	async loadMain(
		entry: SpineEntryConfig,
		{ defaultMix = 0.2 }: Pick<SpineMountOptions, 'defaultMix'> = {}
	) {
		this.clear()
		const main = await this.loadSpine(entry)
		this.root.addChild(main)
		this.main = main
		if (main.state?.data) {
			main.state.data.defaultMix = defaultMix
		}
		this.relayout()
		return main
	}

	start({
		startAnimation = 'Start_Idle_01',
		idleAnimation = 'Idle_01',
		idleTracks
	}: Pick<SpineMountOptions, 'startAnimation' | 'idleAnimation' | 'idleTracks'> = {}) {
		const spine = this.main
		if (!spine) {
			return
		}

		if (this.hasAnimation(startAnimation)) {
			spine.state.setAnimation(0, startAnimation, false)
			const listener = {
				complete: (entry: { trackIndex: number }) => {
					if (entry.trackIndex !== 0) {
						return
					}
					this.idle(idleAnimation, idleTracks)
					spine.state.removeListener(listener)
				}
			}
			spine.state.addListener(listener)
			return
		}

		this.idle(idleAnimation, idleTracks)
	}

	idle(
		animation = 'Idle_01',
		idleTracks?: ReadonlyArray<{
			track: number
			animation: string
			alpha?: number
		}>
	) {
		const spine = this.main
		if (!spine) {
			return
		}

		if (idleTracks?.length) {
			const sanitizedTracks = idleTracks.filter(
				(trackConfig) =>
					Number.isInteger(trackConfig.track) &&
					trackConfig.track >= 0 &&
					this.hasAnimation(trackConfig.animation)
			)

			if (!sanitizedTracks.length) {
				return
			}

			this.applyIdleTracks(sanitizedTracks)
			this.relayout()
			return
		}

		if (!this.hasAnimation(animation)) {
			return
		}

		const singleTrack = [
			{
				track: 0,
				animation,
				alpha: 1
			}
		]
		this.applyIdleTracks(singleTrack)
		this.relayout()
	}

	resizeTo(width: number, height: number) {
		const resolution = getResolution()
		const { targetWidth, targetHeight } = ensureCanvasSize(this.canvas, width, height, resolution)
		if (this.app?.renderer) {
			this.app.renderer.resolution = resolution
			this.app.renderer.resize(targetWidth, targetHeight)
		}
		this.relayout()
	}

	setScaleFactor(factor: number) {
		if (!Number.isFinite(factor)) {
			return
		}
		this._scaleFactor = Math.max(0, factor)
		this.relayout()
	}

	setOffset(x = 0, y = 0) {
		this._offsetX = Number.isFinite(x) ? x : 0
		this._offsetY = Number.isFinite(y) ? y : 0
		this.relayout()
	}

	clear() {
		this.root.removeChildren()
		this.main = undefined
	}

	destroy() {
		this.clear()
		this.app?.destroy(true, {
			children: true,
			texture: false,
			baseTexture: false
		})
	}

	private hasAnimation(name: string) {
		const animations = this.main?.state?.data?.skeletonData?.animations ?? []
		return animations.some((animation: { name: string }) => animation.name === name)
	}

	private async loadSpine(entry: SpineEntryConfig) {
		const skelAlias = aliasFor(entry.skel, 'skel')
		const atlasAlias = aliasFor(entry.atlas.src, 'atlas')

		await Promise.all([
			prepareSkeletonAsset(skelAlias, entry.skel),
			prepareAtlasAsset(atlasAlias, entry.atlas)
		])

		const spine = Spine.from({
			skeleton: skelAlias,
			atlas: atlasAlias,
			...(typeof entry.scale === 'number' ? { scale: entry.scale } : {})
		})
		spine.name = entry.name ?? 'home-background'
		spine.alpha = 1
		return spine
	}

	private relayout() {
		const renderer = this.app?.renderer
		const spine = this.main
		if (!renderer || !spine) {
			return
		}

		spine.scale.set(1)
		spine.pivot.set(0, 0)
		spine.position.set(0, 0)

		const { width, height } = this.getReferenceSkeletonSize()
		const referenceWidth = Math.max(this._referenceWidth, MIN_DIMENSION)
		const referenceHeight = Math.max(this._referenceHeight, MIN_DIMENSION)
		const baseScale = Math.max(referenceWidth / width, referenceHeight / height)
		const viewportScale = Math.max(
			renderer.width / referenceWidth,
			renderer.height / referenceHeight
		)
		const resolvedScale = baseScale * this._scaleFactor * viewportScale
		const resolvedOffsetX = this._offsetX * (renderer.width / referenceWidth)
		const resolvedOffsetY = this._offsetY * (renderer.height / referenceHeight)

		spine.scale.set(resolvedScale)
		spine.pivot.set(0, 0)
		spine.position.set(0, 0)

		const scaledBounds = spine.getBounds(false)
		if (this._centerPivot) {
			const centerX = scaledBounds.x + scaledBounds.width / 2
			const centerY = scaledBounds.y + scaledBounds.height / 2
			spine.position.set(
				renderer.width / 2 - centerX + resolvedOffsetX,
				renderer.height / 2 - centerY + resolvedOffsetY
			)
			return
		}

		const centerX = scaledBounds.x + scaledBounds.width / 2
		const bottom = scaledBounds.y + scaledBounds.height
		spine.position.set(
			renderer.width / 2 - centerX + resolvedOffsetX,
			renderer.height - bottom + resolvedOffsetY
		)
	}

	private applyIdleTracks(idleTracks: readonly IdleTrackConfig[]) {
		const spine = this.main
		if (!spine) {
			return
		}

		spine.state.clearTracks()
		for (const trackConfig of idleTracks) {
			const entry = spine.state.setAnimation(trackConfig.track, trackConfig.animation, true)
			entry.alpha = typeof trackConfig.alpha === 'number' ? trackConfig.alpha : 1
		}
		this.syncSkeletonFromState()
	}

	private syncSkeletonFromState() {
		const spine = this.main
		if (!spine) {
			return
		}

		spine.skeleton.setToSetupPose()
		spine.state.apply(spine.skeleton)
		spine.skeleton.updateWorldTransform(2)
	}

	private getReferenceSkeletonSize() {
		return {
			width: Math.max(this.main?.state?.data?.skeletonData?.width || MIN_DIMENSION, MIN_DIMENSION),
			height: Math.max(this.main?.state?.data?.skeletonData?.height || MIN_DIMENSION, MIN_DIMENSION)
		}
	}
}

export async function mountBundleOnCanvas(
	canvas: HTMLCanvasElement,
	entries: readonly SpineEntryConfig[],
	options: SpineMountOptions = {}
) {
	if (!entries.length) {
		throw new Error('At least one spine entry is required')
	}

	const viewer = new SpineViewer(canvas, {
		backgroundAlpha: options.backgroundAlpha,
		centerPivot: options.centerPivot,
		offsetX: options.offsetX,
		offsetY: options.offsetY,
		referenceWidth: options.referenceWidth,
		referenceHeight: options.referenceHeight
	})

	if (typeof options.fps === 'number') {
		viewer.setMaxFPS(options.fps)
	}

	await viewer.loadMain(entries[0], {
		defaultMix: options.defaultMix
	})

	if (typeof options.scaleFactor === 'number') {
		viewer.setScaleFactor(options.scaleFactor)
	}

	viewer.start({
		startAnimation: options.startAnimation,
		idleAnimation: options.idleAnimation,
		idleTracks: options.idleTracks
	})

	return viewer
}
