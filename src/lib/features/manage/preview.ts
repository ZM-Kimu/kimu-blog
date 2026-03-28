import { marked } from 'marked'

const CODE_FENCE_PATTERN = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/gu
const IMPORT_LINE_PATTERN = /^\s*import\s+.+$/gmu
const SCRIPT_BLOCK_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script>/giu
const STYLE_BLOCK_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style>/giu
const COMPONENT_BLOCK_PATTERN = /<([A-Z][\w.]*(?::[\w-]+)?|svelte:[\w-]+)\b[^>]*>[\s\S]*?<\/\1>/gu
const COMPONENT_SELF_CLOSING_PATTERN = /<([A-Z][\w.]*(?::[\w-]+)?|svelte:[\w-]+)\b[^>]*\/>/gu
const BLOB_SAFE_URI_PATTERN =
	/^(?:(?:https?|mailto|tel|blob):|\/(?!\/)|#|\.{1,2}\/|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/iu
const DANGEROUS_BLOCK_PATTERN =
	/<(?:script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\/(?:script|style|iframe|object|embed|link|meta)>/giu
const DANGEROUS_SELF_CLOSING_PATTERN =
	/<(?:script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/giu
const EVENT_HANDLER_ATTR_PATTERN = /\son[a-z-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/giu
const URI_ATTR_PATTERN = /\s(href|src|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)')/giu

function buildPlaceholder(kind: 'component' | 'import' | 'script' | 'style', label: string) {
	return `
<div class="manage-preview__placeholder" data-preview-kind="${kind}">
	<strong>${label}</strong>
	<p>预览面板不会执行这段 mdsvex / Svelte 逻辑。</p>
</div>
`
}

function replaceOutsideCodeFences(source: string, transform: (segment: string) => string) {
	return source
		.split(CODE_FENCE_PATTERN)
		.map((segment, index) => (index % 2 === 1 ? segment : transform(segment)))
		.join('')
}

function replaceManageUploadPlaceholders(source: string, uploads: Map<string, string>) {
	let output = source

	for (const [placeholder, url] of uploads) {
		output = output.split(placeholder).join(url)
	}

	return output
}

function normalizeMdsvexForPreview(source: string) {
	return replaceOutsideCodeFences(source, (segment) =>
		segment
			.replace(IMPORT_LINE_PATTERN, (value) => buildPlaceholder('import', value.trim()))
			.replace(SCRIPT_BLOCK_PATTERN, () => buildPlaceholder('script', '<script> block'))
			.replace(STYLE_BLOCK_PATTERN, () => buildPlaceholder('style', '<style> block'))
			.replace(COMPONENT_BLOCK_PATTERN, (_value, name: string) =>
				buildPlaceholder('component', `${name} component`)
			)
			.replace(COMPONENT_SELF_CLOSING_PATTERN, (_value, name: string) =>
				buildPlaceholder('component', `${name} component`)
			)
	)
}

function sanitizePreviewHtml(html: string) {
	return html
		.replace(DANGEROUS_BLOCK_PATTERN, '')
		.replace(DANGEROUS_SELF_CLOSING_PATTERN, '')
		.replace(EVENT_HANDLER_ATTR_PATTERN, '')
		.replace(
			URI_ATTR_PATTERN,
			(match, attribute: string, doubleQuoted?: string, singleQuoted?: string) => {
				const value = doubleQuoted ?? singleQuoted ?? ''

				if (BLOB_SAFE_URI_PATTERN.test(value)) {
					return ` ${attribute}="${value}"`
				}

				return ` ${attribute}="#"`
			}
		)
}

export function resolvePreviewAssetPath(path: string, uploads: Map<string, string>) {
	if (!path) {
		return ''
	}

	return replaceManageUploadPlaceholders(path, uploads)
}

export function renderManagePreviewHtml(source: string, uploads: Map<string, string>) {
	const normalized = normalizeMdsvexForPreview(replaceManageUploadPlaceholders(source, uploads))
	const html = marked.parse(normalized, {
		gfm: true
	}) as string

	return sanitizePreviewHtml(html)
}
