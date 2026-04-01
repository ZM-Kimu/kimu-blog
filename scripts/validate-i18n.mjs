import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import ts from 'typescript'

const SOURCE_ROOTS = [
	path.resolve('src/routes'),
	path.resolve('src/lib/features'),
	path.resolve('src/lib/components'),
	path.resolve('src/lib/navigation'),
	path.resolve('src/lib/config')
]

const LOCALE_FILES = {
	'zh-CN': path.resolve('src/lib/i18n/messages/zh-CN.ts'),
	'en-US': path.resolve('src/lib/i18n/messages/en-US.ts')
}

const SCRIPT_BLOCK_PATTERN = /<script\b[^>]*>([\s\S]*?)<\/script>/giu
const STYLE_BLOCK_PATTERN = /<style\b[^>]*>[\s\S]*?<\/style>/giu
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/gu
const MARKUP_TEXT_PATTERN = />([^<>{}]+)</gu
const MARKUP_ATTR_PATTERN = /\b(?:aria-label|placeholder|title|alt)\s*=\s*(["'])(.*?)\1/gu

const SUSPICIOUS_NAME_PATTERN =
	/(title|description|label|message|eyebrow|headline|detail|intro|lead|copy|text|placeholder|summary|cta|status|error|success|empty|prompt|tooltip|caption|source)$/iu

const EXCLUDED_SEGMENTS = [
	'/src/lib/i18n/',
	'/src/lib/content/',
	'/src/lib/server/',
	'/src/routes/api/'
]

const EXCLUDED_FILE_PATTERNS = [
	/\.d\.ts$/u,
	/\.server\.[cm]?[jt]s$/u,
	/\/\+server\.[cm]?[jt]s$/u,
	/\/types\.[cm]?[jt]s$/u,
	/\/contracts\.[cm]?[jt]s$/u
]

function normalizePath(filePath) {
	return filePath.replace(/\\/gu, '/')
}

function isExcludedFile(filePath) {
	const normalized = normalizePath(filePath)

	if (EXCLUDED_SEGMENTS.some((segment) => normalized.includes(segment))) {
		return true
	}

	return EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(normalized))
}

async function collectSourceFiles(root) {
	const entries = await readdir(root, { withFileTypes: true })
	const files = []

	for (const entry of entries) {
		const absolutePath = path.join(root, entry.name)

		if (entry.isDirectory()) {
			files.push(...(await collectSourceFiles(absolutePath)))
			continue
		}

		if (!/\.(?:svelte|[cm]?[jt]s)$/u.test(entry.name)) {
			continue
		}

		if (!isExcludedFile(absolutePath)) {
			files.push(absolutePath)
		}
	}

	return files
}

async function importTypeScriptModule(filePath) {
	const source = await readFile(filePath, 'utf8')
	const compiled = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2022
		},
		fileName: filePath
	}).outputText
	const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`

	return import(moduleUrl)
}

function flattenMessageKeys(record, prefix = '') {
	if (typeof record !== 'object' || record === null || Array.isArray(record)) {
		return []
	}

	const keys = []

	for (const [key, value] of Object.entries(record)) {
		const nextPrefix = prefix ? `${prefix}.${key}` : key

		if (typeof value === 'string') {
			keys.push(nextPrefix)
			continue
		}

		keys.push(...flattenMessageKeys(value, nextPrefix))
	}

	return keys
}

function isUserFacingLiteral(text) {
	const normalized = text.replace(/\s+/gu, ' ').trim()

	if (!normalized) {
		return false
	}

	if (!/[\p{L}\p{Script=Han}]/u.test(normalized)) {
		return false
	}

	if (/^[a-z0-9_./:#?=&+%-]+$/iu.test(normalized)) {
		return false
	}

	if (/^[A-Za-z][A-Za-z0-9-]*$/u.test(normalized)) {
		return false
	}

	return true
}

function findPropertyName(node) {
	if (!node) {
		return null
	}

	if (ts.isIdentifier(node)) {
		return node.text
	}

	if (ts.isStringLiteralLike(node)) {
		return node.text
	}

	if (ts.isComputedPropertyName(node) && ts.isStringLiteralLike(node.expression)) {
		return node.expression.text
	}

	return null
}

function getCallName(node) {
	if (ts.isIdentifier(node)) {
		return node.text
	}

	if (ts.isPropertyAccessExpression(node)) {
		return node.name.text
	}

	return null
}

function shouldInspectStringLiteral(node) {
	const text = node.text?.trim?.() ?? ''

	if (!isUserFacingLiteral(text)) {
		return false
	}

	const parent = node.parent

	if (!parent) {
		return false
	}

	if (
		ts.isImportDeclaration(parent) ||
		ts.isExportDeclaration(parent) ||
		ts.isImportTypeNode(parent) ||
		ts.isExternalModuleReference(parent) ||
		ts.isLiteralTypeNode(parent)
	) {
		return false
	}

	if (ts.isPropertyAssignment(parent)) {
		const propertyName = findPropertyName(parent.name)
		return propertyName ? SUSPICIOUS_NAME_PATTERN.test(propertyName) : false
	}

	if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
		return SUSPICIOUS_NAME_PATTERN.test(parent.name.text)
	}

	if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
		const left = parent.left
		if (ts.isIdentifier(left)) {
			return SUSPICIOUS_NAME_PATTERN.test(left.text)
		}

		if (ts.isPropertyAccessExpression(left)) {
			return SUSPICIOUS_NAME_PATTERN.test(left.name.text)
		}
	}

	if (ts.isCallExpression(parent)) {
		if (
			ts.isPropertyAccessExpression(parent.expression) &&
			ts.isIdentifier(parent.expression.expression) &&
			parent.expression.expression.text === 'console'
		) {
			return false
		}

		const callName = getCallName(parent.expression)
		return callName !== null && ['confirm', 'alert', 'prompt', 'error'].includes(callName)
	}

	if (ts.isReturnStatement(parent)) {
		let current = parent
		while (current) {
			if (
				(ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current)) &&
				current.name &&
				SUSPICIOUS_NAME_PATTERN.test(current.name.text)
			) {
				return true
			}

			current = current.parent
		}
	}

	return false
}

function scanScriptLiterals(source, filePath) {
	const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)
	const failures = []

	function visit(node) {
		if (
			(ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
			shouldInspectStringLiteral(node)
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(sourceFile)
			)
			failures.push({
				filePath,
				line: line + 1,
				column: character + 1,
				message: `raw script literal "${node.text.trim()}"`
			})
		}

		ts.forEachChild(node, visit)
	}

	visit(sourceFile)

	return failures
}

function scanSvelteMarkup(source, filePath) {
	const markup = source
		.replace(SCRIPT_BLOCK_PATTERN, '')
		.replace(STYLE_BLOCK_PATTERN, '')
		.replace(HTML_COMMENT_PATTERN, '')
	const failures = []

	for (const match of markup.matchAll(MARKUP_ATTR_PATTERN)) {
		const value = match[2]?.trim() ?? ''
		if (!isUserFacingLiteral(value)) {
			continue
		}

		const offset = match.index ?? 0
		const line = markup.slice(0, offset).split('\n').length
		const column = offset - markup.lastIndexOf('\n', offset - 1)
		failures.push({
			filePath,
			line,
			column,
			message: `raw markup attribute "${value}"`
		})
	}

	for (const match of markup.matchAll(MARKUP_TEXT_PATTERN)) {
		const value = match[1]?.replace(/\s+/gu, ' ').trim() ?? ''
		if (!isUserFacingLiteral(value)) {
			continue
		}

		const offset = match.index ?? 0
		const line = markup.slice(0, offset).split('\n').length
		const column = offset - markup.lastIndexOf('\n', offset - 1)
		failures.push({
			filePath,
			line,
			column,
			message: `raw markup text "${value}"`
		})
	}

	for (const match of source.matchAll(SCRIPT_BLOCK_PATTERN)) {
		const scriptContent = match[1] ?? ''
		const scriptOffset = match.index ?? 0
		const scriptFailures = scanScriptLiterals(scriptContent, filePath)

		for (const failure of scriptFailures) {
			const prelude = source.slice(0, scriptOffset)
			const baseLine = prelude.split('\n').length - 1
			failures.push({
				...failure,
				line: failure.line + baseLine
			})
		}
	}

	return failures
}

async function scanSourceFile(filePath) {
	const source = await readFile(filePath, 'utf8')

	if (filePath.endsWith('.svelte')) {
		return scanSvelteMarkup(source, filePath)
	}

	return scanScriptLiterals(source, filePath)
}

async function validateMessageParity() {
	const localeModules = await Promise.all(
		Object.values(LOCALE_FILES).map((filePath) => importTypeScriptModule(filePath))
	)
	const dictionaries = {
		'zh-CN': localeModules[0].zhCNMessages,
		'en-US': localeModules[1].enUSMessages
	}
	const zhKeys = new Set(flattenMessageKeys(dictionaries['zh-CN']))
	const enKeys = new Set(flattenMessageKeys(dictionaries['en-US']))
	const failures = []

	for (const key of zhKeys) {
		if (!enKeys.has(key)) {
			failures.push(`Missing key in en-US: ${key}`)
		}
	}

	for (const key of enKeys) {
		if (!zhKeys.has(key)) {
			failures.push(`Missing key in zh-CN: ${key}`)
		}
	}

	return failures
}

async function validateSourceText() {
	const files = (await Promise.all(SOURCE_ROOTS.map((root) => collectSourceFiles(root)))).flat()
	const failures = []

	for (const filePath of files.sort((left, right) => left.localeCompare(right))) {
		failures.push(...(await scanSourceFile(filePath)))
	}

	return failures
}

async function main() {
	const parityFailures = await validateMessageParity()
	const textFailures = await validateSourceText()

	if (parityFailures.length === 0 && textFailures.length === 0) {
		console.log('i18n validation passed.')
		return
	}

	for (const failure of parityFailures) {
		console.error(`PARITY ${failure}`)
	}

	for (const failure of textFailures) {
		const relativePath = normalizePath(path.relative(process.cwd(), failure.filePath))
		console.error(`SOURCE ${relativePath}:${failure.line}:${failure.column} :: ${failure.message}`)
	}

	process.exitCode = 1
}

await main()
