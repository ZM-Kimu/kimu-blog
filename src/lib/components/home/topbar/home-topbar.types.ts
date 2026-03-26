export type TopbarMode = 'subpage' | 'main';

export type TriggerOrigin = 'cta' | 'back';

export type HomeTopbarMetric = {
	key: string;
	label: string;
	value: string;
};

export type HomeTopbarAction = {
	href: string;
	label: string;
};

export type ElementBox = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export type MotionLibs = {
	gsap: typeof import('gsap').gsap;
	Flip: typeof import('gsap/all').Flip;
	interpolate: typeof import('flubber').interpolate;
};

export type MorphOverlay = {
	wrapper: HTMLDivElement;
	path: SVGPathElement;
	startStop: SVGStopElement;
	endStop: SVGStopElement;
	text: HTMLDivElement;
	glyph: HTMLSpanElement;
};

export type TitleGhost = {
	wrapper: HTMLDivElement;
};

export type StripProxy = {
	wrapper: HTMLDivElement;
	shell: HTMLDivElement;
};

export type HomeTopbarRefs = {
	topbarRoot: HTMLElement | null;
	backButton: HTMLButtonElement | null;
	profileChip: HTMLAnchorElement | null;
	titleWrap: HTMLDivElement | null;
	stripShell: HTMLDivElement | null;
	motionLayer: HTMLDivElement | null;
};

export type HomeTopbarStateDetail = {
	mode: TopbarMode;
	locked: boolean;
};
