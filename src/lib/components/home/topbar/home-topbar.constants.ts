export const richDuration = 0.58;
export const stripRevealDuration = 0.24;
export const compactDuration = 0.18;
export const reducedDuration = 0.12;
export const stripDropOffset = -20;
export const stripRetreatOffset = -16;
export const titleRevealAt = 0.34;
export const profileRevealAt = 0.36;
export const glyphSwitchAt = richDuration * 0.55;
export const textExitDuration = richDuration * 0.25;
export const fallbackProfilePath =
	'M0 0H300Q312 0 312 12V62Q312 70 306 76L286 94Q280 100 272 100H0Z';
export const backShellPath =
	'M160 0C248.366 0 320 22.386 320 50C320 77.614 248.366 100 160 100C71.634 100 0 77.614 0 50C0 22.386 71.634 0 160 0Z';
export const profileGradient = {
	startColor: '#2d61b3',
	startOpacity: 1,
	endColor: '#2d61b3',
	endOpacity: 1
} as const;
export const backGradient = {
	startColor: '#466399',
	startOpacity: 1,
	endColor: '#466399',
	endOpacity: 1
} as const;
export const profileGradientVector = { x1: '0%', y1: '0%', x2: '100%', y2: '100%' } as const;
export const backGradientVector = { x1: '50%', y1: '0%', x2: '50%', y2: '100%' } as const;
