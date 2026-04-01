import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import prettier from 'prettier'

import { createRootMotionCssSource } from '../src/lib/motion/tokens.ts'

const targetPath = fileURLToPath(new URL('../src/lib/motion/tokens.css', import.meta.url))
const prettierConfig = await prettier.resolveConfig(targetPath)
const expectedSource = await prettier.format(createRootMotionCssSource(), {
	...prettierConfig,
	filepath: targetPath
})
const checkOnly = process.argv.includes('--check')

async function readCurrentSource() {
	try {
		return await readFile(targetPath, 'utf8')
	} catch {
		return null
	}
}

const currentSource = await readCurrentSource()

if (checkOnly) {
	if (currentSource !== expectedSource) {
		console.error('Motion CSS tokens are out of date. Run npm run gen:motion-css.')
		process.exit(1)
	}

	process.exit(0)
}

await writeFile(targetPath, expectedSource, 'utf8')
