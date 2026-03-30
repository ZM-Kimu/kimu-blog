import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { compile } from 'mdsvex'
import remarkGfm from 'remark-gfm'
import { parse } from 'yaml'

const CONTENT_ROOT = path.resolve('src/lib/content/blog')
const VALID_EXTENSIONS = new Set(['.md', '.svx'])
const YAML_FRONTMATTER_PATTERN = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

function parseFrontmatter(source, filePath) {
	const match = YAML_FRONTMATTER_PATTERN.exec(source)

	if (!match) {
		throw new Error(`缺少 YAML frontmatter: ${filePath}`)
	}

	const frontmatter = parse(match[1])

	if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
		throw new Error(`frontmatter 必须是对象: ${filePath}`)
	}

	return frontmatter
}

async function collectContentFiles(root) {
	const entries = await readdir(root, { withFileTypes: true })
	const files = []

	for (const entry of entries) {
		const absolutePath = path.join(root, entry.name)

		if (entry.isDirectory()) {
			files.push(...(await collectContentFiles(absolutePath)))
			continue
		}

		if (VALID_EXTENSIONS.has(path.extname(entry.name))) {
			files.push(absolutePath)
		}
	}

	return files.sort((left, right) => left.localeCompare(right))
}

async function validateFile(filePath) {
	const source = await readFile(filePath, 'utf8')
	const relativePath = path.relative(process.cwd(), filePath).replace(/\\/gu, '/')
	parseFrontmatter(source, relativePath)

	await compile(source, {
		filename: relativePath,
		remarkPlugins: [remarkGfm]
	})

	return relativePath
}

async function main() {
	const files = await collectContentFiles(CONTENT_ROOT)

	if (files.length === 0) {
		console.log('No blog content files found.')
		return
	}

	const failures = []

	for (const filePath of files) {
		try {
			const relativePath = await validateFile(filePath)
			console.log(`OK ${relativePath}`)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			failures.push({ filePath, message })
			console.error(
				`FAIL ${path.relative(process.cwd(), filePath).replace(/\\/gu, '/')} :: ${message}`
			)
		}
	}

	if (failures.length > 0) {
		console.error(`mdsvex validation failed for ${failures.length} file(s).`)
		process.exitCode = 1
		return
	}

	console.log(`Validated ${files.length} mdsvex content file(s).`)
}

await main()
