export function bindMediaQuery(query: string, onChange: (matches: boolean) => void) {
	const mediaQuery = window.matchMedia(query);
	const update = () => onChange(mediaQuery.matches);

	update();
	mediaQuery.addEventListener('change', update);

	return () => mediaQuery.removeEventListener('change', update);
}
