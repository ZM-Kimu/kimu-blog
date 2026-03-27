import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, type Plugin } from 'vite'

const YAML_FRONTMATTER_PATTERN = /^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/

function stripMdsvexFrontmatter(): Plugin {
	return {
		name: 'strip-mdsvex-frontmatter',
		enforce: 'pre',
		transform(code, id) {
			const [filename, query = ''] = id.split('?', 2)

			if ((!filename.endsWith('.md') && !filename.endsWith('.svx')) || query.includes('raw')) {
				return null
			}

			const stripped = code.replace(YAML_FRONTMATTER_PATTERN, '')

			if (stripped === code) {
				return null
			}

			return {
				code: stripped,
				map: null
			}
		}
	}
}

export default defineConfig({
	plugins: [stripMdsvexFrontmatter(), sveltekit()]
})
