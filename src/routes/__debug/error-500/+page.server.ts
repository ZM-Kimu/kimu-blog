import { error } from '@sveltejs/kit'

export const load = () => {
	throw error(500, 'debug_500_route')
}
