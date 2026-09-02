import type { SpineEntryConfig, SpineMountOptions } from './spine-viewer'

export type HomeSpineVariant = 'daytime' | 'nighttime'
type HomeSpineIdleTrack = NonNullable<SpineMountOptions['idleTracks']>[number]
type HomeSpineIdleCombo = readonly [string] | readonly [string, string]

const daytimeEntry = {
	name: 'Arona Daytime',
	skel: '/spine/home/daytime/arona_workpage_daytime_2.skel',
	atlas: {
		src: '/spine/home/daytime/arona_workpage_daytime_2.atlas',
		data: {
			images: {
				'arona_workpage_daytime_2.png': '/spine/home/daytime/arona_workpage_daytime_2.png',
				'arona_workpage_daytime_2_2.png': '/spine/home/daytime/arona_workpage_daytime_2_2.png'
			}
		}
	}
} satisfies SpineEntryConfig

const nighttimeEntry = {
	name: 'Arona Nighttime',
	skel: '/spine/home/nighttime/arona_workpage_nighttime_2.skel',
	atlas: {
		src: '/spine/home/nighttime/arona_workpage_nighttime_2.atlas',
		data: {
			images: {
				'arona_workpage_nighttime_2.png': '/spine/home/nighttime/arona_workpage_nighttime_2.png',
				'arona_workpage_nighttime_2_2.png': '/spine/home/nighttime/arona_workpage_nighttime_2_2.png'
			}
		}
	}
} satisfies SpineEntryConfig

const sharedBaseOptions = {
	backgroundAlpha: 0,
	fps: 60,
	defaultMix: 0.2,
	referenceWidth: 1920,
	referenceHeight: 1080,
	scaleFactor: 0.85,
	offsetX: -250,
	offsetY: -150,
	centerPivot: true
} satisfies SpineMountOptions

const homeSpineIdleComboPools = {
	daytime: [
		['Idle_00', 'Idle_11'],
		['Idle_00', 'Idle_12'],
		['Idle_01'],
		['Idle_02', 'Idle_11'],
		['Idle_02', 'Idle_12'],
		['Idle_03', 'Idle_12']
	],
	nighttime: [
		['Idle_00'],
		['Idle_00', 'Idle_11'],
		['Idle_01'],
		['Idle_01', 'Idle_11'],
		['Idle_02'],
		['Idle_02', 'Idle_11'],
		['Idle_03'],
		['Idle_04']
	]
} as const satisfies Record<HomeSpineVariant, readonly HomeSpineIdleCombo[]>

const homeSpineBackgroundTrack = {
	track: 0,
	animation: 'Idle_background_00',
	alpha: 1
} satisfies HomeSpineIdleTrack

export const homeSpineConfigs: Record<
	HomeSpineVariant,
	{
		entry: SpineEntryConfig
		options: SpineMountOptions
	}
> = {
	daytime: {
		entry: daytimeEntry,
		options: sharedBaseOptions
	},
	nighttime: {
		entry: nighttimeEntry,
		options: sharedBaseOptions
	}
}

export function resolveHomeSpineIdleTracks(variant: HomeSpineVariant) {
	const comboPool = homeSpineIdleComboPools[variant]
	const combo = comboPool[Math.floor(Math.random() * comboPool.length)] ?? comboPool[0]
	const characterTracks = combo.map((animation, index) => ({
		track: index + 1,
		animation,
		alpha: 1
	}))

	return [homeSpineBackgroundTrack, ...characterTracks] satisfies SpineMountOptions['idleTracks']
}

const DAYTIME_START_HOUR = 6
const NIGHTTIME_START_HOUR = 18

export function resolveHomeSpineVariant(date = new Date()): HomeSpineVariant {
	const hour = date.getHours()
	return hour >= DAYTIME_START_HOUR && hour < NIGHTTIME_START_HOUR ? 'daytime' : 'nighttime'
}

export function getNextHomeSpineVariantChange(date = new Date()) {
	const next = new Date(date)
	const hour = date.getHours()

	if (hour < DAYTIME_START_HOUR) {
		next.setHours(DAYTIME_START_HOUR, 0, 0, 0)
		return next
	}

	if (hour < NIGHTTIME_START_HOUR) {
		next.setHours(NIGHTTIME_START_HOUR, 0, 0, 0)
		return next
	}

	next.setDate(next.getDate() + 1)
	next.setHours(DAYTIME_START_HOUR, 0, 0, 0)
	return next
}
