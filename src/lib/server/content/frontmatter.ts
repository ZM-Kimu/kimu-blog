import { parse } from 'yaml';

const YAML_FRONTMATTER_PATTERN = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function parseContentFrontmatter<T extends Record<string, unknown>>(
	source: string,
	path: string
) {
	const match = YAML_FRONTMATTER_PATTERN.exec(source);

	if (!match) {
		throw new Error(`缺少 YAML frontmatter: ${path}`);
	}

	let frontmatter: unknown;

	try {
		frontmatter = parse(match[1]);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`frontmatter 解析失败 (${path}): ${message}`);
	}

	if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
		throw new Error(`frontmatter 必须是对象: ${path}`);
	}

	return {
		frontmatter: frontmatter as T,
		body: source.slice(match[0].length)
	};
}
