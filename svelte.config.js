import adapter from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import remarkGfm from 'remark-gfm';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			routes: {
				include: ['/manage', '/manage/*', '/api', '/api/*'],
				exclude: ['<all>']
			}
		})
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) =>
			filename.includes('node_modules') ? undefined : { runes: true }
	},
	preprocess: [
		mdsvex({
			extensions: ['.md', '.svx'],
			remarkPlugins: [remarkGfm]
		})
	],
	extensions: ['.svelte', '.md', '.svx']
};

export default config;
