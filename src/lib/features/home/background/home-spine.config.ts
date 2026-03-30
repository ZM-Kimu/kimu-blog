import type { SpineEntryConfig, SpineMountOptions } from './spine-viewer'

export type HomeSpineVariant = 'daytime' | 'nighttime'

const daytimeEntry = {
	name: 'Arona Daytime',
	skel: '/spine/home/daytime/arona_workpage_daytime.skel',
	atlas: {
		src: '/spine/home/daytime/arona_workpage_daytime.atlas',
		data: {
			images: {
				'arona_workpage_daytime.png': '/spine/home/daytime/arona_workpage_daytime.png',
				'arona_workpage_daytime2.png': '/spine/home/daytime/arona_workpage_daytime2.png'
			}
		}
	}
} satisfies SpineEntryConfig

const nighttimeEntry = {
	name: 'Arona Nighttime',
	skel: '/spine/home/nighttime/arona_workpage_nighttime.skel',
	atlas: {
		src: '/spine/home/nighttime/arona_workpage_nighttime.atlas',
		data: {
			images: {
				'arona_workpage_nighttime.png': '/spine/home/nighttime/arona_workpage_nighttime.png',
				'arona_workpage_nighttime2.png': '/spine/home/nighttime/arona_workpage_nighttime2.png'
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

export const homeSpineConfigs: Record<
	HomeSpineVariant,
	{
		entry: SpineEntryConfig
		options: SpineMountOptions
	}
> = {
	daytime: {
		entry: daytimeEntry,
		options: {
			...sharedBaseOptions,
			idleTracks: [
				{
					track: 0,
					animation: 'Idle_background_00',
					alpha: 1
				},
				{
					track: 1,
					animation: 'Idle_00',
					alpha: 1
				},
				{
					track: 2,
					animation: 'Idle_11',
					alpha: 1
				}
			]
		}
	},
	nighttime: {
		entry: nighttimeEntry,
		options: {
			...sharedBaseOptions,
			idleTracks: [
				{
					track: 0,
					animation: 'Idle_background_00',
					alpha: 1
				},
				{
					track: 1,
					animation: 'Idle_03',
					alpha: 1
				}
			]
		}
	}
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
