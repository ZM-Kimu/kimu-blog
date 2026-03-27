import { error } from '@sveltejs/kit'

// TODO: remove after error-page QA is complete.
export const load = () => {
	throw error(500, 'Debug 500 route')
}
